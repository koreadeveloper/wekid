import { existsSync, readFileSync } from 'node:fs';

const failures = [];

const readIfExists = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const designSystem = readIfExists('DESIGN.md');
const indexCss = readIfExists('src/index.css');
const pickerCss = readIfExists('src/styles/business-card-job-picker.css');
const symbolCss = readIfExists('src/styles/business-card-symbols.css');
const jobThemeIcon = readIfExists('src/pages/business-card/JobThemeIcon.tsx');
const jobPicker = readIfExists('src/pages/business-card/JobThemePicker.tsx');
const preview = readIfExists('src/pages/business-card/BusinessCardPreview.tsx');

if (!existsSync('src/styles/business-card-job-picker.css')) {
  failures.push('job picker responsive CSS file is missing');
}

if (!existsSync('src/styles/business-card-symbols.css')) {
  failures.push('business-card-symbols.css is missing');
}

if (!existsSync('src/pages/business-card/JobThemeIcon.tsx')) {
  failures.push('JobThemeIcon component is missing');
}

const hasAll = (text, fragments) => fragments.every((fragment) => text.includes(fragment));
const baseListRule = pickerCss.match(/\.job-theme-list\s*\{[^}]*\}/s)?.[0] ?? '';
const textRule = pickerCss.match(/\.job-theme-button strong,\s*\.job-theme-button small\s*\{[^}]*\}/s)?.[0] ?? '';
const wideListRule =
  pickerCss.match(/@media \(min-width: 520px\)\s*\{[\s\S]*?\.job-theme-list\s*\{[^}]*\}/s)?.[0] ?? '';

const requiredChecks = [
  [
    hasAll(indexCss, ["@import './styles/business-card-job-picker.css';", "@import './styles/business-card-symbols.css';"]),
    'index.css must import job picker and symbol styles after the base business-card styles',
  ],
  [
    hasAll(designSystem, ['### Job Picker', 'mobile uses one column', 'do not use ellipsis', 'Lucide SVG icons']),
    'DESIGN.md must document the mobile one-column, no-ellipsis job picker contract',
  ],
  [
    hasAll(baseListRule, ['grid-template-columns: minmax(0, 1fr)', 'max-height: 368px']),
    'job picker must default to a single readable column on narrow screens',
  ],
  [
    hasAll(wideListRule, ['grid-template-columns: repeat(2, minmax(0, 1fr))', 'max-height: 326px']),
    'job picker must restore two columns only once there is enough width',
  ],
  [
    hasAll(textRule, ['overflow: visible', 'text-overflow: clip', 'white-space: normal', 'word-break: keep-all']),
    'job picker visible job text must wrap naturally instead of using ellipsis',
  ],
  [
    hasAll(jobThemeIcon, ['Palette', 'BriefcaseBusiness', 'Laptop', 'GraduationCap', 'HeartPulse', 'Microscope']) &&
      hasAll(symbolCss, ['.job-theme-symbol', '.card-job-symbol']) &&
      hasAll(jobPicker, ['JobThemeIcon', 'category={theme.category}']) &&
      hasAll(preview, ['JobThemeIcon', 'card-job-symbol', 'category={theme.category}']) &&
      !jobPicker.includes('{theme.emoji}') &&
      !preview.includes('{theme.emoji}'),
    'business card UI must use Lucide job symbols instead of visible raw emoji icons',
  ],
];

for (const [passes, message] of requiredChecks) {
  if (!passes) {
    failures.push(message);
  }
}

if (failures.length > 0) {
  console.error('Job picker layout verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Job picker layout verification passed.');
