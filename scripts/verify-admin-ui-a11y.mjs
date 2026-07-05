import { existsSync, readFileSync } from 'node:fs';

const failures = [];

const readIfExists = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const adminPage = readIfExists('src/pages/admin/AdminPage.tsx');
const adminCss = readIfExists('src/styles/admin.css');
const modalFocusTrap = readIfExists('src/lib/useModalFocusTrap.ts');

const hasAll = (text, fragments) => fragments.every((fragment) => text.includes(fragment));

const checks = [
  [
    modalFocusTrap &&
      hasAll(modalFocusTrap, [
        'child.inert = true',
        "child.setAttribute('aria-hidden', 'true')",
        "event.key === 'Escape'",
        "event.key !== 'Tab'",
        "document.body.style.overflow = 'hidden'",
        'while (currentElement.parentElement)',
        'restoreFocusElement.focus',
      ]),
    'modal focus trap must lock background, trap Tab, close on Escape, lock body scroll, and restore focus',
  ],
  [
    hasAll(adminPage, [
      "import { useModalFocusTrap } from '../../lib/useModalFocusTrap'",
      'const modalOverlayRef = useRef<HTMLDivElement | null>(null)',
      'const modalDialogRef = useRef<HTMLElement | null>(null)',
      'const closeButtonRef = useRef<HTMLButtonElement | null>(null)',
      'useModalFocusTrap({',
      'ref={modalOverlayRef}',
      'ref={modalDialogRef}',
      'tabIndex={-1}',
      'ref={closeButtonRef}',
    ]),
    'admin result detail dialog must use the shared focus-trap hook with overlay, dialog, and close refs',
  ],
  [
    !adminPage.includes("window.addEventListener('keydown', handleKeyDown)") &&
      !adminPage.includes("window.removeEventListener('keydown', handleKeyDown)"),
    'admin result detail dialog must not keep the old Escape-only window key handler',
  ],
  [
    hasAll(adminPage, [
      'className="admin-detail-button admin-mobile-detail-button"',
      "aria-label={`${result.participantName ?? '이름 없는 검사'} 결과 보기`}",
      '<th scope="col">저장일</th>',
      'data-label="저장일"',
      'data-label="대표 직업"',
      'data-label="요약"',
    ]),
    'mobile admin table rows must expose scoped headers, cell labels, and a visible detail action inside the primary result cell',
  ],
  [
    hasAll(adminPage, [
      'aria-pressed={!centerFilter}',
      'aria-pressed={centerFilter === center.centerKey}',
      'role="status" aria-live="polite"',
    ]),
    'admin center filters and filtered result count must expose selected state and polite status updates',
  ],
  [
    hasAll(adminPage, ['role="status"', 'role="alert"', 'admin-copy-status" role="status"', 'admin-copy-status warning" role="alert"']),
    'admin loading, error, and copy feedback messages must expose status or alert roles',
  ],
  [
    !adminPage.includes('문서 ID') && !adminPage.includes('placeholder="이름, 센터, 직업, 요약, 문서 ID"'),
    'admin default copy and detail modal must not expose document IDs',
  ],
  [
    hasAll(adminCss, [
      '.admin-stat-card',
      'color: var(--duo-on-green)',
      '.admin-center-chips button.active',
      '.admin-chip-row span.strong',
    ]),
    'admin green stat and filter surfaces must use high-contrast on-green text',
  ],
  [
    hasAll(adminCss, [
      '.admin-text-button',
      'min-height: 44px',
      '.admin-rank-list div,\n.admin-rank-list button',
      '.admin-center-chips button,\n.admin-chip-row span',
      '.admin-search-box button',
      'width: 44px',
      'height: 44px',
    ]),
    'admin buttons and filter chips must keep touch targets at least 44px',
  ],
  [
    hasAll(adminCss, ['.admin-mobile-detail-button', 'display: none', '@media (max-width: 620px)', 'display: inline-flex']),
    'mobile detail action must be hidden on wide tables and visible at the mobile breakpoint',
  ],
  [
    hasAll(adminCss, [
      '.admin-table-wrap table,\n  .admin-table-wrap tbody,\n  .admin-table-wrap tr,\n  .admin-table-wrap td',
      'display: block',
      '.admin-table-wrap table',
      'min-width: 0',
      '.admin-table-wrap td::before',
      'content: attr(data-label)',
      '.admin-table-wrap thead',
      'clip-path: inset(50%)',
    ]),
    'mobile admin results table must turn into labeled cards instead of requiring horizontal scrolling',
  ],
  [
    hasAll(adminCss, ['.admin-table-wrap td:last-child .admin-detail-button', 'display: none']),
    'mobile admin rows must hide the duplicate table detail button so keyboard users reach only one visible row action',
  ],
  [
    hasAll(adminCss, ['.admin-heading h1', 'text-wrap: balance', 'word-break: keep-all']),
    'admin headings must keep Korean terms such as 대시보드 from splitting awkwardly',
  ],
  [
    hasAll(adminCss, [
      '.admin-report-filter-summary span',
      'overflow-wrap: anywhere',
      '.admin-report-row',
      'grid-template-columns: minmax(0, 1fr) auto',
      '.admin-report-page table',
      'table-layout: fixed',
    ]),
    'admin PDF report must wrap long filters, center names, and table text instead of overflowing',
  ],
  [
    hasAll(adminPage, [
      'const pageOverflowTolerance = 8',
      'naturalImageHeight > pageHeight && naturalImageHeight - pageHeight <= pageOverflowTolerance',
      'while (remainingHeight > pageOverflowTolerance)',
    ]),
    'admin PDF export must avoid adding a mostly blank trailing page for tiny capture overflow',
  ],
  [
    hasAll(adminCss, [
      '.admin-modal-heading p',
      '.admin-answer-list small',
      '.admin-answer-list strong',
      '.admin-answer-list p',
      'text-wrap: pretty',
      'word-break: keep-all',
      'overflow-wrap: break-word',
    ]),
    'admin detail dialog text must use Korean-friendly wrapping without clipping long values',
  ],
];

for (const [passes, message] of checks) {
  if (!passes) {
    failures.push(message);
  }
}

if (failures.length > 0) {
  console.error('Admin UI accessibility verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Admin UI accessibility verification passed.');
