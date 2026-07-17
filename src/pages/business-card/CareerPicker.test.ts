import { describe, expect, it } from 'vitest';
import { careerCatalog } from '../../data/careerCatalog';
import { filterBusinessCardCareers } from './CareerPicker';

describe('filterBusinessCardCareers', () => {
  it('returns all 107 catalog careers with an empty search term', () => {
    expect(filterBusinessCardCareers(careerCatalog, '')).toHaveLength(107);
  });

  it('finds a Korean job name and preserves its catalog emoji', () => {
    expect(filterBusinessCardCareers(careerCatalog, '아쿠아리스트')).toMatchObject([
      { name: '아쿠아리스트', detail: { emoji: '🐾' } },
    ]);
  });
});
