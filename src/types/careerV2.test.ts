import { describe, expect, it } from 'vitest';
import { careerFields } from '../data/careerFields';

describe('career v2 domain', () => {
  it('exposes eight descriptive result fields', () => {
    expect(careerFields.map((field) => field.label)).toEqual([
      '호기심 많은 탐구자 — 과학·연구',
      '영리한 미래 설계자 — 기술·디지털',
      '상상력 넘치는 창작자 — 예술·콘텐츠',
      '따뜻한 성장 조력자 — 사람·교육',
      '다정한 생명 수호자 — 의료·돌봄',
      '도전하는 아이디어 리더 — 비즈니스·리더십',
      '정의로운 세상 수호자 — 사회·안전·공공',
      '활력 넘치는 행동가 — 자연·현장·스포츠',
    ]);
  });
});
