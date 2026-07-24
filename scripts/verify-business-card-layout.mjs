import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const failures = [];
const port = 5187;
const baseUrl = `http://127.0.0.1:${port}/?mode=business-card`;
const auditDir = 'audits/business-card-layout-20260705';
const maxStressCardData = {
  englishName: 'ABCDEFGHIJKLMNOPQRSTUVWX',
  goal: '사람들이 즐거운 순간을 만들고 싶어요.',
  job: '학교 상담 프로그램 기획자',
  name: '가가가가가가가가가가가가',
  phone: '010-0000-0000',
  school: '위키드 초등학교',
};
const layoutCardData = {
  email: 'dream@wekid.kr',
  goal: '사람들이 즐거운 순간을 만들고 싶어요.',
  phone: '010-0000-0000',
};

const wait = (ms) => new Promise((resolve) => {
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
  const channels = ['chrome', 'msedge'];
  for (const channel of channels) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // Try the next locally installed browser channel before falling back.
    }
  }

  return chromium.launch({ headless: true });
}

async function fillCardData(page, data) {
  const fills = [
    ['이름', data.name],
    ['영문 이름', data.englishName],
    ['학교 / 소속', data.school],
    ['연락처 (선택)', data.phone],
    ['이메일 (선택)', data.email],
    ['한 줄 목표', data.goal],
  ];

  for (const [label, value] of fills) {
    if (value !== undefined) {
      await page.getByLabel(label, { exact: true }).fill(value);
    }
  }
}

async function collectFrontCardMetrics(page, selector, minGapPx) {
  return page.evaluate(
    ({ minGapPx: gapPx, selector: cardSelector }) => {
      const overlap = (first, second) =>
        first.left < second.right && second.left < first.right && first.top < second.bottom && second.top < first.bottom;
      const rectFor = (element) => {
        const rect = element.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          height: rect.height,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        };
      };
      return [...document.querySelectorAll(cardSelector)]
        .filter((card) => {
          const style = getComputedStyle(card);
          return style.display !== 'none' && style.visibility !== 'hidden' && card.clientWidth > 0 && card.clientHeight > 0;
        })
        .map((card, index) => {
          const name = card.querySelector('.card-front-identity strong');
          const english = card.querySelector('.card-front-english-name');
          const logo = card.querySelector('.card-front-wekid-mark');
          const job = card.querySelector('.card-front-job');
          const centerLogo = card.querySelector('.card-front-center-logo');
          const contact = card.querySelector('.card-front-contact');
          if (!name || !english || !logo || !job || !centerLogo || !contact) {
            return { index, missingElements: true };
          }

          const nameRect = rectFor(name);
          const englishRect = rectFor(english);
          const logoRect = rectFor(logo);
          const jobRect = rectFor(job);
          const centerLogoRect = rectFor(centerLogo);
          const contactRect = rectFor(contact);
          const nameBottom = Math.max(nameRect.bottom, englishRect.bottom);
          const gapToJob = jobRect.top - nameBottom;
          const gapFromLogoToName = nameRect.top - logoRect.bottom;
          const jobStyle = getComputedStyle(job);

          return {
            card: rectFor(card),
            centerContactOverlap: overlap(centerLogoRect, contactRect),
            centerLogo: centerLogoRect,
            contact: contactRect,
            english: rectFor(english),
            englishFontSize: getComputedStyle(english).fontSize,
            englishFontSizePx: Number.parseFloat(getComputedStyle(english).fontSize),
            englishHasOverflow: english.scrollWidth > english.clientWidth + 1,
            englishOverflow: {
              clientHeight: english.clientHeight,
              clientWidth: english.clientWidth,
              scrollHeight: english.scrollHeight,
              scrollWidth: english.scrollWidth,
            },
            gapToJob,
            gapFromLogoToName,
            index,
            isPassing: gapToJob >= gapPx && gapFromLogoToName >= gapPx && !overlap(logoRect, nameRect),
            job: jobRect,
            jobBorderStyle: jobStyle.borderStyle,
            jobOutlineStyle: jobStyle.outlineStyle,
            jobTextDecoration: jobStyle.textDecorationLine,
            logo: rectFor(logo),
            minGapPx: gapPx,
            name: rectFor(name),
            nameFontSize: getComputedStyle(name).fontSize,
            nameFontSizePx: Number.parseFloat(getComputedStyle(name).fontSize),
            nameHasOverflow: name.scrollWidth > name.clientWidth + 1,
            nameOverflow: {
              clientHeight: name.clientHeight,
              clientWidth: name.clientWidth,
              scrollHeight: name.scrollHeight,
              scrollWidth: name.scrollWidth,
            },
          };
        });
    },
    { minGapPx, selector },
  );
}

function assertMetrics(label, metrics, fontMinimums) {
  if (metrics.length === 0) {
    failures.push(`${label}: no visible front cards were found`);
    return;
  }

  for (const metric of metrics) {
    if (metric.missingElements) {
      failures.push(`${label} card ${metric.index}: missing Wekid logo, center logo, name, English name, contact, or job elements`);
      continue;
    }

    if (!metric.isPassing) {
      failures.push(
        `${label} card ${metric.index}: front logo/name/job stack is too tight; logo-name gap ${metric.gapFromLogoToName.toFixed(1)}px, name-job gap ${metric.gapToJob.toFixed(1)}px, required ${metric.minGapPx}px`,
      );
    }

    if (metric.centerContactOverlap) {
      failures.push(`${label} card ${metric.index}: center logo overlaps the contact block`);
    }

    if (metric.jobBorderStyle !== 'none' || metric.jobOutlineStyle !== 'none') {
      failures.push(`${label} card ${metric.index}: job text must not show border/outline decoration`);
    }

    if (metric.jobTextDecoration !== 'none') {
      failures.push(`${label} card ${metric.index}: job text must not show text decoration`);
    }

    if (metric.name.left < metric.card.left - 1 || metric.name.right > metric.card.right + 1) {
      failures.push(
        `${label} card ${metric.index}: Korean name is clipped by the card edge; name ${metric.name.left.toFixed(1)}-${metric.name.right.toFixed(1)}, card ${metric.card.left.toFixed(1)}-${metric.card.right.toFixed(1)}`,
      );
    }

    if (metric.english.left < metric.card.left - 1 || metric.english.right > metric.card.right + 1) {
      failures.push(
        `${label} card ${metric.index}: English name is clipped by the card edge; English ${metric.english.left.toFixed(1)}-${metric.english.right.toFixed(1)}, card ${metric.card.left.toFixed(1)}-${metric.card.right.toFixed(1)}`,
      );
    }

    if (metric.gapFromLogoToName < metric.minGapPx) {
      failures.push(
        `${label} card ${metric.index}: Wekid logo is too close to the name; gap ${metric.gapFromLogoToName.toFixed(1)}px, required ${metric.minGapPx}px`,
      );
    }

    if (metric.nameFontSizePx < fontMinimums.name) {
      failures.push(
        `${label} card ${metric.index}: Korean name font-size ${metric.nameFontSizePx.toFixed(1)}px is below ${fontMinimums.name}px`,
      );
    }

    if (metric.englishFontSizePx < fontMinimums.english) {
      failures.push(
        `${label} card ${metric.index}: English name font-size ${metric.englishFontSizePx.toFixed(1)}px is below ${fontMinimums.english}px`,
      );
    }

    if (metric.nameHasOverflow) {
      failures.push(`${label} card ${metric.index}: Korean name clips or overflows ${JSON.stringify(metric.nameOverflow)}`);
    }

    if (metric.englishHasOverflow) {
      failures.push(`${label} card ${metric.index}: English name clips or overflows ${JSON.stringify(metric.englishOverflow)}`);
    }
  }
}

async function prepareBusinessCardPage(page, { height, media, stress = false, width }) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ media: 'screen' });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await waitForVisibleCard(page, '.business-card-front.screen');
  await fillCardData(page, stress ? maxStressCardData : layoutCardData);
  if (media === 'print') {
    await page.emulateMedia({ media: 'print' });
    await waitForVisibleCard(page, '.business-card-front.print');
  }
  await page.evaluate(() => document.fonts?.ready);
}

async function verifyViewport(page, width, height) {
  await prepareBusinessCardPage(page, { height, media: 'screen', width });
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.screen', 4);
  const fontMinimums = width <= 420 ? { english: 8, name: 23 } : width <= 900 ? { english: 8, name: 24 } : { english: 12, name: 38 };
  assertMetrics(`screen ${width}x${height}`, metrics, fontMinimums);
  return metrics;
}

async function verifyPrint(page) {
  await prepareBusinessCardPage(page, { height: 1400, media: 'print', width: 1000 });
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.print', 8);
  assertMetrics('print front', metrics, { english: 8, name: 23 });
  return metrics;
}

async function verifyStressViewport(page, width, height) {
  await prepareBusinessCardPage(page, { height, media: 'screen', stress: true, width });
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.screen', 4);
  const fontMinimums = width <= 420 ? { english: 5, name: 14 } : width <= 900 ? { english: 5, name: 15 } : { english: 7, name: 24 };
  assertMetrics(`max-name screen ${width}x${height}`, metrics, fontMinimums);
  return metrics;
}

async function verifyStressPrint(page) {
  await prepareBusinessCardPage(page, { height: 1400, media: 'print', stress: true, width: 1000 });
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.print', 8);
  assertMetrics('max-name print front', metrics, { english: 5, name: 14 });
  return metrics;
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

const { output, server } = startViteServer();

try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const stressPage = await browser.newPage();
  const report = {
    print: await verifyPrint(page),
    screen375: await verifyViewport(page, 375, 812),
    screen768: await verifyViewport(page, 768, 900),
    screen1280: await verifyViewport(page, 1280, 900),
    stressPrint: await verifyStressPrint(stressPage),
    stressScreen375: await verifyStressViewport(stressPage, 375, 812),
    stressScreen768: await verifyStressViewport(stressPage, 768, 900),
    stressScreen1280: await verifyStressViewport(stressPage, 1280, 900),
  };

  await writeFile(join(auditDir, 'front-layout-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await stopViteServer(server);
}

if (failures.length > 0) {
  console.error('Business card layout verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  if (output()) console.error(output());
  process.exit(1);
}

console.log('Business card layout verification passed.');
