import type { AxisLabels } from '../types/career';

export const axisLabels: AxisLabels = {
  energy: { left: 'together', right: 'focus', title: '활동 방식', leftLabel: '함께하기', rightLabel: '혼자집중' },
  information: {
    left: 'observe',
    right: 'imagine',
    title: '생각 재료',
    leftLabel: '실제관찰',
    rightLabel: '상상아이디어',
  },
  decision: { left: 'solve', right: 'care', title: '도움 방식', leftLabel: '논리해결', rightLabel: '마음도움' },
  pace: { left: 'plan', right: 'flex', title: '진행 방식', leftLabel: '계획형', rightLabel: '탐험형' },
};
