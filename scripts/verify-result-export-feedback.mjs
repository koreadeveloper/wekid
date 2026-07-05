import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const failures = [];
const port = 5224;
const baseUrl = `http://127.0.0.1:${port}/?mode=career`;
const auditDir = 'audits/result-export-feedback-20260705';

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

async function reachResultPage(page) {
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForSelector('.name-step-card');
  await page.locator('.name-input').fill('김위키드');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.question-panel');

  for (let attempt = 0; attempt < 40 && (await page.locator('.result-hero').count()) === 0; attempt += 1) {
    await page.keyboard.press('Space');
    await wait(260);
  }

  await page.waitForSelector('.result-hero');
}

const { output, server } = startViteServer();

try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  page.on('dialog', async (dialog) => {
    failures.push(`result export feedback must not open a browser dialog: ${dialog.message()}`);
    await dialog.dismiss();
  });

  await reachResultPage(page);
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toDataURL = () => {
      throw new Error('forced export failure for visual QA');
    };
  });
  await page.getByRole('button', { name: '결과 이미지 저장' }).click();
  await page.waitForSelector('.result-export-status');

  const statusState = await page.locator('.result-export-status').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const shareRow = document.querySelector('.share-row')?.getBoundingClientRect();
    const nextSection = document.querySelector('.result-actions')?.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return {
      ariaLive: element.getAttribute('aria-live') ?? '',
      ariaAtomic: element.getAttribute('aria-atomic') ?? '',
      backgroundColor: style.backgroundColor,
      borderStyle: style.borderStyle,
      bottom: rect.bottom,
      height: rect.height,
      nextSectionTop: nextSection?.top ?? 0,
      role: element.getAttribute('role') ?? '',
      shareRowBottom: shareRow?.bottom ?? 0,
      text: element.textContent?.trim().replace(/\s+/g, ' ') ?? '',
      top: rect.top,
      wordBreak: style.wordBreak,
      overflowWrap: style.overflowWrap,
    };
  });

  assert(statusState.role === 'status', `export feedback must use role=status, found ${statusState.role}`);
  assert(statusState.ariaLive === 'polite', `export feedback must use aria-live=polite, found ${statusState.ariaLive}`);
  assert(statusState.ariaAtomic === 'true', `export feedback must use aria-atomic=true, found ${statusState.ariaAtomic}`);
  assert(
    statusState.text === '결과 이미지를 저장하지 못했어요. 다시 시도해 주세요.',
    `unexpected export feedback copy: ${statusState.text}`,
  );
  assert(statusState.height >= 44, `export feedback touch/read target must be at least 44px tall, found ${statusState.height}`);
  assert(
    statusState.wordBreak === 'keep-all' && statusState.overflowWrap === 'break-word',
    `export feedback must keep Korean words readable, found ${statusState.wordBreak}/${statusState.overflowWrap}`,
  );
  assert(
    statusState.top >= statusState.shareRowBottom,
    `export feedback must not overlap the share actions, found top ${statusState.top} / share bottom ${statusState.shareRowBottom}`,
  );
  assert(
    statusState.nextSectionTop === 0 || statusState.bottom <= statusState.nextSectionTop,
    `export feedback must not overlap the next section, found bottom ${statusState.bottom} / next top ${statusState.nextSectionTop}`,
  );

  await page.screenshot({ fullPage: true, path: join(auditDir, 'mobile-image-export-error.png') });
  await writeFile(join(auditDir, 'feedback-report.json'), `${JSON.stringify({ statusState }, null, 2)}\n`);
  await browser.close();
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await stopViteServer(server);
}

if (failures.length > 0) {
  console.error('Result export feedback verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  if (output()) console.error(output());
  process.exit(1);
}

console.log('Result export feedback verification passed.');
