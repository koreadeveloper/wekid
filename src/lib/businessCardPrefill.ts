import { careerByName } from '../data/careerCatalog';
import type { StoredTestResultRecord } from '../types/firestore';
import { getCareerName, isV2Result, toAdminDate } from './adminResults';

export type BusinessCardPrefill = {
  sourceId: string;
  name: string;
  email: string;
  school: string;
  job: string;
  goal: string;
};

export function createBusinessCardPrefill(result: StoredTestResultRecord): BusinessCardPrefill {
  const job = isV2Result(result)
    ? result.dreamChoice.kind === 'undecided' || result.dreamChoice.kind === 'custom'
      ? ''
      : careerByName[result.dreamChoice.careerName.trim()]?.name ?? ''
    : getCareerName(result.topCareer).trim();

  return {
    sourceId: result.id,
    name: result.participantName?.trim() ?? '',
    email: result.participantEmail?.trim() ?? '',
    school: result.centerName?.trim() ?? '',
    job,
    goal: result.resultSummary.trim(),
  };
}

function normalizeSearchValue(value: string) {
  return value.toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]+/gu, '');
}

export function searchBusinessCardResults(results: StoredTestResultRecord[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return [];
  }

  return results
    .map((result, index) => ({ index, result, prefill: createBusinessCardPrefill(result) }))
    .filter(({ prefill }) => {
      const normalizedName = normalizeSearchValue(prefill.name);

      return normalizedName.length > 0 && normalizedName.includes(normalizedQuery);
    })
    .sort((left, right) => {
      const leftTime = toAdminDate(left.result.createdAt)?.getTime() ?? Number.NEGATIVE_INFINITY;
      const rightTime = toAdminDate(right.result.createdAt)?.getTime() ?? Number.NEGATIVE_INFINITY;
      return rightTime - leftTime || left.index - right.index;
    })
    .map(({ result }) => result);
}
