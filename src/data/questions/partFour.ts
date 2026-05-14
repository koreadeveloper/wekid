import type { Question } from '../../types/career';

export const questionPartFour: Question[] = [
  {
    id: 19,
    axis: 'decision',
    eyebrow: '학급 행사',
    text: '행사 종목을 정할 때 내 기준은?',
    options: [
      {
        label: '가장 많이 이길 수 있는 종목',
        choice: 'solve',
        helper: '결과를 분석해서 유리한 선택을 해요.',
      },
      {
        label: '모두가 즐겁게 참여할 수 있는 종목',
        choice: 'care',
        helper: '함께 즐거운 게 더 중요해요.',
      },
    ],
  },
  {
    id: 20,
    axis: 'pace',
    eyebrow: '모둠 프로젝트',
    text: '프로젝트 마감 일주일 전 나는?',
    options: [
      {
        label: '남은 분량을 나눠 일정대로 끝낸다',
        choice: 'plan',
        helper: '체계적으로 하면 마감이 무섭지 않아요.',
      },
      {
        label: '완성도를 높일 새 아이디어를 찾는다',
        choice: 'flex',
        helper: '마지막까지 더 좋은 방법을 찾아요.',
      },
    ],
  },
  {
    id: 21,
    axis: 'energy',
    eyebrow: '긴 연휴',
    text: '연휴가 끝났을 때 활력이 생기는 경우는?',
    options: [
      {
        label: '친구, 가족과 함께 신나게 논 날',
        choice: 'together',
        helper: '사람들과 함께하면 에너지가 충전돼요.',
      },
      {
        label: '혼자 조용히 하고 싶던 걸 마음껏 한 날',
        choice: 'focus',
        helper: '나만의 시간이 있어야 기운이 나요.',
      },
    ],
  },
  {
    id: 22,
    axis: 'information',
    eyebrow: '과학 실험',
    text: '실험 결과가 예상과 다를 때 나는?',
    options: [
      {
        label: '어디서 틀렸는지 단계별로 확인한다',
        choice: 'observe',
        helper: '사실을 하나씩 확인하면 답이 보여요.',
      },
      {
        label: '다른 이유가 있지 않을까 상상해본다',
        choice: 'imagine',
        helper: '예상 밖 결과가 새로운 발견일 수 있어요.',
      },
    ],
  },
  {
    id: 23,
    axis: 'decision',
    eyebrow: '의견 충돌',
    text: '친구와 다른 의견이 생겼을 때 나는?',
    options: [
      {
        label: '어느 쪽이 더 맞는지 사실로 확인한다',
        choice: 'solve',
        helper: '근거가 있으면 해결이 빠르게 돼요.',
      },
      {
        label: '서로 기분이 상하지 않게 이야기한다',
        choice: 'care',
        helper: '관계를 지키는 게 먼저예요.',
      },
    ],
  },
  {
    id: 24,
    axis: 'pace',
    eyebrow: '자유 시간',
    text: '갑자기 두 시간이 생겼을 때 나는?',
    options: [
      {
        label: '미리 해두고 싶었던 일을 꺼낸다',
        choice: 'plan',
        helper: '준비된 목록이 있으면 바로 시작할 수 있어요.',
      },
      {
        label: '지금 하고 싶은 걸 바로 시작한다',
        choice: 'flex',
        helper: '그 순간의 감각을 따라가면 즐거워요.',
      },
    ],
  },
];
