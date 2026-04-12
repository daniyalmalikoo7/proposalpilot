# UI/UX Standard — Netflix/Apple/Uber Benchmark

This standard applies to every user-facing surface. No exceptions.
Agents in Phase 0 AUDIT against these checks. Agents in Phase 2 BUILD to meet them.
Agents in Phase 3 VALIDATE that they are met.

## The 7 principles — with measurable checks

### 01 — Nothing is outdated
Every component feels contemporary and intentional (2025-2026 standards).

Measurable checks:
- Border-radius on cards/containers: ≥8px (12-16px preferred). 0px or 2px → CRITICAL
- Box-shadow: soft, diffused shadows (spread ≥4px, opacity <30%). Hard-edge shadows → HIGH
- Font stack: variable font or modern system stack (Inter, SF Pro, Geist). Arial/Helvetica alone → MEDIUM
- Component patterns: no Bootstrap 3/4 grid artifacts, no Material Design v1 flat patterns, no pre-2022 card layouts → HIGH
- Icons: consistent icon set (Lucide, Heroicons). Mixed icon sources → MEDIUM

### 02 — Motion is communication
Animations convey state changes, not decoration.

Measurable checks:
- CSS transitions/animations defined in stylesheets: 0 found → CRITICAL
- Loading states: static "Loading..." text with no animation → HIGH
- State changes (button click, tab switch, modal open): no visual feedback → HIGH
- Transition durations: <100ms (too fast to perceive) or >500ms (feels sluggish) → MEDIUM
- Easing: linear easing on UI interactions → MEDIUM (should be ease-out or spring)
- GPU-accelerated properties only: animating width/height/top/left → HIGH

### 03 — Perfection in the details
Spacing, typography, contrast, and alignment are exact.

Measurable checks:
- Spacing values: >3 unique values NOT on a 4px/8px grid → HIGH
- Typography: >4 unique font sizes not on a defined scale → HIGH
- Inconsistent padding within same component type (e.g., cards with 16px and 20px padding) → CRITICAL
- Arbitrary Tailwind values (p-[13px], m-[7px]) → MEDIUM per occurrence
- Text alignment: mixed left/center alignment within same content type → MEDIUM

### 04 — Zero clutter
If it doesn't serve the user in this moment, it doesn't exist on screen.

Measurable checks:
- >6 competing visual elements in a single viewport area → HIGH
- No progressive disclosure (all information visible at once without hierarchy) → MEDIUM
- Dashboard with >10 metric cards visible simultaneously → MEDIUM
- Form with >7 visible fields without section grouping → MEDIUM

### 05 — System consistency
Every surface follows the design system. No one-offs.

Measurable checks:
- >5 unique hex/rgb color values not mapped to semantic tokens → CRITICAL
- >3 unique spacing values not on the defined scale → HIGH
- Component variants with different styling for the same purpose → HIGH
- Mixed border-radius values on same-level elements → MEDIUM
- Inconsistent shadow depths on same-level cards → MEDIUM

### 06 — Performance as UX
60fps animations. Sub-100ms interactions. No layout shift.

Measurable checks:
- Lighthouse Performance score <80 → CRITICAL
- Cumulative Layout Shift (CLS) >0.1 → HIGH
- Largest Contentful Paint (LCP) >2.5s → HIGH
- Interaction to Next Paint (INP) >200ms → MEDIUM
- JavaScript bundle >300KB gzipped → MEDIUM
- Images without explicit width/height (cause CLS) → MEDIUM

### 07 — Accessibility is designed in
WCAG 2.1 AA is the minimum. Not patched in Phase 3.

Measurable checks:
- axe-core critical violations → CRITICAL (1:1 mapping)
- axe-core serious violations → HIGH (1:1 mapping)
- Text contrast ratio <4.5:1 for normal text → CRITICAL
- Text contrast ratio <3:1 for large text (≥18px or ≥14px bold) → HIGH
- No focus-visible styles on interactive elements → CRITICAL
- Touch targets <44×44px on mobile → HIGH
- Color as sole state indicator (no text/icon accompaniment) → HIGH
- Missing alt text on informational images → HIGH
- Missing ARIA landmarks (main, navigation, complementary) → MEDIUM
- Missing skip-to-content link → MEDIUM

## Non-negotiable rules

- Design system tokens are used for ALL colors, spacing, and typography
- Every interactive element has hover, focus-visible, active, and disabled states
- Every image has meaningful alt text or is marked decorative (alt="")
- Color is never the only indicator of state (always paired with text or icon)
- Touch targets are minimum 44×44px on mobile
- Text contrast meets WCAG 2.1 AA (4.5:1 normal, 3:1 large)
- No layout shift from lazy-loaded content (explicit dimensions required)
- Dark mode uses semantic tokens, not inverted colors

## Quality bar

Any work product is complete when:
- Zero CRITICAL findings against the checks above
- Zero HIGH findings on accessibility (Principle 7)
- All measurable checks can be verified by computed style extraction or tool output
