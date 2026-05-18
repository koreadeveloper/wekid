import type { CareerDetail } from '../../types/career';

export type CareerDetailSeed = {
  name: string;
  emoji: string;
  tagline: string;
  field: string;
  outcome: string;
  tools: string;
  places?: string[];
  skills: string[];
  school?: string[];
  steps?: string[];
  funFact?: string;
};

type CareerDetailDefaults = {
  places: string[];
  skills: string[];
  school: string[];
  steps: string[];
};

const unique = (items: string[]) => [...new Set(items)].filter(Boolean);

const hasFinalConsonant = (value: string) => {
  const lastChar = value.trim().charAt(value.trim().length - 1);
  const code = lastChar.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
};

const subjectParticle = (value: string) => (hasFinalConsonant(value) ? '은' : '는');
const objectParticle = (value: string) => (hasFinalConsonant(value) ? '을' : '를');
const andParticle = (value: string) => (hasFinalConsonant(value) ? '과' : '와');

export const createCareerDetails = (seeds: CareerDetailSeed[], defaults: CareerDetailDefaults): CareerDetail[] =>
  seeds.map((seed) => {
    const places = seed.places ?? defaults.places;
    const skills = unique([...seed.skills, ...defaults.skills]).slice(0, 5);
    const schoolActivities = unique(
      seed.school ?? [
        seed.field + andParticle(seed.field) + ' 관련된 작은 조사 주제를 정해 보기',
        seed.tools + subjectParticle(seed.tools) + ' 어떻게 쓰이는지 사진이나 영상으로 찾아보기',
        seed.name + '에게 필요한 태도를 학교생활에서 연습해 보기',
        '친구들과 역할을 나누어 작은 프로젝트를 끝까지 완성해 보기',
      ],
    ).slice(0, 4);
    const growthSteps = unique(
      seed.steps ?? [
        '관심 분야의 쉬운 책이나 영상을 꾸준히 찾아보기',
        '새로 알게 된 직업 정보를 한 문장으로 정리해 보기',
        '비슷한 직업 두 가지를 비교하며 차이점 찾기',
        '직접 해볼 수 있는 작은 체험 활동에 참여해 보기',
      ],
    ).slice(0, 4);

    return {
      name: seed.name,
      emoji: seed.emoji,
      tagline: seed.tagline,
      description:
        seed.name +
        subjectParticle(seed.name) +
        ' ' +
        seed.field +
        ' 분야에서 ' +
        seed.outcome +
        ' 직업이에요. ' +
        seed.tools +
        objectParticle(seed.tools) +
        ' 활용해 상황을 살피고, 사람들에게 실제로 필요한 결과가 나오도록 끝까지 확인해요.',
      dailyTasks: [
        seed.field + andParticle(seed.field) + ' 관련된 문제나 요청을 살펴보고 하루 계획을 세워요.',
        seed.tools + objectParticle(seed.tools) + ' 활용해 ' + seed.outcome + ' 일을 해요.',
        '동료나 이용자와 이야기하며 필요한 정보를 확인하고 기록해요.',
        '완성된 결과가 안전하고 정확한지 점검하고 더 나은 방법을 찾아요.',
      ],
      workPlaces: places,
      skills,
      schoolActivities,
      growthSteps,
      funFact:
        seed.funFact ??
        seed.name +
          subjectParticle(seed.name) +
          ' 한 가지 능력만으로 잘하는 직업이 아니에요. ' +
          skills.slice(0, 3).join(', ') +
          ' 같은 힘을 함께 키울수록 더 멋지게 성장할 수 있어요.',
    };
  });
