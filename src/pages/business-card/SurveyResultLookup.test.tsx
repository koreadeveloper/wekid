import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { StoredTestResultRecord } from '../../types/firestore';
import { SurveyResultLookup } from './SurveyResultLookup';

function surveyResult(overrides: Partial<StoredTestResultRecord> = {}): StoredTestResultRecord {
  return {
    id: 'sky-center-result',
    participantName: '김하늘',
    participantEmail: 'sky@example.com',
    centerName: '하늘청소년센터',
    centerKey: '하늘청소년센터',
    centerSource: 'manual',
    startedAt: new Date('2026-07-01T09:00:00.000Z'),
    completedAt: new Date('2026-07-01T09:05:00.000Z'),
    createdAt: new Date('2026-07-01T09:05:00.000Z'),
    questionnaireVersion: 2,
    schemaVersion: 2,
    answers: [],
    answerSnapshots: [],
    scores: {},
    fieldResults: [],
    topCareer: '',
    recommendedCareers: [],
    recommendedFieldResults: [],
    dreamChoice: { kind: 'catalog', careerName: '천문학자' },
    resultSummary: '별을 관찰하는 일을 하고 싶어요.',
    ...overrides,
  } as StoredTestResultRecord;
}

describe('SurveyResultLookup', () => {
  it('announces the asynchronous loading state to screen readers', () => {
    const markup = renderToStaticMarkup(<SurveyResultLookup onSelect={() => undefined} />);

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('설문 결과를 불러오는 중이에요.');
  });

  it('shows email, center, date, and final dream for duplicate name matches', () => {
    const kimAtSkyCenter = surveyResult();
    const kimAtStarSchool = surveyResult({
      id: 'star-school-result',
      participantEmail: 'star@example.com',
      centerName: '별빛초등학교',
      centerKey: '별빛초등학교',
      createdAt: new Date('2026-07-02T09:05:00.000Z'),
      dreamChoice: { kind: 'custom', careerName: '항공우주공학자' },
    });
    const nameless = surveyResult({ id: 'nameless-result', participantName: '   ' });

    const markup = renderToStaticMarkup(
      <SurveyResultLookup initialResults={[kimAtStarSchool, kimAtSkyCenter, nameless]} onSelect={() => undefined} />,
    );

    expect(markup).toContain('sky@example.com');
    expect(markup).toContain('별빛초등학교');
    expect(markup).toContain('2026. 7. 1.');
    expect(markup).toContain('천문학자');
    expect(markup).not.toContain('nameless-result');
  });
});
