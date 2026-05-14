import type { Question } from '../../types/career';

export const questionPartOne: Question[] = [
  {
    id: 1,
    axis: 'energy',
    eyebrow: '쉬는 시간',
    text: '내가 더 신나는 쪽은?',
    options: [
      {
        label: '친구들과 함께 움직이며 놀기',
        choice: 'together',
        helper: '이야기하고 같이 해보면 힘이 나요.',
      },
      {
        label: '혼자 조용히 만들거나 상상하기',
        choice: 'focus',
        helper: '차분히 생각할 때 집중이 잘돼요.',
      },
    ],
  },
  {
    id: 2,
    axis: 'information',
    eyebrow: '새로운 과제',
    text: '어떤 방법이 더 편할까?',
    options: [
      {
        label: '예시를 보고 차근차근 따라 하기',
        choice: 'observe',
        helper: '눈에 보이는 순서와 사실이 좋아요.',
      },
      {
        label: '내 방식으로 새롭게 바꿔 보기',
        choice: 'imagine',
        helper: '상상하고 연결하는 일이 재미있어요.',
      },
    ],
  },
  {
    id: 3,
    axis: 'decision',
    eyebrow: '친구의 고민',
    text: '내가 먼저 하는 말은?',
    options: [
      {
        label: '문제가 왜 생겼는지 같이 찾아보자',
        choice: 'solve',
        helper: '원인을 알아내고 해결책을 세워요.',
      },
      {
        label: '많이 속상했겠다, 내가 들어줄게',
        choice: 'care',
        helper: '마음을 살피고 따뜻하게 도와요.',
      },
    ],
  },
  {
    id: 4,
    axis: 'pace',
    eyebrow: '숙제 시작',
    text: '내 책상 위 모습은?',
    options: [
      {
        label: '해야 할 일을 적고 하나씩 끝내기',
        choice: 'plan',
        helper: '정리된 계획이 있으면 마음이 편해요.',
      },
      {
        label: '떠오르는 생각부터 빠르게 해보기',
        choice: 'flex',
        helper: '해보면서 더 좋은 길을 발견해요.',
      },
    ],
  },
  {
    id: 5,
    axis: 'energy',
    eyebrow: '모둠 활동',
    text: '내가 맡고 싶은 역할은?',
    options: [
      {
        label: '앞에서 발표하고 친구들을 모으기',
        choice: 'together',
        helper: '사람들과 움직이는 순간이 즐거워요.',
      },
      {
        label: '자료를 만들고 중요한 부분 챙기기',
        choice: 'focus',
        helper: '깊게 살피며 조용히 완성도를 높여요.',
      },
    ],
  },
  {
    id: 6,
    axis: 'information',
    eyebrow: '발명 수업',
    text: '더 만들고 싶은 것은?',
    options: [
      {
        label: '실제로 튼튼하게 움직이는 물건',
        choice: 'observe',
        helper: '손으로 확인하고 고치는 과정이 좋아요.',
      },
      {
        label: '아무도 본 적 없는 미래 도구',
        choice: 'imagine',
        helper: '새로운 가능성을 떠올리면 설레요.',
      },
    ],
  },
];
