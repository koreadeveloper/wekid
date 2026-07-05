import { describe, expect, it } from 'vitest';
import { readAppModeFromSearch } from './appMode';

describe('readAppModeFromSearch', () => {
  it('returns career when the mode parameter is missing', () => {
    expect(readAppModeFromSearch('?center=wekid')).toBe('career');
  });

  it('returns business-card when the URL asks for the card maker', () => {
    expect(readAppModeFromSearch('?mode=business-card')).toBe('business-card');
  });

  it('returns admin when the URL asks for the admin surface', () => {
    expect(readAppModeFromSearch('?mode=admin')).toBe('admin');
  });

  it('falls back to career for unknown modes', () => {
    expect(readAppModeFromSearch('?mode=unknown')).toBe('career');
  });
});
