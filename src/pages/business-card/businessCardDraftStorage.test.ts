import { describe, expect, it } from 'vitest';
import type { BusinessCardData } from './BusinessCardPreview';
import { clearBusinessCardDraft, readBusinessCardDraft, saveBusinessCardDraft } from './businessCardDraftStorage';

function createMemoryStorage(initialValues: ReadonlyArray<readonly [string, string]> = []) {
  const values = new Map(initialValues);

  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

const cardData: BusinessCardData = {
  name: '김위키드',
  englishName: 'KIM WEKID',
  job: '웹툰 작가',
  school: '위키드 초등학교',
  phone: '010-0000-0000',
  goal: '재미있는 이야기를 그리고 싶어요.',
};

describe('business card draft storage', () => {
  it('reads a saved business card draft', () => {
    const storage = createMemoryStorage();

    saveBusinessCardDraft(cardData, storage);

    expect(readBusinessCardDraft(storage)).toEqual(cardData);
  });

  it('ignores invalid saved drafts', () => {
    const storage = createMemoryStorage([['wekid.businessCardDraft.v1', JSON.stringify({ name: '김위키드' })]]);

    expect(readBusinessCardDraft(storage)).toBeUndefined();
  });

  it('clears the saved draft', () => {
    const storage = createMemoryStorage();
    saveBusinessCardDraft(cardData, storage);

    clearBusinessCardDraft(storage);

    expect(readBusinessCardDraft(storage)).toBeUndefined();
  });
});
