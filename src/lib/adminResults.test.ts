import { describe, expect, it } from 'vitest';
import {
  CSV_UTF8_BOM,
  buildAdminExportFileName,
  createAdminResultAnalysis,
  createAdminResultSummary,
  detectSimilarCenterGroups,
  filterResults,
  getAdminAnswerDetails,
  getDreamChoiceLabel,
  getResultDurationMinutes,
  isSuspectedTestResult,
  paginateAdminResults,
  sanitizeAdminFileNamePart,
  sortAdminResults,
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

const v2Record: StoredTestResultRecord = {
  id: 'v2',
  participantName: '김탐험',
  centerName: '강남 청소년센터',
  centerKey: '강남 청소년센터',
  centerSource: 'manual',
  startedAt: new Date('2026-07-05T00:00:00.000Z'),
  completedAt: new Date('2026-07-05T00:05:00.000Z'),
  questionnaireVersion: 2,
  answerSnapshots: [{
    questionId: 1,
    questionText: '체험 수업에서 더 해보고 싶은 것은?',
    choice: 'A',
    optionLabel: '별과 우주를 관찰하며 궁금한 점 알아보기',
  }],
  fieldResults: [],
  recommendedFieldResults: [{
    fieldId: 'research',
    label: '호기심 많은 탐구자 — 과학·연구',
    score: 0.9,
    scoreBand: 'very-high',
    evidence: [],
    recommendedCareers: [],
  }],
  dreamChoice: { kind: 'catalog', careerName: '유튜버' },
  resultSummary: '여러 방향을 탐험했어요.',
  createdAt: new Date('2026-07-05T00:05:01.000Z'),
  schemaVersion: 2,
  answers: [],
  scores: {},
  topCareer: '',
  recommendedCareers: [],
};

describe('v2 result helpers', () => {
  it('returns a final dream and readable snapshot answers', () => {
    expect(getDreamChoiceLabel(v2Record)).toBe('유튜버 (목록 선택)');
    expect(getAdminAnswerDetails(v2Record)[0]).toMatchObject({
      questionText: '체험 수업에서 더 해보고 싶은 것은?',
      optionLabel: '별과 우주를 관찰하며 궁금한 점 알아보기',
    });
  });

  it('exports questionnaire version, fields, recommendations, and dream choice', () => {
    const csv = toResultsCsv([v2Record]);

    expect(csv).toContain('설문버전');
    expect(csv).toContain('최종꿈');
    expect(csv).toContain('호기심 많은 탐구자 — 과학·연구');
  });
});

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

  it('searches inside current filter results by name, center, career, summary, and document id', () => {
    expect(filterResults([...records, ...edgeRecords], { searchTerm: '  사진  ' }).map((record) => record.id)).toEqual([
      '1',
    ]);
    expect(filterResults([...records, ...edgeRecords], { searchTerm: '쉼표 센터' }).map((record) => record.id)).toEqual([
      'comma-quote-newline',
      'invalid-duration',
    ]);
    expect(filterResults([...records, ...edgeRecords], { searchTerm: 'NEWLINE' }).map((record) => record.id)).toEqual([
      'comma-quote-newline',
    ]);
  });

  it('hides suspected test results when requested', () => {
    expect(filterResults(edgeRecords, { hideTestResults: true }).map((record) => record.id)).toEqual([
      'no-center',
      'invalid-duration',
    ]);
  });
});

describe('isSuspectedTestResult', () => {
  it('detects test-like names and centers without mutating data', () => {
    expect(isSuspectedTestResult(edgeRecords[0])).toBe(true);
    expect(isSuspectedTestResult(edgeRecords[1])).toBe(false);
    expect(isSuspectedTestResult({ ...edgeRecords[1], centerName: 'MCP 배포센터' })).toBe(true);
  });
});

describe('sortAdminResults', () => {
  it('sorts by date, text fields, career, and duration with stable fallback', () => {
    expect(sortAdminResults(records, { key: 'createdAt', direction: 'desc' }).map((record) => record.id)).toEqual([
      '2',
      '1',
    ]);
    expect(sortAdminResults(records, { key: 'participantName', direction: 'asc' }).map((record) => record.id)).toEqual([
      '1',
      '2',
    ]);
    expect(sortAdminResults(edgeRecords, { key: 'durationMinutes', direction: 'desc' }).map((record) => record.id)).toEqual([
      'comma-quote-newline',
      'no-center',
      'invalid-duration',
    ]);
  });
});

describe('paginateAdminResults', () => {
  it('calculates bounded pages and supports all rows', () => {
    expect(paginateAdminResults(edgeRecords, { page: 2, pageSize: 2 })).toMatchObject({
      currentPage: 2,
      totalPages: 2,
      totalResults: 3,
      pageResults: [edgeRecords[2]],
    });
    expect(paginateAdminResults(edgeRecords, { page: 99, pageSize: 2 }).currentPage).toBe(2);
    expect(paginateAdminResults(edgeRecords, { page: 1, pageSize: 'all' }).pageResults).toHaveLength(3);
  });
});

describe('detectSimilarCenterGroups', () => {
  it('groups center variants by normalized key', () => {
    const variants: StoredTestResultRecord[] = [
      { ...records[0], id: 'a', centerName: '강남청소년센터', centerKey: '강남청소년센터' },
      { ...records[0], id: 'b', centerName: '강남 청소년센터', centerKey: '강남 청소년센터' },
      { ...records[0], id: 'c', centerName: '강남 청소년 센터', centerKey: '강남 청소년 센터' },
      { ...records[1], id: 'd', centerName: '서초 청소년센터', centerKey: '서초 청소년센터' },
    ];

    expect(detectSimilarCenterGroups(variants)).toEqual([
      {
        normalizedKey: '강남청소년센터',
        totalCount: 3,
        variants: [
          { centerName: '강남청소년센터', centerKey: '강남청소년센터', count: 1 },
          { centerName: '강남 청소년센터', centerKey: '강남 청소년센터', count: 1 },
          { centerName: '강남 청소년 센터', centerKey: '강남 청소년 센터', count: 1 },
        ],
      },
    ]);
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
    expect(csv).toContain('설문버전,대표직업,추천직업,추천분야,최종꿈,최종꿈유형,답변수,답변스냅샷JSON');
    expect(csv).toContain('5.0,김탐험,,강남 청소년센터,강남 청소년센터,manual,1,사진작가,목공예가');
  });

  it('escapes comma, quote, newline, null, and JSON values for Excel-friendly CSV', () => {
    const csv = toResultsCsv(edgeRecords);

    expect(csv).toContain('"오""테스트"');
    expect(csv).toContain('"쉼표, 센터"');
    expect(csv).toContain(',교사 / 사회복지사,');
    expect(csv).toContain('"쉼표, 따옴표 ""테스트""\n줄바꿈 포함"');
    expect(csv).toContain('no-center,2026-07-01T00:02:01.000Z,2026-07-01T00:00:00.000Z,2026-07-01T00:02:00.000Z,2.0,,,,,none,1,작가');
    expect(csv).toContain('"{""social"":5,""care"":3}",예,,270,"{""name"":""상담가""}"');
  });

  it('stores a filter memo and raw career values for filtered exports', () => {
    const csv = toResultsCsv([records[1]], { filterMemo: '센터: 전체 / 검색: 음악 / 테스트 제외' });

    expect(csv).toContain('센터: 전체 / 검색: 음악 / 테스트 제외');
    expect(csv).toContain('음악가');
    expect(csv).toContain(',[]');
  });
});

describe('export file names', () => {
  it('sanitizes file name parts and includes search/test filter hints', () => {
    expect(sanitizeAdminFileNamePart(' 강남/청소년센터: A반 검색어가 아주 긴 문자열입니다 ')).toBe(
      '강남청소년센터_A반_검색어가_아주_긴_문자열입니다',
    );
    expect(
      buildAdminExportFileName({
        kind: 'results',
        extension: 'csv',
        centerLabel: '전체 센터',
        dateStamp: '2026-07-04',
        hideTestResults: true,
        searchTerm: '목공예가/테스트',
      }),
    ).toBe('wekid-results-all-no-test-목공예가테스트-2026-07-04.csv');
  });
});
