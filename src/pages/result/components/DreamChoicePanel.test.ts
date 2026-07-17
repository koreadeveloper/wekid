import { describe, expect, it } from 'vitest';
import { isDreamChoiceReady } from './DreamChoicePanel';

describe('DreamChoicePanel helpers', () => {
  it('allows catalog selection, custom input, and still-exploring confirmation', () => {
    expect(isDreamChoiceReady({ kind: 'catalog', careerName: '유튜버' })).toBe(true);
    expect(isDreamChoiceReady({ kind: 'custom', careerName: '  만화 번역가  ' })).toBe(true);
    expect(isDreamChoiceReady({ kind: 'undecided' })).toBe(true);
    expect(isDreamChoiceReady({ kind: 'custom', careerName: '  ' })).toBe(false);
  });
});
