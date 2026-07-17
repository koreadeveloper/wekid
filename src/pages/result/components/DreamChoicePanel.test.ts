import { describe, expect, it } from 'vitest';
import { canConfirmDreamChoice, isDreamChoiceReady } from './DreamChoicePanel';

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
});
