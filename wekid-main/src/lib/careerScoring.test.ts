import { describe, expect, it } from 'vitest';
import { getCategoryRecommendations, getCategoryScores, getScores, initialScores } from './careerScoring';
import type { AnswerMap, ScoreMap } from '../types/career';

const scoresWith = (values: Partial<ScoreMap>): ScoreMap => ({
  ...initialScores,
  ...values,
});

describe('balanced career recommendations', () => {
  it('normalizes category scores to the same 0–1 scale', () => {
    const scores = scoresWith({ realistic: 4, artistic: 2, social: 1 });
    const categoryScores = getCategoryScores(scores);

    expect(Object.keys(categoryScores)).toHaveLength(8);
    expect(Object.values(categoryScores).every((score) => score >= 0 && score <= 1)).toBe(true);
  });

  it('returns multiple category recommendations without repeating a category first', () => {
    const scores = scoresWith({ artistic: 4, enterprising: 3, realistic: 2 });
    const result = getCategoryRecommendations(scores);

    expect(result).toHaveLength(3);
    expect(result.every((group) => group.careers.length > 0 && group.careers.length <= 2)).toBe(true);
    expect(new Set(result.map((group) => group.category)).size).toBe(3);
  });

  it('does not award an axis point for ambiguous or neither answers', () => {
    const answers: AnswerMap = { 1: 'uncertain', 2: 'neither', 3: 'artistic' };
    const scores = getScores(answers);

    expect(scores.artistic).toBe(1);
    expect(Object.values(scores).reduce((sum, score) => sum + score, 0)).toBe(1);
  });
});
