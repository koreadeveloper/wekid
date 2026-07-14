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
});
