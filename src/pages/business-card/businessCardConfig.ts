import { jobCardThemes } from '../../data/jobCardThemes';
import type { BusinessCardData } from './BusinessCardPreview';

export const PRINT_CARD_COUNT = 10;

export type ResultBusinessCardSeed = {
  readonly userName: string;
  readonly centerName: string | null;
  readonly careerName: string;
};

export const defaultCardData: BusinessCardData = {
  name: '김위키드',
  englishName: 'KIM WEKID',
  job: jobCardThemes[0].name,
  school: '위키드 초등학교',
  phone: '',
  goal: '사람들이 즐거운 순간을 만들고 싶어요.',
};

export const businessCardFields: ReadonlyArray<{
  readonly id: keyof BusinessCardData;
  readonly label: string;
  readonly maxLength: number;
  readonly placeholder: string;
}> = [
  { id: 'name', label: '이름', maxLength: 12, placeholder: '김위키드' },
  { id: 'englishName', label: '영문 이름', maxLength: 24, placeholder: 'KIM WEKID' },
  { id: 'school', label: '학교 또는 센터', maxLength: 24, placeholder: '위키드 초등학교' },
  { id: 'phone', label: '보호자 연락처 (선택)', maxLength: 18, placeholder: '010-0000-0000' },
  { id: 'goal', label: '한 줄 목표', maxLength: 36, placeholder: '사람들이 즐거운 순간을 만들고 싶어요.' },
] as const;

export const cardCopies = Array.from({ length: PRINT_CARD_COUNT }, (_, index) => index);

export function buildResultBusinessCardData(seed: ResultBusinessCardSeed): BusinessCardData {
  return {
    ...defaultCardData,
    name: seed.userName.trim() || defaultCardData.name,
    job: seed.careerName.trim() || defaultCardData.job,
    school: seed.centerName?.trim() || defaultCardData.school,
  };
}
