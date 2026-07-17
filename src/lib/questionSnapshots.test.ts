import { describe, expect, it } from 'vitest';
import { createAnswerSnapshots } from './questionSnapshots';

describe('createAnswerSnapshots', () => {
  it('captures the approved question and selected option label', () => {
    expect(createAnswerSnapshots({ 1: 'A', 2: 'unknown' })).toEqual([
      {
        questionId: 1,
        questionText: '체험 수업에서 더 해보고 싶은 것은?',
        choice: 'A',
        optionLabel: '별과 우주를 관찰하며 궁금한 점 알아보기',
      },
      {
        questionId: 2,
        questionText: '학교 축제에서 더 해보고 싶은 것은?',
        choice: 'unknown',
        optionLabel: '아직 잘 모르겠어요',
      },
    ]);
  });
});
