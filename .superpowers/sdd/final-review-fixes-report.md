# Final review fixes report

## 범위

- 기준 HEAD: `1754f2d725b17fc59ae28de874e36b5691a4830f`
- 검증 일자: 2026-07-17 (Asia/Seoul)
- 대상: P1 결과 화면 저장 중 연속 직업 선택, P2 명함 prefill catalog 경계, P2 Firestore 공백 이름 차단, P3 README owner 권한 표현
- 보존: 작업 시작 전부터 수정된 `package-lock.json`과 untracked `docs/share/`는 열거나 수정·stage하지 않았다.

## P1: 저장 중 추천/목록 직업 선택

### RED

테스트에 다음 두 경로를 먼저 추가했다.

1. `canAutoSaveCareerChoice(..., true, ...)`가 자동 저장 후보를 허용하는지 확인
2. `isSaving: true` 서버 마크업에서 추천/목록 버튼에 `disabled`가 없는지 확인

명령:

```text
npm test -- src/pages/result/components/DreamChoicePanel.test.ts
```

결과: exit 1, 5개 중 2개 실패.

- helper가 `false`를 반환해 `expected false to be true`로 실패
- 추천 버튼 마크업에 `disabled=""`가 있어 실패

### GREEN

- 패널의 `automaticSaveStartedRef` 1회 잠금을 제거했다.
- 추천/목록 버튼은 `isSaving` 중에도 enabled 상태를 유지한다.
- 각 클릭은 `onConfirm`으로 전달되며 상위 `resultSaveSession` 큐가 직렬화한다.
- search/custom/undecided와 수동 확인 버튼의 기존 저장 중 잠금 및 실패 복구 동작은 유지했다.

명령:

```text
npm test -- src/pages/result/components/DreamChoicePanel.test.ts src/lib/resultSaveSession.test.ts
```

결과: exit 0, 2개 파일·7개 테스트 통과. 기존 deferred 저장 세션 테스트가 연속 요청을 순서대로 저장하고 마지막 선택을 마지막에 적용하는 동작을 포함한다.

## P2: BusinessCardPrefill catalog 경계

### RED

먼저 다음 테스트를 추가했다.

- v2 `custom`은 이름이 catalog에 있어도 `job`이 빈 문자열
- 존재하지 않는 v2 직업은 `job`이 빈 문자열
- 실제 `careerCatalog` 107개는 모두 그대로 `job`으로 유지

명령:

```text
npm test -- src/lib/businessCardPrefill.test.ts
```

결과: exit 1, 10개 중 1개 실패. `custom: 천문학자`가 빈 문자열 대신 `천문학자`로 전달되어 실패했다.

### GREEN

v2 `custom`/`undecided`를 비우고, 나머지는 trim한 이름이 `careerByName`에 실제로 있을 때만 catalog 이름을 적용하도록 변경했다.

명령:

```text
npm test -- src/lib/businessCardPrefill.test.ts src/pages/business-card/SurveyResultLookup.test.tsx src/pages/business-card/CareerPicker.test.ts
```

결과: exit 0, 3개 파일·14개 테스트 통과.

## P2: Firestore careerName 규칙

- 기존 `kind`, `keys().hasOnly/hasAll`, `undecided`, create/update 범위는 변경하지 않았다.
- 이름이 1~40자이고 최소 한 개 non-whitespace 문자를 포함하도록 `matches('[\\s\\S]*\\S[\\s\\S]*')`를 추가했다.
- Firebase 공식 String Rules 문서에서 `matches`가 전체 문자열을 Google RE2로 검사하는 API임을 확인했다: https://firebase.google.com/docs/reference/rules/rules.String#matches
- 패턴 샘플 정적 확인: `""`, `" "`, `"\t\n"`은 false; `"  천문학자  "`, `"\nA\n"`은 true.

Rules Emulator 검증은 수행하지 못했다. 이 checkout에는 `firebase.json`/`.firebaserc`, `@firebase/rules-unit-testing`, `firebase-tools`가 없으므로 규칙 범위 및 RE2 패턴을 정적으로 검토했다.

## P3: README owner 권한 표현

README의 응답 상세/CSV, 명함 조회, admin 화면, Firebase 설정, 체크리스트 관련 표현을 `owner 관리자` 또는 `owner 전용 조회`로 정정했다. 권한 표에는 `admins/{UID}`의 `role: "owner"` 조건을 명시했다.

정적 확인:

```text
rg -n "관리자|owner 전용 조회" README.md
```

결과: 모든 관련 조회·관리자 표현이 owner 범위를 명시한다.

## 전체 검증

| 명령 | 결과 | 근거 |
| --- | --- | --- |
| `npm test` | PASS | exit 0; 18개 파일, 76개 테스트 통과 |
| `npm run build` | PASS | exit 0; data 7개, distribution 2개, business-card 검사, TypeScript, Vite build 통과; 2,006 modules transformed |
| scoped `git diff --check` | PASS | exit 0; whitespace error 없음 |
| scoped diff review | PASS | README, rules, P1/P2 구현·테스트만 포함 |

빌드는 500 kB를 넘는 기존 Vite chunk warning을 출력했지만 실패 없이 완료됐다.

## 최종 diff 보존 확인

작업 파일만 별도로 diff/check하고 stage한다. 시작 전 사용자 변경은 그대로 남긴다.

```text
 M package-lock.json
?? docs/share/
```
