import { describe, expect, it } from 'vitest';
import { getCareerResultV2 } from './careerScoring';

describe('normalized multi-field career recommendations', () => {
  it('shows several careers without using a career-name fallback for a partial-answer tie', () => {
    const result = getCareerResultV2({ 1: 'A', 5: 'A', 9: 'A', 13: 'A' });

    expect(result.fieldResults[0].recommendedCareers.length).toBeGreaterThan(1);
  });

  it('excludes unknown answers from both numerator and denominator', () => {
    const known = getCareerResultV2({ 1: 'A' });
    const knownAndUnknown = getCareerResultV2({ 1: 'A', 2: 'unknown' });

    expect(known.fieldResults).toEqual(knownAndUnknown.fieldResults);
  });

  it('makes a research-oriented scenario favor the research field', () => {
    const result = getCareerResultV2({ 1: 'A', 5: 'A', 9: 'A', 13: 'A', 14: 'A' });

    expect(result.fieldResults[0].fieldId).toBe('research');
  });

  it('does not invent a ranked field or career when every answer is unknown', () => {
    const answers = Object.fromEntries(Array.from({ length: 24 }, (_, index) => [index + 1, 'unknown'])) as Record<number, 'unknown'>;
    const result = getCareerResultV2(answers);

    expect(result.recommendedFieldResults).toEqual([]);
    expect(result.summary).toContain('아직 마음이 끌리는 활동을 찾는 중');
  });

  it('keeps three careers per recommended field, including a third-place tie only', () => {
    const result = getCareerResultV2({ 1: 'A', 5: 'A', 9: 'A', 13: 'A' });

    expect(result.recommendedFieldResults.every((field) => field.recommendedCareers.length >= 3)).toBe(true);
  });
});
