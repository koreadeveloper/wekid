import type { CareerField, CareerFieldId } from '../types/career';

export const careerFields: CareerField[] = [
  {
    id: 'research',
    label: '호기심 많은 탐구자 — 과학·연구',
    description: '궁금한 것을 관찰하고, 이유를 찾아보는 활동을 좋아해요.',
    activityTags: { investigate: 1, observe: 0.9, measure: 0.9 },
    workStyleTags: { focus: 0.8, solve: 0.7, observe: 0.6 },
  },
  {
    id: 'digital',
    label: '영리한 미래 설계자 — 기술·디지털',
    description: '새로운 도구와 방법으로 편리한 것을 만들고 싶어 해요.',
    activityTags: { digital_make: 1, rule_make: 0.8, plan: 0.6 },
    workStyleTags: { solve: 0.8, focus: 0.7, imagine: 0.6 },
  },
  {
    id: 'creative',
    label: '상상력 넘치는 창작자 — 예술·콘텐츠',
    description: '나만의 생각을 그림, 이야기, 음악, 영상으로 표현하는 일을 좋아해요.',
    activityTags: { express: 1, perform: 0.8, introduce: 0.6 },
    workStyleTags: { imagine: 1, flex: 0.7, focus: 0.45 },
  },
  {
    id: 'people',
    label: '따뜻한 성장 조력자 — 사람·교육',
    description: '사람의 이야기를 듣고, 함께 배우거나 편하게 지내도록 돕고 싶어 해요.',
    activityTags: { guide: 1, communicate: 0.8, care: 0.75 },
    workStyleTags: { together: 1, care: 0.8, flex: 0.45 },
  },
  {
    id: 'life',
    label: '다정한 생명 수호자 — 의료·돌봄',
    description: '사람과 동물의 건강, 안전한 생활을 지키는 활동에 마음이 가요.',
    activityTags: { health: 1, care: 0.9, observe: 0.5 },
    workStyleTags: { care: 1, focus: 0.55, together: 0.5 },
  },
  {
    id: 'leadership',
    label: '도전하는 아이디어 리더 — 비즈니스·리더십',
    description: '좋은 생각을 사람들에게 알리고, 친구들과 목표를 이루는 일을 좋아해요.',
    activityTags: { plan: 1, introduce: 0.9, communicate: 0.7 },
    workStyleTags: { together: 0.8, flex: 0.8, imagine: 0.55 },
  },
  {
    id: 'public',
    label: '정의로운 세상 수호자 — 사회·안전·공공',
    description: '규칙과 안전을 지키고, 더 좋은 동네를 만드는 활동을 중요하게 여겨요.',
    activityTags: { safety: 1, rule_make: 0.8, guide: 0.65 },
    workStyleTags: { plan: 0.8, solve: 0.75, together: 0.55 },
  },
  {
    id: 'action',
    label: '활력 넘치는 행동가 — 자연·현장·스포츠',
    description: '몸을 움직이고 자연이나 현장에서 직접 해보는 활동을 즐겨요.',
    activityTags: { active: 1, nature: 0.85, safety: 0.4 },
    workStyleTags: { flex: 0.75, together: 0.7, focus: 0.45 },
  },
];

export const careerFieldById: Record<CareerFieldId, CareerField> = Object.fromEntries(
  careerFields.map((field) => [field.id, field]),
) as Record<CareerFieldId, CareerField>;
