import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ResultPage } from './ResultPage';

const result = {
  questionnaireVersion: 2 as const,
  summary: '여러 방향을 탐험했어요.',
  strengths: ['호기심 많은 탐구자'],
  fieldResults: [],
  recommendedFieldResults: [{
    fieldId: 'research' as const,
    label: '호기심 많은 탐구자 — 과학·연구',
    score: 0.8,
    scoreBand: 'very-high' as const,
    evidence: ['별과 우주를 관찰하며 궁금한 점 알아보기'],
    recommendedCareers: [{ name: '과학자', score: 0.8, primaryField: 'research' as const, reason: '탐구해요.' }],
  }],
};

describe('ResultPage', () => {
  it('shows field labels and never renders a single-best-career heading', () => {
    const markup = renderToStaticMarkup(
      <ResultPage
        result={result}
        userName="김탐험"
        resultSaveStatus={{ status: 'idle' }}
        hasCareerDetail={() => true}
        onCareerSelect={() => undefined}
        onEditLastAnswer={() => undefined}
        onReset={() => undefined}
        onConfirmDreamChoice={() => undefined}
      />,
    );

    expect(markup).toContain('호기심 많은 탐구자 — 과학·연구');
    expect(markup).not.toContain('가장 잘 맞는 직업은');
  });
});
