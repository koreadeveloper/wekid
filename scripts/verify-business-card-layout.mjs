import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const failures = [];
const port = 5187;
const baseUrl = `http://127.0.0.1:${port}/?mode=business-card`;
const auditDir = 'audits/business-card-layout-20260705';
const businessCardDraftStorageKey = 'wekid.businessCardDraft.v1';
const maxStressCardData = {
  englishName: 'ABCDEFGHIJKLMNOPQRSTUVWX',
  goal: '사람들이 즐거운 순간을 만들고 싶어요.',
  job: '학교 상담 프로그램 기획자',
  name: '가가가가가가가가가가가가',
  phone: '010-0000-0000',
  school: '위키드 초등학교',
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

async function installMaxStressDraft(page) {
  await page.addInitScript(
    ({ data, key }) => {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    },
    { data: maxStressCardData, key: businessCardDraftStorageKey },
  );
}

async function collectFrontCardMetrics(page, selector, minGapPx) {
  return page.evaluate(
    ({ minGapPx: gapPx, selector: cardSelector }) => {
      const overlapX = (first, second) => first.left < second.right && second.left < first.right;
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
      const clipsOwnOverflow = (element) => {
        const style = getComputedStyle(element);
        return style.overflowX !== 'visible' || style.overflowY !== 'visible';
      };

      return [...document.querySelectorAll(cardSelector)]
        .filter((card) => {
          const style = getComputedStyle(card);
          return style.display !== 'none' && style.visibility !== 'hidden' && card.clientWidth > 0 && card.clientHeight > 0;
        })
        .map((card, index) => {
          const name = card.querySelector('.card-name-overlay');
          const english = card.querySelector('.card-english-overlay');
          const logo = card.querySelector('.card-front-logo');
          const badge = card.querySelector('.card-front-job-badge');
          const badgeText = card.querySelector('.card-front-job-badge span');
          if (!name || !english || !logo || !badge || !badgeText) {
            return { index, missingElements: true };
          }

          const nameRect = rectFor(name);
          const englishRect = rectFor(english);
          const logoRect = rectFor(logo);
          const nameClipsOwnOverflow = clipsOwnOverflow(name);
          const englishClipsOwnOverflow = clipsOwnOverflow(english);
          const badgeRect = rectFor(badge);
          const nameBottom = Math.max(nameRect.bottom, englishRect.bottom);
          const horizontalOverlap = overlapX(englishRect, badgeRect) || overlapX(nameRect, badgeRect);
          const gapToBadge = badgeRect.top - nameBottom;
          const logoHorizontalOverlap = overlapX(logoRect, nameRect) || overlapX(logoRect, englishRect);
          const gapFromLogoToName = nameRect.top - logoRect.bottom;
          const badgeStyle = getComputedStyle(badge);
          const badgeTextStyle = getComputedStyle(badgeText);

          return {
            badgeBorderStyle: badgeStyle.borderStyle,
            badgeOutlineStyle: badgeStyle.outlineStyle,
            badgeTextDecoration: badgeTextStyle.textDecorationLine,
            card: rectFor(card),
            english: rectFor(english),
            englishFontSize: getComputedStyle(english).fontSize,
            englishFontSizePx: Number.parseFloat(getComputedStyle(english).fontSize),
            englishHasOverflow:
              englishClipsOwnOverflow &&
              (english.scrollWidth > english.clientWidth + 1 || english.scrollHeight > english.clientHeight + 1),
            englishOverflow: {
              clientHeight: english.clientHeight,
              clientWidth: english.clientWidth,
              scrollHeight: english.scrollHeight,
              scrollWidth: english.scrollWidth,
            },
            gapToBadge,
            gapFromLogoToName,
            horizontalOverlap,
            index,
            isPassing: !horizontalOverlap || gapToBadge >= gapPx,
            logo: rectFor(logo),
            logoHorizontalOverlap,
            minGapPx: gapPx,
            name: rectFor(name),
            nameFontSize: getComputedStyle(name).fontSize,
            nameFontSizePx: Number.parseFloat(getComputedStyle(name).fontSize),
            nameHasOverflow:
              nameClipsOwnOverflow && (name.scrollWidth > name.clientWidth + 1 || name.scrollHeight > name.clientHeight + 1),
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
      failures.push(`${label} card ${metric.index}: missing logo, name, English name, or job badge elements`);
      continue;
    }

    if (!metric.isPassing) {
      failures.push(
        `${label} card ${metric.index}: front name stack overlaps job badge; gap ${metric.gapToBadge.toFixed(1)}px, required ${metric.minGapPx}px`,
      );
    }

    if (metric.badgeBorderStyle !== 'none' || metric.badgeOutlineStyle !== 'none') {
      failures.push(`${label} card ${metric.index}: job badge must not show border/outline decoration`);
    }

    if (metric.badgeTextDecoration !== 'none') {
      failures.push(`${label} card ${metric.index}: job badge text must not show text decoration`);
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

    if (metric.logoHorizontalOverlap && metric.gapFromLogoToName < 2) {
      failures.push(
        `${label} card ${metric.index}: Wekid logo overlaps the enlarged name; gap ${metric.gapFromLogoToName.toFixed(1)}px, required 2px`,
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

async function verifyViewport(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ media: 'screen' });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await waitForVisibleCard(page, '.business-card-front.screen');
  await page.evaluate(() => document.fonts?.ready);
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.screen', 4);
  const fontMinimums = width <= 420 ? { english: 23, name: 54 } : width <= 900 ? { english: 28, name: 58 } : { english: 38, name: 82 };
  assertMetrics(`screen ${width}x${height}`, metrics, fontMinimums);
  return metrics;
}

async function verifyPrint(page) {
  await page.setViewportSize({ width: 1000, height: 1400 });
  await page.emulateMedia({ media: 'print' });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await waitForVisibleCard(page, '.business-card-front.print');
  await page.evaluate(() => document.fonts?.ready);
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.print', 8);
  assertMetrics('print front', metrics, { english: 26, name: 72 });
  return metrics;
}

async function verifyStressViewport(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ media: 'screen' });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await waitForVisibleCard(page, '.business-card-front.screen');
  await page.evaluate(() => document.fonts?.ready);
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.screen', 4);
  const fontMinimums = width <= 420 ? { english: 12, name: 22 } : width <= 900 ? { english: 13, name: 24 } : { english: 17, name: 32 };
  assertMetrics(`max-name screen ${width}x${height}`, metrics, fontMinimums);
  return metrics;
}

async function verifyStressPrint(page) {
  await page.setViewportSize({ width: 1000, height: 1400 });
  await page.emulateMedia({ media: 'print' });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await waitForVisibleCard(page, '.business-card-front.print');
  await page.evaluate(() => document.fonts?.ready);
  const metrics = await collectFrontCardMetrics(page, '.business-card-front.print', 8);
  assertMetrics('max-name print front', metrics, { english: 12, name: 24 });
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
  await installMaxStressDraft(stressPage);
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
