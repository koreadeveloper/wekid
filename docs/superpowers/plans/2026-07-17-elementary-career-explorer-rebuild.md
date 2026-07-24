# Elementary Career Explorer Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy 178-career, single-winner RIASEC quiz with a versioned 107-career elementary-school experience that recommends several fields and careers, records the child's final dream choice, and exposes all v2 answers and decisions to administrators.

**Architecture:** Store a canonical 107-career catalog with unique field, activity, and work-style profiles. The questionnaire stores option signals rather than legacy interest keys; the scorer normalizes every field and career against the actual maximum available in each A/B question pair. Results remain draft-only until a child confirms a catalog choice, custom dream, or “still exploring” state, then a v2 record stores answer snapshots and the complete result payload.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest 4, Firebase Firestore, html2canvas, jsPDF, CSS.

## Global Constraints

- The active catalog contains exactly 107 child-facing Korean career names from `docs/superpowers/specs/2026-07-17-elementary-career-explorer-design.md`.
- Display the eight field labels without emoji and always include their descriptive adjective: for example, `호기심 많은 탐구자 — 과학·연구`.
- Use the approved 24 question texts verbatim; do not replace their visible Korean copy without a new approval.
- `아직 잘 모르겠어요` is a valid answer that is excluded from both numerator and denominator.
- Never choose a single “best career” or use Korean name ordering to break a recommendation tie.
- Existing `schemaVersion: 1` Firestore records remain readable and retain their legacy question rendering.
- Do not stage or alter the pre-existing `package-lock.json` modification while implementing this feature.

---

### Task 1: Define v2 domain types and result contracts

**Files:**
- Modify: `src/types/career.ts`
- Modify: `src/types/firestore.ts`
- Create: `src/types/careerV2.test.ts`

**Interfaces:**
- Produces `CareerFieldId`, `ActivityTag`, `WorkStyleTag`, `CareerQuestionV2`, `CareerDefinition`, `CareerFieldResult`, `CareerResultV2`, `DreamChoice`, and v2 Firestore payload types.
- Consumed by catalog data, question data, scorer, result UI, storage, and admin utilities.

- [ ] **Step 1: Write the failing type-level fixture test**

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/types/careerV2.test.ts`

Expected: FAIL because `careerFields` and the v2 types do not exist.

- [ ] **Step 3: Add the v2 contracts**

Add the following core shape to `src/types/career.ts` and keep legacy types until migration is complete.

```ts
export type CareerFieldId =
  | 'research'
  | 'digital'
  | 'creative'
  | 'people'
  | 'life'
  | 'leadership'
  | 'public'
  | 'action';

export type ActivityTag =
  | 'investigate' | 'observe' | 'measure' | 'digital_make' | 'rule_make'
  | 'express' | 'perform' | 'guide' | 'communicate' | 'care' | 'health'
  | 'plan' | 'introduce' | 'safety' | 'nature' | 'active';

export type WorkStyleTag =
  | 'together' | 'focus' | 'observe' | 'imagine' | 'solve' | 'care'
  | 'plan' | 'flex';

export type CareerQuestionOption = {
  id: 'A' | 'B';
  label: string;
  activityTags: Partial<Record<ActivityTag, number>>;
  workStyleTags?: Partial<Record<WorkStyleTag, number>>;
};

export type CareerQuestionV2 = {
  id: number;
  kind: 'activity' | 'style';
  text: string;
  options: [CareerQuestionOption, CareerQuestionOption];
};

export type CareerDefinition = {
  name: string;
  libraryCategory: string;
  primaryField: CareerFieldId;
  secondaryField?: CareerFieldId;
  activityTags: Partial<Record<ActivityTag, number>>;
  workStyleTags: Partial<Record<WorkStyleTag, number>>;
  detail: CareerDetail;
};
```

- [ ] **Step 4: Extend Firestore types without widening v1**

Define `TestResultV2Document` with `questionnaireVersion: 2`, `answerSnapshots`, `fieldResults`, `recommendedFieldResults`, `dreamChoice`, and `schemaVersion: 2`. Define `StoredTestResultRecord` as a v1/v2 union rather than using optional untyped properties.

- [ ] **Step 5: Run the focused tests**

Run: `npm test -- src/types/careerV2.test.ts src/lib/resultStorage.test.ts`

Expected: PASS after v1 fixture types are updated to the discriminated union.

- [ ] **Step 6: Commit**

```bash
git add src/types/career.ts src/types/firestore.ts src/types/careerV2.test.ts
git commit -m "feat: define versioned career quiz contracts"
```

### Task 2: Build the canonical 107-career catalog and details

**Files:**
- Create: `src/data/careerFields.ts`
- Create: `src/data/careerCatalog.ts`
- Create: `src/data/careerCatalog.test.ts`
- Modify: `src/data/careerCategories/index.ts`
- Modify: `src/data/careerDetails.ts`
- Remove after imports are migrated: `src/data/careerCategories/groupOne.ts`, `src/data/careerCategories/groupTwo.ts`, `src/data/careerDetailGroups/*.ts`, `src/data/careerFits/*.ts`

**Interfaces:**
- Consumes the exact approved catalog in the design spec.
- Produces `careerCatalog`, `careerByName`, `careerCategories`, and `getCareerDetail` for every v2 UI consumer.

- [ ] **Step 1: Write catalog integrity tests**

```ts
import { careerCatalog, careerByName } from './careerCatalog';

it('contains exactly the approved 107 unique careers with details', () => {
  expect(careerCatalog).toHaveLength(107);
  expect(new Set(careerCatalog.map((career) => career.name)).size).toBe(107);
  expect(Object.keys(careerByName)).toHaveLength(107);
  expect(careerCatalog.every((career) => career.detail.description.length > 30)).toBe(true);
});

it('keeps required child-facing careers', () => {
  expect(careerByName['아이돌']).toBeDefined();
  expect(careerByName['유튜버']).toBeDefined();
  expect(careerByName['모델']).toBeDefined();
  expect(careerByName['CEO']).toBeDefined();
  expect(careerByName['수학자']).toBeDefined();
  expect(careerByName['정보보안 전문가']).toBeDefined();
  expect(careerByName['음악가']).toBeDefined();
});
```

- [ ] **Step 2: Run the catalog test to verify it fails**

Run: `npm test -- src/data/careerCatalog.test.ts`

Expected: FAIL because the v2 catalog does not exist.

- [ ] **Step 3: Implement the eight result field definitions**

Create `careerFields.ts` with the eight `CareerFieldId` values, exact labels in the global constraints, short child-facing descriptions, and their tag profiles. Export `careerFields` and `careerFieldById`.

- [ ] **Step 4: Implement the 107 entries from the approved catalog**

Create `careerCatalog.ts`. Copy every name from the “확정 직업 목록” section of the design spec exactly once. Group entries by the fourteen library categories shown there, but give each entry one primary result field, optional secondary field, 3–5 activity tags, 2–4 work-style tags, and a unique `CareerDetail`.

Use this entry shape for every career:

```ts
{
  name: '유튜버',
  libraryCategory: '방송·콘텐츠',
  primaryField: 'creative',
  secondaryField: 'digital',
  activityTags: { digital_make: 1, express: 0.9, communicate: 0.8, introduce: 0.6 },
  workStyleTags: { imagine: 1, flex: 0.8, together: 0.45 },
  detail: {
    name: '유튜버', emoji: '🎥', tagline: '나만의 영상으로 이야기를 전하는 사람',
    description: '유튜버는 재미있거나 도움이 되는 영상을 기획하고 만들어 사람들과 나누는 일을 해요.',
    dailyTasks: ['영상 주제 정하기', '촬영하거나 자료 찾기', '장면을 고르고 편집하기', '시청자 의견 살피기'],
    workPlaces: ['촬영 장소', '집이나 스튜디오', '행사 현장'],
    skills: ['아이디어 내기', '말하기', '영상 만들기', '꾸준함'],
    schoolActivities: ['좋아하는 주제로 1분 소개 영상 계획하기', '친구가 이해하기 쉬운 설명 카드 만들기'],
    growthSteps: ['다양한 영상을 보고 좋은 점 기록하기', '작은 작품을 끝까지 완성해 보기'],
    funFact: '카메라 앞에서 말하는 일뿐 아니라 기획과 편집도 중요한 일이에요.',
  },
}
```

- [ ] **Step 5: Replace legacy category/detail adapters**

Derive `careerCategories` from `careerCatalog` for the library UI, and make `getCareerDetail(name)` read `careerByName[name]?.detail`. Remove old 178-career imports only after all callers compile against the adapters.

- [ ] **Step 6: Run data checks and tests**

Run: `npm test -- src/data/careerCatalog.test.ts && npm run build`

Expected: PASS, with no references to deleted career groups.

- [ ] **Step 7: Commit**

```bash
git add src/data/careerFields.ts src/data/careerCatalog.ts src/data/careerCatalog.test.ts src/data/careerCategories src/data/careerDetails.ts
git rm src/data/careerDetailGroups/*.ts src/data/careerFits/*.ts
git commit -m "feat: replace career data with child-friendly catalog"
```

### Task 3: Encode the approved v2 questionnaire and answer snapshots

**Files:**
- Create: `src/data/questionsV2.ts`
- Create: `src/data/questionsV2.test.ts`
- Create: `src/lib/questionSnapshots.ts`
- Create: `src/lib/questionSnapshots.test.ts`
- Modify: `src/pages/quiz/QuizPage.tsx`
- Modify: `src/pages/quiz/components/QuestionPanel.tsx`

**Interfaces:**
- Produces `careerQuestionsV2`, `createAnswerSnapshots(answers)`, and user-visible A/B/unknown options.
- Consumed by the app state, scorer, Firestore storage, and admin results.

- [ ] **Step 1: Write failing questionnaire tests**

```ts
it('contains the approved 16 activity and 8 style questions', () => {
  expect(careerQuestionsV2).toHaveLength(24);
  expect(careerQuestionsV2.filter((question) => question.kind === 'activity')).toHaveLength(16);
  expect(careerQuestionsV2.filter((question) => question.kind === 'style')).toHaveLength(8);
  expect(careerQuestionsV2[0].text).toBe('체험 수업에서 더 해보고 싶은 것은?');
  expect(careerQuestionsV2[23].options[1].label).toBe('그리면서 떠오르는 생각을 계속 더하기');
});

it('never gives both options the same primary activity tag', () => {
  expect(careerQuestionsV2.every((question) => {
    const aTags = Object.keys(question.options[0].activityTags);
    const bTags = Object.keys(question.options[1].activityTags);
    return !aTags.every((tag) => bTags.includes(tag));
  })).toBe(true);
});
```

- [ ] **Step 2: Run the questionnaire test to verify it fails**

Run: `npm test -- src/data/questionsV2.test.ts`

Expected: FAIL because the new question dataset does not exist.

- [ ] **Step 3: Create the 24 exact question records**

Copy the approved Korean text from the design spec into `questionsV2.ts`. Use `A` and `B` ids, add the unknown answer only in UI state, and assign the documented tags. For every question pair, assert that its primary tag sets differ.

- [ ] **Step 4: Add immutable answer snapshot creation**

```ts
export function createAnswerSnapshots(answers: CareerAnswerMap): TestResultAnswerSnapshot[] {
  return careerQuestionsV2.flatMap((question) => {
    const choice = answers[question.id];
    if (!choice) return [];
    const option = question.options.find((candidate) => candidate.id === choice);
    return [{ questionId: question.id, questionText: question.text, choice, optionLabel: option?.label ?? '아직 잘 모르겠어요' }];
  });
}
```

- [ ] **Step 5: Add the child-facing unknown option and revised progress copy**

Render `아직 잘 모르겠어요` below A/B. It must call `onChooseAnswer('unknown')`, show as selected when revisiting a question, and retain a 24-question progress denominator.

- [ ] **Step 6: Verify the question suite**

Run: `npm test -- src/data/questionsV2.test.ts src/lib/questionSnapshots.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/questionsV2.ts src/data/questionsV2.test.ts src/lib/questionSnapshots.ts src/lib/questionSnapshots.test.ts src/pages/quiz
git commit -m "feat: add approved elementary career questions"
```

### Task 4: Implement normalized multi-field recommendation scoring

**Files:**
- Replace: `src/lib/careerScoring.ts`
- Replace: `src/lib/careerScoring.test.ts`
- Create: `src/lib/careerScoring.simulation.test.ts`

**Interfaces:**
- Produces `getCareerResultV2(answers): CareerResultV2` with field results, score-banded recommendations, strengths, and recommendation evidence.
- Consumes `careerQuestionsV2`, `careerFields`, and `careerCatalog`.

- [ ] **Step 1: Write failing focused score tests**

```ts
it('does not use a career-name fallback for an exact tie', () => {
  const result = getCareerResultV2({ 1: 'A', 5: 'A', 9: 'A', 13: 'A' });
  expect(result.fieldResults[0].recommendedCareers.length).toBeGreaterThan(1);
});

it('excludes unknown answers from numerator and denominator', () => {
  const known = getCareerResultV2({ 1: 'A' });
  const knownAndUnknown = getCareerResultV2({ 1: 'A', 2: 'unknown' });
  expect(known.fieldResults).toEqual(knownAndUnknown.fieldResults);
});

it('makes the research scenario favor the research field', () => {
  expect(getCareerResultV2(researchScenario).fieldResults[0].fieldId).toBe('research');
});
```

- [ ] **Step 2: Run the scorer tests to verify they fail**

Run: `npm test -- src/lib/careerScoring.test.ts`

Expected: FAIL because `getCareerResultV2` does not exist.

- [ ] **Step 3: Implement pair-aware normalization**

For a profile vector and each answered question, calculate the selected option dot product and divide the final sum by the sum of `max(A dot profile, B dot profile)`. Skip unknown selections. Reuse the same `normalizedAffinity` function for fields, career activity tags, and style tags.

```ts
const normalizedAffinity = <Tag extends string>(questions: CareerQuestionV2[], answers: CareerAnswerMap, profile: Partial<Record<Tag, number>>, selector: (option: CareerQuestionOption) => Partial<Record<Tag, number>>) => {
  let actual = 0;
  let maximum = 0;
  for (const question of questions) {
    const answer = answers[question.id];
    if (answer !== 'A' && answer !== 'B') continue;
    const selected = question.options.find((option) => option.id === answer)!;
    const score = (option: CareerQuestionOption) => dot(selector(option), profile);
    actual += score(selected);
    maximum += Math.max(...question.options.map(score));
  }
  return maximum === 0 ? 0 : actual / maximum;
};
```

- [ ] **Step 4: Implement field and career result shaping**

Calculate field score from its profile. Calculate career score as `0.65 * primaryFieldAffinity + 0.20 * activityAffinity + 0.15 * styleAffinity`. Sort only by numeric score, group exact ties, include every tied career at the third-career cutoff, and return the top three fields.

- [ ] **Step 5: Add simulation coverage**

Use a deterministic seeded generator for 100,000 A/B answer maps. Assert every field appears in its dedicated scenario, every catalog career is reachable in an intentionally constructed or simulated recommendation, and no two careers have the same primary/secondary/activity/style profile.

- [ ] **Step 6: Run scoring verification**

Run: `npm test -- src/lib/careerScoring.test.ts src/lib/careerScoring.simulation.test.ts`

Expected: PASS; the test output identifies any unreachable career by name.

- [ ] **Step 7: Commit**

```bash
git add src/lib/careerScoring.ts src/lib/careerScoring.test.ts src/lib/careerScoring.simulation.test.ts
git commit -m "feat: add normalized multi-field career recommendations"
```

### Task 5: Add versioned Firestore persistence and security rules

**Files:**
- Modify: `src/lib/resultStorage.ts`
- Modify: `src/lib/resultStorage.test.ts`
- Modify: `src/types/firestore.ts`
- Modify: `firestore.rules`

**Interfaces:**
- Consumes `CareerResultV2`, `TestResultAnswerSnapshot`, and `DreamChoice`.
- Produces v2 Firestore documents that admin pages can read alongside v1 records.

- [ ] **Step 1: Write failing v2 persistence test**

```ts
it('writes a schema v2 result with snapshots, fields, and dream choice', async () => {
  await saveTestResult(v2Draft, dependencies);
  expect(addTestResult).toHaveBeenCalledWith(expect.objectContaining({
    schemaVersion: 2,
    questionnaireVersion: 2,
    answerSnapshots: expect.any(Array),
    recommendedFieldResults: expect.any(Array),
    dreamChoice: { kind: 'catalog', careerName: '유튜버' },
  }));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/resultStorage.test.ts`

Expected: FAIL because v2 draft fields are absent from the serialized document.

- [ ] **Step 3: Implement v2 draft serialization**

Accept a discriminated `TestResultDraftV2`; normalize text inputs; preserve answer snapshots exactly; write `schemaVersion: 2` and `questionnaireVersion: 2`. Retain the v1 serializer for legacy test compatibility.

- [ ] **Step 4: Permit safe v2 creates in Firestore rules**

Split `validTestResultCreate` into v1/v2 validators. The v2 validator must allow only the explicit v2 keys, cap snapshots at 24, cap field results at 8, cap recommended fields at 3, restrict dream kind to `recommended`, `catalog`, `custom`, or `undecided`, and retain owner-only reads and no update/delete permissions.

- [ ] **Step 5: Run persistence and rule-adjacent tests**

Run: `npm test -- src/lib/resultStorage.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/resultStorage.ts src/lib/resultStorage.test.ts src/types/firestore.ts firestore.rules
git commit -m "feat: store versioned career results"
```

### Task 6: Move the application flow to result confirmation

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/result/components/DreamChoicePanel.tsx`
- Create: `src/pages/result/components/DreamChoicePanel.test.tsx`

**Interfaces:**
- Consumes `CareerResultV2`, catalog search data, and `DreamChoice`.
- Produces one explicit final result save after the child chooses a dream or “still exploring”.

- [ ] **Step 1: Write failing choice panel tests**

```tsx
it('allows catalog selection, custom input, and still-exploring confirmation', async () => {
  render(<DreamChoicePanel careers={careerCatalog} onConfirm={onConfirm} />);
  await user.click(screen.getByRole('button', { name: '유튜버' }));
  await user.click(screen.getByRole('button', { name: '이 꿈으로 결과 저장하기' }));
  expect(onConfirm).toHaveBeenCalledWith({ kind: 'catalog', careerName: '유튜버' });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/pages/result/components/DreamChoicePanel.test.tsx`

Expected: FAIL because the confirmation panel does not exist.

- [ ] **Step 3: Replace legacy result state**

Use `careerQuestionsV2`, `CareerAnswerMap`, and `getCareerResultV2` in `App.tsx`. Do not call `saveTestResult` when results first render. Store `completedAt` only when the child confirms one of the four dream choice kinds.

- [ ] **Step 4: Implement the choice panel**

Show recommended careers first, then searchable catalog chips grouped by library category, a custom text input limited to 40 visible characters, and an explicit `아직 더 찾아볼래요` confirmation. Require a confirmation button, not an automatic save.

- [ ] **Step 5: Save the complete v2 draft once**

Build answer snapshots through `createAnswerSnapshots`, include field results and field recommendations, and use a signature containing answers plus `dreamChoice` to prevent duplicate writes.

- [ ] **Step 6: Run component and storage tests**

Run: `npm test -- src/pages/result/components/DreamChoicePanel.test.tsx src/lib/resultStorage.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/pages/result/components/DreamChoicePanel.tsx src/pages/result/components/DreamChoicePanel.test.tsx
git commit -m "feat: require final dream choice before saving results"
```

### Task 7: Redesign the result, library, export, and responsive UI

**Files:**
- Modify: `src/pages/result/ResultPage.tsx`
- Replace: `src/pages/result/components/ResultHero.tsx`
- Modify: `src/pages/result/components/CareerRecommendations.tsx`
- Modify: `src/pages/result/components/InsightPanels.tsx`
- Modify: `src/pages/result/components/PdfResultReport.tsx`
- Modify: `src/pages/result/components/ResultActions.tsx`
- Create: `src/styles/field-results.css`
- Modify: `src/styles/result-hero.css`, `src/styles/career-sections.css`, `src/styles/pdf-report.css`, `src/styles/responsive.css`, `src/index.css`

**Interfaces:**
- Consumes `CareerResultV2` and current dream choice state.
- Produces field-first on-screen, PNG, and PDF results.

- [ ] **Step 1: Write failing result rendering tests**

```tsx
it('shows field labels and never renders a single-best-career heading', () => {
  render(<ResultPage {...v2Props} />);
  expect(screen.getByText('호기심 많은 탐구자 — 과학·연구')).toBeInTheDocument();
  expect(screen.queryByText('가장 잘 맞는 직업은')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/pages/result/ResultPage.test.tsx`

Expected: FAIL because the legacy hero requires `topCareer`.

- [ ] **Step 3: Render the three top fields**

Replace `ResultHero` with a heading that says the child explored three matching directions. Render each field’s complete descriptive label, score band, evidence drawn from selected option labels, and recommended careers.

- [ ] **Step 4: Render career details and dream choice accessibly**

Keep career detail buttons only for catalog careers with details. Use semantic headings, labels for search and custom input, keyboard-focusable chips, and no decorative result-field emoji.

- [ ] **Step 5: Update exports**

Make PNG and PDF titles use `나의 진로 탐험 결과`. Include top fields, recommended careers, and `내가 고른 꿈` when present; show `아직 더 찾아보는 중` for undecided results. Remove the legacy “대표 추천” card from exports.

- [ ] **Step 6: Add mobile CSS**

Create `field-results.css` for field cards, recommendation groups, and dream selection. Ensure one-column rendering at `max-width: 600px`, 44px minimum interactive targets, and print-safe field cards in the PDF report.

- [ ] **Step 7: Run UI and build verification**

Run: `npm test -- src/pages/result/ResultPage.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/pages/result src/styles/field-results.css src/styles/result-hero.css src/styles/career-sections.css src/styles/pdf-report.css src/styles/responsive.css src/index.css
git commit -m "feat: show field-first career exploration results"
```

### Task 8: Expose every v2 decision in administration and exports

**Files:**
- Modify: `src/lib/adminResults.ts`
- Modify: `src/lib/adminResults.test.ts`
- Modify: `src/pages/admin/AdminPage.tsx`
- Modify: `src/styles/admin.css`

**Interfaces:**
- Consumes the v1/v2 stored record union.
- Produces version-safe admin details, summaries, CSV rows, and printable reports.

- [ ] **Step 1: Write failing v2 admin utility tests**

```ts
it('returns a v2 final dream and readable snapshot answers', () => {
  expect(getDreamChoiceLabel(v2Record)).toBe('유튜버 (목록 선택)');
  expect(getAdminAnswerDetails(v2Record)[0]).toMatchObject({
    questionText: '체험 수업에서 더 해보고 싶은 것은?',
    optionLabel: '별과 우주를 관찰하며 궁금한 점 알아보기',
  });
});

it('exports v2 questionnaire version, fields, recommendations, and dream choice', () => {
  const csv = toResultsCsv([v2Record]);
  expect(csv).toContain('설문버전');
  expect(csv).toContain('최종꿈');
  expect(csv).toContain('호기심 많은 탐구자 — 과학·연구');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/adminResults.test.ts`

Expected: FAIL because v2 helpers and columns are absent.

- [ ] **Step 3: Add version-safe helpers**

Implement `isV2Result`, `getDreamChoiceLabel`, `getAdminAnswerDetails`, and `getRecommendedFieldLabels`. v2 uses stored snapshots. v1 uses a new frozen `legacyQuestionsV1.ts` map, never the current v2 question list.

- [ ] **Step 4: Update admin list and detail rendering**

Show questionnaire version, final dream, top fields, field recommendations, and all answer snapshots in v2 details. Keep v1 details readable with a `기존 설문` label. Add final dream and field labels to search indexing.

- [ ] **Step 5: Update CSV and printable report**

Add columns for questionnaire version, final dream kind, final dream text, recommended fields, and answer snapshot JSON. In the printable report, rename “대표 직업 분포” to “선택한 꿈 분포” and display recommended-field trends for v2 records.

- [ ] **Step 6: Run admin verification**

Run: `npm test -- src/lib/adminResults.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/adminResults.ts src/lib/adminResults.test.ts src/pages/admin/AdminPage.tsx src/styles/admin.css src/data/legacyQuestionsV1.ts
git commit -m "feat: expose v2 choices in career administration"
```

### Task 9: Replace legacy validation, run full verification, and perform browser checks

**Files:**
- Replace: `scripts/validate-data.mjs`
- Modify: `package.json`
- Create: `scripts/simulate-career-distribution.mjs`
- Modify: `README.md`

**Interfaces:**
- Produces `npm run check:data`, `npm run check:distribution`, and a build pipeline that validates the v2 catalog before compiling.

- [ ] **Step 1: Write the validation expectations**

Make `validate-data.mjs` fail unless all of these hold: 107 catalog entries, unique career names, eight fields, 24 questions, 16 activity plus 8 style questions, A/B primary-tag differences, complete details, and unique career profiles.

- [ ] **Step 2: Add deterministic distribution simulation**

Implement `simulate-career-distribution.mjs` with a fixed seed and 100,000 generated A/B answer maps. Fail if any career is unreachable, if a career is selected because of name sorting, or if an exact profile duplicate exists. Print the field and career counts for review.

- [ ] **Step 3: Wire package scripts**

```json
{
  "check:data": "node scripts/validate-data.mjs",
  "check:distribution": "node scripts/simulate-career-distribution.mjs",
  "build": "npm run check:data && npm run check:distribution && npm run check:business-card && tsc && vite build"
}
```

- [ ] **Step 4: Update the README**

Document the 107-career catalog, 24 approved questions, field-first result experience, final dream choice, questionnaire versioning, and the two new validation commands.

- [ ] **Step 5: Run full automated verification**

Run: `npm test && npm run check:data && npm run check:distribution && npm run build`

Expected: all commands exit 0 and `dist/` is generated.

- [ ] **Step 6: Run browser verification**

Start `npm run dev -- --port 5173`; complete a research-oriented answer path, a creative-oriented path, a “still exploring” result submission, a catalog dream selection, and a custom dream submission. Verify the administrator can display each new result’s all 24 answer snapshots, three field recommendations, and final dream.

- [ ] **Step 7: Commit**

```bash
git add scripts/validate-data.mjs scripts/simulate-career-distribution.mjs package.json README.md
git commit -m "test: validate child career recommendation distribution"
```

### Task 10: Final regression review and handoff

**Files:**
- Modify only if verification identifies an issue: files from Tasks 1–9

**Interfaces:**
- Consumes the complete v2 app and legacy Firestore record fixtures.
- Produces verified implementation with no uncommitted task files.

- [ ] **Step 1: Check the final diff and legacy compatibility**

Run: `git diff main~10..HEAD --check` and `npm test -- src/lib/resultStorage.test.ts src/lib/adminResults.test.ts`.

Expected: no whitespace errors; v1 and v2 fixtures pass.

- [ ] **Step 2: Re-run the release command**

Run: `npm run build`

Expected: exit 0 with both catalog and distribution checks completed before Vite build.

- [ ] **Step 3: Inspect the mobile result view**

Use a 390px-wide viewport. Confirm field cards, job chips, catalog search, custom dream input, confirmation button, and result export controls remain visible without horizontal scrolling.

- [ ] **Step 4: Commit a regression fix only when one was made**

If a check in Steps 1–3 fails, return to the task that owns the failing file, add a focused test first, and commit that exact file set using `fix: resolve career explorer regression`. If all checks pass without source changes, do not create an empty commit.
