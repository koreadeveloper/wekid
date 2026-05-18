import type { CareerDetail, CareerFit, InterestKey, StyleKey } from '../types/career';

const interestFallbacks: Record<
  InterestKey,
  { emoji: string; tagline: string; lens: string; workPlaces: string[]; tasks: string[]; activities: string[] }
> = {
  realistic: {
    emoji: '🛠️',
    tagline: '손으로 익히고 현장에서 해결하는 사람',
    lens: '직접 보고 만들고 움직이는 힘',
    workPlaces: ['현장', '작업실', '훈련장', '기술 센터'],
    tasks: ['현장의 상태를 살피고 필요한 장비를 준비해요', '문제가 생긴 부분을 직접 고치거나 조정해요', '안전 규칙을 지키며 결과를 확인해요'],
    activities: ['간단한 도구 사용법 익히기', '안전 규칙 포스터 만들기', '관찰한 문제를 직접 고쳐보기'],
  },
  investigative: {
    emoji: '🔎',
    tagline: '궁금한 원리를 끝까지 찾는 사람',
    lens: '질문하고 분석하며 원리를 찾는 힘',
    workPlaces: ['연구실', '대학·연구소', '기업 연구팀', '데이터 분석실'],
    tasks: ['궁금한 문제를 정하고 조사 계획을 세워요', '실험이나 자료 분석으로 근거를 찾아요', '발견한 내용을 보고서나 발표로 정리해요'],
    activities: ['하루 한 가지 질문 노트 쓰기', '작은 실험 계획하기', '자료를 표로 정리해 비교하기'],
  },
  artistic: {
    emoji: '🎨',
    tagline: '생각과 감정을 표현하는 사람',
    lens: '상상한 것을 자기답게 표현하는 힘',
    workPlaces: ['스튜디오', '제작사', '디자인 회사', '공연·전시 공간'],
    tasks: ['표현하고 싶은 주제와 분위기를 정해요', '그림, 글, 소리, 영상 같은 결과물을 만들어요', '사람들의 반응을 보고 작품을 더 다듬어요'],
    activities: ['짧은 이야기나 콘티 만들기', '좋아하는 작품 분석하기', '색과 분위기 보드 만들기'],
  },
  social: {
    emoji: '🤝',
    tagline: '사람의 성장을 돕는 사람',
    lens: '상대의 마음을 살피고 돕는 힘',
    workPlaces: ['학교', '상담실', '병원·복지기관', '지역 센터'],
    tasks: ['상대가 어려워하는 부분을 듣고 살펴요', '필요한 도움이나 설명을 차근차근 전해요', '변화를 기록하며 다음 도움을 계획해요'],
    activities: ['친구에게 쉽게 설명해 보기', '도움이 필요한 상황 관찰하기', '봉사 활동 아이디어 쓰기'],
  },
  enterprising: {
    emoji: '📣',
    tagline: '아이디어를 실행으로 이끄는 사람',
    lens: '사람을 모으고 계획을 움직이는 힘',
    workPlaces: ['회사', '창업팀', '방송·행사 현장', '기획 사무실'],
    tasks: ['목표와 아이디어를 정하고 실행 계획을 세워요', '팀원과 역할을 나누고 일정을 조정해요', '현장에서 생기는 변화를 빠르게 판단해요'],
    activities: ['작은 행사 기획서 쓰기', '친구들에게 아이디어 발표하기', '역할을 나눠 프로젝트 해보기'],
  },
  conventional: {
    emoji: '📋',
    tagline: '정확하게 정리하고 지키는 사람',
    lens: '자료와 규칙을 꼼꼼히 관리하는 힘',
    workPlaces: ['자료실', '관리 부서', '공항·관제실', '병원·약국'],
    tasks: ['중요한 자료와 규칙을 정확히 확인해요', '기록을 정리하고 빠진 부분을 찾아요', '실수가 생기지 않도록 순서대로 점검해요'],
    activities: ['체크리스트 만들기', '기록을 보기 좋게 정리하기', '숫자나 자료의 오류 찾아보기'],
  },
};

const categoryInterest: Record<string, InterestKey> = {
  '과학·연구': 'investigative',
  '기술·디지털': 'investigative',
  '예술·콘텐츠': 'artistic',
  '사람·교육': 'social',
  '의료·돌봄': 'social',
  '비즈니스·리더십': 'enterprising',
  '사회·안전·공공': 'enterprising',
  '자연·현장·스포츠': 'realistic',
};

const growthByStyle: Record<StyleKey, string> = {
  together: '모둠 활동에서 역할을 맡아 친구들과 협력해 보기',
  focus: '한 가지 주제를 정해 끝까지 완성한 기록 남기기',
  observe: '눈으로 본 사실을 사진, 표, 메모로 정리하기',
  imagine: '떠오른 아이디어를 그림이나 짧은 글로 먼저 표현하기',
  solve: '문제의 원인과 해결 방법을 나누어 생각해 보기',
  care: '상대가 무엇을 필요로 하는지 물어보고 도와보기',
  plan: '작은 목표를 정하고 순서를 나눠 실천해 보기',
  flex: '예상과 다르게 흘러간 상황에서 새 방법을 찾아보기',
};

const unique = (items: string[]) => [...new Set(items)].filter(Boolean);

const hasFinalConsonant = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const lastChar = trimmed.charAt(trimmed.length - 1);
  const code = lastChar.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
};

const topicParticle = (value: string) => (hasFinalConsonant(value) ? '은' : '는');

const getMainInterest = (fit?: CareerFit, categoryTitle?: string): InterestKey => {
  if (fit) {
    return Object.entries(fit.interestFit).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] as InterestKey;
  }

  return categoryInterest[categoryTitle ?? ''] ?? 'social';
};

const getGrowthSteps = (fit?: CareerFit) => {
  const styleSteps = fit ? Object.values(fit.styleFit).map((style) => growthByStyle[style]) : [];
  return unique([...styleSteps, '관심 있는 직업을 인터뷰하거나 영상으로 찾아보기']).slice(0, 4);
};

export const enrichCareerDetail = (detail: CareerDetail, fit?: CareerFit, categoryTitle?: string): CareerDetail => {
  const mainInterest = getMainInterest(fit, categoryTitle);
  const fallback = interestFallbacks[mainInterest];
  const fitTags = fit?.fitTags.slice(0, 3).join(', ') ?? detail.skills.slice(0, 3).join(', ');

  return {
    ...detail,
    fitReason:
      detail.fitReason ??
      `${fit?.reasonTemplate ?? detail.description} 특히 ${fitTags} 같은 강점을 자주 쓰며, ${fallback.lens}을 실제 일로 연결할 수 있어요.`,
    workPlaces: detail.workPlaces ?? fallback.workPlaces,
    schoolActivities: detail.schoolActivities ?? unique([...(fit?.missions ?? []), ...fallback.activities]).slice(0, 4),
    growthSteps: detail.growthSteps ?? getGrowthSteps(fit),
  };
};

export const buildFallbackCareerDetail = (careerName: string, fit?: CareerFit, categoryTitle?: string): CareerDetail => {
  const mainInterest = getMainInterest(fit, categoryTitle);
  const fallback = interestFallbacks[mainInterest];
  const fitTags = fit?.fitTags ?? [fallback.lens, '관찰', '꾸준함'];

  return enrichCareerDetail(
    {
      name: careerName,
      emoji: fallback.emoji,
      tagline: fallback.tagline,
      description: `${careerName}${topicParticle(careerName)} ${fallback.lens}을 바탕으로 사람이나 사회에 필요한 가치를 만들어내는 직업이에요. 어떤 하루를 보내는지, 어떤 능력을 자주 쓰는지 알면 더 구체적으로 탐색할 수 있어요.`,
      dailyTasks: fallback.tasks,
      skills: fitTags,
      funFact: '직업은 한 가지 성향만으로 정해지지 않아요. 흥미와 경험이 쌓이면서 더 선명해질 수 있어요!',
    },
    fit,
    categoryTitle,
  );
};
