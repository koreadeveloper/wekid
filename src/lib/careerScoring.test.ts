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
});
