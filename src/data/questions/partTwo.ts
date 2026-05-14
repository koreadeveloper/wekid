import type { Question } from '../../types/career';

export const questionPartTwo: Question[] = [
  {
    id: 7,
    axis: 'decision',
    eyebrow: '선물 고르기',
    text: '내가 고르는 기준은?',
    options: [
      {
        label: '오래 쓰고 도움이 되는 선물',
        choice: 'solve',
        helper: '쓸모와 이유를 꼼꼼히 생각해요.',
      },
      {
        label: '받는 사람이 활짝 웃을 선물',
        choice: 'care',
        helper: '기분과 마음을 먼저 떠올려요.',
      },
    ],
  },
  {
    id: 8,
    axis: 'pace',
    eyebrow: '체험학습',
    text: '출발 전 나는?',
    options: [
      {
        label: '준비물과 시간을 미리 확인하기',
        choice: 'plan',
        helper: '예상하고 준비하면 더 잘할 수 있어요.',
      },
      {
        label: '가서 재미있는 걸 발견해보기',
        choice: 'flex',
        helper: '상황에 맞춰 움직이는 게 자연스러워요.',
      },
    ],
  },
  {
    id: 9,
    axis: 'energy',
    eyebrow: '궁금한 문제',
    text: '답을 찾을 때 나는?',
    options: [
      {
        label: '친구와 말하며 아이디어 나누기',
        choice: 'together',
        helper: '대화 속에서 생각이 더 커져요.',
      },
      {
        label: '먼저 혼자 생각을 정리하기',
        choice: 'focus',
        helper: '차분히 살피면 좋은 답이 보여요.',
      },
    ],
  },
  {
    id: 10,
    axis: 'information',
    eyebrow: '좋아하는 수업',
    text: '더 끌리는 활동은?',
    options: [
      {
        label: '관찰하고 실험해서 확인하기',
        choice: 'observe',
        helper: '정확한 결과와 실제 경험이 좋아요.',
      },
      {
        label: '이야기와 아이디어를 연결하기',
        choice: 'imagine',
        helper: '보이지 않는 뜻을 찾아내고 싶어요.',
      },
    ],
  },
  {
    id: 11,
    axis: 'decision',
    eyebrow: '규칙 정하기',
    text: '더 중요하다고 느끼는 것은?',
    options: [
      {
        label: '모두에게 공평한 기준 만들기',
        choice: 'solve',
        helper: '정확하고 납득되는 규칙을 세워요.',
      },
      {
        label: '서로의 마음이 다치지 않게 하기',
        choice: 'care',
        helper: '함께 편안한 분위기를 만들어요.',
      },
    ],
  },
  {
    id: 12,
    axis: 'pace',
    eyebrow: '발표 준비',
    text: '마지막 점검 시간에 나는?',
    options: [
      {
        label: '연습한 대로 또박또박 마무리하기',
        choice: 'plan',
        helper: '정해진 순서를 지키면 실수가 줄어요.',
      },
      {
        label: '더 재미있는 표현을 끝까지 바꾸기',
        choice: 'flex',
        helper: '새로운 생각이 떠오르면 바로 반영해요.',
      },
    ],
  },
];
