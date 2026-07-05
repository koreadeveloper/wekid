import { describe, expect, it } from 'vitest';
import { getReadableKoreanLines } from './readableKoreanLines';

describe('getReadableKoreanLines', () => {
  it('splits known result summaries into semantic Korean line groups', () => {
    expect(
      getReadableKoreanLines(
        '아직 여러 분야를 고르게 탐색하는 중이에요. 다양한 경험을 해보며 특히 마음이 오래 머무는 활동을 찾아가면 좋아요.',
      ),
    ).toEqual([
      '아직 여러 분야를',
      '고르게 탐색하는\u00a0중이에요.',
      '다양한 경험을 해보며',
      '특히 마음이 오래\u00a0머무는 활동을 찾아가면 좋아요.',
    ]);
  });

  it('keeps ordinary sentences readable without losing text', () => {
    expect(getReadableKoreanLines('재료를 만지고 형태를 다듬어 쓸모 있는 작품을 완성하는 일이 잘 맞아요.')).toEqual([
      '재료를 만지고 형태를 다듬어 쓸모 있는 작품을 완성하는 일이 잘 맞아요.',
    ]);
  });
});
