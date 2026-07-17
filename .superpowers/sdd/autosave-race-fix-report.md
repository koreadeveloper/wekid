# Auto-save race fix report

## Scope

- `src/App.tsx`의 자동 저장 create/update 응답이 answer 수정, reset, 새 답변 이후 현재 세션의 결과 ID와 저장 상태를 오염하지 못하게 했다.
- 같은 설문 세션에서 꿈을 빠르게 바꿔도 저장 요청을 선택 순서대로 실행해 최종 꿈이 마지막으로 저장되게 했다.
- 설문 완료 시 `undecided`를 저장하는 기존 auto-save 동작을 유지했다.

## Root cause

`saveTestResult(...).then(...)`은 요청을 시작한 설문 세션이 아직 현재 세션인지 확인하지 않고 `savedResultIdRef`와 `resultSaveStatus`를 갱신했다. 또한 결과 ID가 생기기 전 연속 선택은 create를 중복 실행할 수 있었고, 결과 ID가 생긴 뒤 연속 update는 네트워크 완료 순서가 뒤집히면 이전 선택이 최종 문서에 남을 수 있었다.

## RED

1. `npm test -- src/lib/resultSaveSession.test.ts`
   - 1 test file failed, 2 tests failed.
   - 실패 원인: `createResultSaveSession`이 없어 이전 세션 응답 차단 및 빠른 선택 직렬화 동작이 존재하지 않았다.
2. 첫 구현 뒤 테스트를 현재 세션 응답이 이전 세션보다 먼저 완료되는 순서로 강화하고 같은 명령을 재실행했다.
   - 1 test failed, 1 test passed.
   - 실패 원인: 이전 세션 promise가 새 세션 큐를 막아 현재 요청의 `resultId` 인수가 `undefined`로 남았다.

## GREEN

- 저장 세션에 generation, 현재 result ID, latest request ID를 두었다.
- `invalidate()`는 result ID를 비우고 새 세대용 큐를 즉시 시작한다. 이미 실행 중인 이전 세대 응답은 완료돼도 ID 또는 UI 상태를 바꾸지 않는다.
- 같은 세대의 저장은 직렬화한다. 최초 create 성공 ID는 후속 update가 이어받으며, 빠른 꿈 선택의 update는 선택 순서대로 실행된다.
- 최신 요청의 완료만 UI 상태 콜백으로 전달한다.
- answer 선택, 마지막 답 수정, reset에서 세대를 무효화한다.

## Verification

- Focused: `npm test -- src/lib/resultSaveSession.test.ts src/lib/resultStorage.test.ts src/App.business-card.test.tsx src/pages/result/ResultPage.test.tsx src/pages/result/components/DreamChoicePanel.test.ts` — 5 files, 15 tests passed.
- Full: `npm test` — 18 files, 70 tests passed.
- Build: `npm run build` — data/distribution/business-card checks, TypeScript, Vite build passed.
- 최초 build에서 `resultDraft.questionnaireVersion`이 `number`로 widen된 TS2345를 재현했고, `2 as const`로 리터럴 타입을 보존한 뒤 위 검증을 모두 다시 실행했다.
- Vite는 기존 500 kB 초과 chunk 경고를 출력했지만 build exit code는 0이었다.
