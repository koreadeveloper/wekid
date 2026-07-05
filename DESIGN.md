# Wekid Design System

## 1. Atmosphere & Identity

Wekid feels playful, bright, and classroom-friendly. The signature is a soft 3D learning-tool style: rounded forms, candy-like green accents, clear Korean typography, and tactile button depth that feels approachable for children.

## 2. Color

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Surface/page | --page | #f7f7f7 | App background |
| Surface/canvas | --canvas | #ffffff | Cards, controls, logo mark |
| Text/primary | --ink | #3c3c3c | Main headings and labels |
| Text/muted | --muted | #777777 | Secondary copy |
| Border/default | --line | #e5e5e5 | Dividers, control borders |
| Accent/green | --duo-green | #58cc02 | Primary actions and brand accents |
| Accent/green-dark | --duo-green-dark | #46a302 | Pressed shadows and strong green text |
| Text/on-green | --duo-on-green | #172414 | Text placed directly on bright green surfaces |
| Accent/blue | --duo-blue | #1cb0f6 | Informational accents |
| Accent/yellow | --duo-yellow | #ffc800 | Highlight accents |
| Status/error | --duo-red | #ff4b4b | Error and warning accents |

## 3. Typography

Primary font stack: Pretendard, Noto Sans KR, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif.

| Level | Size | Weight | Line height | Usage |
| --- | --- | --- | --- | --- |
| Page title | 40px responsive clamp | 1000 | 1.05 | Main section titles |
| Section title | 24px | 1000 | 1.1 | Panel headers |
| Brand title | 17px | 900 | 1.12 | Top bar brand text |
| Body | 16px | 800 | 1.45 | Form fields and readable UI text |
| Caption | 12px | 800-900 | 1.2 | Supporting labels and badges |

## 4. Spacing & Layout

Base unit is 4px. Existing spacing uses compact 8px, 10px, 12px, 14px, 16px, 20px, and 24px steps for dense kid-friendly controls. The mobile shell is centered at 520px, while the business-card maker expands to a desktop two-panel workspace.

## 5. Components

### Product Copy Tone

- Voice: child-friendly first, center-staff clear second. Prefer concrete action language over technical labels.
- Avoid exposing implementation terms in visible UI, including Firebase, Firestore, environment variables, owner permissions, document IDs, and URL mechanics unless the user is in a support/debug context.
- Privacy-sensitive copy, especially whether answers/results are stored or visible to centers, requires owner approval before changing the meaning.
- Interaction hints should work across mouse, touch, and keyboard; prefer `눌러서` over device-specific wording such as `탭해서`.

### Brand Mark

- Structure: fixed square mark beside the app title.
- Variants: Site Logo.
- Spacing: 46px square on desktop, 38px square on narrow mobile.
- States: static brand element only; no hover or active state.
- Accessibility: brand text sits next to the image, so the image can be decorative.
- Motion: none.

### Site Logo

- Structure: image inside Brand Mark using `img.brand-logo`.
- Fit: fill the mark box and keep `object-position: center`.
- Surface: white canvas with soft green depth to stay aligned with Wekid's tactile button language.

### Icon Button

- Structure: square icon-only button.
- States: default, hover, active, focus-visible.
- Motion: active state translates down to match the shadow depth.
- Scope: global reset is career-test specific; it should not appear on modes where it does not reset the current surface.

### Upload Button

- Structure: full-width label wrapping a visually hidden file input.
- States: default, hover, focus-within, active.
- Accessibility: keyboard focus on the hidden input must create a visible ring on the label.
- Motion: hover/active use transform-only tactile movement and preserve the blue depth shadow.

### Business Card Photo Controls

- Structure: photo upload and photo removal actions live as one form-row control group.
- Behavior: `사진 빼기` appears only after a photo is attached, revokes the temporary object URL, and returns every card preview to the placeholder portrait.
- Accessibility: both actions are keyboard reachable, keep visible focus states, and maintain at least a 44px target height.
- Visual: upload keeps the blue tactile style; removal uses a restrained red-tinted secondary style so it reads as reversible cleanup rather than a destructive form reset.

### Segmented Switch

- Structure: two equal buttons inside a rounded track.
- States: default, selected, focus-visible, active.
- Accessibility: the switch container exposes a named `group`, and selected buttons expose `aria-pressed` so screen readers hear both the setting context and the current side.
- Touch: mobile segmented buttons and reset icon buttons keep at least a 44px hit target.
- Contrast: selected green segments use `--duo-on-green` text.
- Motion: selected/active states keep the green tactile depth shadow.

### Business Card Print Controls

- Structure: side switch, selected-side count pill, short duplex guide, and print button live as one named print settings group.
- Copy: the count pill names the selected side directly, using `앞면만 10개 인쇄` or `뒷면만 10개 인쇄` instead of a generic A4 quantity.
- Accessibility: the print button describes itself with the duplex guide, and business-card mode changes move focus to the page title so keyboard and screen-reader users get the new context.
- Layout: the guide wraps with Korean-friendly line breaks and spans the full row on wider controls so it does not crowd the side switch or print button.

### Job Picker

- Structure: searchable list of job options inside the business-card form.
- Layout: mobile uses one column so the job name and hint remain readable; wider form panels may use two columns.
- Typography: job names and hints wrap naturally with `keep-all`; do not use ellipsis for the visible picker text.
- Iconography: visible picker and card-detail symbols use Lucide SVG icons mapped from job category; raw job-data emoji stays metadata only.
- States: default, selected, focus-visible, active, empty.
- Accessibility: the list uses a `radiogroup` pattern, each job exposes `role="radio"` and `aria-checked`, and keyboard entry lands on one active option instead of forcing users through all 178 jobs.
- Keyboard: Arrow keys move focus and selection within the filtered list; Home and End jump to the first and last visible job; Tab exits the picker normally.
- Motion: focus and selected states use the existing tactile green/blue depth language without resizing the option.

### Quiz Answer Group

- Structure: two large answer buttons inside a labelled `group`.
- States: default, selected, disabled while advancing, focus-visible.
- Accessibility: each answer remains a button and exposes `aria-pressed` only for the already selected answer, because choosing an answer immediately advances the quiz.
- Keyboard: Arrow keys move between answers without changing the saved answer; Home and End move to the first and last answer; Enter or Space chooses the focused answer, advances, and moves focus to the next answer group or result heading.
- Pointer: click/tap chooses an answer without forcing focus to jump, so touch users are not pulled into keyboard focus rings.
- Visual state: neutral status squares mean unselected; green status squares are reserved for selected answers.

### Quiz Layout

- Structure: the active question panel appears before the intro/progress panel in DOM and visual order on mobile, tablet, and desktop.
- Desktop: keep the question panel in the wider leading column and the intro/progress panel in the narrower trailing column so keyboard, screen-reader, and left-to-right visual flow agree.
- Accessibility: do not use CSS `order` to move the intro panel ahead of the active question panel.

### Quiz Progress

- Structure: numeric count, percent label, and horizontal progressbar.
- Accessibility: progress exposes `role="progressbar"`, percentage value, and a text value with answered count.
- Motion: progress width transitions should collapse under `prefers-reduced-motion: reduce`.

### Result Chips

- Structure: compact rounded labels used for result tags, strengths, hints, and career-map chips.
- States: default, highlighted, matched, focus-visible when interactive.
- Typography: keep Korean words and short semantic phrases intact; chips may wrap as separate units, but text should not split inside words such as `만들기`.
- Layout: chip rows wrap between chips and preserve the tactile pill shape without resizing neighboring panels.
- Touch: interactive career-map chips and filters must keep at least a 44px target height.

### Career Library

- Structure: searchable career map with wrapped category filters and career chips.
- Accessibility: the search field must expose a visible focus-within ring because the native input outline is removed.
- Touch: category filters, compact career chips, and the library toggle remain at least 44px tall on mobile and desktop.
- Contrast: active green filters and matched career chips use `--duo-on-green` text on the bright green fill.

### Result Hero Heading

- Structure: two-line result title with the prefix and recommended career rendered as separate spans.
- Typography: keep the prefix phrase `가장 잘 맞는 직업은` on one line so `직업은` is not orphaned from the career name on tablet layouts.
- Responsive: tablet widths may slightly reduce the prefix size instead of splitting the phrase.
- Contrast: title, kicker, subtitle, description, and primary result controls use `--duo-on-green` when sitting directly on the bright green hero surface.
- Copy wrapping: known result-summary sentences may be split into semantic Korean line groups without changing the visible wording.
- Accessibility: after keyboard quiz completion, focus lands on the programmatically focusable result title so screen-reader and keyboard users arrive at the new page context; the visible focus state uses a branded underline on the career line rather than a large outline box.

### Result Actions

- Structure: two tactile controls for editing the final answer and restarting the test.
- Layout: actions sit directly after the result hero in DOM order so keyboard users reach them before large recommendation and career-map surfaces.
- States: default, hover, active, focus-visible, confirm dialog for restarting.
- Accessibility: restart opens the shared reset confirmation dialog; editing the final answer moves focus back to the selected answer group.

### Result To Business Card CTA

- Structure: tactile action button in the result hero share row, pairing a Lucide card icon with the dream-card action.
- Behavior: transfers the result owner name, center name, and recommended career into the business-card maker so users do not re-enter the same information.
- States: default, hover, active, focus-visible, disabled while export actions are running.
- Visual: use the existing yellow accent and tactile depth so this action reads as the next creative step, not as another file export.

### Result Export Feedback

- Structure: a compact inline status message below the result hero share actions.
- Behavior: visible only when image or PDF export fails; successful saves stay quiet.
- Accessibility: expose polite live status text so assistive technology receives the failure without blocking the page.
- Visual: use the red status token on a white/pink surface, with Korean-friendly wrapping and a stable minimum touch-sized height.
- Constraint: Browser alert dialogs are not used for result export feedback.

### Result PDF Report

- Structure: hidden A4-width report capture used only for the downloadable result PDF.
- Layout: report uses a minimum A4 height instead of a fixed height, so dynamic names, summaries, and recommendations can expand naturally.
- Copy wrapping: report text uses Korean-friendly wrapping (`word-break: keep-all` with safe overflow wrapping) to avoid splitting common particles and endings in printable copy.
- Export: PDF generation paginates tall captures across additional A4 pages, but small browser-rendering overflow is fitted to one A4 page so mostly blank trailing pages are not added.
- Print fidelity: capture waits for fonts and uses a white background so the saved PDF matches the rendered report surface.

### Business Card Detail Grid

- Structure: compact labeled rows on the card back.
- Form layout: the goal field spans the full form width on multi-column layouts so the sentence remains readable while editing.
- Privacy: contact information is optional and should be blank by default. If the contact field is empty, the printed/back preview omits that row instead of showing placeholder personal data.
- Copy: contact input labels identify the field as guardian/contact information so children are not nudged to enter their own phone number.
- Copy: use child-facing form labels such as `학교 또는 센터` and `하고 싶은 직업 찾기` instead of staff/tool labels.

### Business Card Front Identity

- Structure: job name appears in a clean solid lower-left capsule that covers any baked template guide lines, with no dashed, dotted, or outer-ring decoration around the text.
- Typography: Korean and English names are oversized dominant elements on the front preview and remain prominent on the back preview. Long names scale through `compact`, `dense`, and `ultra` states; Korean names should avoid one-character orphan lines.
- Responsive: front-card name, English name, and job badge type use card-width-relative sizing so 320px mobile previews do not clip or collide.
- Print: name hierarchy must remain larger than supporting details in A4 output, and printing waits for card fonts and image backgrounds to decode before opening the print dialog.

### Mobile Business Card Live Preview

- Structure: visual-only sticky preview inside the mobile form, showing one centered front card so small screens do not crop a second card.
- Scope: mobile and tablet widths below the two-panel editor breakpoint; desktop keeps the full preview panel as the single editing preview.
- Accessibility: duplicate visual previews are hidden from assistive technology because the full preview panel remains the semantic preview.
- Motion: none; keep the preview stable while users edit the form.

### Business Card Loading State

- Structure: centered route-level loading surface used while the heavy business-card maker bundle loads.
- Copy: short and task-specific, so children and staff understand that only the maker screen is preparing.
- Motion: none; keep the fallback stable and quick because it appears during lazy loading only.

### Job Card Background Assets

- Source: keep full-size PNG job backgrounds as editable source resources.
- Runtime: render optimized WebP derivatives from `wekid-job-backgrounds-clean-178/webp` so the business-card maker does not ship 300MB+ of PNG assets.
- Print: WebP derivatives should stay near 1200px wide to preserve A4 card print clarity while keeping mobile downloads small.

### Career Detail Modal

- Structure: fixed overlay with a scrollable dialog, using the existing modal classes so mobile opens as a bottom sheet and desktop centers the card.
- Iconography: render the career category as a Lucide SVG icon tile; raw job-detail emoji stays metadata only and must not appear in the visible modal UI.
- Typography: sentence-style Korean content uses `keep-all` wrapping so words such as `세워요` do not split across lines; long tokens may still break safely.
- States: open, close, backdrop close, focus-visible close button.
- Accessibility: initial focus lands on close, Tab and Shift+Tab stay inside the dialog, Escape closes, background siblings are inert and hidden from assistive technology while open, and focus returns to the opener on close.
- Motion: keep the current short fade and slide motion only; the dialog must remain stable at narrow heights.

### Reset Confirmation Dialog

- Structure: portal-rendered modal opened from reset/retest actions before clearing quiz progress or result state.
- States: open, cancel, confirm, backdrop close, Escape close, focus-visible controls.
- Accessibility: expose `role="alertdialog"`, label the title and description, focus the non-destructive cancel action first, trap Tab and Shift+Tab, make background siblings inert while open, and restore focus to the opener on close.
- Visual: use the same white surface, thick border, tactile shadow, and green icon language as the app shell; destructive confirmation uses the red status token.
- Copy: short and concrete, explaining that selected answers and result screens will be cleared without exposing implementation details.

### Admin Dashboard

- Copy: staff-facing but non-technical. Use `관리자 연결 설정`, `관리 권한`, and `점검용 결과` instead of implementation or accusatory labels.
- PDF export: use the same small-overflow tolerance as the student result PDF so one-page reports do not create mostly blank trailing pages.
- CJK wrapping: detail summaries, answers, helper text, and report rows use Korean-friendly wrapping with safe long-token overflow.
- Contrast: green stat cards, active center chips, and strong center labels use `--duo-on-green` text on bright green.
- Touch and semantics: center filter chips, search clear, and rank filter buttons keep at least a 44px target, expose selected state with `aria-pressed`, and announce filtered result counts politely.
- Implementation details: document IDs stay out of default admin copy and detail modals.

## 6. Motion & Interaction

Motion is short and tactile. Button and card interactions use 120-150ms transitions, transform-only movement, and pressed-depth feedback.

## 7. Depth & Surface

Depth strategy is mixed: soft borders plus playful 3D shadows. Primary green controls use green pressed shadows, white surfaces use grey shadows, and brand surfaces may use subtle green-tinted depth.
