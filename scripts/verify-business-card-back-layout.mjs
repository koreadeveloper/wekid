import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const failures = [];
const port = 5188;
const baseUrl = `http://127.0.0.1:${port}/?mode=business-card`;
const auditDir = 'audits/business-card-back-layout-20260705';
const businessCardDraftStorageKey = 'wekid.businessCardDraft.v1';
const maxStressCardData = {
  englishName: 'ABCDEFGHIJKLMNOPQRSTUVWX',
  goal: '사람들이 즐거운 순간을 만들고 싶어요.',
  job: '학교 상담 프로그램 기획자',
  name: '가가가가가가가가가가가가',
  phone: '010-0000-0000',
  school: '위키드 초등학교',
};

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

async function installMaxStressDraft(page) {
  await page.addInitScript(
    ({ data, key }) => {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    },
    { data: maxStressCardData, key: businessCardDraftStorageKey },
  );
}

async function waitForVisibleCard(page, selector) {
  await page.waitForFunction(
    (cardSelector) =>
      [...document.querySelectorAll(cardSelector)].some((card) => {
        const style = getComputedStyle(card);
        return style.display !== 'none' && style.visibility !== 'hidden' && card.clientWidth > 0 && card.clientHeight > 0;
      }),
    selector,
  );
}

async function collectScreenMetrics(page, viewport) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ media: 'screen' });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await waitForVisibleCard(page, '.business-card-back.screen');
  await page.evaluate(() => document.fonts?.ready);
  await page.screenshot({
    fullPage: true,
    path: join(auditDir, `screen-${viewport.width}.png`),
  });

  return page.evaluate(({ height, width }) => {
    const numberFromPx = (value) => Number.parseFloat(value.replace('px', ''));
    const readText = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        fontSize: numberFromPx(style.fontSize),
        height: rect.height,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
        text: element.textContent?.trim() ?? '',
        width: rect.width,
      };
    };
    const readBox = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        display: style.display,
        height: rect.height,
        top: rect.top,
        width: rect.width,
      };
    };

    return {
      backDetail: readText('.business-card-preview-grid .business-card-back.screen .card-detail-item dd'),
      backEnglish: readText('.business-card-preview-grid .business-card-back.screen .card-info-english'),
      backGoal: readText('.business-card-preview-grid .business-card-back.screen .card-goal-band strong'),
      backJob: readText('.business-card-preview-grid .business-card-back.screen .card-info-job strong'),
      backName: readText('.business-card-preview-grid .business-card-back.screen .card-info-column h3'),
      mobilePreview: readBox('.business-card-mobile-live-preview'),
      viewport: { height, width },
    };
  }, viewport);
}

async function collectPrintMetrics(page) {
  await page.setViewportSize({ width: 1000, height: 1400 });
  await page.emulateMedia({ media: 'screen' });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await waitForVisibleCard(page, '.business-card-front.screen');
  await page.getByRole('button', { name: '뒷면' }).click();
  await page.emulateMedia({ media: 'print' });
  await waitForVisibleCard(page, '.business-card-back.print');
  await page.evaluate(() => document.fonts?.ready);
  await page.screenshot({
    fullPage: true,
    path: join(auditDir, 'print-back.png'),
  });

  return page.evaluate(() => {
    const numberFromPx = (value) => Number.parseFloat(value.replace('px', ''));
    const readText = (card, selector) => {
      const element = card.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        fontSize: numberFromPx(style.fontSize),
        height: rect.height,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
        text: element.textContent?.trim() ?? '',
        width: rect.width,
      };
    };

    return [...document.querySelectorAll('.business-card-back.print')].map((card, index) => {
      const rect = card.getBoundingClientRect();
      return {
        backDetail: readText(card, '.card-detail-item dd'),
        backEnglish: readText(card, '.card-info-english'),
        backGoal: readText(card, '.card-goal-band strong'),
        backJob: readText(card, '.card-info-job strong'),
        backName: readText(card, '.card-info-column h3'),
        card: { height: rect.height, width: rect.width },
        index,
      };
    });
  });
}

function assertTextMetric(label, metric, minFontSize) {
  if (!metric) {
    failures.push(`${label}: missing text element`);
    return;
  }

  if (metric.fontSize < minFontSize) {
    failures.push(`${label}: font-size ${metric.fontSize.toFixed(1)}px is below ${minFontSize}px`);
  }

  if (metric.height <= 0 || metric.width <= 0) {
    failures.push(`${label}: element is not visibly measurable`);
  }

  const clipsOwnOverflow = metric.overflowX !== 'visible' || metric.overflowY !== 'visible';
  if (clipsOwnOverflow && (metric.scrollWidth > metric.clientWidth + 1 || metric.scrollHeight > metric.clientHeight + 1)) {
    failures.push(
      `${label}: text clips or overflows ${JSON.stringify({
        clientHeight: metric.clientHeight,
        clientWidth: metric.clientWidth,
        scrollHeight: metric.scrollHeight,
        scrollWidth: metric.scrollWidth,
      })}`,
    );
  }
}

function assertStressScreenMetrics(label, metrics) {
  assertTextMetric(`${label} back name`, metrics.backName, 19);
  assertTextMetric(`${label} back English name`, metrics.backEnglish, 9.5);
  assertTextMetric(`${label} back job`, metrics.backJob, 8);
  assertTextMetric(`${label} back detail`, metrics.backDetail, 9);
  assertTextMetric(`${label} back goal`, metrics.backGoal, 8.8);
}

function assertScreenMetrics(label, metrics) {
  assertTextMetric(`${label} back name`, metrics.backName, 30);
  assertTextMetric(`${label} back English name`, metrics.backEnglish, 15);
  assertTextMetric(`${label} back job`, metrics.backJob, 9);
  assertTextMetric(`${label} back detail`, metrics.backDetail, 9.2);
  assertTextMetric(`${label} back goal`, metrics.backGoal, 8.8);

  if (metrics.viewport.width < 980) {
    if (!metrics.mobilePreview || metrics.mobilePreview.display === 'none') {
      failures.push(`${label}: mobile live preview is not visible below the desktop breakpoint`);
      return;
    }

    const maxPreviewHeight = Math.min(250, metrics.viewport.height * 0.33);
    if (metrics.mobilePreview.height > maxPreviewHeight) {
      failures.push(
        `${label}: sticky mobile preview height ${metrics.mobilePreview.height.toFixed(1)}px exceeds ${maxPreviewHeight.toFixed(1)}px`,
      );
    }
  }
}

function assertPrintMetrics(metrics) {
  if (metrics.length !== 10) {
    failures.push(`print back: expected 10 cards, found ${metrics.length}`);
  }

  for (const metric of metrics) {
    assertTextMetric(`print back card ${metric.index} name`, metric.backName, 38);
    assertTextMetric(`print back card ${metric.index} English name`, metric.backEnglish, 15.5);
    assertTextMetric(`print back card ${metric.index} job`, metric.backJob, 9);
    assertTextMetric(`print back card ${metric.index} detail`, metric.backDetail, 9);
    assertTextMetric(`print back card ${metric.index} goal`, metric.backGoal, 8.8);
  }
}

function assertStressPrintMetrics(metrics) {
  if (metrics.length !== 10) {
    failures.push(`max-name print back: expected 10 cards, found ${metrics.length}`);
  }

  for (const metric of metrics) {
    assertTextMetric(`max-name print back card ${metric.index} name`, metric.backName, 19);
    assertTextMetric(`max-name print back card ${metric.index} English name`, metric.backEnglish, 9.5);
    assertTextMetric(`max-name print back card ${metric.index} job`, metric.backJob, 8);
    assertTextMetric(`max-name print back card ${metric.index} detail`, metric.backDetail, 9);
    assertTextMetric(`max-name print back card ${metric.index} goal`, metric.backGoal, 8.8);
  }
}

const { output, server } = startViteServer();

try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const stressPage = await browser.newPage();
  await installMaxStressDraft(stressPage);
  const report = {
    printBack: await collectPrintMetrics(page),
    screen375: await collectScreenMetrics(page, { height: 812, width: 375 }),
    screen768: await collectScreenMetrics(page, { height: 900, width: 768 }),
    screen1280: await collectScreenMetrics(page, { height: 900, width: 1280 }),
    stressPrintBack: await collectPrintMetrics(stressPage),
    stressScreen375: await collectScreenMetrics(stressPage, { height: 812, width: 375 }),
    stressScreen768: await collectScreenMetrics(stressPage, { height: 900, width: 768 }),
    stressScreen1280: await collectScreenMetrics(stressPage, { height: 900, width: 1280 }),
  };

  assertPrintMetrics(report.printBack);
  assertScreenMetrics('screen 375x812', report.screen375);
  assertScreenMetrics('screen 768x900', report.screen768);
  assertScreenMetrics('screen 1280x900', report.screen1280);
  assertStressPrintMetrics(report.stressPrintBack);
  assertStressScreenMetrics('max-name screen 375x812', report.stressScreen375);
  assertStressScreenMetrics('max-name screen 768x900', report.stressScreen768);
  assertStressScreenMetrics('max-name screen 1280x900', report.stressScreen1280);
  await writeFile(join(auditDir, 'back-layout-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await stopViteServer(server);
}

if (failures.length > 0) {
  console.error('Business card back layout verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  if (output()) console.error(output());
  process.exit(1);
}

console.log('Business card back layout verification passed.');
