# 분야별 진로 추천 품질 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 특정 직업 쏠림을 줄이고, 8개 분야에서 여러 직업을 균형 있게 추천하는 진로 테스트 흐름을 로컬에서 검증한다.

**Architecture:** 기존 문항과 직업 데이터는 유지하면서 추천 계산을 `분야 점수 → 분야별 직업 점수`의 2단계로 바꾼다. 답변 모델에 선택 신뢰도(`clear`, `uncertain`)를 추가하고, 결과는 상위 분야 3개에서 분야당 2개 직업을 골라 대표 직업과 함께 보여준다.

**Tech Stack:** React, TypeScript, Vitest, Vite, 기존 `careerFits`·`careerCategories` 데이터 구조.

## Global Constraints

- 분야는 기존 8개 카테고리를 사용하고 분야별 점수는 문항 수로 정규화한다.
- 결과 화면에는 대표 직업 1개와 상위 분야별 탐색 직업을 함께 보여준다.
- 애매한 답변은 점수 기여를 낮추며, 기존 Firebase 저장 구조와 관리자 기능은 변경하지 않는다.
- 로컬 검증만 수행하며 GitHub push와 Vercel 배포는 이 작업에서 하지 않는다.

---

### Task 1: 추천 계산 계약과 회귀 테스트

**Files:**
- Create: `src/lib/careerScoring.test.ts`
- Modify: `src/types/career.ts`

**Interfaces:**
- `AnswerMap` values may include an optional confidence marker without changing existing answer persistence.
- New result type exposes `categoryRecommendations` and `categoryScores`.

- [ ] **Step 1: Write failing tests** for category normalization, uncertain answers, and one-career-per-category diversity.
- [ ] **Step 2: Run `npx vitest run src/lib/careerScoring.test.ts` and confirm the new assertions fail.**
- [ ] **Step 3: Add the smallest types needed for category score and grouped recommendation results.**
- [ ] **Step 4: Run the focused test again and confirm type-level expectations compile.**
- [ ] **Step 5: Commit the test and type contract as `test: define balanced career recommendation contract`.**

### Task 2: 분야 점수 정규화와 다중 추천 계산

**Files:**
- Modify: `src/lib/careerScoring.ts`
- Modify: `src/types/career.ts`
- Test: `src/lib/careerScoring.test.ts`

**Interfaces:**
- Add `getCategoryScores(scores)` returning each category's normalized 0–1 score.
- Add `getCategoryRecommendations(scores)` returning the top three categories and up to two careers per category.
- Preserve `getCareerResult` fields consumed by the existing result page while adding grouped recommendations.

- [ ] **Step 1: Add a failing test showing that a category with more mapped careers does not win solely due to its size.**
- [ ] **Step 2: Run the focused test and confirm the expected failure.**
- [ ] **Step 3: Implement category aggregation from `careerCategories` and `careerFits`, normalize each category by its available career count, and rank careers within the top three categories.**
- [ ] **Step 4: Add a failing test for a tie: recommendations must not return two careers from the same category before every selected category has one.**
- [ ] **Step 5: Implement deterministic tie-breaking by category score, career score, and Korean name.**
- [ ] **Step 6: Run all scoring tests and confirm they pass.**
- [ ] **Step 7: Commit as `feat: balance recommendations across career categories`.**

### Task 3: 결과 화면에 분야별 추천 표시

**Files:**
- Modify: `src/pages/result/ResultPage.tsx`
- Modify: `src/pages/result/components/CareerRecommendations.tsx`
- Modify: `src/styles/career-sections.css`
- Test: `src/lib/careerScoring.test.ts`

**Interfaces:**
- Consume `profile.categoryRecommendations` without changing existing PDF export props.
- Render each category with its Korean title and up to two linked career cards.

- [ ] **Step 1: Add a failing rendering test for three category headings and their career names.**
- [ ] **Step 2: Run the focused test and confirm it fails because grouped recommendations are not rendered.**
- [ ] **Step 3: Add a compact grouped recommendation section below the representative career.**
- [ ] **Step 4: Add responsive styling and preserve existing career detail navigation.**
- [ ] **Step 5: Run the rendering test and the full test suite.**
- [ ] **Step 6: Commit as `feat: show balanced category recommendations`.**

### Task 4: 로컬 검증과 실행

**Files:**
- Modify: `src/data/questions/*.ts` only where a targeted wording correction is required by a failing ambiguity check.
- Create: `scripts/verify-recommendation-balance.mjs`

- [ ] **Step 1: Add a failing data check for duplicate question IDs, uneven axis coverage, and missing category career references.**
- [ ] **Step 2: Implement the verifier and fix only data defects it reports.**
- [ ] **Step 3: Run `npm run check:data`, `npx vitest run`, and `npm run build`.**
- [ ] **Step 4: Start `npm run dev -- --host 0.0.0.0` and verify the local result route displays the grouped recommendations.**
- [ ] **Step 5: Commit as `test: verify balanced recommendation output`.**

