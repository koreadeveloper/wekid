import type { Question } from '../../types/career';

export const questionPartThree: Question[] = [
  {
    id: 13,
    axis: 'energy',
    eyebrow: '방과 후 시간',
    text: '오늘 하루 제일 기억에 남는 순간은?',
    options: [
      {
        label: '친구들과 같이 웃고 떠든 순간',
        choice: 'together',
        helper: '함께하면 시간이 빨리 가요.',
      },
      {
        label: '혼자 무언가에 푹 빠져든 순간',
        choice: 'focus',
        helper: '집중하다 보면 시간이 사라져요.',
      },
    ],
  },
  {
    id: 14,
    axis: 'information',
    eyebrow: '역사 수업',
    text: '역사를 배울 때 더 끌리는 것은?',
    options: [
      {
        label: '그때 실제로 어떤 일이 벌어졌는지',
        choice: 'observe',
        helper: '사실과 증거를 알면 이해가 쉬워요.',
      },
      {
        label: '왜 그런 일이 생겼는지 연결 고리',
        choice: 'imagine',
        helper: '숨어 있는 이유를 찾는 게 재미있어요.',
      },
    ],
  },
  {
    id: 15,
    axis: 'decision',
    eyebrow: '모둠 발표',
    text: '발표 주제가 마음에 안 들 때 나는?',
    options: [
      {
        label: '더 좋은 주제를 찾아 근거를 제시한다',
        choice: 'solve',
        helper: '논리적으로 더 나은 방법을 제안해요.',
      },
      {
        label: '친구들 의견을 먼저 들어본다',
        choice: 'care',
        helper: '모두의 마음을 살피며 결정해요.',
      },
    ],
  },
  {
    id: 16,
    axis: 'pace',
    eyebrow: '방학 계획',
    text: '방학 첫 날 내 모습은?',
    options: [
      {
        label: '할 일 목록을 만들고 날짜를 정한다',
        choice: 'plan',
        helper: '계획이 있으면 방학이 알차게 느껴져요.',
      },
      {
        label: '그날그날 하고 싶은 걸 한다',
        choice: 'flex',
        helper: '흐름에 따라 움직이면 즐거운 일이 생겨요.',
      },
    ],
  },
  {
    id: 17,
    axis: 'energy',
    eyebrow: '새 동아리',
    text: '동아리에 처음 갔을 때 나는?',
    options: [
      {
        label: '먼저 말 걸고 친해지려고 노력한다',
        choice: 'together',
        helper: '새로운 사람을 만나는 게 설레요.',
      },
      {
        label: '상황을 먼저 파악하고 천천히 다가간다',
        choice: 'focus',
        helper: '차분히 살펴보면 더 편안해져요.',
      },
    ],
  },
  {
    id: 18,
    axis: 'information',
    eyebrow: '독서 시간',
    text: '책을 고를 때 더 당기는 건?',
    options: [
      {
        label: '실제 사건이나 인물 이야기',
        choice: 'observe',
        helper: '사실에 가까울수록 더 흥미로워요.',
      },
      {
        label: '상상 속 세계나 미래 이야기',
        choice: 'imagine',
        helper: '새로운 세계를 그려보는 게 좋아요.',
      },
    ],
  },
];
