// Firestore schema v1 records are rendered from this frozen question map.
// Do not replace it with the current v2 questionnaire.
export const legacyQuestionsV1: Record<string, { eyebrow: string; text: string }> = {
  '1': { eyebrow: '체험 활동', text: '더 해보고 싶은 활동은?' },
  '2': { eyebrow: '동아리 선택', text: '마음이 더 끌리는 동아리는?' },
  '3': { eyebrow: '학급 행사', text: '행사에서 맡고 싶은 일은?' },
  '4': { eyebrow: '만들기 시간', text: '더 재미있는 만들기는?' },
  '5': { eyebrow: '궁금한 문제', text: '답을 찾을 때 더 좋은 방법은?' },
  '6': { eyebrow: '새 프로젝트', text: '가장 먼저 하고 싶은 일은?' },
  '7': { eyebrow: '자료 정리', text: '더 편한 역할은?' },
  '8': { eyebrow: '발표 준비', text: '발표를 더 멋지게 만드는 방법은?' },
  '9': { eyebrow: '봉사 활동', text: '내가 더 잘할 것 같은 일은?' },
  '10': { eyebrow: '체육대회', text: '더 끌리는 역할은?' },
  '11': { eyebrow: '독서 시간', text: '더 읽고 싶은 책은?' },
  '12': { eyebrow: '운영 준비', text: '학급 매점을 만든다면?' },
  '13': { eyebrow: '교실 개선', text: '바꾸고 싶은 쪽은?' },
  '14': { eyebrow: '새 아이디어', text: '좋은 생각이 떠오르면?' },
  '15': { eyebrow: '마음 표현', text: '힘든 친구를 도울 때 나는?' },
  '16': { eyebrow: '과학 축제', text: '더 기대되는 부스는?' },
  '17': { eyebrow: '동아리 첫날', text: '가장 자연스러운 모습은?' },
  '18': { eyebrow: '나만의 기록', text: '더 만들고 싶은 것은?' },
  '19': { eyebrow: '쉬는 시간', text: '내가 더 신나는 쪽은?' },
  '20': { eyebrow: '모둠 활동', text: '내가 맡고 싶은 역할은?' },
  '21': { eyebrow: '긴 연휴', text: '연휴가 끝났을 때 활력이 생기는 경우는?' },
  '22': { eyebrow: '새로운 과제', text: '어떤 방법이 더 편할까?' },
  '23': { eyebrow: '과학 실험', text: '실험 결과가 예상과 다를 때 나는?' },
  '24': { eyebrow: '역사 수업', text: '역사를 배울 때 더 끌리는 것은?' },
  '25': { eyebrow: '친구의 고민', text: '내가 먼저 하는 말은?' },
  '26': { eyebrow: '규칙 정하기', text: '더 중요하다고 느끼는 것은?' },
  '27': { eyebrow: '의견 충돌', text: '친구와 다른 의견이 생겼을 때 나는?' },
  '28': { eyebrow: '숙제 시작', text: '내 책상 위 모습은?' },
  '29': { eyebrow: '발표 준비', text: '마지막 점검 시간에 나는?' },
  '30': { eyebrow: '자유 시간', text: '갑자기 두 시간이 생겼을 때 나는?' },
};

// v1 records retained a choice key instead of option text. This frozen map keeps
// those historical answers readable even after the live questionnaire changes.
export const legacyChoiceLabelsV1: Record<string, string> = {
  realistic: '직접 해 보고 움직이는 쪽', investigative: '이유와 원리를 찾아보는 쪽', artistic: '그림·글·음악으로 표현하는 쪽',
  social: '친구와 사람을 돕는 쪽', enterprising: '앞에서 이끌고 소개하는 쪽', conventional: '순서와 자료를 정리하는 쪽',
  together: '친구와 함께하는 쪽', focus: '혼자 차분히 집중하는 쪽', observe: '실제로 보고 확인하는 쪽', imagine: '새로운 생각을 떠올리는 쪽',
  solve: '문제를 찾아 해결하는 쪽', care: '마음을 살피고 돕는 쪽', plan: '미리 계획하고 준비하는 쪽', flex: '상황에 맞춰 바꾸는 쪽',
};
