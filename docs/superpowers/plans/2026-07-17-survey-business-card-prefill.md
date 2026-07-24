# 설문 결과 기반 명함 제작 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 관리자가 명함 제작 탭에서 설문 응답자를 이름으로 찾아 정보를 불러오고, 전체 107개 직업 중 하나를 선택해 명함을 만들 수 있게 한다.

**Architecture:** testResults 문서를 명함 입력값으로 바꾸는 순수 변환 함수와 이름 검색 함수를 먼저 만든다. 명함 제작 화면은 owner 상태에서만 Firestore 응답을 읽어 동명이인 목록을 보여 주고, 선택된 응답으로 편집 상태를 채운다. 직업 선택은 careerCatalog을 단일 원본으로 하는 검색 컴포넌트로 통합한다.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Firebase Authentication, Cloud Firestore, lucide-react

## Global Constraints

- Firestore 규칙과 testResults 문서 스키마는 변경하지 않는다.
- 결과 검색은 기존 owner 관리자에게만 보인다.
- 이름 없는 결과는 명함 불러오기 결과에서 제외한다.
- 전체 직업 선택은 src/data/careerCatalog.ts의 107개 직업만 사용한다.
- undecided 최종 꿈은 자동 선택하지 않는다.
- 기존 package-lock.json 변경은 스테이징하거나 커밋하지 않는다.

---

### Task 1: 설문 응답 명함 사전 입력 도메인 로직

**Files:**
- Create: src/lib/businessCardPrefill.ts
- Create: src/lib/businessCardPrefill.test.ts

**Interfaces:**
- Consumes: StoredTestResultRecord, isV2Result, getCareerName, toAdminDate
- Produces: BusinessCardPrefill, createBusinessCardPrefill(result), searchBusinessCardResults(results, query)

- [ ] **Step 1: Write the failing tests**

~~~
it('uses a v2 final dream and saved participant fields', () => {
  const prefill = createBusinessCardPrefill(v2Result({
    participantName: '김하늘', participantEmail: 'sky@example.com', centerName: '별빛초등학교',
    dreamChoice: { kind: 'catalog', careerName: '천문학자' }, resultSummary: '별을 관찰하는 일을 좋아해요.',
  }));
  expect(prefill).toMatchObject({ name: '김하늘', email: 'sky@example.com', school: '별빛초등학교', job: '천문학자' });
});

it('excludes nameless rows and keeps same-name responses newest first', () => {
  expect(searchBusinessCardResults([olderKim, nameless, latestKim], '김하늘').map((result) => result.id))
    .toEqual(['latest-result', 'older-result']);
});
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/lib/businessCardPrefill.test.ts

Expected: FAIL because businessCardPrefill does not exist.

- [ ] **Step 3: Implement the minimal domain API**

~~~
export type BusinessCardPrefill = {
  sourceId: string; name: string; email: string; school: string; job: string; goal: string;
};

export function createBusinessCardPrefill(result: StoredTestResultRecord): BusinessCardPrefill {
  const job = isV2Result(result)
    ? result.dreamChoice.kind === 'undecided' ? '' : result.dreamChoice.careerName.trim()
    : getCareerName(result.topCareer);
  return {
    sourceId: result.id,
    name: result.participantName?.trim() ?? '',
    email: result.participantEmail?.trim() ?? '',
    school: result.centerName?.trim() ?? '',
    job,
    goal: result.resultSummary.trim(),
  };
}
~~~

Implement searchBusinessCardResults with normalized Korean case-insensitive matching, no-name exclusion, and descending createdAt order.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: npm test -- src/lib/businessCardPrefill.test.ts

Expected: PASS for v1, v2, undecided, duplicate-name, and nameless cases.

- [ ] **Step 5: Commit**

~~~
git add src/lib/businessCardPrefill.ts src/lib/businessCardPrefill.test.ts
git commit -m "feat: map survey results to business card data"
~~~

### Task 2: 전체 107개 직업 선택 컴포넌트

**Files:**
- Create: src/pages/business-card/CareerPicker.tsx
- Create: src/pages/business-card/CareerPicker.test.ts
- Modify: src/pages/business-card/BusinessCardMakerPage.tsx
- Modify: src/styles/business-card.css
- Modify: scripts/verify-business-card.mjs

**Interfaces:**
- Consumes: careerCatalog: CareerDefinition[]
- Produces: CareerPicker({ value, onChange }), filterBusinessCardCareers(careers, searchTerm)

- [ ] **Step 1: Write the failing tests**

~~~
it('returns all 107 catalog careers with an empty search term', () => {
  expect(filterBusinessCardCareers(careerCatalog, '')).toHaveLength(107);
});

it('finds a Korean job name and preserves its catalog emoji', () => {
  expect(filterBusinessCardCareers(careerCatalog, '아쿠아리스트'))
    .toMatchObject([{ name: '아쿠아리스트', detail: { emoji: '🐾' } }]);
});
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/pages/business-card/CareerPicker.test.ts

Expected: FAIL because CareerPicker does not exist.

- [ ] **Step 3: Implement the catalog picker and replace fixed themes**

~~~
export function CareerPicker({ value, onChange }: { value: string; onChange: (careerName: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const careers = filterBusinessCardCareers(careerCatalog, searchTerm);
  return <div className="business-card-job-selector">
    <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
    <div className="job-theme-list" aria-label="희망 직업 선택">
      {careers.map((career) => <button key={career.name} type="button" onClick={() => onChange(career.name)}>
        <span aria-hidden="true">{career.detail.emoji}</span><strong>{career.name}</strong>
      </button>)}
    </div>
  </div>;
}
~~~

In BusinessCardMakerPage, remove JOB_CARD_THEMES, selectedJobKey, and selectedJobTheme. Use careerByName[cardData.job]?.detail.emoji ?? '💼' for the preview. Keep the existing common card design and do not add generated background assets. In scripts/verify-business-card.mjs, replace the fixed-five-theme source checks with checks for CareerPicker, careerCatalog, and 107-job search support.

- [ ] **Step 4: Run picker and print checks**

Run: npm test -- src/pages/business-card/CareerPicker.test.ts; npm run check:business-card

Expected: PASS; every catalog career is searchable and print verification remains green.

- [ ] **Step 5: Commit**

~~~
git add src/pages/business-card/CareerPicker.tsx src/pages/business-card/CareerPicker.test.ts src/pages/business-card/BusinessCardMakerPage.tsx src/styles/business-card.css scripts/verify-business-card.mjs
git commit -m "feat: offer all careers in business card maker"
~~~

### Task 3: 명함 제작 탭의 설문 결과 이름 검색

**Files:**
- Create: src/pages/business-card/SurveyResultLookup.tsx
- Create: src/pages/business-card/SurveyResultLookup.test.tsx
- Modify: src/pages/business-card/BusinessCardMakerPage.tsx
- Modify: src/styles/business-card.css

**Interfaces:**
- Consumes: fetchAdminResults, createBusinessCardPrefill, searchBusinessCardResults
- Produces: SurveyResultLookup({ onSelect })

- [ ] **Step 1: Write the failing presentation tests**

~~~
it('shows email, center, date, and final dream for duplicate name matches', () => {
  const markup = renderToStaticMarkup(
    <SurveyResultLookup initialResults={[kimAtStarSchool, kimAtSkyCenter]} onSelect={() => undefined} />,
  );
  expect(markup).toContain('sky@example.com');
  expect(markup).toContain('별빛초등학교');
  expect(markup).toContain('천문학자');
});
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/pages/business-card/SurveyResultLookup.test.tsx

Expected: FAIL because SurveyResultLookup does not exist.

- [ ] **Step 3: Implement the owner-only lookup**

~~~
export function SurveyResultLookup({ onSelect }: { onSelect: (prefill: BusinessCardPrefill) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StoredTestResultRecord[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  useEffect(() => { void fetchAdminResults().then((response) => {
    if (response.ok) { setResults(response.results); setStatus('ready'); } else setStatus('unavailable');
  }); }, []);
  const matches = searchBusinessCardResults(results, query);
  // Render only non-empty name searches; each row calls onSelect(createBusinessCardPrefill(result)).
}
~~~

Add the panel above the editor in BusinessCardMakerPage. A selected result replaces name, englishName, email, school, job, and goal but keeps an already uploaded photograph and optional phone number. Show the selected response’s name and date below the lookup panel.

- [ ] **Step 4: Run lookup tests to verify they pass**

Run: npm test -- src/pages/business-card/SurveyResultLookup.test.tsx src/lib/businessCardPrefill.test.ts

Expected: PASS; duplicate names are distinguishable and no-name records never appear.

- [ ] **Step 5: Commit**

~~~
git add src/pages/business-card/SurveyResultLookup.tsx src/pages/business-card/SurveyResultLookup.test.tsx src/pages/business-card/BusinessCardMakerPage.tsx src/styles/business-card.css
git commit -m "feat: load survey answers into business cards"
~~~

### Task 4: 단일 React 명함 흐름으로 정리

**Files:**
- Delete: src/pages/admin/AdminBusinessCardBridge.tsx
- Delete: src/pages/business-card/AdminBusinessCardMakerPage.tsx
- Modify: src/App.tsx
- Create: src/App.business-card.test.tsx
- Modify: README.md

**Interfaces:**
- Consumes: unified BusinessCardMakerPage
- Produces: DOM mutation observer 없이 React가 소유하는 단일 명함 제작 화면

- [ ] **Step 1: Write the failing integration test**

~~~
it('uses the unified business card maker without the DOM bridge', () => {
  const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
  expect(source).not.toContain('AdminBusinessCardBridge');
  expect(source).not.toContain('AdminBusinessCardMakerPage');
  expect(source).toContain('<BusinessCardMakerPage');
});
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/App.business-card.test.tsx

Expected: FAIL because the old bridge imports are still present.

- [ ] **Step 3: Remove bridge-only code and document the workflow**

Remove businessCardPrefill state and bridge imports from App.tsx; render BusinessCardMakerPage directly in business-card mode while preserving canUseBusinessCard as the owner-derived navigation gate. Delete both obsolete component files. Add one README bullet describing the administrator name search and 107-career selection.

- [ ] **Step 4: Run integration checks**

Run: npm test -- src/App.business-card.test.tsx; npm run check:business-card

Expected: PASS; the card maker is React-owned and the existing print flow remains valid.

- [ ] **Step 5: Commit**

~~~
git add src/App.tsx src/App.business-card.test.tsx README.md
git rm src/pages/admin/AdminBusinessCardBridge.tsx src/pages/business-card/AdminBusinessCardMakerPage.tsx
git commit -m "refactor: unify survey business card flow"
~~~

### Task 5: Final regression verification

**Files:**
- Verify only: files from Tasks 1–4

- [ ] **Step 1: Run all tests**

Run: npm test

Expected: PASS with no failed test files.

- [ ] **Step 2: Run data and business-card verification**

Run: npm run check:data; npm run check:distribution; npm run check:business-card

Expected: PASS; the catalog stays at 107 careers and the print checks succeed.

- [ ] **Step 3: Run production build**

Run: npm run build

Expected: TypeScript and Vite exit with code 0. The existing bundle-size warning is acceptable only if the command exits successfully.

- [ ] **Step 4: Inspect the handoff diff**

Run: git diff --check HEAD~4..HEAD; git status --short

Expected: no whitespace errors; the pre-existing package-lock.json remains unstaged.
