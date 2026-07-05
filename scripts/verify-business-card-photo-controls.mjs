import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const failures = [];
const port = 5226;
const baseUrl = `http://127.0.0.1:${port}/?mode=business-card`;
const auditDir = 'audits/business-card-photo-controls-20260705';
const sampleImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVR42mP8z8Dwn4EIwESJ5lEDRgYGBhYGJgYGAABy2QIRdHnldgAAAABJRU5ErkJggg==',
  'base64',
);

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
  const server = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });

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
    const killer = spawn('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
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

const { output, server } = startViteServer();

try {
  await mkdir(auditDir, { recursive: true });
  const imagePath = join(auditDir, 'sample-photo.png');
  await writeFile(imagePath, sampleImage);
  await waitForServer();

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForSelector('.business-card-upload input');

  await page.locator('.business-card-upload input').setInputFiles(imagePath);
  await page.waitForSelector('.business-card-photo-remove');
  const attachedState = await page.evaluate(() => ({
    photoImages: document.querySelectorAll('.card-photo-frame img').length,
    removeButtonHeight: document.querySelector('.business-card-photo-remove')?.getBoundingClientRect().height ?? 0,
    uploadButtonHeight: document.querySelector('.business-card-upload')?.getBoundingClientRect().height ?? 0,
  }));

  assert(attachedState.photoImages > 0, `photo upload must render in preview, found ${attachedState.photoImages} image(s)`);
  assert(attachedState.removeButtonHeight >= 44, `photo remove button must be at least 44px tall, found ${attachedState.removeButtonHeight}`);
  assert(attachedState.uploadButtonHeight >= 44, `photo upload button must be at least 44px tall, found ${attachedState.uploadButtonHeight}`);

  await page.screenshot({ fullPage: true, path: join(auditDir, 'mobile-photo-attached.png') });
  await page.getByRole('button', { name: '사진 빼기' }).click();
  await page.waitForSelector('.business-card-photo-remove', { state: 'detached' });

  const removedState = await page.evaluate(() => ({
    photoImages: document.querySelectorAll('.card-photo-frame img').length,
    placeholderIcons: document.querySelectorAll('.card-photo-frame svg').length,
    removeButtonCount: document.querySelectorAll('.business-card-photo-remove').length,
  }));

  assert(removedState.photoImages === 0, `photo removal must clear preview images, found ${removedState.photoImages}`);
  assert(removedState.placeholderIcons > 0, 'photo removal must restore the placeholder portrait');
  assert(removedState.removeButtonCount === 0, `remove button must hide after clearing the photo, found ${removedState.removeButtonCount}`);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await wait(120);
  await page.screenshot({ fullPage: true, path: join(auditDir, 'mobile-photo-removed.png') });
  await writeFile(join(auditDir, 'photo-controls-report.json'), `${JSON.stringify({ attachedState, removedState }, null, 2)}\n`);
  await browser.close();
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await stopViteServer(server);
}

if (failures.length > 0) {
  console.error('Business card photo controls verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  if (output()) console.error(output());
  process.exit(1);
}

console.log('Business card photo controls verification passed.');
