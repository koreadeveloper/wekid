import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('App business card flow', () => {
  it('uses the unified business card maker without the DOM bridge', () => {
    const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

    expect(source).not.toContain('AdminBusinessCardBridge');
    expect(source).not.toContain('AdminBusinessCardMakerPage');
    expect(source).toContain('<BusinessCardMakerPage');
  });
});
