import { describe, expect, it } from 'vitest';
import { careerQuestionsV2 } from './questionsV2';

describe('approved elementary career questions', () => {
  it('contains the approved 16 activity and 8 style questions', () => {
    expect(careerQuestionsV2).toHaveLength(24);
    expect(careerQuestionsV2.filter((question) => question.kind === 'activity')).toHaveLength(16);
    expect(careerQuestionsV2.filter((question) => question.kind === 'style')).toHaveLength(8);
    expect(careerQuestionsV2[0].text).toBe('체험 수업에서 더 해보고 싶은 것은?');
    expect(careerQuestionsV2[23].options[1].label).toBe('그리면서 떠오르는 생각을 계속 더하기');
  });

  it('gives each A/B pair different activity directions', () => {
    expect(careerQuestionsV2.every((question) => {
      const aTags = Object.keys(question.options[0].activityTags);
      const bTags = Object.keys(question.options[1].activityTags);
      return !aTags.every((tag) => bTags.includes(tag));
    })).toBe(true);
  });
});
