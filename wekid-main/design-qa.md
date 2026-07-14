# Business card design QA

- Source visual truth: `C:\Users\kiminkyu\Desktop\ChatGPT Image 2026년 7월 14일 오후 12_29_18.png`
- Implementation: browser-rendered local business-card preview at `http://localhost:5173` (admin-gated UI; local preview used only for QA)
- Viewport: 1265 × 712 desktop
- State: 경찰관 selected; default and long-name editing states checked. 소방관 background switching also checked.

## Comparison history

1. The first rendered version used a shared partnership image, so the career-specific illustration did not match the reference. Fixed by connecting each of the five selected jobs to its own raster background.
2. The reference had no editable front name. Added a fixed-coordinate Korean and English name layer, with reduced type scales for long names.
3. A full-width blue brand crop looked correct over the police background but produced a visible blue rectangle over the red firefighter background. The final implementation uses the exact reference brand lockup for police and the transparent Wekid mark on the other colored job backgrounds.

## Findings

No actionable P0, P1, or P2 differences remain for the requested editable card flow.

- Fonts and typography: the editable Korean name uses heavy white display type with a dark shadow, and English name uses spaced uppercase type. Long Korean and English values reduce in scale before truncation.
- Spacing and layout rhythm: card ratio follows the 1672 × 929 source backgrounds. Name, English name, and brand coordinates were checked against the supplied police-card composition.
- Colors and visual tokens: all career backgrounds remain raster artwork; editable copy uses white and a navy shadow for contrast. The police reference lockup preserves its exact blue field while other colored backgrounds use the transparent logo to avoid a visible color block.
- Image quality and asset fidelity: police, firefighter, soccer, director, and teacher use their corresponding high-resolution assets. The reference brand lockup is derived from the supplied image and used only where its blue field matches.
- Copy and content: editing the Korean name and English name updates both front and back previews immediately; job selection switches the front art and back job label.

## Primary interactions checked

- Edited name and English name in the input form; both updated the front and back cards.
- Selected firefighter after editing; correct red firefighter artwork and job label appeared.
- Entered a long Korean name and long English name; both stayed within the front-card safe area.

## Follow-up polish

- [P3] The supplied police illustration has a dashed inner job-badge outline, whereas the reference image shows a plain yellow badge. This is part of the supplied raster background and does not affect editing or print placement.

final result: passed
