import { describe, expect, it } from 'vitest';
import { careerByName, careerCatalog, careerTraitProfiles } from './careerCatalog';

describe('child-friendly career catalog', () => {
  it('contains exactly the approved 107 unique careers with details', () => {
    expect(careerCatalog).toHaveLength(107);
    expect(new Set(careerCatalog.map((career) => career.name)).size).toBe(107);
    expect(Object.keys(careerByName)).toHaveLength(107);
    expect(careerCatalog.every((career) => career.detail.description.length > 30)).toBe(true);
  });

  it('keeps required child-facing careers', () => {
    ['아이돌', '유튜버', '모델', 'CEO', '수학자', '정보보안 전문가', '음악가'].forEach((career) => {
      expect(careerByName[career]).toBeDefined();
    });
  });

  it('gives every approved career a meaning-based trait profile', () => {
    expect(Object.keys(careerTraitProfiles).sort()).toEqual(careerCatalog.map((career) => career.name).sort());
  });
});
