import { describe, expect, it } from 'vitest';
import { buildResultBusinessCardData, defaultCardData } from './businessCardConfig';

describe('buildResultBusinessCardData', () => {
  it('prefills the dream card with the result owner, center, and recommended career', () => {
    const cardData = buildResultBusinessCardData({
      userName: 'Alex Kim',
      centerName: 'Future Center',
      careerName: 'Pilot',
    });

    expect(cardData).toMatchObject({
      name: 'Alex Kim',
      school: 'Future Center',
      job: 'Pilot',
    });
    expect(cardData.englishName).toBe(defaultCardData.englishName);
  });

  it('keeps safe defaults when the result has optional blank fields', () => {
    const cardData = buildResultBusinessCardData({
      userName: ' ',
      centerName: null,
      careerName: ' ',
    });

    expect(cardData).toEqual(defaultCardData);
  });
});
