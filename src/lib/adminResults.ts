import { collection, getDocs, limit, orderBy, query, type Firestore, type Timestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import type { StoredTestResultRecord, TestResultDocument } from '../types/firestore';

export const CSV_UTF8_BOM = '\uFEFF';

export type AdminResultSummary = {
  totalCount: number;
  recentCount: number;
  byCenter: Array<{ centerKey: string; centerName: string; count: number }>;
  byTopCareer: Array<{ careerName: string; count: number }>;
};

export type AdminResultAnalysis = {
  averageAnsweredCount: number;
  averageDurationMinutes: number | null;
  topCenter: { centerName: string; count: number; ratio: number } | null;
  topCareer: { careerName: string; count: number; ratio: number } | null;
  scoreAverages: Array<{ scoreKey: string; average: number; total: number }>;
};

export type AdminResultFilters = {
  centerKey?: string;
  fromDate?: string;
  toDate?: string;
};

export type FetchAdminResultsResult =
  | {
      ok: true;
      results: StoredTestResultRecord[];
    }
  | {
      ok: false;
      reason: 'firebase-not-configured' | 'read-failed';
      error?: unknown;
    };

export function toAdminDate(value: Date | Timestamp | null): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if ('toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  return null;
}

export function getCareerName(topCareer: StoredTestResultRecord['topCareer']) {
  if (typeof topCareer === 'string') {
    return topCareer;
  }

  return typeof topCareer.name === 'string' ? topCareer.name : '알 수 없음';
}

function getCareerNames(careers: StoredTestResultRecord['recommendedCareers']) {
  return careers
    .map((career) => {
      if (typeof career === 'string') {
        return career;
      }

      return typeof career.name === 'string' ? career.name : '';
    })
    .filter(Boolean)
    .join(' / ');
}

export function getResultDurationMinutes(result: Pick<StoredTestResultRecord, 'startedAt' | 'completedAt'>) {
  const startedAt = toAdminDate(result.startedAt);
  const completedAt = toAdminDate(result.completedAt);

  if (!startedAt || !completedAt) {
    return null;
  }

  const minutes = (completedAt.getTime() - startedAt.getTime()) / 60000;
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : null;
}

export function createAdminResultSummary(results: StoredTestResultRecord[], now = new Date()): AdminResultSummary {
  const byCenterMap = new Map<string, { centerKey: string; centerName: string; count: number }>();
  const byCareerMap = new Map<string, { careerName: string; count: number }>();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let recentCount = 0;

  results.forEach((result) => {
    const centerKey = result.centerKey ?? 'none';
    const centerName = result.centerName ?? '센터 없음';
    const centerEntry = byCenterMap.get(centerKey) ?? { centerKey, centerName, count: 0 };
    centerEntry.count += 1;
    byCenterMap.set(centerKey, centerEntry);

    const careerName = getCareerName(result.topCareer);
    const careerEntry = byCareerMap.get(careerName) ?? { careerName, count: 0 };
    careerEntry.count += 1;
    byCareerMap.set(careerName, careerEntry);

    const createdAt = toAdminDate(result.createdAt);
    if (createdAt && createdAt >= sevenDaysAgo) {
      recentCount += 1;
    }
  });

  return {
    totalCount: results.length,
    recentCount,
    byCenter: Array.from(byCenterMap.values()).sort((left, right) => right.count - left.count),
    byTopCareer: Array.from(byCareerMap.values()).sort((left, right) => right.count - left.count),
  };
}

export function filterResults(results: StoredTestResultRecord[], filters: AdminResultFilters) {
  const fromDate = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00.000`) : null;
  const toDate = filters.toDate ? new Date(`${filters.toDate}T23:59:59.999`) : null;

  return results.filter((result) => {
    const createdAt = toDateValue(result.createdAt);

    if (filters.centerKey && result.centerKey !== filters.centerKey) {
      return false;
    }

    if (fromDate && createdAt && createdAt < fromDate) {
      return false;
    }

    if (toDate && createdAt && createdAt > toDate) {
      return false;
    }

    return true;
  });
}

function toDateValue(value: StoredTestResultRecord['createdAt']) {
  return toAdminDate(value);
}

function toStoredTestResultRecord(id: string, data: TestResultDocument): StoredTestResultRecord {
  return {
    ...data,
    id,
    startedAt: data.startedAt as StoredTestResultRecord['startedAt'],
    completedAt: data.completedAt as StoredTestResultRecord['completedAt'],
    createdAt: data.createdAt as StoredTestResultRecord['createdAt'],
  };
}

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toResultsCsv(results: StoredTestResultRecord[]) {
  const headers = [
    '문서ID',
    '저장일',
    '검사시작',
    '검사완료',
    '소요분',
    '이름',
    '센터',
    '센터키',
    '센터입력경로',
    '대표직업',
    '추천직업',
    '답변수',
    '요약',
    '점수JSON',
  ];
  const rows = results.map((result) => {
    const createdAt = toAdminDate(result.createdAt)?.toISOString() ?? '';
    const startedAt = toAdminDate(result.startedAt)?.toISOString() ?? '';
    const completedAt = toAdminDate(result.completedAt)?.toISOString() ?? '';
    const duration = getResultDurationMinutes(result);

    return [
      result.id,
      createdAt,
      startedAt,
      completedAt,
      duration == null ? '' : duration.toFixed(1),
      result.participantName,
      result.centerName,
      result.centerKey,
      result.centerSource,
      getCareerName(result.topCareer),
      getCareerNames(result.recommendedCareers),
      result.answers.length,
      result.resultSummary,
      JSON.stringify(result.scores),
    ]
      .map(csvCell)
      .join(',');
  });

  return `${CSV_UTF8_BOM}${[headers.join(','), ...rows].join('\n')}`;
}

export function createAdminResultAnalysis(results: StoredTestResultRecord[]): AdminResultAnalysis {
  const summary = createAdminResultSummary(results);
  const durations = results
    .map((result) => getResultDurationMinutes(result))
    .filter((duration): duration is number => duration !== null);
  const averageDurationMinutes =
    durations.length > 0 ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : null;
  const averageAnsweredCount =
    results.length > 0 ? results.reduce((sum, result) => sum + result.answers.length, 0) / results.length : 0;
  const scoreTotals = new Map<string, number>();

  results.forEach((result) => {
    Object.entries(result.scores).forEach(([scoreKey, score]) => {
      scoreTotals.set(scoreKey, (scoreTotals.get(scoreKey) ?? 0) + Number(score));
    });
  });

  const scoreAverages = Array.from(scoreTotals.entries())
    .map(([scoreKey, total]) => ({
      scoreKey,
      total,
      average: results.length > 0 ? total / results.length : 0,
    }))
    .sort((left, right) => right.average - left.average || left.scoreKey.localeCompare(right.scoreKey));
  const topCenter = summary.byCenter[0]
    ? {
        centerName: summary.byCenter[0].centerName,
        count: summary.byCenter[0].count,
        ratio: results.length > 0 ? summary.byCenter[0].count / results.length : 0,
      }
    : null;
  const topCareer = summary.byTopCareer[0]
    ? {
        careerName: summary.byTopCareer[0].careerName,
        count: summary.byTopCareer[0].count,
        ratio: results.length > 0 ? summary.byTopCareer[0].count / results.length : 0,
      }
    : null;

  return {
    averageAnsweredCount,
    averageDurationMinutes,
    topCenter,
    topCareer,
    scoreAverages,
  };
}

export async function fetchAdminResults(db: Firestore | null = firestore): Promise<FetchAdminResultsResult> {
  if (!db) {
    return { ok: false, reason: 'firebase-not-configured' };
  }

  try {
    const resultsQuery = query(collection(db, 'testResults'), orderBy('createdAt', 'desc'), limit(500));
    const snapshot = await getDocs(resultsQuery);
    const results = snapshot.docs.map((documentSnapshot) =>
      toStoredTestResultRecord(documentSnapshot.id, documentSnapshot.data() as TestResultDocument),
    );

    return { ok: true, results };
  } catch (error) {
    return { ok: false, reason: 'read-failed', error };
  }
}
