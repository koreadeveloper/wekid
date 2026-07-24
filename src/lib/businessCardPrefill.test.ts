import { describe, expect, it } from 'vitest';
import { careerCatalog } from '../data/careerCatalog';
import type { StoredTestResultRecord } from '../types/firestore';
import { createBusinessCardPrefill, searchBusinessCardResults } from './businessCardPrefill';

function v1Result(overrides: Partial<StoredTestResultRecord> = {}): StoredTestResultRecord {
  return {
    id: 'v1-result',
    participantName: '김하늘',
    participantEmail: ' sky@example.com ',
    centerName: ' 별빛초등학교 ',
    centerKey: '별빛초등학교',
    centerSource: 'manual',
    startedAt: new Date('2026-07-01T09:00:00.000Z'),
    completedAt: new Date('2026-07-01T09:05:00.000Z'),
    createdAt: new Date('2026-07-01T09:05:00.000Z'),
    schemaVersion: 1,
    answers: [],
    scores: {},
    topCareer: { name: '사진작가' },
    recommendedCareers: [],
    resultSummary: ' 관찰한 것을 사진으로 남기고 싶어요. ',
    ...overrides,
  } as StoredTestResultRecord;
}

function v2Result(overrides: Partial<StoredTestResultRecord> = {}): StoredTestResultRecord {
  return {
    ...v1Result(),
    id: 'v2-result',
    questionnaireVersion: 2,
    answerSnapshots: [],
    fieldResults: [],
    recommendedFieldResults: [],
    dreamChoice: { kind: 'catalog', careerName: '천문학자' },
    schemaVersion: 2,
    topCareer: '',
    recommendedCareers: [],
    ...overrides,
  } as StoredTestResultRecord;
}

describe('createBusinessCardPrefill', () => {
  it('uses a v2 final dream and saved participant fields', () => {
    const prefill = createBusinessCardPrefill(v2Result({
      participantName: '김하늘',
      participantEmail: 'sky@example.com',
      centerName: '별빛초등학교',
      dreamChoice: { kind: 'catalog', careerName: '천문학자' },
      resultSummary: '별을 관찰하는 일을 좋아해요.',
    }));

    expect(prefill).toMatchObject({
      sourceId: 'v2-result',
      name: '김하늘',
      email: 'sky@example.com',
      school: '별빛초등학교',
      job: '천문학자',
      goal: '별을 관찰하는 일을 좋아해요.',
    });
  });

  it('uses the v1 top career and trims optional participant fields', () => {
    expect(createBusinessCardPrefill(v1Result())).toEqual({
      sourceId: 'v1-result',
      name: '김하늘',
      email: 'sky@example.com',
      school: '별빛초등학교',
      job: '사진작가',
      goal: '관찰한 것을 사진으로 남기고 싶어요.',
    });
  });

  it('leaves a v2 undecided dream blank', () => {
    expect(createBusinessCardPrefill(v2Result({ dreamChoice: { kind: 'undecided' } })).job).toBe('');
  });

  it('leaves custom and non-catalog v2 dreams blank', () => {
    expect(createBusinessCardPrefill(v2Result({
      dreamChoice: { kind: 'custom', careerName: '천문학자' },
    })).job).toBe('');
    expect(createBusinessCardPrefill(v2Result({
      dreamChoice: { kind: 'catalog', careerName: '우주 해적' },
    })).job).toBe('');
  });

  it('keeps all 107 catalog careers as v2 card jobs', () => {
    expect(careerCatalog).toHaveLength(107);

    for (const career of careerCatalog) {
      expect(createBusinessCardPrefill(v2Result({
        dreamChoice: { kind: 'catalog', careerName: career.name },
      })).job).toBe(career.name);
    }
  });
});

describe('searchBusinessCardResults', () => {
  it('excludes nameless rows and keeps same-name responses newest first', () => {
    const olderKim = v1Result({ id: 'older-result', createdAt: new Date('2026-07-01T09:05:00.000Z') });
    const nameless = v1Result({ id: 'nameless-result', participantName: '  ', createdAt: new Date('2026-07-03T09:05:00.000Z') });
    const latestKim = v2Result({ id: 'latest-result', createdAt: new Date('2026-07-04T09:05:00.000Z') });

    expect(searchBusinessCardResults([olderKim, nameless, latestKim], '김하늘').map((result) => result.id))
      .toEqual(['latest-result', 'older-result']);
  });

  it('matches only partial and full normalized Korean names', () => {
    const result = v2Result({
      participantName: ' 김 하 늘 ',
    });

    expect(searchBusinessCardResults([result], '김하')).toHaveLength(1);
    expect(searchBusinessCardResults([result], '김 하 늘')).toHaveLength(1);
  });

  it('returns no results for a punctuation-only query', () => {
    expect(searchBusinessCardResults([v1Result()], '---')).toHaveLength(0);
  });

  it('excludes names that normalize to empty', () => {
    const punctuationOnlyName = v1Result({ id: 'punctuation-name', participantName: ' -.- ' });
    const namedResult = v2Result({ id: 'named-result', participantName: '김하늘' });

    expect(searchBusinessCardResults([punctuationOnlyName, namedResult], '김하늘').map((result) => result.id))
      .toEqual(['named-result']);
  });

  it('does not match email, school, job, goal, or source ID values', () => {
    const result = v2Result({
      id: 'survey-result-42',
      participantName: ' 김 하 늘 ',
      participantEmail: 'SKY@EXAMPLE.COM',
      centerName: '별빛 초등학교',
      dreamChoice: { kind: 'custom', careerName: ' 천문학자 ' },
      resultSummary: '별을 관찰하는 일을 좋아해요.',
    });

    for (const query of [
      'sky@example.com',
      '별빛초등학교',
      '천문학자',
      '별을관찰',
      'survey-result-42',
    ]) {
      expect(searchBusinessCardResults([result], query)).toHaveLength(0);
    }
  });
});
