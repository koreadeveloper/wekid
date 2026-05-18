import type { InterestKey } from '../types/career';

export const interestLabels: Record<
  InterestKey,
  { label: string; keywords: string; headline: string; summary: string; strengths: string[]; missions: string[] }
> = {
  realistic: {
    label: '실용형',
    keywords: '도구, 몸, 현장, 만들기',
    headline: '직접 만들고 움직이며 해결하는 힘',
    summary: '손으로 해보고 몸으로 익히며 실제 현장에서 답을 찾는 흥미가 보여요.',
    strengths: ['실전 감각', '도구 활용', '몸으로 배우기', '현장 해결'],
    missions: ['간단한 물건 고쳐보기', '안전 동선 그려보기', '운동 기술 기록하기'],
  },
  investigative: {
    label: '탐구형',
    keywords: '질문, 과학, 분석, 원리',
    headline: '궁금한 원리를 끝까지 파고드는 힘',
    summary: '왜 그런지 질문하고 자료와 실험으로 답을 찾아가는 흥미가 보여요.',
    strengths: ['질문하기', '자료 분석', '원리 찾기', '깊은 집중'],
    missions: ['왜 질문 10개 적기', '실험 결과 기록하기', '퍼즐 풀이 설명하기'],
  },
  artistic: {
    label: '예술형',
    keywords: '표현, 상상, 음악, 그림, 글',
    headline: '상상한 것을 자기답게 표현하는 힘',
    summary: '그림, 이야기, 음악, 디자인처럼 마음과 아이디어를 표현하는 흥미가 보여요.',
    strengths: ['상상력', '표현력', '색과 분위기', '이야기 만들기'],
    missions: ['캐릭터 설정 만들기', '하루 사진 일기 쓰기', '짧은 이야기 완성하기'],
  },
  social: {
    label: '사회형',
    keywords: '도움, 상담, 교육, 돌봄',
    headline: '사람을 살피고 따뜻하게 돕는 힘',
    summary: '친구의 마음과 필요를 살피고 함께 성장하도록 돕는 흥미가 보여요.',
    strengths: ['공감', '설명하기', '돌봄', '관계 만들기'],
    missions: ['친구 장점 인터뷰하기', '새 친구 안내하기', '작은 봉사 계획하기'],
  },
  enterprising: {
    label: '도전형',
    keywords: '발표, 리더십, 설득, 기획',
    headline: '아이디어를 말하고 사람들을 이끄는 힘',
    summary: '목표를 세우고 사람들과 함께 새로운 일을 추진하는 흥미가 보여요.',
    strengths: ['리더십', '설득하기', '발표하기', '기획력'],
    missions: ['모둠 목표표 만들기', '1분 발표 연습하기', '행사 아이디어 제안하기'],
  },
  conventional: {
    label: '정리형',
    keywords: '규칙, 자료, 숫자, 계획',
    headline: '자료와 규칙을 꼼꼼히 정리하는 힘',
    summary: '정해진 순서와 기준을 지키며 자료를 정확하게 다루는 흥미가 보여요.',
    strengths: ['정리정돈', '기록 관리', '숫자 감각', '계획 지키기'],
    missions: ['물품 목록 만들기', '일주일 계획표 쓰기', '자료 분류표 정리하기'],
  },
};
