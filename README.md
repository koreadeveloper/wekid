# 위키드 직업 탐험

초등학생과 청소년이 30개의 쉬운 선택형 질문을 풀고, 자신에게 잘 맞는 직업을 탐색하는 모바일 우선 웹앱입니다. 검사 결과를 저장하고, 관리자 대시보드에서 모아보며, 178개 직업 배경으로 꿈 명함까지 만들 수 있습니다.

![Start](./docs/readme/01-start.png)

## 핵심 기능

| 영역 | 기능 |
| --- | --- |
| 진로 탐험 | 이름과 센터명 입력, 이름 없이 시작, 30문항 검사, 대표 추천 직업과 이유 표시 |
| 결과 화면 | 대표 직업, 추천 이유, 성향 요약, 관련 직업, 178개 직업 상세 모달 |
| 결과 저장 | Firebase Firestore 저장, 저장 성공/진행 문구는 숨김, 실패 때만 재시도 안내 표시 |
| 관리자 | 센터별/기간별/검색 필터, 통계, CSV, PDF 보고서, 모바일 카드형 결과 목록 |
| 꿈 명함 | 178개 직업 배경 검색, 위키드 로고, 앞면/뒷면 미리보기, A4 10장 인쇄 |
| 접근성/반응형 | 키보드 포커스, 모달 포커스 트랩, CJK 줄바꿈, 모바일/태블릿/데스크톱 검증 |

## 화면 구성

| 화면 | 설명 |
| --- | --- |
| 진로 탐험 | 아이가 바로 이해할 수 있는 질문과 큰 선택 버튼으로 진행합니다. |
| 결과 | 가장 잘 맞는 직업을 크게 보여주고, 이유와 함께 다른 직업도 탐색할 수 있습니다. |
| 명함 제작 | 직업명이나 키워드로 178개 배경을 검색해 앞면/뒷면 명함을 만듭니다. |
| 센터 관리 | 저장된 검사 결과를 센터 실무자가 필터링하고 내려받을 수 있습니다. |

## 명함 제작

명함 배경은 `wekid-job-backgrounds-clean-178` 폴더에서 관리합니다.

- `wekid-job-backgrounds-clean-178/images`: 원본 PNG 배경 178개
- `wekid-job-backgrounds-clean-178/webp`: 앱에서 사용하는 최적화 WebP 배경 178개
- `wekid-job-backgrounds-clean-178/job-background-name-map.csv`: 직업명, 영문명, 카테고리, 파일명 매핑
- `contact-sheets-by-category`: 배경을 빠르게 확인하기 위한 카테고리별 시트

명함 앞면은 직업별 배경 위에 위키드 로고, 한글 이름, 영문 이름, 직업명 배지를 올립니다. 직업명 배지는 왼쪽 아래에 점선 없이 표시되며, 이름은 크게 보이도록 기본 크기를 키우고 긴 이름에서는 자동으로 축소됩니다.

명함 뒷면은 공통 디자인입니다. 이름, 영문 이름, 직업명, 소속, 연락처, 목표가 인쇄물에서도 겹치지 않도록 별도 출력 레이아웃을 사용합니다.

## 관리자 대시보드

관리자 화면은 `?mode=admin`으로 접근합니다.

- Firebase Auth 로그인
- 관리자 권한 문서 확인
- 센터별 결과 보기
- 기간, 검색어, 테스트 의심 결과 제외 필터
- 센터명 표기 차이 확인
- CSV 다운로드
- PDF 보고서 저장
- 모바일에서는 가로 스크롤 표 대신 라벨이 붙은 카드형 결과 목록 사용

Firebase 설정 방법은 [docs/firebase-setup.md](./docs/firebase-setup.md)를 참고하세요.

## 데이터 설계

| 데이터 | 위치 |
| --- | --- |
| 질문 | `src/data/questions` |
| 추천 계산 | `src/lib/careerScoring.ts` |
| 직업 상세 | `src/data/careerDetails.ts`, `src/data/careerDetailGroups` |
| 직업 카탈로그 요약 | `src/data/careerCatalogSummary.ts` |
| 명함 배경 | `src/data/jobCardThemes.ts`, `src/lib/jobCardThemes.ts` |
| 관리자 집계 | `src/lib/adminResults.ts` |

앱 화면에는 `RIASEC` 같은 내부 이론 용어를 직접 노출하지 않습니다. 아이가 이해하기 쉬운 직업명, 추천 이유, 활동 문장 중심으로 보여줍니다.

## 로컬 실행

```bash
npm install
npm run dev
```

기본 개발 서버는 Vite가 실행합니다.

```text
http://localhost:5173
```

다른 포트를 쓰려면 다음처럼 실행할 수 있습니다.

```bash
npm run dev -- --port 5200
```

## Firebase 환경 변수

`.env.example`을 기준으로 `.env.local`에 값을 넣습니다.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase가 설정되지 않아도 앱은 렌더링됩니다. 이 경우 결과 저장과 관리자 데이터 로딩은 비활성 상태로 처리됩니다.

## 검증 명령

배포용 빌드는 Playwright 브라우저 바이너리에 의존하지 않도록 가볍게 유지합니다.

```bash
npm run build
```

`npm run build`는 데이터 정합성 검사, TypeScript 검사, Vite 빌드를 수행합니다.

브라우저 기반 UI/인쇄 검증까지 포함한 전체 로컬 검증은 다음 명령입니다.

```bash
npm run verify
```

`npm run verify`는 아래 검증과 단위 테스트를 모두 실행합니다. Playwright 브라우저가 없는 환경에서는 먼저 `npx playwright install chromium`을 실행하세요.

| 명령 | 확인 내용 |
| --- | --- |
| `npm run check:data` | 질문, 직업 매칭, 상세 직업 데이터 정합성 |
| `npm run check:start-page` | 시작 화면 문구, 접근성, 모바일 높이 |
| `npm run check:result-ui` | 결과 화면, PDF, 저장/내보내기 피드백 |
| `npm run check:result-export-feedback` | 이미지/PDF 내보내기 실패 안내 |
| `npm run check:admin-ui` | 관리자 접근성, 모바일 결과 목록, PDF 보고서 |
| `npm run check:career-flow-a11y` | 검사 흐름 키보드/포커스 동작 |
| `npm run check:touch-contrast` | 터치 영역과 대비 |
| `npm run check:job-picker-layout` | 178개 직업 검색/선택 UI |
| `npm run check:business-card` | 명함 리소스, 로고, 배지, 인쇄 규칙 |
| `npm run check:business-card-photo` | 사진 넣기/빼기 컨트롤 |
| `npm run check:business-card-layout` | 앞면 이름/직업명 출력 레이아웃 |
| `npm run check:business-card-back-layout` | 뒷면 이름/정보 출력 레이아웃 |
| `npm test` | Vitest 단위 테스트 |

## 프로젝트 구조

```text
src/
  components/layout/        공통 상단바와 초기화 확인
  data/                     질문, 직업, 명함 배경 데이터
  lib/                      점수 계산, 저장, Firebase, 관리자 유틸
  pages/start/              시작 화면
  pages/quiz/               질문 화면
  pages/result/             결과 화면과 직업 상세
  pages/business-card/      명함 제작
  pages/admin/              관리자 대시보드
  styles/                   화면별 CSS
scripts/                    데이터, UI, 인쇄 검증 스크립트
docs/                       운영 문서와 README 이미지
public/brand/               위키드 로고 이미지
wekid-job-backgrounds-clean-178/
contact-sheets-by-category/
```

## 운영 메모

- 메인 브랜치 기준으로 배포합니다.
- 검사 결과 저장 성공/저장 중 문구는 사용자에게 표시하지 않습니다.
- 저장 실패는 결과 화면에서만 작은 재시도 안내로 표시합니다.
- 명함 인쇄물에는 점선 재단선이 나오지 않습니다.
- 감사 스크린샷과 로컬 작업 흔적은 커밋하지 않습니다.

## 배포

Vite 정적 빌드 결과는 `dist/`에 생성됩니다.

```bash
npm run build
```

Vercel에서는 루트 프로젝트로 연결하면 `vite build` 결과를 배포할 수 있습니다. 브라우저 QA는 `npm run verify`로 로컬 또는 별도 CI에서 실행하고, Vercel production build에서는 Playwright 브라우저 다운로드가 필요하지 않도록 분리합니다.
