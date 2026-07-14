import type { Question } from '../../types/career';

export const questionPartThree: Question[] = [
  {
    id: 17,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '동아리 첫날',
    text: '가장 자연스러운 모습은?',
    options: [
      { label: '친구들과 친해지고 활동을 이끌기', choice: 'enterprising', helper: '먼저 말하고 분위기를 만들어요.' },
      { label: '친구들이 편하게 참여하도록 돕기', choice: 'social', helper: '사람들의 마음을 살피는 편이에요.' },
    ],
  },
  {
    id: 18,
    kind: 'interest',
    axis: 'interest',
    eyebrow: '나만의 기록',
    text: '더 만들고 싶은 것은?',
    options: [
      { label: '개성 있는 그림과 이야기 노트', choice: 'artistic', helper: '나만의 표현이 담기면 좋아요.' },
      { label: '날짜와 자료가 잘 정리된 기록장', choice: 'conventional', helper: '찾기 쉽게 정리하면 뿌듯해요.' },
    ],
  },
  {
    id: 19,
    kind: 'style',
    axis: 'energy',
    eyebrow: '쉬는 시간',
    text: '내가 더 신나는 쪽은?',
    options: [
      { label: '친구들과 함께 움직이며 놀기', choice: 'together', helper: '이야기하고 같이 해보면 힘이 나요.' },
      { label: '혼자 조용히 만들거나 상상하기', choice: 'focus', helper: '차분히 생각할 때 집중이 잘돼요.' },
    ],
  },
  {
    id: 20,
    kind: 'style',
    axis: 'energy',
    eyebrow: '모둠 활동',
    text: '내가 맡고 싶은 역할은?',
    options: [
      { label: '앞에서 발표하고 친구들을 모으기', choice: 'together', helper: '사람들과 움직이는 순간이 즐거워요.' },
      { label: '자료를 만들고 중요한 부분 챙기기', choice: 'focus', helper: '깊게 살피며 조용히 완성도를 높여요.' },
    ],
  },
  {
    id: 21,
    kind: 'style',
    axis: 'energy',
    eyebrow: '긴 연휴',
    text: '연휴가 끝났을 때 활력이 생기는 경우는?',
    options: [
      { label: '친구, 가족과 함께 신나게 논 날', choice: 'together', helper: '사람들과 함께하면 에너지가 충전돼요.' },
      { label: '혼자 하고 싶던 걸 마음껏 한 날', choice: 'focus', helper: '나만의 시간이 있어야 기운이 나요.' },
    ],
  },
  {
    id: 22,
    kind: 'style',
    axis: 'information',
    eyebrow: '새로운 과제',
    text: '어떤 방법이 더 편할까?',
    options: [
      { label: '예시를 보고 차근차근 따라 하기', choice: 'observe', helper: '눈에 보이는 순서와 사실이 좋아요.' },
      { label: '내 방식으로 새롭게 바꿔 보기', choice: 'imagine', helper: '상상하고 연결하는 일이 재미있어요.' },
    ],
  },
  {
    id: 23,
    kind: 'style',
    axis: 'information',
    eyebrow: '과학 실험',
    text: '실험 결과가 예상과 다를 때 나는?',
    options: [
      { label: '어디서 틀렸는지 단계별로 확인한다', choice: 'observe', helper: '사실을 하나씩 확인하면 답이 보여요.' },
      { label: '다른 이유가 있지 않을까 상상해본다', choice: 'imagine', helper: '예상 밖 결과가 새로운 발견일 수 있어요.' },
    ],
  },
];
