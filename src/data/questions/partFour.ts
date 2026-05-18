import type { Question } from '../../types/career';

export const questionPartFour: Question[] = [
  {
    id: 24,
    kind: 'style',
    axis: 'information',
    eyebrow: '역사 수업',
    text: '역사를 배울 때 더 끌리는 것은?',
    options: [
      { label: '그때 실제로 어떤 일이 벌어졌는지', choice: 'observe', helper: '사실과 증거를 알면 이해가 쉬워요.' },
      { label: '왜 그런 일이 생겼는지 연결 고리', choice: 'imagine', helper: '숨어 있는 이유를 찾는 게 재미있어요.' },
    ],
  },
  {
    id: 25,
    kind: 'style',
    axis: 'decision',
    eyebrow: '친구의 고민',
    text: '내가 먼저 하는 말은?',
    options: [
      { label: '문제가 왜 생겼는지 같이 찾아보자', choice: 'solve', helper: '원인을 알아내고 해결책을 세워요.' },
      { label: '많이 속상했겠다, 내가 들어줄게', choice: 'care', helper: '마음을 살피고 따뜻하게 도와요.' },
    ],
  },
  {
    id: 26,
    kind: 'style',
    axis: 'decision',
    eyebrow: '규칙 정하기',
    text: '더 중요하다고 느끼는 것은?',
    options: [
      { label: '모두에게 공평한 기준 만들기', choice: 'solve', helper: '정확하고 납득되는 규칙을 세워요.' },
      { label: '서로의 마음이 다치지 않게 하기', choice: 'care', helper: '함께 편안한 분위기를 만들어요.' },
    ],
  },
  {
    id: 27,
    kind: 'style',
    axis: 'decision',
    eyebrow: '의견 충돌',
    text: '친구와 다른 의견이 생겼을 때 나는?',
    options: [
      { label: '어느 쪽이 더 맞는지 사실로 확인한다', choice: 'solve', helper: '근거가 있으면 해결이 빠르게 돼요.' },
      { label: '서로 기분이 상하지 않게 이야기한다', choice: 'care', helper: '관계를 지키는 게 먼저예요.' },
    ],
  },
  {
    id: 28,
    kind: 'style',
    axis: 'pace',
    eyebrow: '숙제 시작',
    text: '내 책상 위 모습은?',
    options: [
      { label: '해야 할 일을 적고 하나씩 끝내기', choice: 'plan', helper: '정리된 계획이 있으면 마음이 편해요.' },
      { label: '떠오르는 생각부터 빠르게 해보기', choice: 'flex', helper: '해보면서 더 좋은 길을 발견해요.' },
    ],
  },
  {
    id: 29,
    kind: 'style',
    axis: 'pace',
    eyebrow: '발표 준비',
    text: '마지막 점검 시간에 나는?',
    options: [
      { label: '연습한 대로 또박또박 마무리하기', choice: 'plan', helper: '정해진 순서를 지키면 실수가 줄어요.' },
      { label: '더 재미있는 표현을 끝까지 바꾸기', choice: 'flex', helper: '새로운 생각이 떠오르면 바로 반영해요.' },
    ],
  },
  {
    id: 30,
    kind: 'style',
    axis: 'pace',
    eyebrow: '자유 시간',
    text: '갑자기 두 시간이 생겼을 때 나는?',
    options: [
      { label: '미리 해두고 싶었던 일을 꺼낸다', choice: 'plan', helper: '준비된 목록이 있으면 바로 시작할 수 있어요.' },
      { label: '지금 하고 싶은 걸 바로 시작한다', choice: 'flex', helper: '그 순간의 감각을 따라가면 즐거워요.' },
    ],
  },
];
