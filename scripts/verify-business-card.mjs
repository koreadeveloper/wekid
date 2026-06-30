import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/pages/business-card/BusinessCardMakerPage.tsx',
  'src/styles/business-card.css',
  'public/business-card-backgrounds/police.png',
  'public/business-card-backgrounds/firefighter.png',
  'public/business-card-backgrounds/soccer.png',
  'public/business-card-backgrounds/director.png',
  'public/business-card-backgrounds/teacher.png',
];
const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`${file} is missing`);
  }
}

const readIfExists = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const app = readIfExists('src/App.tsx');
const indexCss = readIfExists('src/index.css');
const css = readIfExists('src/styles/business-card.css');
const page = readIfExists('src/pages/business-card/BusinessCardMakerPage.tsx');

const requiredChecks = [
  [app.includes('BusinessCardMakerPage'), 'App must import and render BusinessCardMakerPage'],
  [app.includes('business-card'), 'App must include business-card mode state'],
  [indexCss.includes('business-card.css'), 'index.css must import business-card.css'],
  [css.includes('@page'), 'business-card.css must define @page print rules'],
  [css.includes('size: A4'), 'print page size must be A4'],
  [css.includes('--card-width: 90mm'), 'card width must be 90mm'],
  [css.includes('--card-height: 50mm'), 'card height must be 50mm'],
  [css.includes('grid-template-columns: repeat(2, var(--card-width))'), 'print sheet must use two columns'],
  [page.includes('const PRINT_CARD_COUNT = 10'), 'page must repeat 10 cards per A4 sheet'],
  [page.includes('window.print()'), 'page must use browser print'],
  [page.includes('const JOB_CARD_THEMES'), 'page must define selectable job card themes'],
  [page.includes('경찰관') && page.includes('소방관') && page.includes('축구선수'), 'page must include police, firefighter, and soccer themes'],
  [page.includes('영화감독') && page.includes('선생님'), 'page must include film director and teacher themes'],
  [page.includes('jobSearch') && page.includes('filteredJobThemes'), 'page must support searching job themes'],
  [page.includes('selectJobTheme'), 'page must support selecting a job theme'],
  [page.includes('backgroundUrl'), 'job themes must point to baked background images'],
  [page.includes('card-front-background'), 'front card must render a baked background image'],
  [page.includes('card-name-overlay'), 'front card must render the editable Korean name as an overlay'],
  [page.includes('card-english-overlay'), 'front card must render the editable English name as an overlay'],
  [!page.includes('<div className="card-brand-row">'), 'front card must not render WEKID as web overlay'],
  [!page.includes('className="card-job-pill"'), 'front card must not render job badge as web overlay'],
  [!page.includes('<p>나의 미래 명함</p>'), 'front card must remove the old future-card label'],
  [css.includes('.card-front-background'), 'CSS must position the baked background image'],
  [css.includes('.card-name-overlay'), 'CSS must position the Korean name overlay'],
  [css.includes('.card-english-overlay'), 'CSS must position the English name overlay'],
];

for (const [passes, message] of requiredChecks) {
  if (!passes) {
    failures.push(message);
  }
}

if (failures.length > 0) {
  console.error('Business card verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Business card verification passed.');
