import { describe, expect, it } from 'vitest';
import packageJson from '../../package.json';

const scripts = packageJson.scripts as Record<string, string>;
const browserCheckScripts = [
  'check:result-export-feedback',
  'check:career-flow-a11y',
  'check:touch-contrast',
  'check:business-card-photo',
  'check:business-card-layout',
  'check:business-card-back-layout',
];

describe('package scripts', () => {
  it('keeps production builds independent from Playwright browser binaries', () => {
    expect(scripts.build).toContain('vite build');

    for (const scriptName of browserCheckScripts) {
      expect(scripts.build).not.toContain(scriptName);
    }
  });

  it('keeps browser QA available through the local verification command', () => {
    expect(scripts.verify).toBeTruthy();

    for (const scriptName of browserCheckScripts) {
      expect(scripts.verify).toContain(scriptName);
    }
  });
});
