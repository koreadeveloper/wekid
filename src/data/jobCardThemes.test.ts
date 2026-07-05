import { describe, expect, it } from 'vitest';
import { jobCardThemes } from './jobCardThemes';

describe('jobCardThemes', () => {
  it('loads every generated job background as a selectable card theme', () => {
    expect(jobCardThemes).toHaveLength(178);
    expect(new Set(jobCardThemes.map((theme) => theme.key)).size).toBe(178);
  });

  it('includes known jobs with background image URLs', () => {
    expect(jobCardThemes.find((theme) => theme.name === '소프트웨어 개발자')).toMatchObject({
      englishName: 'Software Developer',
      category: 'digital',
      backgroundUrl: expect.stringContaining('.webp'),
    });
    expect(jobCardThemes.find((theme) => theme.name === '경찰관')).toMatchObject({
      englishName: 'Police Officer',
      category: 'public',
      backgroundUrl: expect.stringContaining('.webp'),
    });
  });
});
