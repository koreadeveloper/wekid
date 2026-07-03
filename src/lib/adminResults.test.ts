import { describe, expect, it } from 'vitest';
import {
  CSV_UTF8_BOM,
  createAdminResultAnalysis,
  createAdminResultSummary,
  filterResults,
  getResultDurationMinutes,
  toResultsCsv,
} from './adminResults';
import type { StoredTestResultRecord } from '../types/firestore';

const records: StoredTestResultRecord[] = [
  {
    id: '1',
    participantName: '김탐험',
    centerName: '강남 청소년센터',
    centerKey: '강남 청소년센터',
    centerSource: 'manual',
    startedAt: new Date('2026-07-04T00:00:00.000Z'),
    completedAt: new Date('2026-07-04T00:05:00.000Z'),
    answers: [],
    scores: { realistic: 3, artistic: 1 },
    topCareer: { name: '사진작가' },
    recommendedCareers: [{ name: '목공예가' }],
    resultSummary: '관찰을 좋아해요.',
    createdAt: new Date('2026-07-04T00:05:01.000Z'),
    schemaVersion: 1,
  },
  {
    id: '2',
    participantName: null,
    centerName: '서초 청소년센터',
    centerKey: '서초 청소년센터',
    centerSource: 'url',
    startedAt: new Date('2026-07-05T00:00:00.000Z'),
    completedAt: new Date('2026-07-05T00:05:00.000Z'),
    answers: [],
    scores: { realistic: 1, artistic: 4 },
    topCareer: '음악가',
    recommendedCareers: [],
    resultSummary: '표현을 좋아해요.',
    createdAt: new Date('2026-07-05T00:05:01.000Z'),
    schemaVersion: 1,
  },
];

const edgeRecords: StoredTestResultRecord[] = [
  {
    id: 'comma-quote-newline',
    participantName: '오"테스트',
    centerName: '쉼표, 센터',
    centerKey: '쉼표, 센터',
    centerSource: 'manual',
    startedAt: new Date('2026-07-03T00:00:00.000Z'),
    completedAt: new Date('2026-07-03T00:04:30.000Z'),
    answers: [
      { questionId: 1, choice: 'realistic' },
      { questionId: 2, choice: 'artistic' },
    ],
    scores: { social: 5, care: 3 },
    topCareer: { name: '상담가' },
    recommendedCareers: ['교사', { name: '사회복지사' }],
    resultSummary: '쉼표, 따옴표 "테스트"\n줄바꿈 포함',
    createdAt: new Date('2026-07-03T00:04:31.000Z'),
    schemaVersion: 1,
  },
  {
    id: 'no-center',
    participantName: null,
    centerName: null,
    centerKey: null,
    centerSource: 'none',
    startedAt: new Date('2026-07-01T00:00:00.000Z'),
    completedAt: new Date('2026-07-01T00:02:00.000Z'),
    answers: [{ questionId: 1, choice: 'focus' }],
    scores: { focus: 2 },
    topCareer: '작가',
    recommendedCareers: [{ name: '기자' }],
    resultSummary: '센터 없음',
    createdAt: new Date('2026-07-01T00:02:01.000Z'),
    schemaVersion: 1,
  },
  {
    id: 'invalid-duration',
    participantName: '시간역전',
    centerName: '쉼표, 센터',
    centerKey: '쉼표, 센터',
    centerSource: 'url',
    startedAt: new Date('2026-07-06T00:05:00.000Z'),
    completedAt: new Date('2026-07-06T00:00:00.000Z'),
    answers: [],
    scores: { focus: 4 },
    topCareer: '연구원',
    recommendedCareers: [],
    resultSummary: '소요 시간 제외',
    createdAt: new Date('2026-07-06T00:05:01.000Z'),
    schemaVersion: 1,
  },
];

describe('createAdminResultSummary', () => {
  it('groups results by center and top career', () => {
    expect(createAdminResultSummary(records, new Date('2026-07-06T00:00:00.000Z'))).toEqual({
      totalCount: 2,
      recentCount: 2,
      byCenter: [
        { centerKey: '강남 청소년센터', centerName: '강남 청소년센터', count: 1 },
        { centerKey: '서초 청소년센터', centerName: '서초 청소년센터', count: 1 },
      ],
      byTopCareer: [
        { careerName: '사진작가', count: 1 },
        { careerName: '음악가', count: 1 },
      ],
    });
  });
});

describe('filterResults', () => {
  it('filters by center key and inclusive date range', () => {
    expect(
      filterResults(records, {
        centerKey: '강남 청소년센터',
        fromDate: '2026-07-04',
        toDate: '2026-07-04',
      }).map((record) => record.id),
    ).toEqual(['1']);
  });

  it('supports start-only and end-only date filters', () => {
    expect(filterResults(edgeRecords, { fromDate: '2026-07-03' }).map((record) => record.id)).toEqual([
      'comma-quote-newline',
      'invalid-duration',
    ]);
    expect(filterResults(edgeRecords, { toDate: '2026-07-03' }).map((record) => record.id)).toEqual([
      'comma-quote-newline',
      'no-center',
    ]);
  });

  it('filters null center values under the no-center bucket', () => {
    expect(filterResults(edgeRecords, { centerKey: 'none' }).map((record) => record.id)).toEqual(['no-center']);
  });
});

describe('createAdminResultAnalysis', () => {
  it('calculates duration, answer, center, career, and score analysis', () => {
    const analysis = createAdminResultAnalysis(records);

    expect(analysis.averageDurationMinutes).toBe(5);
    expect(analysis.averageAnsweredCount).toBe(0);
    expect(analysis.topCenter).toEqual({ centerName: '강남 청소년센터', count: 1, ratio: 0.5 });
    expect(analysis.topCareer).toEqual({ careerName: '사진작가', count: 1, ratio: 0.5 });
    expect(analysis.scoreAverages[0]).toEqual({ scoreKey: 'artistic', average: 2.5, total: 5 });
  });

  it('excludes invalid durations and handles null center values', () => {
    const analysis = createAdminResultAnalysis(edgeRecords);
    const summary = createAdminResultSummary(edgeRecords, new Date('2026-07-07T00:00:00.000Z'));

    expect(analysis.averageDurationMinutes).toBe(3.25);
    expect(analysis.averageAnsweredCount).toBe(1);
    expect(summary.byCenter).toContainEqual({ centerKey: 'none', centerName: '센터 없음', count: 1 });
  });
});

describe('getResultDurationMinutes', () => {
  it('returns the elapsed minutes between start and completion', () => {
    expect(getResultDurationMinutes(records[0])).toBe(5);
  });

  it('returns null for impossible duration values', () => {
    expect(getResultDurationMinutes(edgeRecords[2])).toBeNull();
  });
});

describe('toResultsCsv', () => {
  it('exports UTF-8 BOM, Korean headers, and expanded result fields', () => {
    const csv = toResultsCsv(records);

    expect(csv.startsWith(CSV_UTF8_BOM)).toBe(true);
    expect(csv).toContain('문서ID,저장일,검사시작,검사완료,소요분,이름,센터,센터키,센터입력경로,대표직업,추천직업,답변수,요약,점수JSON');
    expect(csv).toContain('1,2026-07-04T00:05:01.000Z,2026-07-04T00:00:00.000Z,2026-07-04T00:05:00.000Z,5.0,김탐험,강남 청소년센터,강남 청소년센터,manual,사진작가,목공예가,0,관찰을 좋아해요.');
  });

  it('escapes comma, quote, newline, null, and JSON values for Excel-friendly CSV', () => {
    const csv = toResultsCsv(edgeRecords);

    expect(csv).toContain('"오""테스트"');
    expect(csv).toContain('"쉼표, 센터"');
    expect(csv).toContain(',교사 / 사회복지사,');
    expect(csv).toContain('"쉼표, 따옴표 ""테스트""\n줄바꿈 포함"');
    expect(csv).toContain('no-center,2026-07-01T00:02:01.000Z,2026-07-01T00:00:00.000Z,2026-07-01T00:02:00.000Z,2.0,,,,none,작가');
    expect(csv).toContain('"{""social"":5,""care"":3}"');
  });
});
