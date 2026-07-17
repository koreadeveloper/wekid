import { describe, expect, it } from 'vitest';
import {
  canAutoSaveCareerChoice,
  canConfirmDreamChoice,
  getAutoSaveDreamChoice,
  isDreamChoiceReady,
} from './DreamChoicePanel';

describe('DreamChoicePanel helpers', () => {
  it('allows catalog selection, custom input, and still-exploring confirmation', () => {
    expect(isDreamChoiceReady({ kind: 'catalog', careerName: '유튜버' })).toBe(true);
    expect(isDreamChoiceReady({ kind: 'custom', careerName: '  만화 번역가  ' })).toBe(true);
    expect(isDreamChoiceReady({ kind: 'undecided' })).toBe(true);
    expect(isDreamChoiceReady({ kind: 'custom', careerName: '  ' })).toBe(false);
  });

  it('allows a changed choice to be confirmed after a previous save', () => {
    const savedChoice = { kind: 'catalog', careerName: '유튜버' } as const;
    expect(canConfirmDreamChoice({ kind: 'catalog', careerName: '아이돌' }, savedChoice)).toBe(true);
    expect(canConfirmDreamChoice(savedChoice, savedChoice)).toBe(false);
  });

  it('automatically saves a career selected from recommendations or the catalog', () => {
    const recommendedChoice = { kind: 'recommended', careerName: '아이돌' } as const;
    const catalogChoice = { kind: 'catalog', careerName: '수의사' } as const;

    expect(getAutoSaveDreamChoice(recommendedChoice)).toEqual(recommendedChoice);
    expect(getAutoSaveDreamChoice(catalogChoice)).toEqual(catalogChoice);
    expect(getAutoSaveDreamChoice({ kind: 'custom', careerName: '만화 번역가' })).toBeUndefined();
    expect(getAutoSaveDreamChoice({ kind: 'undecided' })).toBeUndefined();
  });

  it('allows changing a saved career choice but prevents changes while it is saving', () => {
    const choice = { kind: 'recommended', careerName: '아이돌' } as const;

    expect(canAutoSaveCareerChoice(choice, false, undefined)).toBe(true);
    expect(canAutoSaveCareerChoice(choice, true, undefined)).toBe(false);
    expect(canAutoSaveCareerChoice(choice, false, choice)).toBe(true);
  });
});
