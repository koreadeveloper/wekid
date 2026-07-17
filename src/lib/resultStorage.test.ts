import { describe, expect, it, vi } from 'vitest';
import { saveTestResult } from './resultStorage';
import type { TestResultDraft } from '../types/firestore';

const draft: TestResultDraft = {
  participantName: '김탐험',
  centerName: ' 강남 청소년센터 ',
  centerKey: '강남 청소년센터',
  centerSource: 'manual',
  startedAt: new Date('2026-07-04T00:00:00.000Z'),
  completedAt: new Date('2026-07-04T00:05:00.000Z'),
  answers: [{ questionId: 'q1', choice: 'A' }],
  scores: { realistic: 3, artistic: 2 },
  topCareer: { name: '사진작가' },
  recommendedCareers: [{ name: '목공예가' }],
  resultSummary: '관찰과 기록을 좋아해요.',
};

describe('saveTestResult', () => {
  it('skips Firestore writes when Firebase is not configured', async () => {
    const addTestResult = vi.fn();

    const result = await saveTestResult(draft, { db: null, addTestResult });

    expect(result).toEqual({ ok: false, reason: 'firebase-not-configured' });
    expect(addTestResult).not.toHaveBeenCalled();
  });

  it('writes the normalized test result and returns the created id', async () => {
    const createdAt = new Date('2026-07-04T00:05:01.000Z');
    const addTestResult = vi.fn().mockResolvedValue({ id: 'result-123' });

    const result = await saveTestResult(draft, {
      db: {} as never,
      addTestResult,
      getServerTimestamp: () => createdAt,
    });

    expect(addTestResult).toHaveBeenCalledWith({
      ...draft,
      participantName: '김탐험',
      participantEmail: null,
      centerName: '강남 청소년센터',
      centerKey: '강남 청소년센터',
      centerSource: 'manual',
      createdAt,
      schemaVersion: 1,
    });
    expect(result).toEqual({ ok: true, resultId: 'result-123' });
  });

  it('returns a write-failed result instead of throwing', async () => {
    const error = new Error('permission-denied');
    const addTestResult = vi.fn().mockRejectedValue(error);

    const result = await saveTestResult(draft, {
      db: {} as never,
      addTestResult,
    });

    expect(result).toEqual({ ok: false, reason: 'write-failed', error });
  });

  it('writes a schema v2 result with snapshots, fields, and dream choice', async () => {
    const addTestResult = vi.fn().mockResolvedValue({ id: 'result-v2' });
    const v2Draft = {
      participantName: '김탐험',
      centerName: '강남 청소년센터',
      centerKey: '강남 청소년센터',
      centerSource: 'manual' as const,
      startedAt: new Date('2026-07-04T00:00:00.000Z'),
      completedAt: new Date('2026-07-04T00:05:00.000Z'),
      questionnaireVersion: 2 as const,
      answerSnapshots: [{
        questionId: 1,
        questionText: '체험 수업에서 더 해보고 싶은 것은?',
        choice: 'A' as const,
        optionLabel: '별과 우주를 관찰하며 궁금한 점 알아보기',
      }],
      fieldResults: [{
        fieldId: 'research' as const,
        label: '호기심 많은 탐구자 — 과학·연구',
        score: 0.9,
        scoreBand: 'very-high' as const,
        evidence: ['별과 우주를 관찰하며 궁금한 점 알아보기'],
        recommendedCareers: [{
          name: '과학자',
          score: 0.9,
          primaryField: 'research' as const,
          reason: '궁금한 세상을 탐험해요.',
        }],
      }],
      recommendedFieldResults: [{
        fieldId: 'research' as const,
        label: '호기심 많은 탐구자 — 과학·연구',
        score: 0.9,
        scoreBand: 'very-high' as const,
        evidence: ['별과 우주를 관찰하며 궁금한 점 알아보기'],
        recommendedCareers: [],
      }],
      dreamChoice: { kind: 'catalog' as const, careerName: '유튜버' },
      resultSummary: '여러 방향을 탐험했어요.',
    };

    await saveTestResult(v2Draft, { db: {} as never, addTestResult, getServerTimestamp: () => new Date() });

    expect(addTestResult).toHaveBeenCalledWith(expect.objectContaining({
      schemaVersion: 2,
      questionnaireVersion: 2,
      answerSnapshots: expect.any(Array),
      recommendedFieldResults: expect.any(Array),
      dreamChoice: { kind: 'catalog', careerName: '유튜버' },
    }));
  });
});
