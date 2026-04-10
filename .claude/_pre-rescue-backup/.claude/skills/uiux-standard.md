# UI/UX Standard — Rescue Edition

The Netflix/Apple benchmark applies even during rescue. Fixed features must meet these standards.

## 01 — Nothing is outdated
Every fixed component must feel contemporary. If a fix reveals a dated pattern, flag it for post-rescue polish.

## 02 — Motion is communication
Animations convey state changes. Loading → loaded transitions must be smooth. No jarring content shifts.

## 03 — Perfection in the details
Spacing, typography, contrast, alignment must be exact after a fix. Don't introduce 4px misalignment while fixing a feature.

## 04 — Zero clutter
If fixing a feature reveals unnecessary UI elements, remove them. Less is more.

## 05 — System consistency
Every fix must use existing design tokens. Don't introduce one-off colors, fonts, or spacing values.

## 06 — Performance as UX
60fps animations. Sub-100ms interactions. No CLS. Every fix must maintain or improve performance.

## 07 — Accessibility is not optional
WCAG 2.1 AA minimum. Fixed components must have: proper ARIA labels, keyboard navigation, sufficient contrast.

## Rescue-Specific Application
- Loading states: every data-fetching component gets a skeleton loader
- Error states: every component that can fail gets an error boundary with user-friendly message
- Empty states: every list/table gets an empty state with clear call-to-action
- These three states are MANDATORY for any feature touched during rescue
