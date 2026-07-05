import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/pages/start/StartPage.tsx',
  'src/App.tsx',
  'src/components/layout/TopBar.tsx',
  'src/components/layout/ResetConfirmButton.tsx',
  'src/pages/result/components/ResultActions.tsx',
  'src/styles/base.css',
  'src/styles/name-step.css',
  'src/styles/quiz-intro.css',
];
const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`${file} is missing`);
  }
}

const readIfExists = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const app = readIfExists('src/App.tsx');
const startPage = readIfExists('src/pages/start/StartPage.tsx');
const topBar = readIfExists('src/components/layout/TopBar.tsx');
const resetConfirm = readIfExists('src/components/layout/ResetConfirmButton.tsx');
const quizIntro = readIfExists('src/pages/quiz/components/QuizIntro.tsx');
const questionPanel = readIfExists('src/pages/quiz/components/QuestionPanel.tsx');
const resultPage = readIfExists('src/pages/result/ResultPage.tsx');
const resultActions = readIfExists('src/pages/result/components/ResultActions.tsx');
const baseCss = readIfExists('src/styles/base.css');
const css = readIfExists('src/styles/name-step.css');
const quizIntroCss = readIfExists('src/styles/quiz-intro.css');

const requiredChecks = [
  [startPage.includes('탐험 준비'), 'start page kicker must be calm and preparation-focused'],
  [startPage.includes('누가 탐험하나요?'), 'start page headline must be concise and child-friendly'],
  [startPage.includes('이름과 센터명은 선택이에요'), 'start page helper copy must clearly mark name and center as optional'],
  [
    startPage.includes('답변과 결과는 저장될 수 있어요'),
    'start page helper copy must keep the result-saving notice in cleaner wording',
  ],
  [startPage.includes('검사 시작'), 'primary start button must use concise wording'],
  [
    startPage.includes('const startTest') &&
      startPage.includes('onSkip(shouldFocusQuiz)') &&
      !startPage.includes('disabled={!hasName}') &&
      !css.includes('.name-start-btn:disabled'),
    'primary start button must allow anonymous start when the name field is blank',
  ],
  [!startPage.includes('Sparkles'), 'primary start button must not render a decorative icon next to the text'],
  [!startPage.includes('이름을 쓰거나 아래에서 이름 없이 시작할 수 있어요'), 'start page must not show the old no-name helper copy'],
  [!startPage.includes('name-helper') && !css.includes('.name-helper'), 'start page must remove the no-name helper element and unused style'],
  [!startPage.includes('name-skip-btn') && !css.includes('.name-skip-btn'), 'start page must not render a duplicate anonymous-start button'],
  [
    quizIntro.includes('{totalQuestions}문항에 답하면 나에게 잘 맞는 직업과 이유를 볼 수 있어요.'),
    'quiz intro must use clearer result-preview copy',
  ],
  [
    quizIntroCss.includes('.intro-panel') &&
      quizIntroCss.includes('color: var(--duo-on-green)') &&
      !quizIntroCss.includes('color: #eaffdc'),
    'quiz intro must use high-contrast text on bright green surfaces',
  ],
  [
    quizIntroCss.includes('.visual-card') &&
      quizIntroCss.includes('background: #73d900') &&
      quizIntroCss.includes('color: var(--duo-on-green)') &&
      !quizIntroCss.includes('color: #ffffff'),
    'quiz visual cards must avoid low-contrast white text on bright colors',
  ],
  [!quizIntro.includes('마음에 더 가까운 선택지를 고르면'), 'quiz intro must remove awkward choice-result wording'],
  [!resultPage.includes('ResultSaveNotice'), 'result page must not render save-status notices to users'],
  [!resultPage.includes('결과를 안전하게 저장하는 중이에요'), 'result page must hide the saving notice'],
  [!resultPage.includes('결과가 저장됐어요'), 'result page must hide the saved notice'],
  [resultActions.includes('마지막 답변 고치기'), 'result action must say it edits the final answer only'],
  [!resultActions.includes('\n        답변 고치기\n'), 'result action must remove the generic edit-answer label'],
  [!startPage.includes('탐험 시작!'), 'primary start button must not use an exclamation mark'],
  [!startPage.includes('이름과 센터명을'), 'old headline copy must be removed'],
  [!startPage.includes('알려주세요'), 'old headline copy must be removed'],
  [!startPage.includes('검사를 마치면 이름, 센터명'), 'old dense helper copy must be removed'],
  [!startPage.includes('🧭'), 'start page must use an icon component instead of a raw emoji'],
  [!startPage.includes('Compass') && !startPage.includes('name-step-icon'), 'start page must not render a decorative compass icon'],
  [
    !css.includes('.name-step-icon') &&
      css.includes('text-wrap: balance') &&
      css.includes('text-wrap: pretty') &&
      css.includes('word-break: keep-all'),
    'start page styles must remove the decorative icon and support Korean line wrapping',
  ],
  [css.includes('100dvh'), 'start page layout must use mobile-stable dynamic viewport height'],
  [css.includes('padding-top: clamp(22px, 5vh, 56px)'), 'start page top spacing must keep the card visible on tablet-height screens'],
  [
    app.includes('name-step-app') && css.includes('.name-step-app') && css.includes('padding-bottom: clamp(12px, 2vh, 20px)'),
    'start page app shell must remove the global bottom padding that causes unnecessary vertical scrolling',
  ],
  [
    css.includes('@media (max-width: 620px)') && css.includes('min-height: calc(100dvh - 112px)'),
    'start page mobile layout must account for the two-row mobile top bar height',
  ],
  [topBar.includes('<ResetConfirmButton'), 'top bar reset must open a confirmation dialog before resetting'],
  [
    topBar.includes('showReset') &&
      app.includes("showReset={mode === 'career' && !nameStep && !showResult}") &&
      !topBar.includes("mode === 'career' && ("),
    'top bar reset must stay hidden before the test starts and after the result opens',
  ],
  [
    startPage.includes('onStart(shouldFocusQuiz)') &&
      startPage.includes('onSkip(shouldFocusQuiz)') &&
      app.includes('quizFocusRequest') &&
      questionPanel.includes('focusRequest') &&
      questionPanel.includes('focus({ preventScroll: true })'),
    'keyboard start must hand focus to the active quiz answer without scrolling',
  ],
  [resultActions.includes('<ResetConfirmButton'), 'result page retest action must confirm before clearing results'],
  [resetConfirm.includes('role="alertdialog"'), 'reset confirmation must expose an alertdialog role'],
  [resetConfirm.includes('aria-modal="true"'), 'reset confirmation must be modal for assistive technology'],
  [resetConfirm.includes('aria-labelledby="reset-confirm-title"'), 'reset confirmation must label the dialog title'],
  [resetConfirm.includes('aria-describedby="reset-confirm-desc"'), 'reset confirmation must describe the destructive action'],
  [resetConfirm.includes("event.key === 'Escape'"), 'reset confirmation must close on Escape'],
  [resetConfirm.includes("event.key !== 'Tab'"), 'reset confirmation must trap Tab focus'],
  [resetConfirm.includes('cancelButtonRef.current?.focus'), 'reset confirmation must focus the non-destructive action first'],
  [resetConfirm.includes('triggerButtonRef.current.focus'), 'reset confirmation must restore focus to the opener'],
  [resetConfirm.includes('child.inert = true'), 'reset confirmation must make background content inert while open'],
  [resetConfirm.includes('createPortal'), 'reset confirmation must render outside the app shell to avoid clipping'],
  [baseCss.includes('.reset-confirm-overlay'), 'reset confirmation overlay styles must exist'],
  [baseCss.includes('.reset-confirm-card'), 'reset confirmation card styles must exist'],
  [baseCss.includes('.reset-confirm-primary'), 'reset confirmation destructive action styles must exist'],
];

for (const [passes, message] of requiredChecks) {
  if (!passes) {
    failures.push(message);
  }
}

if (failures.length > 0) {
  console.error('Start page verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Start page verification passed.');
