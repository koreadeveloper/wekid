import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const failures = [];
const port = 5194;
const baseUrl = `http://127.0.0.1:${port}/?mode=career`;
const auditDir = 'audits/career-flow-a11y-20260705';

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function startViteServer() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`]
      : ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'];
  const server = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  return { output: () => output, server };
}

async function stopViteServer(server) {
  if (process.platform !== 'win32' || !server.pid) {
    server.kill();
    return;
  }

  await new Promise((resolve) => {
    const killer = spawn('taskkill', ['/pid', String(server.pid), '/t', '/f'], {
      stdio: 'ignore',
    });
    killer.on('exit', resolve);
    killer.on('error', resolve);
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      await wait(250);
    }
  }
  throw new Error(`Vite server did not start at ${baseUrl}`);
}

async function launchBrowser() {
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // Try the next locally installed browser channel before falling back.
    }
  }

  return chromium.launch({ headless: true });
}

async function readFocusState(page) {
  return page.evaluate(() => {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement.nodeType !== Node.ELEMENT_NODE) {
      return { className: '', tagName: '' };
    }

    const element = /** @type {Element} */ (activeElement);
    return {
      ariaLabel: element.getAttribute('aria-label') ?? '',
      className: element.className,
      tagName: element.tagName,
      text: element.textContent?.trim().replace(/\s+/g, ' ') ?? '',
    };
  });
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function assertFocusedOption(page, label) {
  await page.waitForFunction(
    () => document.activeElement?.nodeType === Node.ELEMENT_NODE && document.activeElement.classList.contains('option-card'),
    null,
    { timeout: 1500 },
  ).catch(() => undefined);
  const focusState = await readFocusState(page);
  assert(
    focusState.className.split(/\s+/).includes('option-card'),
    `${label}: expected focus on the active quiz answer, found ${focusState.tagName}.${focusState.className}`,
  );
}

async function chooseFocusedOptionWithKeyboard(page) {
  await page.keyboard.press('Space');
  await wait(260);
}

const { output, server } = startViteServer();

try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForSelector('.name-step-card');
  assert((await page.locator('.topbar .icon-button').count()) === 0, 'untouched start page must not show reset');

  await page.locator('.name-input').focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('.question-panel');
  const questionHeadingStyle = await page.locator('.question-panel h2').evaluate((heading) => {
    const style = window.getComputedStyle(heading);
    return {
      fontSize: style.fontSize,
      overflowWrap: style.overflowWrap,
      textWrap: style.textWrap,
      wordBreak: style.wordBreak,
    };
  });
  assert(
    questionHeadingStyle.wordBreak === 'keep-all',
    `mobile question heading must keep Korean words together, found word-break: ${questionHeadingStyle.wordBreak}`,
  );
  assert(
    questionHeadingStyle.overflowWrap === 'break-word',
    `mobile question heading must still wrap long words safely, found overflow-wrap: ${questionHeadingStyle.overflowWrap}`,
  );
  assert(
    questionHeadingStyle.fontSize === '31px',
    `mobile question heading should use a stable fixed size, found ${questionHeadingStyle.fontSize}`,
  );
  const mobileFooterState = await page.evaluate(() => {
    const dots = document.querySelector('.question-dots');
    const count = document.querySelector('.question-footer-count');
    return {
      countDisplay: count ? window.getComputedStyle(count).display : '',
      countText: count?.textContent?.trim() ?? '',
      dotsDisplay: dots ? window.getComputedStyle(dots).display : '',
    };
  });
  assert(
    mobileFooterState.dotsDisplay === 'none',
    `mobile question progress dots should be hidden, found display: ${mobileFooterState.dotsDisplay}`,
  );
  assert(
    mobileFooterState.countDisplay !== 'none' && mobileFooterState.countText === '1 / 30',
    `mobile question footer should show a compact 1 / 30 count, found ${mobileFooterState.countText || 'nothing'}`,
  );
  const answerGroupSemantics = await page.evaluate(() => {
    const optionGrid = document.querySelector('.options-grid');
    const firstOption = document.querySelector('.option-card');
    return {
      firstOptionAriaChecked: firstOption?.getAttribute('aria-checked') ?? '',
      firstOptionAriaPressed: firstOption?.getAttribute('aria-pressed') ?? '',
      firstOptionRole: firstOption?.getAttribute('role') ?? '',
      optionGridRole: optionGrid?.getAttribute('role') ?? '',
    };
  });
  assert(
    answerGroupSemantics.optionGridRole === 'group',
    `quiz answer options should use a button group, found role: ${answerGroupSemantics.optionGridRole}`,
  );
  assert(
    answerGroupSemantics.firstOptionRole === '' && answerGroupSemantics.firstOptionAriaChecked === '',
    `quiz answer buttons must not masquerade as radios, found role "${answerGroupSemantics.firstOptionRole}" and aria-checked "${answerGroupSemantics.firstOptionAriaChecked}"`,
  );
  assert(
    answerGroupSemantics.firstOptionAriaPressed === 'false',
    `quiz answer buttons should expose current pressed state, found aria-pressed: ${answerGroupSemantics.firstOptionAriaPressed}`,
  );
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktopPage.goto(baseUrl, { waitUntil: 'load' });
  await desktopPage.locator('.name-input').focus();
  await desktopPage.keyboard.press('Enter');
  await desktopPage.waitForSelector('.quiz-layout .question-panel');
  const desktopQuizState = await desktopPage.evaluate(() => {
    const layout = document.querySelector('.quiz-layout');
    const intro = document.querySelector('.intro-panel');
    const question = document.querySelector('.quiz-layout .question-panel');
    const introRect = intro?.getBoundingClientRect();
    const questionRect = question?.getBoundingClientRect();
    return {
      alignItems: layout ? window.getComputedStyle(layout).alignItems : '',
      domQuestionBeforeIntro: Boolean(
        question && intro && question.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      introLeft: introRect?.left ?? 0,
      introHeight: intro?.getBoundingClientRect().height ?? 0,
      questionLeft: questionRect?.left ?? 0,
      questionHeight: question?.getBoundingClientRect().height ?? 0,
    };
  });
  await desktopPage.close();
  assert(
    desktopQuizState.alignItems === 'start',
    `desktop quiz layout should not stretch the question panel, found align-items: ${desktopQuizState.alignItems}`,
  );
  assert(
    desktopQuizState.questionHeight + 24 < desktopQuizState.introHeight,
    `desktop question panel should be compact beside the intro panel, found question ${desktopQuizState.questionHeight}px / intro ${desktopQuizState.introHeight}px`,
  );
  assert(desktopQuizState.domQuestionBeforeIntro, 'desktop quiz DOM order must put the active question before the intro panel');
  assert(
    desktopQuizState.questionLeft < desktopQuizState.introLeft,
    `desktop quiz visual order must match DOM order, found question left ${desktopQuizState.questionLeft}px / intro left ${desktopQuizState.introLeft}px`,
  );
  await assertFocusedOption(page, 'after starting the quiz');
  assert((await page.locator('.topbar .icon-button').count()) === 1, 'quiz page must show reset after the test starts');

  await chooseFocusedOptionWithKeyboard(page);
  await assertFocusedOption(page, 'after advancing to the next question');

  for (let attempt = 0; attempt < 40 && (await page.locator('.result-hero').count()) === 0; attempt += 1) {
    await chooseFocusedOptionWithKeyboard(page);
  }

  await page.waitForSelector('.result-hero');
  const resultFocus = await readFocusState(page);
  assert(
    resultFocus.className.split(/\s+/).includes('result-title'),
    `result page must focus the result title, found ${resultFocus.tagName}.${resultFocus.className}`,
  );

  const resultChecks = await page.evaluate(() => {
    const actions = document.querySelector('.result-actions');
    const library = document.querySelector('.library-section');
    const topCareerCard = document.querySelector('.top-career-card');
    return {
      actionsBeforeLibrary: Boolean(
        actions && library && actions.compareDocumentPosition(library) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      topbarResetCount: document.querySelectorAll('.topbar .icon-button').length,
      topCareerAriaLabel: topCareerCard?.getAttribute('aria-label') ?? '',
    };
  });

  assert(resultChecks.actionsBeforeLibrary, 'result actions must appear before the full career library in tab order');
  assert(resultChecks.topbarResetCount === 0, 'result page must keep the reset action in the result body only');
  assert(resultChecks.topCareerAriaLabel.length > 0, 'top career detail button must have a concise aria-label');

  await page.locator('.business-card-share-button').focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('.business-card-maker');
  await page.waitForFunction(
    () => document.activeElement?.nodeType === Node.ELEMENT_NODE && document.activeElement.matches('.business-card-page-heading h1'),
    null,
    { timeout: 2000 },
  ).catch(() => undefined);
  const businessCardFocus = await readFocusState(page);
  assert(
    businessCardFocus.tagName === 'H1' && businessCardFocus.text === '내 꿈 명함 만들기',
    `business-card mode must focus the page heading, found ${businessCardFocus.tagName}.${businessCardFocus.className} "${businessCardFocus.text}"`,
  );

  const printControlsInitial = await page.evaluate(() => {
    const printButton = document.querySelector('.print-button');
    const guide = document.querySelector('#business-card-print-guide');
    const pill = document.querySelector('.print-count-pill');
    return {
      buttonDescriptionId: printButton?.getAttribute('aria-describedby') ?? '',
      guideText: guide?.textContent?.trim() ?? '',
      pillText: pill?.textContent?.trim() ?? '',
    };
  });
  assert(
    printControlsInitial.pillText === '앞면만 10개 인쇄',
    `print side copy should start with front-only quantity, found "${printControlsInitial.pillText}"`,
  );
  assert(
    printControlsInitial.buttonDescriptionId === 'business-card-print-guide' &&
      printControlsInitial.guideText === '앞면 인쇄 후 같은 종이에 뒷면을 인쇄하세요.',
    `print button must be described by the duplex guide, found id "${printControlsInitial.buttonDescriptionId}" and guide "${printControlsInitial.guideText}"`,
  );

  await page.getByRole('button', { name: '뒷면' }).click();
  const printControlsBack = await page.evaluate(() => document.querySelector('.print-count-pill')?.textContent?.trim() ?? '');
  assert(printControlsBack === '뒷면만 10개 인쇄', `back-side print copy should name the selected side, found "${printControlsBack}"`);

  await page.screenshot({ fullPage: true, path: join(auditDir, 'mobile-result-focus.png') });
  await writeFile(
    join(auditDir, 'focus-report.json'),
    `${JSON.stringify({ businessCardFocus, printControlsBack, printControlsInitial, resultChecks }, null, 2)}\n`,
  );
  await browser.close();
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await stopViteServer(server);
}

if (failures.length > 0) {
  console.error('Career flow accessibility verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  if (output()) console.error(output());
  process.exit(1);
}

console.log('Career flow accessibility verification passed.');
