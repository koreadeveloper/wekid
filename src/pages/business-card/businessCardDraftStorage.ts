import type { BusinessCardData } from './BusinessCardPreview';

const BUSINESS_CARD_DRAFT_STORAGE_KEY = 'wekid.businessCardDraft.v1';

type BusinessCardDraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const businessCardDataKeys = ['name', 'englishName', 'job', 'school', 'phone', 'goal'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function isBusinessCardData(value: unknown): value is BusinessCardData {
  return isRecord(value) && businessCardDataKeys.every((key) => typeof value[key] === 'string');
}

function getSessionDraftStorage(): BusinessCardDraftStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readBusinessCardDraft(storage: BusinessCardDraftStorage | null = getSessionDraftStorage()) {
  if (!storage) {
    return undefined;
  }

  try {
    const storedDraft = storage.getItem(BUSINESS_CARD_DRAFT_STORAGE_KEY);
    if (!storedDraft) {
      return undefined;
    }

    const parsedDraft: unknown = JSON.parse(storedDraft);
    return isBusinessCardData(parsedDraft) ? parsedDraft : undefined;
  } catch {
    return undefined;
  }
}

export function saveBusinessCardDraft(
  cardData: BusinessCardData,
  storage: BusinessCardDraftStorage | null = getSessionDraftStorage(),
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(BUSINESS_CARD_DRAFT_STORAGE_KEY, JSON.stringify(cardData));
  } catch {
  }
}

export function clearBusinessCardDraft(storage: BusinessCardDraftStorage | null = getSessionDraftStorage()) {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(BUSINESS_CARD_DRAFT_STORAGE_KEY);
  } catch {
  }
}
