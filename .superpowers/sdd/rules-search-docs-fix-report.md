# Rules, search, and docs fix report

## Scope

- Firestore v2 `dreamChoice`가 종류별로 정확한 키와 유효한 직업명을 갖도록 제한했다.
- 명함 설문 결과 검색을 정규화된 참여자 이름의 일부/전체 일치로만 제한했다.
- README 서비스 흐름과 Firestore 권한 표를 완주 자동 저장 및 후속 꿈 선택 갱신 동작에 맞췄다.
- 기존 사용자 변경인 `package-lock.json`과 `docs/share/`는 수정하지 않았다.

## Root causes

1. `validV2DreamChoice`의 공통 `hasOnly(['kind', 'careerName'])`는 키 존재를 보장하지 않았고, `undecided` 분기는 `careerName`의 존재나 타입을 검사하지 않았다.
2. `searchBusinessCardResults`는 이름 검색 UI임에도 이름, 이메일, 학교, 직업, 목표, 결과 ID를 같은 검색 대상 배열로 처리했다.
3. README는 설문 완주 직후 `undecided`로 결과를 먼저 생성하고, 꿈 선택 시 같은 결과의 `dreamChoice`만 갱신하는 실제 저장 순서를 반영하지 않았다.

## RED

- 테스트를 먼저 수정해 정규화된 한국어 이름의 일부/전체는 검색되고, 이메일·학교·직업·목표·결과 ID만 일치하면 검색되지 않아야 한다고 명시했다.
- 실행: `npm test -- src/lib/businessCardPrefill.test.ts`
- 결과: 1 test file failed, 1 test failed, 5 tests passed.
- 기대한 실패: 이메일 쿼리만으로 기존 결과가 1개 반환돼 `toHaveLength(0)`가 실패했다. 기존 다중 필드 검색 결함을 재현한 실패였다.

## GREEN

- 검색 필터의 매칭 대상을 `normalizeSearchValue(prefill.name)` 하나로 줄였다.
- 초기 수정에서는 이름 없는 결과 제외, 빈 쿼리 처리, 최신순 및 동일 시각의 입력 순서 정렬을 변경하지 않았다.
- 실행: `npm test -- src/lib/businessCardPrefill.test.ts`
- 결과: 1 test file, 6 tests passed.

## Firestore rules review

Firebase CLI와 `firebase.json`, Firestore Rules 테스트 도구가 현재 환경에 없어 Rules Emulator는 실행하지 못했다. 다음 구조를 수동 검토했다.

| 입력 구조 | 기대 | 규칙 근거 |
| --- | --- | --- |
| `{ kind: 'undecided' }` | 허용 | `kind` 키만 모두/오직 요구 |
| `undecided`에 `careerName` 또는 다른 키 추가 | 거부 | `hasOnly(['kind'])` |
| `recommended`/`catalog`/`custom` + 길이 1~40의 문자열 `careerName` | 허용 | 두 키를 모두/오직 요구하고 종류·타입·길이 검사 |
| 직업명 누락, 빈 문자열, 41자 이상, 추가 키, 알 수 없는 종류 | 거부 | `hasAll`, 길이 `> 0 && <= 40`, 종류 목록, `hasOnly` |

`validV2DreamChoiceUpdate`의 `affectedKeys().hasOnly(['dreamChoice'])`는 변경하지 않아 기존 답변이나 참여자 정보 등 다른 필드의 업데이트 범위를 넓히지 않았다. 삭제 금지도 그대로 유지했다.

## README

- 서비스 흐름을 설문 완주 결과 자동 저장(`undecided`) → 결과/직업 확인 → 꿈 선택 → 같은 저장 결과의 꿈 값만 갱신 → 이미지/PDF 순서로 고쳤다.
- 권한 표에 v2 기존 응답은 `dreamChoice`만 갱신 가능하고, 다른 기존 답변·참여자 정보 수정과 응답 삭제는 불가능하다고 명시했다.

## Verification

- Focused: `npm test -- src/lib/businessCardPrefill.test.ts src/pages/business-card/SurveyResultLookup.test.tsx` — 2 files, 8 tests passed.
- Full: `npm test` — 18 files, 71 tests passed.
- Build: `npm run build` — data 4 files/7 tests, distribution 1 file/2 tests, business-card 검사, TypeScript, Vite build passed.
- Diff whitespace: `git diff --check -- firestore.rules README.md src/lib/businessCardPrefill.ts src/lib/businessCardPrefill.test.ts` — 오류 없음.
- Vite는 기존 500 kB 초과 chunk 경고를 출력했지만 build exit code는 0이었다.

## Follow-up review P2/P3

### P2 RED

- 구두점 전용 검색어는 결과가 없어야 하고, 정규화하면 빈 값이 되는 참여자 이름은 제외돼야 한다는 테스트를 구현보다 먼저 추가했다.
- 실행: `npm test -- src/lib/businessCardPrefill.test.ts`
- 결과: 1 test file failed, 1 test failed, 7 tests passed.
- 기대한 실패: `---` 검색어가 빈 문자열로 정규화된 뒤 기존 분기에서 전체 결과를 반환해 `toHaveLength(0)`가 1개 결과로 실패했다. 구두점 전용 이름 제외 사양도 같은 RED 실행에 포함했다.

### P2 GREEN

- 정규화 검색어가 비면 즉시 빈 배열을 반환하도록 했다. `SurveyResultLookup`은 공백 원문이면 함수를 호출하지 않으며, 구두점처럼 원문은 있지만 유효한 검색 문자가 없는 입력도 이제 결과를 노출하지 않는다.
- 각 결과의 참여자 이름도 먼저 정규화하고, 정규화 이름이 비지 않은 경우에만 이름 일부/전체 일치를 검사한다.
- 이름 없는 결과 제외와 최신순 및 동일 시각 입력 순서 정렬은 유지했다.
- 실행: `npm test -- src/lib/businessCardPrefill.test.ts`
- 결과: 1 test file, 8 tests passed.

### P3 README

- 자동 저장 뒤 결과 확인에서 `결과 이미지·PDF 저장`과 `나의 꿈 직접 선택`이 별도 분기로 이어지도록 서비스 흐름을 고쳤다.
- 꿈 선택 전에도 이미지/PDF를 저장할 수 있고, 꿈을 선택하면 같은 저장 결과의 `dreamChoice`만 갱신된다고 명시했다.

### Follow-up verification

- Focused: `npm test -- src/lib/businessCardPrefill.test.ts src/pages/business-card/SurveyResultLookup.test.tsx` — 2 files, 10 tests passed.
- Full: `npm test` — 18 files, 73 tests passed.
- Build: `npm run build` — data 4 files/7 tests, distribution 1 file/2 tests, business-card 검사, TypeScript, Vite build passed.
- Vite는 기존 500 kB 초과 chunk 경고를 출력했지만 build exit code는 0이었다.
