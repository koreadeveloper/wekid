import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const failures = [];
const port = 5225;
const baseUrl = `http://127.0.0.1:${port}/?mode=business-card`;
const auditDir = 'audits/touch-contrast-20260705';

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

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function parseRgb(value) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function luminance([red, green, blue]) {
  const channels = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

const { output, server } = startViteServer();

try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForSelector('.topbar');

  const state = await page.evaluate(() => {
    const addFixture = () => {
      const fixture = document.createElement('section');
      fixture.className = 'touch-contrast-fixture';
      fixture.innerHTML = `
        <button class="mode-button active" type="button">진로 탐험</button>
        <article class="admin-stat-card"><span>검사 수</span><strong>10</strong></article>
        <button class="icon-button" type="button" aria-label="검사 처음부터 다시 하기">x</button>
        <div class="admin-center-chips">
          <button class="active" type="button">전체 <strong>10</strong></button>
        </div>
        <div class="admin-chip-row"><span class="strong">위키드센터 10</span></div>
        <div class="admin-rank-list"><button type="button"><span>위키드센터</span><strong>10</strong></button></div>
        <div class="admin-search-box"><span></span><input aria-label="검색" /><button type="button" aria-label="검색어 지우기">x</button></div>
      `;
      document.body.append(fixture);
      return fixture;
    };

    const fixture = addFixture();
    const rectFor = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        height: rect.height,
        minHeight: style.minHeight,
        width: rect.width,
      };
    };

    const metrics = {
      adminCenterChip: rectFor('.touch-contrast-fixture .admin-center-chips button'),
      adminRankButton: rectFor('.touch-contrast-fixture .admin-rank-list button'),
      adminSearchClear: rectFor('.touch-contrast-fixture .admin-search-box button'),
      adminStrongChip: rectFor('.touch-contrast-fixture .admin-chip-row span.strong'),
      adminStatCard: rectFor('.touch-contrast-fixture .admin-stat-card'),
      iconButton: rectFor('.touch-contrast-fixture .icon-button'),
      modeButton: rectFor('.touch-contrast-fixture .mode-button.active'),
    };
    fixture.remove();
    return metrics;
  });

  for (const [name, metric] of Object.entries(state)) {
    assert(Boolean(metric), `${name} metric must exist`);
    if (!metric) continue;

    if (['modeButton', 'iconButton', 'adminCenterChip', 'adminRankButton', 'adminSearchClear'].includes(name)) {
      assert(metric.height >= 44, `${name} must be at least 44px tall, found ${metric.height}`);
    }

    if (['modeButton', 'adminCenterChip', 'adminStrongChip', 'adminStatCard'].includes(name)) {
      const foreground = parseRgb(metric.color);
      const background = parseRgb(metric.backgroundColor);
      assert(Boolean(foreground && background), `${name} colors must parse for contrast`);
      if (foreground && background) {
        const ratio = contrastRatio(foreground, background);
        assert(ratio >= 4.5, `${name} contrast must be at least 4.5:1, found ${ratio.toFixed(2)}:1`);
      }
    }
  }

  await page.screenshot({ fullPage: true, path: join(auditDir, 'mobile-business-card-topbar.png') });
  await writeFile(join(auditDir, 'touch-contrast-report.json'), `${JSON.stringify({ state }, null, 2)}\n`);
  await browser.close();
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await stopViteServer(server);
}

if (failures.length > 0) {
  console.error('Touch and contrast verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  if (output()) console.error(output());
  process.exit(1);
}

console.log('Touch and contrast verification passed.');
