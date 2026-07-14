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

export type AdminSortKey = 'createdAt' | 'participantName' | 'centerName' | 'topCareer' | 'durationMinutes';
export type AdminSortDirection = 'asc' | 'desc';
export type AdminPageSize = number | 'all';

export type AdminResultFilters = {
  centerKey?: string;
  fromDate?: string;
  hideTestResults?: boolean;
  searchTerm?: string;
  toDate?: string;
};

export type AdminResultSort = {
  direction: AdminSortDirection;
  key: AdminSortKey;
};

export type AdminPaginationOptions = {
  page: number;
  pageSize: AdminPageSize;
};

export type AdminPaginationResult = {
  currentPage: number;
  pageResults: StoredTestResultRecord[];
  pageSize: AdminPageSize;
  totalPages: number;
  totalResults: number;
};

export type SimilarCenterGroup = {
  normalizedKey: string;
  totalCount: number;
  variants: Array<{ centerKey: string; centerName: string; count: number }>;
};

export type ResultsCsvOptions = {
  filterMemo?: string;
};

export type AdminExportFileNameOptions = {
  centerLabel: string;
  dateStamp: string;
  extension: 'csv' | 'pdf';
  hideTestResults?: boolean;
  kind: 'report' | 'results';
  searchTerm?: string;
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

export function getRecommendedCareerNames(careers: StoredTestResultRecord['recommendedCareers']) {
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

function stringifyRawValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
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

function getResultDurationSeconds(result: Pick<StoredTestResultRecord, 'startedAt' | 'completedAt'>) {
  const durationMinutes = getResultDurationMinutes(result);
  return durationMinutes === null ? null : Math.round(durationMinutes * 60);
}

function normalizeSearchValue(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('ko-KR');
}

function compactSearchValue(value: unknown) {
  return normalizeSearchValue(value).replace(/[^\p{L}\p{N}]+/gu, '');
}

function resultMatchesSearch(result: StoredTestResultRecord, searchTerm: string) {
  const query = normalizeSearchValue(searchTerm);
  const compactQuery = compactSearchValue(searchTerm);

  if (!query) {
    return true;
  }

  const fields = [
    result.participantName,
    result.centerName,
    getCareerName(result.topCareer),
    result.resultSummary,
    result.id,
  ];

  return fields.some((field) => {
    const normalizedField = normalizeSearchValue(field);
    return normalizedField.includes(query) || (compactQuery.length > 0 && compactSearchValue(field).includes(compactQuery));
  });
}

export function isSuspectedTestResult(result: Pick<StoredTestResultRecord, 'centerKey' | 'centerName' | 'participantName'>) {
  const value = `${result.participantName ?? ''} ${result.centerName ?? ''} ${result.centerKey ?? ''}`.toLocaleLowerCase(
    'ko-KR',
  );
  return ['테스트', 'test', 'mcp', 'audit'].some((keyword) => value.includes(keyword));
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
  const searchTerm = filters.searchTerm?.trim() ?? '';

  return results.filter((result) => {
    const createdAt = toDateValue(result.createdAt);
    const resultCenterKey = result.centerKey ?? 'none';

    if (filters.centerKey && resultCenterKey !== filters.centerKey) {
      return false;
    }

    if (fromDate && createdAt && createdAt < fromDate) {
      return false;
    }

    if (toDate && createdAt && createdAt > toDate) {
      return false;
    }

    if (filters.hideTestResults && isSuspectedTestResult(result)) {
      return false;
    }

    if (searchTerm && !resultMatchesSearch(result, searchTerm)) {
      return false;
    }

    return true;
  });
}

function compareNullableText(left: string | null | undefined, right: string | null | undefined) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return left.localeCompare(right, 'ko-KR', { numeric: true, sensitivity: 'base' });
}

function getSortValue(result: StoredTestResultRecord, key: AdminSortKey) {
  if (key === 'createdAt') {
    return toAdminDate(result.createdAt)?.getTime() ?? null;
  }

  if (key === 'participantName') {
    return result.participantName;
  }

  if (key === 'centerName') {
    return result.centerName;
  }

  if (key === 'topCareer') {
    return getCareerName(result.topCareer);
  }

  return getResultDurationMinutes(result);
}

export function sortAdminResults(results: StoredTestResultRecord[], sort: AdminResultSort) {
  return results
    .map((result, index) => ({ index, result }))
    .sort((left, right) => {
      const leftValue = getSortValue(left.result, sort.key);
      const rightValue = getSortValue(right.result, sort.key);
      let comparison = 0;

      if (leftValue == null && rightValue == null) {
        comparison = 0;
      } else if (leftValue == null) {
        return 1;
      } else if (rightValue == null) {
        return -1;
      } else if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        comparison = leftValue - rightValue;
      } else {
        comparison = compareNullableText(String(leftValue), String(rightValue));
      }

      if (comparison === 0) {
        return left.index - right.index;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    })
    .map(({ result }) => result);
}

export function paginateAdminResults(results: StoredTestResultRecord[], options: AdminPaginationOptions): AdminPaginationResult {
  if (options.pageSize === 'all') {
    return {
      currentPage: 1,
      pageResults: results,
      pageSize: options.pageSize,
      totalPages: 1,
      totalResults: results.length,
    };
  }

  const totalPages = Math.max(1, Math.ceil(results.length / options.pageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(options.page)), totalPages);
  const startIndex = (currentPage - 1) * options.pageSize;

  return {
    currentPage,
    pageResults: results.slice(startIndex, startIndex + options.pageSize),
    pageSize: options.pageSize,
    totalPages,
    totalResults: results.length,
  };
}

function normalizeCenterName(value: string) {
  return value.toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]+/gu, '');
}

export function detectSimilarCenterGroups(results: StoredTestResultRecord[]): SimilarCenterGroup[] {
  const groups = new Map<string, Map<string, { centerKey: string; centerName: string; count: number }>>();

  results.forEach((result) => {
    if (!result.centerName) {
      return;
    }

    const normalizedKey = normalizeCenterName(result.centerName);
    if (!normalizedKey) {
      return;
    }

    const variants = groups.get(normalizedKey) ?? new Map<string, { centerKey: string; centerName: string; count: number }>();
    const variantKey = `${result.centerName}::${result.centerKey ?? 'none'}`;
    const variant = variants.get(variantKey) ?? {
      centerKey: result.centerKey ?? 'none',
      centerName: result.centerName,
      count: 0,
    };
    variant.count += 1;
    variants.set(variantKey, variant);
    groups.set(normalizedKey, variants);
  });

  return Array.from(groups.entries())
    .map(([normalizedKey, variants]) => ({
      normalizedKey,
      variants: Array.from(variants.values()).sort((left, right) => right.count - left.count),
    }))
    .filter((group) => group.variants.length > 1)
    .map((group) => ({
      ...group,
      totalCount: group.variants.reduce((sum, variant) => sum + variant.count, 0),
    }))
    .sort((left, right) => right.totalCount - left.totalCount || left.normalizedKey.localeCompare(right.normalizedKey));
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

export function toResultsCsv(results: StoredTestResultRecord[], options: ResultsCsvOptions = {}) {
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
    '테스트의심여부',
    '필터메모',
    '소요시간초',
    '대표직업Raw',
    '추천직업Raw',
  ];
  const rows = results.map((result) => {
    const createdAt = toAdminDate(result.createdAt)?.toISOString() ?? '';
    const startedAt = toAdminDate(result.startedAt)?.toISOString() ?? '';
    const completedAt = toAdminDate(result.completedAt)?.toISOString() ?? '';
    const duration = getResultDurationMinutes(result);
    const durationSeconds = getResultDurationSeconds(result);

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
      getRecommendedCareerNames(result.recommendedCareers),
      result.answers.length,
      result.resultSummary,
      JSON.stringify(result.scores),
      isSuspectedTestResult(result) ? '예' : '아니오',
      options.filterMemo ?? '',
      durationSeconds == null ? '' : durationSeconds,
      stringifyRawValue(result.topCareer),
      JSON.stringify(result.recommendedCareers),
    ]
      .map(csvCell)
      .join(',');
  });

  return `${CSV_UTF8_BOM}${[headers.join(','), ...rows].join('\n')}`;
}

export function sanitizeAdminFileNamePart(value: string, maxLength = 48) {
  const sanitized = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return (sanitized || 'all').slice(0, maxLength);
}

export function buildAdminExportFileName({
  centerLabel,
  dateStamp,
  extension,
  hideTestResults,
  kind,
  searchTerm,
}: AdminExportFileNameOptions) {
  const centerPart = centerLabel.trim() === '전체 센터' ? 'all' : sanitizeAdminFileNamePart(centerLabel);
  const parts = [`wekid-${kind}`, centerPart];
  const trimmedSearchTerm = searchTerm?.trim();

  if (hideTestResults) {
    parts.push('no-test');
  }

  if (trimmedSearchTerm) {
    parts.push(sanitizeAdminFileNamePart(trimmedSearchTerm, 24));
  }

  parts.push(dateStamp);

  return `${parts.join('-')}.${extension}`;
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
