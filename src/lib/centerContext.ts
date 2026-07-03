export type CenterSource = 'url' | 'manual' | 'none';

export type CenterContext = {
  centerName: string | null;
  centerKey: string | null;
  centerSource: CenterSource;
};

export function normalizeCenterName(value: string | null | undefined): string | null {
  const normalized = value?.normalize('NFKC').trim().replace(/\s+/g, ' ');
  return normalized ? normalized : null;
}

export function createCenterKey(value: string | null | undefined): string | null {
  const centerName = normalizeCenterName(value);

  if (!centerName) {
    return null;
  }

  const key = centerName
    .toLocaleLowerCase('ko-KR')
    .replace(/[^\p{L}\p{N}\s_-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return key || null;
}

export function getCenterNameFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  return normalizeCenterName(params.get('centerName')) ?? normalizeCenterName(params.get('center'));
}

export function resolveCenterContext(input: {
  centerInput: string;
  initialUrlCenterName: string | null;
  isManual: boolean;
}): CenterContext {
  const centerName = normalizeCenterName(input.centerInput);

  if (!centerName) {
    return {
      centerName: null,
      centerKey: null,
      centerSource: 'none',
    };
  }

  const initialUrlCenterName = normalizeCenterName(input.initialUrlCenterName);

  return {
    centerName,
    centerKey: createCenterKey(centerName),
    centerSource: input.isManual || centerName !== initialUrlCenterName ? 'manual' : 'url',
  };
}
