import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'DESIGN.md',
  'src/components/layout/TopBar.tsx',
  'src/lib/readableKoreanLines.ts',
  'src/pages/result/ResultPage.tsx',
  'src/pages/result/components/CareerDetailModal.tsx',
  'src/pages/result/components/CareerLibrary.tsx',
  'src/pages/result/components/CareerRecommendations.tsx',
  'src/pages/result/components/ResultHero.tsx',
  'src/pages/result/components/WhyPanel.tsx',
  'src/styles/base.css',
  'src/styles/business-card.css',
  'src/styles/career-sections.css',
  'src/styles/career-modal.css',
  'src/styles/pdf-report.css',
  'src/styles/question.css',
  'src/styles/result-hero.css',
];
const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`${file} is missing`);
  }
}

const readIfExists = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const getBlockAfter = (source, startIndex) => {
  const openIndex = source.indexOf('{', startIndex);
  if (openIndex === -1) return '';
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, index);
    }
  }
  return '';
};
const getRuleBlock = (source, selector) => (source.indexOf(selector) === -1 ? '' : getBlockAfter(source, source.indexOf(selector)));
const getMediaRuleBlock = (source, mediaQuery, selector) => {
  let searchIndex = 0;
  while (searchIndex < source.length) {
    const mediaIndex = source.indexOf(mediaQuery, searchIndex);
    if (mediaIndex === -1) return '';
    const ruleBlock = getRuleBlock(getBlockAfter(source, mediaIndex), selector);
    if (ruleBlock) return ruleBlock;
    searchIndex = mediaIndex + mediaQuery.length;
  }
  return '';
};
const designSystem = readIfExists('DESIGN.md');
const topBar = readIfExists('src/components/layout/TopBar.tsx');
const readableKoreanLines = readIfExists('src/lib/readableKoreanLines.ts');
const resultPage = readIfExists('src/pages/result/ResultPage.tsx');
const careerDetailModal = readIfExists('src/pages/result/components/CareerDetailModal.tsx');
const careerLibrary = readIfExists('src/pages/result/components/CareerLibrary.tsx');
const careerRecommendations = readIfExists('src/pages/result/components/CareerRecommendations.tsx');
const resultHero = readIfExists('src/pages/result/components/ResultHero.tsx');
const whyPanel = readIfExists('src/pages/result/components/WhyPanel.tsx');
const baseCss = readIfExists('src/styles/base.css');
const businessCardCss = readIfExists('src/styles/business-card.css');
const careerSectionsCss = readIfExists('src/styles/career-sections.css');
const careerModalCss = readIfExists('src/styles/career-modal.css');
const pdfReportCss = readIfExists('src/styles/pdf-report.css');
const questionCss = readIfExists('src/styles/question.css');
const resultHeroCss = readIfExists('src/styles/result-hero.css');

const sharedChipRule = resultHeroCss.match(
  /\.badge-row span,\s*\.strength-list span,\s*\.hint-list span,\s*\.career-chip\s*\{[^}]*\}/s,
)?.[0] ?? '';
const topCareerNameRule = resultHeroCss.match(/\.top-career-card strong\s*\{[^}]*\}/s)?.[0] ?? '';
const resultTitleRule = resultHeroCss.match(/\.result-title\s*\{[^}]*\}/s)?.[0] ?? '';
const resultTitlePrefixRule = resultHeroCss.match(/\.result-title-prefix\s*\{[^}]*\}/s)?.[0] ?? '';
const resultExportStatusRule =
  Array.from(resultHeroCss.matchAll(/^\.result-export-status\s*\{[^}]*\}/gm), (match) => match[0])[0] ?? '';
const resultSaveNoticeRule = careerSectionsCss.match(/\.result-save-notice\s*\{[^}]*\}/s)?.[0] ?? '';
const resultSaveNoticeButtonRule = careerSectionsCss.match(/\.result-save-notice button\s*\{[^}]*\}/s)?.[0] ?? '';
const tabletResultTitlePrefixRule = resultHeroCss.match(
  /@media \(min-width: 760px\) and \(max-width: 979px\)\s*\{[\s\S]*?\.result-title-prefix\s*\{[^}]*\}/s,
)?.[0] ?? '';
const modalDescRule = careerModalCss.match(/\.modal-desc\s*\{[^}]*\}/s)?.[0] ?? '';
const modalFitNoteTextRule = careerModalCss.match(/\.modal-fit-note p\s*\{[^}]*\}/s)?.[0] ?? '';
const modalTaskListRule = careerModalCss.match(/\.modal-task-list\s*\{[^}]*\}/s)?.[0] ?? '';
const modalFunfactRule = careerModalCss.match(/\.modal-funfact\s*\{[^}]*\}/s)?.[0] ?? '';
const mobileLibraryCategoryRule = getMediaRuleBlock(careerSectionsCss, '@media (max-width: 620px)', '.library-category-filter');
const primaryButtonRule = Array.from(questionCss.matchAll(/\.primary-button\s*\{[^}]*\}/g), (match) => match[0]).join('\n');
const librarySearchFocusRule = careerSectionsCss.match(/\.library-search:focus-within\s*\{[^}]*\}/s)?.[0] ?? '';
const libraryFilterButtonRule = careerSectionsCss.match(/\.library-filter-button\s*\{[^}]*\}/s)?.[0] ?? '';
const libraryFilterActiveRule = careerSectionsCss.match(/\.library-filter-button\.active\s*\{[^}]*\}/s)?.[0] ?? '';
const compactCareerChipRule = careerSectionsCss.match(/\.career-chip-grid\.compact \.career-chip\s*\{[^}]*\}/s)?.[0] ?? '';
const mobileLibraryToggleRule = careerSectionsCss.match(
  /@media \(max-width: 620px\)\s*\{[\s\S]*?\.library-toggle\s*\{[^}]*\}/s,
)?.[0] ?? '';
const mobileResultActionsRule = getMediaRuleBlock(careerSectionsCss, '@media (max-width: 620px)', '.result-actions');
const mobileResultActionButtonsRule = getMediaRuleBlock(careerSectionsCss, '@media (max-width: 620px)', '.result-actions .ghost-button');
const pdfReportRule = pdfReportCss.match(/\.pdf-report\s*\{[^}]*\}/s)?.[0] ?? '';

const requiredChecks = [
  [
    designSystem.includes('### Result Chips') && designSystem.includes('text should not split inside words'),
    'DESIGN.md must document result chip CJK wrapping rules',
  ],
  [
    designSystem.includes('### Result Hero Heading') &&
      designSystem.includes('가장 잘 맞는 직업은') &&
      designSystem.includes('not orphaned'),
    'DESIGN.md must document result hero heading CJK phrase rules',
  ],
  [
    designSystem.includes('### Result Export Feedback') &&
      designSystem.includes('Browser alert dialogs are not used'),
    'DESIGN.md must document inline result export feedback instead of browser alerts',
  ],
  [
    sharedChipRule.includes('word-break: keep-all') &&
      sharedChipRule.includes('overflow-wrap: normal') &&
      sharedChipRule.includes('text-wrap: pretty'),
    'result chip labels must preserve Korean words and wrap between chips',
  ],
  [
    topCareerNameRule.includes('word-break: keep-all') && topCareerNameRule.includes('overflow-wrap: break-word'),
    'top career names must avoid arbitrary Korean syllable splitting',
  ],
  [
    !topCareerNameRule.includes('overflow-wrap: anywhere'),
    'top career names must not use anywhere wrapping',
  ],
  [
    resultTitleRule.includes('display: inline-block') && resultTitleRule.includes('max-width: 100%'),
    'result title focus target must shrink to the text block instead of spanning the full hero column',
  ],
  [
    baseCss.includes('--duo-on-green: #172414') &&
      resultHeroCss.includes('.result-hero .section-kicker') &&
      resultHeroCss.includes('.result-hero .result-description') &&
      resultHeroCss.includes('color: var(--duo-on-green)') &&
      primaryButtonRule.includes('color: var(--duo-on-green)') &&
      !primaryButtonRule.includes('color: #ffffff'),
    'text on bright green result and primary surfaces must use the high-contrast on-green token',
  ],
  [
    resultTitlePrefixRule.includes('white-space: nowrap') && resultTitlePrefixRule.includes('word-break: keep-all'),
    'result title prefix must keep the Korean phrase together',
  ],
  [
    tabletResultTitlePrefixRule.includes('font-size: 38px'),
    'result title prefix must use tablet sizing that prevents orphaned Korean topic markers',
  ],
  [
    readableKoreanLines.includes('semanticLineGroups') &&
      readableKoreanLines.includes('탐색하는 중이에요') &&
      readableKoreanLines.includes('오래 머무는') &&
      resultHero.includes('getReadableKoreanLines(profile.summary)') &&
      whyPanel.includes('getReadableKoreanLines(`${profile.summary} ${profile.topCareer.reason}`)'),
    'result summary text must use semantic Korean line groups for mobile CJK wrapping',
  ],
  [
    designSystem.includes('### Career Detail Modal') && designSystem.includes('raw job-detail emoji stays metadata only'),
    'DESIGN.md must document that career detail modals render SVG category icons instead of raw emoji',
  ],
  [
    careerDetailModal.includes('careerCategories') &&
      careerDetailModal.includes('modal-career-symbol') &&
      careerDetailModal.includes('const CareerIcon = careerCategory?.icon ?? Sparkles') &&
      !careerDetailModal.includes('detail.emoji') &&
      !careerDetailModal.includes('modal-emoji'),
    'career detail modal must render a Lucide category icon instead of raw detail emoji',
  ],
  [
    careerModalCss.includes('.modal-career-symbol') &&
      careerModalCss.includes('place-items: center') &&
      !careerModalCss.includes('.modal-emoji'),
    'career modal CSS must style the SVG icon tile and remove the old emoji style',
  ],
  [
    [modalDescRule, modalFitNoteTextRule, modalTaskListRule, modalFunfactRule].every(
      (rule) =>
        rule.includes('word-break: keep-all') &&
        rule.includes('overflow-wrap: break-word') &&
        rule.includes('text-wrap: pretty'),
    ),
    'career modal sentence text must preserve Korean words while still allowing safe long-token wrapping',
  ],
  [
    careerLibrary.includes('role="group"') &&
      careerLibrary.includes('aria-controls={libraryGridId}') &&
      careerLibrary.includes('id={libraryGridId}') &&
      careerLibrary.includes('aria-label="직업 검색"') &&
      careerLibrary.includes('aria-pressed={activeCategoryTitle ==='),
    'career library controls must expose accessible search, grouped controls, selected category state, and controlled grid relationship',
  ],
  [
    topBar.includes('role="group"') && topBar.includes('aria-label="화면 선택"'),
    'top bar mode switch must expose a grouped control for screen selection',
  ],
  [
    resultPage.indexOf('<ResultActions') > resultPage.indexOf('<ResultHero') &&
      resultPage.indexOf('<ResultActions') < resultPage.indexOf('<CareerLibrary'),
    'result actions must appear immediately after the result hero and before the full career library in keyboard order',
  ],
  [
    resultPage.includes('windowWidth: pdfReportRef.current.scrollWidth') &&
      resultPage.includes('const imageData = canvas.toDataURL') &&
      resultPage.includes('pdf.internal.pageSize.getWidth()') &&
      resultPage.includes('pdf.internal.pageSize.getHeight()') &&
      resultPage.includes('const naturalImageHeight = (canvas.height * pageWidth) / canvas.width') &&
      resultPage.includes('const pageOverflowTolerance = 8') &&
      resultPage.includes('naturalImageHeight - pageHeight <= pageOverflowTolerance') &&
      resultPage.includes('let remainingHeight = imageHeight') &&
      resultPage.includes('while (remainingHeight > pageOverflowTolerance)') &&
      resultPage.includes('pdf.addPage()'),
    'result PDF export must paginate tall report captures without adding blank trailing pages for tiny overflow',
  ],
  [
    pdfReportRule.includes('min-height: 1123px') && !/;\s*height:\s*1123px/.test(pdfReportRule),
    'result PDF report must use minimum A4 height so longer dynamic content can expand before pagination',
  ],
  [
    pdfReportCss.includes('word-break: keep-all') &&
      pdfReportCss.includes('overflow-wrap: break-word') &&
      pdfReportCss.includes('text-wrap: pretty'),
    'result PDF report must use Korean-friendly wrapping so printable copy does not split awkwardly',
  ],
  [
    mobileResultActionsRule.includes('grid-template-columns: 1fr') &&
      mobileResultActionButtonsRule.includes('white-space: nowrap'),
    'mobile result actions must stack full-width so action labels do not wrap unevenly',
  ],
  [
    resultHero.includes('ref={titleRef}') &&
      resultHero.includes('tabIndex={-1}') &&
      resultHero.includes('focusRequest') &&
      resultHero.includes('focus({ preventScroll: true })'),
    'result hero heading must accept keyboard focus after quiz completion',
  ],
  [
    resultHeroCss.includes('.result-title:focus-visible') &&
      resultHeroCss.includes('.result-title:focus-visible .result-title-career') &&
      resultHeroCss.includes('text-decoration-thickness: 5px') &&
      resultHeroCss.includes('text-underline-offset: 8px'),
    'result title keyboard focus must use a branded underline instead of a debug-like outline box',
  ],
  [
    resultPage.includes('setExportErrorMessage') &&
      resultHero.includes('exportErrorMessage') &&
      resultHero.includes('role="status"') &&
      resultHero.includes('aria-live="polite"') &&
      resultHero.includes('aria-atomic="true"') &&
      !resultPage.includes('alert(') &&
      !resultHero.includes('alert('),
    'result export failures must render inline polite status instead of blocking browser alerts',
  ],
  [
    resultPage.includes('resultSaveErrorMessage') &&
      resultPage.includes('result-save-notice warning') &&
      resultPage.includes('role="status"') &&
      resultPage.includes('aria-live="polite"') &&
      resultPage.includes('onRetryResultSave') &&
      resultPage.includes('다시 시도') &&
      !resultPage.includes('결과를 안전하게 저장하는 중이에요') &&
      !resultPage.includes('결과가 저장됐어요'),
    'result save feedback must stay failure-only with a retry action and no saving/success copy',
  ],
  [
    resultSaveNoticeRule.includes('display: flex') &&
      resultSaveNoticeRule.includes('word-break: keep-all') &&
      resultSaveNoticeRule.includes('overflow-wrap: break-word') &&
      resultSaveNoticeButtonRule.includes('min-height: 40px'),
    'result save failure notice must be readable, stable, and include a usable retry button',
  ],
  [
    resultExportStatusRule.includes('min-height: 44px') &&
      resultExportStatusRule.includes('word-break: keep-all') &&
      resultExportStatusRule.includes('overflow-wrap: break-word'),
    'result export feedback must be readable, stable, and Korean-friendly',
  ],
  [
    resultHero.includes('aria-label={hasTopCareerDetail ? `대표 추천 ${profile.topCareer.name} 자세히 보기` : undefined}') &&
      careerRecommendations.includes('aria-label={hasDetail ? `${career.name} 자세히 보기` : undefined}'),
    'career detail buttons must expose concise aria-labels instead of long full-card names',
  ],
  [
    mobileLibraryCategoryRule.includes('flex-wrap: wrap') &&
      mobileLibraryCategoryRule.includes('overflow-x: visible') &&
      !mobileLibraryCategoryRule.includes('nowrap') &&
      !mobileLibraryCategoryRule.includes('overflow-x: auto'),
    'mobile career category filters must wrap instead of hiding choices behind horizontal scrolling',
  ],
  [
    librarySearchFocusRule.includes('border-color: var(--duo-blue)') &&
      librarySearchFocusRule.includes('0 0 0 4px') &&
      libraryFilterButtonRule.includes('min-height: 44px') &&
      compactCareerChipRule.includes('min-height: 44px') &&
      mobileLibraryToggleRule.includes('min-height: 44px') &&
      libraryFilterActiveRule.includes('color: var(--duo-on-green)'),
    'career library search and pill controls must keep visible focus and comfortable touch targets',
  ],
  [
    careerSectionsCss.includes('.library-toggle:focus-visible') &&
      careerSectionsCss.includes('.library-filter-button:focus-visible') &&
      careerSectionsCss.includes('.share-button:focus-visible') &&
      businessCardCss.includes('.mode-button:focus-visible'),
    'custom result/topbar controls must have explicit focus-visible states',
  ],
];

for (const [passes, message] of requiredChecks) {
  if (!passes) {
    failures.push(message);
  }
}

if (failures.length > 0) {
  console.error('Result UI verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Result UI verification passed.');
