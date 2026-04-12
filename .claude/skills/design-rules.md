# Web Platform Design Rules

Adapted from platform-design-skills (ehmo), Apple HIG, Material Design 3, and WCAG 2.2.
Scoped to web applications. Every rule has a severity and is machine-checkable or agent-verifiable.

## Layout [CRITICAL]

L1: Use a consistent max-width container (max-w-5xl to max-w-7xl). Pages without width constraint feel unfinished on large monitors.
L2: Horizontal padding scales with viewport: px-4 (mobile) → px-6 (tablet) → px-8 (desktop).
L3: Content sections use consistent vertical spacing from the spacing scale. Mixed section gaps are the most common layout failure.
L4: Sidebar navigation uses fixed width (240-280px) on desktop, collapses to drawer on mobile (<1024px).
L5: Multi-column layouts stack to single column below 640px. No horizontal scrolling on the page body.
L6: Sticky headers must not exceed 64px height. Tall sticky headers waste viewport on mobile.
L7: Footer is pushed to bottom of viewport on short pages (min-h-screen on main container or flex layout).

## Typography [HIGH]

T1: Use a type scale with defined ratios. Recommended: 12/14/16/18/20/24/30/36/48.
T2: Body text: 16px minimum, line-height 1.5-1.7. Smaller body text fails readability on mobile.
T3: Heading hierarchy is visually obvious. Each heading level must be distinguishable by size AND weight.
T4: Maximum line length: 65-75 characters (max-w-prose or ~680px). Longer lines degrade readability.
T5: Use font-display: swap for web fonts. Invisible text during font load is unacceptable.
T6: No more than 2 font families in one app. Exception: monospace for code.
T7: Font weight range: 400 (regular), 500 (medium), 600 (semibold), 700 (bold). Avoid 100-300 for body text.
T8: Letter-spacing: -0.01em to -0.02em for headings ≥24px. Default for body. Never positive letter-spacing on body text.

## Color [CRITICAL]

C1: All colors defined as semantic tokens: background, foreground, accent, success, warning, danger, border, muted.
C2: Each semantic color has DEFAULT + hover + muted variants minimum.
C3: Background/foreground pairs must meet WCAG AA contrast (4.5:1 normal text, 3:1 large text).
C4: Never use pure black (#000000) on pure white (#ffffff). Use near-black (e.g., #0a0a0b) and near-white (e.g., #fafafa).
C5: Accent color must work as both text-on-background AND background-with-white-text.
C6: Status colors (success/warning/danger) must be distinguishable by colorblind users (use accompanying icons/text).
C7: Dark mode: backgrounds use deep grays (#0a-#1a range), not pure black. Foreground uses off-white (#e0-#f0), not pure white.
C8: Maximum 6-8 base colors. More indicates design system failure.

## Spacing [HIGH]

S1: Use an 8px base grid. All spacing values are multiples: 4/8/12/16/20/24/32/40/48/64.
S2: Internal padding (within components): 8-16px typical. External margin (between components): 16-32px typical.
S3: Consistent gap within component groups. Cards in a grid use the same gap everywhere.
S4: Section spacing is larger than component spacing. Minimum 2x the component gap.
S5: No arbitrary spacing values (Tailwind: avoid p-[13px], m-[7px], gap-[22px]).

## Components [HIGH]

CP1: Buttons: minimum height 36px (compact) or 40px (default). Horizontal padding ≥16px.
CP2: Buttons: maximum 3 visual variants (primary, secondary, ghost/destructive). More causes choice paralysis.
CP3: Inputs: minimum height 40px. Clear label above or floating within. Placeholder is NOT a label.
CP4: Cards: consistent border-radius (8-16px), consistent padding (16-24px), consistent shadow depth.
CP5: Badges/chips: rounded-full or rounded-md. Consistent sizing. Never more than 5 color variants.
CP6: Tables: sticky header row, horizontal scroll on mobile, alternating row colors OR clear dividers.
CP7: Modals: max-width 640px, centered, overlay backdrop, close via Escape key, focus trapped within.
CP8: Toasts/notifications: consistent position (top-right or bottom-right), auto-dismiss after 5s, manual dismiss via X.
CP9: Empty states: illustration or icon + message + action CTA. Never just blank space.
CP10: Loading states: skeleton matching content layout shape. Never generic spinner for page-level loads.

## Responsive [CRITICAL]

R1: Three breakpoints minimum: mobile (375px), tablet (768px), desktop (1440px).
R2: Touch targets: minimum 44×44px on mobile. This includes buttons, links, icons, and form elements.
R3: Navigation adapts: bottom nav or hamburger on mobile, sidebar or top nav on desktop.
R4: Images are responsive (max-w-full) with explicit aspect ratio to prevent CLS.
R5: Tables become horizontally scrollable or transform to card layout on mobile.
R6: Font sizes may reduce on mobile but never below 14px for body text.

## Forms [HIGH]

F1: Labels are always visible (above or floating). Never rely solely on placeholder text.
F2: Error messages appear inline below the field, not in an alert at the top.
F3: Required fields are marked (asterisk or "required" text). Never assume all fields are required.
F4: Submit buttons are disabled during submission with loading indicator.
F5: Success feedback is clear and visible after form submission.
F6: Tab order follows visual layout. No jumping between form sections.

## Quality bar

Any UI work is complete when zero CRITICAL rules are violated and zero HIGH rules are violated on primary routes.
