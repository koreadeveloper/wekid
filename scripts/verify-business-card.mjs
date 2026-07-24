import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/pages/business-card/BusinessCardMakerPage.tsx',
  'src/pages/business-card/CareerPicker.tsx',
  'src/pages/business-card/CareerPicker.test.ts',
  'src/styles/business-card.css',
  'public/goyang-volunteer-center.png',
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
const picker = readIfExists('src/pages/business-card/CareerPicker.tsx');
const pickerTest = readIfExists('src/pages/business-card/CareerPicker.test.ts');

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
  [page.includes('CareerPicker'), 'page must render the catalog career picker'],
  [picker.includes('careerCatalog'), 'career picker must use the shared career catalog'],
  [picker.includes('filterBusinessCardCareers'), 'career picker must support searching catalog careers'],
  [picker.includes('career.name.toLowerCase().includes(keyword)'), 'career picker must search all 107 careers by name'],
  [pickerTest.includes("filterBusinessCardCareers(careerCatalog, '')") && pickerTest.includes('toHaveLength(107)'), 'picker must verify access to all 107 catalog careers'],
  [page.includes('card-front-center-logo'), 'front card must render the Goyang volunteer center logo'],
  [page.includes('card-front-identity'), 'front card must render the identity block (name/english/job)'],
  [page.includes('card-front-english-name'), 'front card must render an editable English name layer'],
  [page.includes('card-front-contact'), 'front card must render the contact block (phone/email)'],
  [page.includes('card-front-wekid-mark'), 'front card must render the Wekid logo mark'],
  [!page.includes('<p>나의 미래 명함</p>'), 'front card must remove the old future-card label'],
  [css.includes('.card-front-center-logo'), 'CSS must position the center logo'],
  [css.includes('.card-front-identity'), 'CSS must position the front identity block'],
  [css.includes('.card-front-contact'), 'CSS must position the front contact block'],
  [css.includes('.card-front-wekid-mark'), 'CSS must position the front Wekid logo mark'],
  [css.includes('#ff7b70'), 'card back must include the coral edge accent'],
  [css.includes('#ffc928'), 'card back must include the yellow sun accent'],
  [css.includes('#2eb85c'), 'card back must include the green smile accent'],
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
