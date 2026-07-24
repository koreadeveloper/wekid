const CHOSEONG = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const JUNGSEONG = [
  'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae',
  'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i',
];
const JONGSEONG = [
  '', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l',
  'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't',
];

// 자주 쓰는 성씨는 여권/관습 표기 우선
const SURNAMES: Record<string, string> = {
  김: 'KIM', 이: 'LEE', 박: 'PARK', 최: 'CHOI', 정: 'JUNG', 강: 'KANG', 조: 'CHO',
  윤: 'YOON', 장: 'JANG', 임: 'LIM', 한: 'HAN', 오: 'OH', 서: 'SEO', 신: 'SHIN',
  권: 'KWON', 황: 'HWANG', 안: 'AHN', 송: 'SONG', 전: 'JEON', 홍: 'HONG', 유: 'YOO',
  고: 'KO', 문: 'MOON', 양: 'YANG', 손: 'SON', 배: 'BAE', 백: 'BAEK', 허: 'HUH',
  남: 'NAM', 심: 'SIM', 노: 'NOH', 하: 'HA', 곽: 'KWAK', 성: 'SUNG', 차: 'CHA',
  주: 'JOO', 우: 'WOO', 구: 'KOO', 민: 'MIN', 류: 'RYU', 나: 'NA', 진: 'JIN',
  지: 'JI', 엄: 'UM', 채: 'CHAE', 원: 'WON', 천: 'CHUN', 방: 'BANG', 공: 'KONG',
  현: 'HYUN', 함: 'HAM', 변: 'BYUN', 염: 'YEOM', 여: 'YEO', 추: 'CHOO', 도: 'DO',
  소: 'SO', 석: 'SEOK', 선: 'SUN', 설: 'SEOL', 마: 'MA', 길: 'GIL', 위: 'WI',
  표: 'PYO', 기: 'KI', 반: 'BAN', 왕: 'WANG', 금: 'KEUM', 옥: 'OK', 인: 'IN',
  맹: 'MAENG', 제: 'JE', 탁: 'TAK',
};
const DOUBLE_SURNAMES: Record<string, string> = {
  남궁: 'NAMGOONG', 황보: 'HWANGBO', 제갈: 'JEGAL', 사공: 'SAGONG',
  선우: 'SUNWOO', 서문: 'SEOMOON', 독고: 'DOKGO',
};

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;

function isHangulSyllable(char: string) {
  const code = char.charCodeAt(0);
  return code >= HANGUL_BASE && code <= HANGUL_LAST;
}

function romanizeSyllable(char: string) {
  const offset = char.charCodeAt(0) - HANGUL_BASE;
  const cho = Math.floor(offset / (21 * 28));
  const jung = Math.floor((offset % (21 * 28)) / 28);
  const jong = offset % 28;
  return `${CHOSEONG[cho]}${JUNGSEONG[jung]}${JONGSEONG[jong]}`;
}

function romanizeSyllables(text: string) {
  return [...text].map(romanizeSyllable).join('');
}

/**
 * 한글 이름을 명함용 영문 이름으로 변환한다. 예: '김위키드' → 'KIM WIKIDEU'
 * 한글 이외의 문자가 섞여 있으면 빈 문자열을 반환해 자동 입력을 건너뛴다.
 */
export function romanizeKoreanName(rawName: string): string {
  const name = rawName.replace(/\s+/g, '').trim();

  if (!name || ![...name].every(isHangulSyllable)) {
    return '';
  }

  if (name.length === 1) {
    return romanizeSyllables(name).toUpperCase();
  }

  let surnameLength = 1;
  let surname = SURNAMES[name[0]] ?? romanizeSyllables(name[0]).toUpperCase();

  if (name.length >= 3 && DOUBLE_SURNAMES[name.slice(0, 2)]) {
    surnameLength = 2;
    surname = DOUBLE_SURNAMES[name.slice(0, 2)];
  }

  const givenName = romanizeSyllables(name.slice(surnameLength)).toUpperCase();
  return givenName ? `${surname} ${givenName}` : surname;
}
