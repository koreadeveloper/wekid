import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const requiredFiles = [
  'DESIGN.md',
  'src/components/layout/TopBar.tsx',
  'src/lib/resultPersistence.ts',
  'src/pages/result/LazyResultPage.tsx',
  'src/pages/result/components/LazyCareerDetailModal.tsx',
  'src/pages/admin/LazyAdminPage.tsx',
  'src/pages/business-card/JobThemePicker.tsx',
  'src/pages/business-card/LazyBusinessCardMakerPage.tsx',
  'src/pages/business-card/BusinessCardPreview.tsx',
  'src/pages/business-card/BusinessCardMakerPage.tsx',
  'src/pages/business-card/businessCardConfig.ts',
  'src/styles/base.css',
  'src/styles/business-card.css',
  'src/lib/appMode.ts',
  'src/lib/jobCardThemes.ts',
  'src/data/jobCardThemes.ts',
  'public/brand/wekid-site-logo.png',
  'public/brand/wekid-logo.png',
  'wekid-job-backgrounds-clean-178/job-background-name-map.csv',
];
const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`${file} is missing`);
  }
}

const imageDirectory = 'wekid-job-backgrounds-clean-178/images';
const optimizedImageDirectory = 'wekid-job-backgrounds-clean-178/webp';
if (!existsSync(imageDirectory)) failures.push(`${imageDirectory} is missing`);
if (!existsSync(optimizedImageDirectory)) failures.push(`${optimizedImageDirectory} is missing`);

const readIfExists = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const app = readIfExists('src/App.tsx');
const designSystem = readIfExists('DESIGN.md');
const indexCss = readIfExists('src/index.css');
const topBar = readIfExists('src/components/layout/TopBar.tsx');
const baseCss = readIfExists('src/styles/base.css');
const careerModalCss = readIfExists('src/styles/career-modal.css');
const css = readIfExists('src/styles/business-card.css');
const page = readIfExists('src/pages/business-card/BusinessCardMakerPage.tsx');
const jobPicker = readIfExists('src/pages/business-card/JobThemePicker.tsx');
const lazyPage = readIfExists('src/pages/business-card/LazyBusinessCardMakerPage.tsx');
const preview = readIfExists('src/pages/business-card/BusinessCardPreview.tsx');
const config = readIfExists('src/pages/business-card/businessCardConfig.ts');
const appMode = readIfExists('src/lib/appMode.ts');
const lazyAdminPage = readIfExists('src/pages/admin/LazyAdminPage.tsx');
const lazyResultPage = readIfExists('src/pages/result/LazyResultPage.tsx');
const lazyCareerDetailModal = readIfExists('src/pages/result/components/LazyCareerDetailModal.tsx');
const resultPersistence = readIfExists('src/lib/resultPersistence.ts');
const data = readIfExists('src/data/jobCardThemes.ts');
const util = readIfExists('src/lib/jobCardThemes.ts');
const csv = readIfExists('wekid-job-backgrounds-clean-178/job-background-name-map.csv');
const hasAll = (text, fragments) => fragments.every((fragment) => text.includes(fragment));
const hasNone = (text, fragments) => fragments.every((fragment) => !text.includes(fragment));
const frontLogoRule = css.match(/\.card-front-logo\s*\{[^}]*\}/s)?.[0] ?? '';
const frontJobBadgeRule = css.match(/\.card-front-job-badge\s*\{[^}]*\}/s)?.[0] ?? '';
const mobileLivePreviewRules = [...css.matchAll(/\.business-card-mobile-live-preview\s*\{[^}]*\}/gs)].map(
  ([rule]) => rule,
);
const mobileLivePreviewRule = mobileLivePreviewRules[mobileLivePreviewRules.length - 1] ?? '';
const mobileLivePreviewBlock = page.match(/<div className="business-card-mobile-live-preview"[\s\S]*?<\/div>/)?.[0] ?? '';
const sharedCss = `${baseCss}\n${careerModalCss}`;
const brandMarkRule = sharedCss.match(/\.brand-mark\s*\{[^}]*\}/s)?.[0] ?? '';
const brandMarkImageRule = sharedCss.match(/\.brand-mark\s+(?:img|\.brand-logo)[^{]*\{[^}]*\}/s)?.[0] ?? '';
const csvRows = csv.split(/\r?\n/).map((row) => row.trim()).filter(Boolean).slice(1);
const imageFiles = existsSync(imageDirectory) ? readdirSync(imageDirectory).filter((file) => file.toLowerCase().endsWith('.png')) : [];
const optimizedImageFiles = existsSync(optimizedImageDirectory) ? readdirSync(optimizedImageDirectory).filter((file) => file.toLowerCase().endsWith('.webp')) : [];

for (const row of csvRows) {
  const filename = row.split(',')[3];
  if (filename && !existsSync(join(imageDirectory, filename))) {
    failures.push(`${filename} is listed in the CSV but missing from ${imageDirectory}`);
  }
}

const requiredChecks = [
  [designSystem.includes('# Wekid Design System'), 'DESIGN.md must document the Wekid visual system before UI changes'],
  [designSystem.includes('Brand Mark') && designSystem.includes('Site Logo'), 'DESIGN.md must document the site logo brand mark primitive'],
  [designSystem.includes('### Job Picker') && designSystem.includes('radiogroup'), 'DESIGN.md must document the accessible job picker primitive'],
  [
    designSystem.includes('### Mobile Business Card Live Preview') &&
      designSystem.includes('showing one centered front card') &&
      designSystem.includes('Motion: none'),
    'DESIGN.md must document the single-card mobile live preview contract',
  ],
  [
    designSystem.includes('### Business Card Print Controls') &&
      designSystem.includes('앞면만 10개 인쇄') &&
      designSystem.includes('business-card mode changes move focus to the page title'),
    'DESIGN.md must document selected-side print copy and business-card focus handoff',
  ],
  [topBar.includes('/brand/wekid-site-logo.png'), 'TopBar must use the new Wekid site logo asset'],
  [topBar.includes('className="brand-logo"'), 'TopBar must render the site logo image in the brand mark'],
  [!topBar.includes('Compass'), 'TopBar must replace the old compass icon site logo'],
  [topBar.includes('센터 관리'), 'TopBar must label the admin surface as center management'],
  [
    hasAll(topBar, ["mode === 'admin' &&", "mode === 'admin' ? 'with-admin' : ''"]),
    'TopBar must hide the center-management tab outside the admin URL mode',
  ],
  [
    hasAll(topBar, ["mode === 'career'", '검사 처음부터 다시 하기']) && !topBar.includes('aria-label="처음부터 다시 하기"'),
    'TopBar reset button must be scoped to the career test mode',
  ],
  [
    hasAll(designSystem, ['mobile segmented buttons', '44px hit target', 'selected green segments use `--duo-on-green`']),
    'DESIGN.md must document high-contrast and touch-safe mobile segmented controls',
  ],
  [
    hasAll(css, ['.mode-button.active', 'color: var(--duo-on-green)', '@media (max-width: 620px)', 'min-height: 44px']) &&
      hasAll(css, ['.brand-mark,\n  .icon-button', 'width: 44px', 'height: 44px']),
    'topbar segmented controls and reset icon must keep readable selected text and 44px mobile touch targets',
  ],
  [
    hasAll(css, ['.job-theme-button.active', 'color: var(--duo-on-green)']) &&
      hasAll(css, ['.print-side-switch button.active', 'color: var(--duo-on-green)']),
    'business-card selected green controls must use the high-contrast on-green token',
  ],
  [
    hasAll(brandMarkRule, ['position: relative', 'overflow: hidden']) &&
      hasAll(brandMarkImageRule, ['position: absolute', 'inset: 0', 'width: 100%', 'height: 100%', 'object-position: center']),
    'site logo image must be centered inside the brand mark',
  ],
  [
    hasAll(app, ['LazyBusinessCardMakerPage', 'LazyAdminPage', 'LazyResultPage', 'LazyCareerDetailModal']) &&
      hasNone(app, [
        "from './pages/business-card/BusinessCardMakerPage'",
        "from './pages/admin/AdminPage'",
        "from './pages/result/ResultPage'",
        "from './pages/result/components/CareerDetailModal'",
      ]),
    'App must lazy-load heavy routes and modals instead of importing them directly',
  ],
  [
    hasAll(lazyPage, ['lazy(async () =>', "await import('./BusinessCardMakerPage')", '<Suspense fallback=']) &&
      hasAll(lazyAdminPage, ['lazy(async () =>', "await import('./AdminPage')", '<Suspense fallback=']) &&
      hasAll(lazyResultPage, ['lazy(async () =>', "await import('./ResultPage')", '<Suspense fallback=']) &&
      hasAll(lazyCareerDetailModal, ['lazy(async () =>', "await import('./CareerDetailModal')", '<Suspense fallback=']),
    'lazy wrappers must split business-card, admin, result, and career-detail behind Suspense',
  ],
  [
    hasAll(app, ['businessCardFocusRequest', 'requestBusinessCardFocus', 'focusRequest={businessCardFocusRequest}']) &&
      hasAll(lazyPage, ['readonly focusRequest: number', 'focusRequest={focusRequest}']) &&
      hasAll(page, ['readonly focusRequest: number', 'headingRef', 'tabIndex={-1}', 'focus({ preventScroll: true })']),
    'business-card mode changes must focus the business-card page title for keyboard and screen-reader users',
  ],
  [
    app.includes('persistTestResult') && !app.includes("from './lib/resultStorage'"),
    'App must defer Firebase result storage until a result is actually saved',
  ],
  [
    hasAll(resultPersistence, ['import type { TestResultDraft }', "await import('./resultStorage')"]),
    'result persistence helper must dynamically import Firebase-backed result storage',
  ],
  [app.includes('business-card'), 'App must include business-card mode state'],
  [
    hasAll(app, ['readCurrentAppMode', 'writeAppModeToHistory', "window.addEventListener('popstate'"]),
    'App modes must sync with URL state and browser history',
  ],
  [
    hasAll(appMode, ['readAppModeFromSearch', "case 'business-card'", "case 'admin'", "url.searchParams.set('mode', nextMode)"]),
    'app mode utility must parse and write URL-addressable modes',
  ],
  [indexCss.includes('business-card.css'), 'index.css must import business-card.css'],
  [csvRows.length === 178, 'CSV must list 178 job backgrounds'],
  [imageFiles.length === 178, 'image directory must contain 178 PNG backgrounds'],
  [optimizedImageFiles.length === 178, 'optimized image directory must contain 178 WebP backgrounds'],
  [data.includes('job-background-name-map.csv?raw'), 'data module must import the job background CSV'],
  [data.includes('import.meta.glob') && data.includes('wekid-job-backgrounds-clean-178/webp/*.webp'), 'data module must import optimized WebP backgrounds'],
  [data.includes('buildJobCardThemes'), 'data module must build selectable job themes'],
  [util.includes('parseJobBackgroundCsv'), 'utility must parse job background CSV data'],
  [util.includes('searchJobCardThemes'), 'utility must expose job theme search'],
  [page.includes('jobCardThemes'), 'page must use generated job card themes'],
  [page.includes('searchJobCardThemes'), 'page must search generated job card themes'],
  [jobPicker.includes('filteredJobThemes.length'), 'job picker must show the number of matching jobs'],
  [page.includes('JobThemePicker'), 'page must render the extracted job picker component'],
  [jobPicker.includes('aria-controls={JOB_THEME_LIST_ID}'), 'job search input must expose controlled result list'],
  [jobPicker.includes('aria-describedby={JOB_THEME_STATUS_ID}'), 'job search and list must describe filtered result status'],
  [jobPicker.includes('role="status"') && jobPicker.includes('aria-live="polite"') && jobPicker.includes('aria-atomic="true"'), 'job result count must be announced politely to assistive tech'],
  [jobPicker.includes('jobButtonRefs'), 'job picker must keep refs for roving focus'],
  [jobPicker.includes('keyboardActiveJobKey'), 'job picker must track the single keyboard-focusable job option'],
  [jobPicker.includes('handleJobThemeKeyDown'), 'job picker must handle arrow/Home/End keyboard navigation'],
  [jobPicker.includes('role="radiogroup"'), 'job picker list must expose a radiogroup role'],
  [jobPicker.includes('role="radio"'), 'each job option must expose a radio role'],
  [jobPicker.includes('aria-checked={selectedJobKey === theme.key}'), 'each job option must expose selected state with aria-checked'],
  [jobPicker.includes('tabIndex={theme.key === keyboardActiveJobKey ? 0 : -1}'), 'job picker must use roving tabindex so only one job option is tabbable'],
  [!page.includes('const JOB_CARD_THEMES'), 'page must not use the old five-theme constant'],
  [preview.includes('backgroundUrl'), 'job themes must point to baked background images'],
  [preview.includes('card-front-background'), 'front card must render a baked background image'],
  [preview.includes('card-front-logo'), 'front card must render the Wekid logo overlay'],
  [preview.includes('card-name-overlay'), 'front card must render the editable Korean name as an overlay'],
  [preview.includes('card-english-overlay'), 'front card must render the editable English name as an overlay'],
  [preview.includes('card-front-job-badge'), 'front card must render the selected job name badge'],
  [
    hasAll(page, [
      'className="business-card-print-controls" role="group" aria-label="명함 인쇄 설정"',
      'className="print-side-switch" role="group" aria-label="인쇄할 면 선택"',
      'aria-pressed={printSide ===',
      'aria-describedby="business-card-print-guide"',
    ]),
    'print controls and side switch must expose grouped labels and selected state to assistive tech',
  ],
  [
    hasAll(page, [
      "const printSideLabel = printSide === 'front' ? '앞면' : '뒷면'",
      '{printSideLabel}만 10개 인쇄',
      '앞면 인쇄 후 같은 종이에 뒷면을 인쇄하세요.',
    ]) && !page.includes('A4 1장 · 명함 10개') && !page.includes('A4 10장'),
    'print quantity copy must clarify that only the selected side prints 10 cards and include front/back guidance',
  ],
  [preview.includes('card-back-brand') && preview.includes('card-back-logo'), 'back card must include a Wekid brand header'],
  [preview.includes('card-back-identity') && preview.includes('card-detail-grid'), 'back card must use the redesigned identity and detail layout'],
  [preview.includes('card-goal-band'), 'back card must give the goal its own prominent band'],
  [
    config.includes("phone: ''") && config.includes('보호자 연락처 (선택)'),
    'business card contact field must default blank and be labeled as optional guardian contact',
  ],
  [
    designSystem.includes('goal field spans the full form width') &&
      page.includes("field.id === 'goal' ? ' wide' : ''") &&
      css.includes('.business-card-field.wide') &&
      css.includes('grid-column: 1 / -1'),
    'business card goal field must span the full form width for readable editing',
  ],
  [
    hasAll(preview, ['const phone = data.phone.trim()', "card-detail-grid${phone ? '' : ' single'}", '{phone &&', '<dt>연락처</dt>']),
    'business card back must omit contact details when the optional contact field is empty',
  ],
  [css.includes('@page'), 'business-card.css must define @page print rules'],
  [css.includes('size: A4'), 'print page size must be A4'],
  [css.includes('--card-width: 90mm'), 'card width must be 90mm'],
  [css.includes('--card-height: 50mm'), 'card height must be 50mm'],
  [css.includes('grid-template-columns: repeat(2, var(--card-width))'), 'print sheet must use two columns'],
  [!css.includes('border: 0.35mm dashed'), 'print cards must not render dotted cut outlines'],
  [css.includes('.job-theme-list') && css.includes('max-height'), 'job theme list must be scrollable for 178 jobs'],
  [!css.includes('order: -1'), 'business card mobile visual order must match DOM and keyboard order'],
  [css.includes('.job-theme-button:focus-visible'), 'job theme buttons must have a visible focus state'],
  [css.includes('.card-front-background'), 'CSS must position the baked background image'],
  [css.includes('.card-front-logo') && css.includes('left: 4%') && css.includes('top: 5.2%') && css.includes('width: 6%'), 'CSS must position the Wekid logo in the front card top-left corner without overlapping the larger name'],
  [
    frontLogoRule.length > 0 &&
      hasNone(frontLogoRule, ['box-shadow', 'background', 'border:', 'padding']),
    'front Wekid logo must not render a rectangular box around the transparent PNG',
  ],
  [css.includes('.card-name-overlay'), 'CSS must position the Korean name overlay'],
  [css.includes('.card-english-overlay'), 'CSS must position the English name overlay'],
  [
    hasAll(css, ['.card-front-job-badge', 'left: 6.2%', 'bottom: 0.4%', 'justify-content: center', 'text-align: center']),
    'CSS must position and center the front job name badge in the lower-left corner',
  ],
  [
    frontJobBadgeRule.length > 0 && hasNone(frontJobBadgeRule, ['0 0 0 3px', '0 0 0 6px', 'dashed', 'dotted']),
    'front job badge must use a solid capsule without dotted-looking outer decoration',
  ],
  [!css.includes('0 0 0 0.6mm rgba(255, 238, 92'), 'print front job badge must not draw a dotted-looking outer ring'],
  [!css.includes('.card-front-job-badge::before'), 'front job badge must not render the old dashed inner frame'],
  [!css.includes('dashed') && !css.includes('dotted'), 'front job badge and print sheet must not use dotted or dashed outlines'],
  [
    hasAll(preview, ["jobBadgeLength >= 11", "jobBadgeLength >= 6"]),
    'front job badge must reserve two-line wrapping for longer job names only',
  ],
  [
    hasAll(preview, ["nameLength >= 11", "nameLength >= 8", "nameLength >= 5"]),
    'front name overlay must keep short Korean names large and reserve compact sizing for longer names',
  ],
  [
    hasAll(preview, ["englishNameLength >= 22", "englishNameLength >= 18", "englishNameLength >= 15"]),
    'front name overlay must use graduated sizing for long English names',
  ],
  [
    hasAll(css, [
      '.card-name-overlay',
      'white-space: nowrap',
      '.card-front-name-layer.ultra',
      '.business-card-mobile-live-preview .card-front-name-layer.ultra',
    ]),
    'front names must stay readable through ultra sizing instead of orphaning Korean syllables',
  ],
  [
    hasAll(css, ['white-space: nowrap', 'word-break: keep-all', '.card-front-job-badge.compact span', '.card-front-job-badge.dense span']),
    'front job badge text must keep short Korean job names centered on one line and scale long names',
  ],
  [
    hasAll(css, ['.business-card-upload:focus-within', '.print-side-switch button:focus-visible']),
    'business card upload and print side controls must have visible keyboard focus states',
  ],
  [
    hasAll(css, ['.print-guide', 'word-break: keep-all', 'overflow-wrap: break-word']) &&
      hasAll(css, ['.print-count-pill', 'word-break: keep-all']),
    'print help text must wrap Korean copy cleanly without crowding the controls',
  ],
  [
    mobileLivePreviewBlock.includes('side="front"') && !mobileLivePreviewBlock.includes('side="back"'),
    'mobile live preview must render one centered front card only',
  ],
  [
    hasAll(mobileLivePreviewRule, ['display: grid', 'place-items: center', 'overflow: visible']) &&
      hasNone(mobileLivePreviewRule, ['overflow-x', 'scroll-snap-type']),
    'mobile live preview CSS must keep the single card centered without horizontal snap scrolling',
  ],
  [
    hasAll(css, ['.card-name-overlay', 'clamp(92px, 20.8cqw, 126px)', 'clamp(70px, 20.9cqw, 90px)', 'font-size: 68pt']),
    'front Korean name must be larger on screen and print while scaling with card width',
  ],
  [
    hasAll(css, ['.card-english-overlay', 'clamp(45px, 9.8cqw, 59px)', 'clamp(33px, 9.5cqw, 44px)', 'font-size: 27.5pt']),
    'front English name must be larger on screen and print while scaling with card width',
  ],
  [hasAll(css, ['.card-front-name-layer.ultra .card-english-overlay', 'letter-spacing: 0']), 'ultra English names must tighten letter spacing'],
  [
    hasAll(css, ['container-type: inline-size', 'cqw']),
    'business card typography must scale against the card width for small previews',
  ],
  [
    hasAll(page, ['document.fonts?.ready', 'image.decode()', 'window.print()']),
    'print action must wait for card fonts and images before opening the print dialog',
  ],
  [css.includes('.card-back-brand') && css.includes('.card-back-logo'), 'CSS must style the back card brand header'],
  [css.includes('.card-back-identity') && css.includes('.card-detail-grid'), 'CSS must style the new readable back card information layout'],
  [css.includes('.card-detail-grid.single'), 'CSS must let optional single detail rows use the full back-card width'],
  [css.includes('.business-card-loading'), 'CSS must style the lazy business-card loading state'],
  [
    hasAll(css, ['.business-card-back.screen', '--back-name-size: 66px', '--back-english-size: 28px', '--back-photo-min: 60px']),
    'screen back card must use compact sizing that fits smaller previews',
  ],
  [
    hasAll(css, [
      '.business-card-back.print',
      '--back-name-size: 34pt',
      '--back-english-size: 14.2pt',
      '--back-photo-col-min: 16mm',
      '--back-photo-min: 11mm',
    ]),
    'print back card must use compact sizing that fits 90mm by 50mm cards',
  ],
  [css.includes('.card-goal-band'), 'CSS must style the prominent back card goal band'],
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
