import { collection, getDocs, limit, orderBy, query, type Firestore, type Timestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import type { StoredTestResultRecord, TestResultDocument } from '../types/firestore';

export type AdminResultSummary = {
  totalCount: number;
  recentCount: number;
  byCenter: Array<{ centerKey: string; centerName: string; count: number }>;
  byTopCareer: Array<{ careerName: string; count: number }>;
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

function toDate(value: Date | Timestamp | null): Date | null {
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

function getTopCareerName(topCareer: StoredTestResultRecord['topCareer']) {
  if (typeof topCareer === 'string') {
    return topCareer;
  }

  return typeof topCareer.name === 'string' ? topCareer.name : '알 수 없음';
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

    const careerName = getTopCareerName(result.topCareer);
    const careerEntry = byCareerMap.get(careerName) ?? { careerName, count: 0 };
    careerEntry.count += 1;
    byCareerMap.set(careerName, careerEntry);

    const createdAt = toDate(result.createdAt);
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
  return toDate(value);
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
  const headers = ['id', 'createdAt', 'participantName', 'centerName', 'centerKey', 'centerSource', 'topCareer', 'resultSummary'];
  const rows = results.map((result) => {
    const createdAt = toDate(result.createdAt)?.toISOString() ?? '';
    return [
      result.id,
      createdAt,
      result.participantName,
      result.centerName,
      result.centerKey,
      result.centerSource,
      getTopCareerName(result.topCareer),
      result.resultSummary,
    ]
      .map(csvCell)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
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
