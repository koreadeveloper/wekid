import type { Question } from '../../types/career';

export const questionPartOne: Question[] = [
  {
    id: 1,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '체험 활동',
    text: '더 해보고 싶은 활동은?',
    options: [
      { label: '로봇이나 도구를 직접 움직여보기', choice: 'realistic', helper: '손으로 다루고 바로 확인하는 활동이 좋아요.' },
      { label: '왜 움직이는지 원리를 찾아보기', choice: 'investigative', helper: '궁금한 이유를 끝까지 파고들어요.' },
    ],
  },
  {
    id: 2,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '동아리 선택',
    text: '마음이 더 끌리는 동아리는?',
    options: [
      { label: '그림, 음악, 글로 나를 표현하는 동아리', choice: 'artistic', helper: '느낌과 상상을 작품으로 만들고 싶어요.' },
      { label: '친구를 돕고 함께 성장하는 동아리', choice: 'social', helper: '사람을 챙기고 응원하는 일이 좋아요.' },
    ],
  },
  {
    id: 3,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '학급 행사',
    text: '행사에서 맡고 싶은 일은?',
    options: [
      { label: '앞에서 설명하고 친구들을 이끌기', choice: 'enterprising', helper: '말하고 설득하며 움직이는 일이 좋아요.' },
      { label: '순서표와 준비물을 꼼꼼히 정리하기', choice: 'conventional', helper: '기준과 계획을 정확히 맞추면 편해요.' },
    ],
  },
  {
    id: 4,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '만들기 시간',
    text: '더 재미있는 만들기는?',
    options: [
      { label: '튼튼하게 작동하는 물건 만들기', choice: 'realistic', helper: '실제로 움직이고 쓸 수 있으면 신나요.' },
      { label: '나만의 캐릭터나 세계 만들기', choice: 'artistic', helper: '새로운 모양과 이야기를 떠올려요.' },
    ],
  },
  {
    id: 5,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '궁금한 문제',
    text: '답을 찾을 때 더 좋은 방법은?',
    options: [
      { label: '자료와 실험으로 정확히 확인하기', choice: 'investigative', helper: '근거를 찾으면 마음이 놓여요.' },
      { label: '친구와 이야기하며 도와주기', choice: 'social', helper: '함께 이야기하면 길이 보여요.' },
    ],
  },
  {
    id: 6,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '새 프로젝트',
    text: '가장 먼저 하고 싶은 일은?',
    options: [
      { label: '아이디어를 발표하고 팀을 모으기', choice: 'enterprising', helper: '사람들과 목표를 세우는 게 좋아요.' },
      { label: '필요한 재료와 장비를 직접 만져보기', choice: 'realistic', helper: '해보면서 감을 잡는 편이에요.' },
    ],
  },
  {
    id: 7,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '자료 정리',
    text: '더 편한 역할은?',
    options: [
      { label: '표와 목록을 깔끔하게 정리하기', choice: 'conventional', helper: '정확하게 분류하면 뿌듯해요.' },
      { label: '숨어 있는 규칙이나 이유 찾기', choice: 'investigative', helper: '자료 속 의미를 발견하고 싶어요.' },
    ],
  },
  {
    id: 8,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '발표 준비',
    text: '발표를 더 멋지게 만드는 방법은?',
    options: [
      { label: '그림, 음악, 영상으로 분위기 만들기', choice: 'artistic', helper: '표현이 살아나면 더 재미있어요.' },
      { label: '친구들이 집중하도록 설득력 있게 말하기', choice: 'enterprising', helper: '사람들의 반응을 이끌고 싶어요.' },
    ],
  },
];
