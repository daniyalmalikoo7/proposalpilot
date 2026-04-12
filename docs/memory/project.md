# ProposalPilot — UI Uplift Project Memory

## Phase summaries

### Phase 0 — Visual Audit (complete)
- Overall quality: 5.5/10
- Critical findings: 5 (dual token system, no motion, landing AI-slop layout, no skip link, filter tabs no ARIA)
- axe-core violations: 14 (4 critical, 6 serious, 4 moderate)
- Landing page was the weakest surface (4/10): centered hero, gradient text, 3-col icon grids, raw Slate/Indigo tokens

### Phase 1 — Design System (complete)
- App profile: saas-dashboard / warm-refined / standard motion / balanced density
- Unified token system: semantic HSL CSS vars replacing pp-* hex tokens + Shadcn aliases preserved
- Anti-slop direction: split-screen hero, bento grid features, no gradient text

### Phase 2 — Execute Uplift (complete)
- 17 components migrated, 40+ files changed
- Token system fully unified: 0 pp-* references remaining
- Framer Motion installed (^12.38.0), 38 usages across codebase
- All 14 Phase 0 axe-core critical/serious violations resolved
- Key fixes: div→Link (ProposalCard), FilterTabBar ARIA, skip-to-content, Radix DropdownMenu (KB), Dialog.Description, htmlFor/id pairs

### Phase 3 — Validate (complete, 2026-04-12)
- Visual regression: PASS (0 critical, 0 high regressions)
- Quality score: 5.5 → 7.5 (+2.0 / +36%)
- axe-core: 14 → 6 violations (−8)
- Lighthouse estimate: avg 71.6 → 77.4 (+5.8 perf), 75.8 → 92.4 (+16.6 a11y)

## Remaining issues for Phase 4 follow-up

### HIGH (fix before or shortly after ship)
1. FilterTabBar touch targets: `py-1.5 text-xs` = ~28px (below 44px). Fix: add `py-2` minimum or `min-h-[44px]`.
2. Settings tabs regressed from ~40px to ~28px via FilterTabBar migration. Fix: className override `[&_button]:py-2.5 [&_button]:text-sm` in settings usage.
3. Editor toolbar buttons: ~26px on mobile. Fix: `min-h-[44px]` on sm breakpoint.
4. Editor top-bar: 6 action items (breadcrumb, save state, KB toggle, DOCX, PDF). Fix: combine DOCX+PDF into "Export" dropdown.

### MODERATE (best practice, non-blocking)
5. `<aside>` landmarks missing aria-label: RequirementsSidebar (×3) + KBSearchPanel (×1). Fix: `aria-label="Requirements"` + `aria-label="Knowledge base search"`.
6. ProposalCard "Overdue" deadline: color + text but no icon. Fix: AlertCircle before text when `isOverdue`.
7. Billing "Active" badge: green bg + "Active" text but no check icon. Fix: CheckCircle2 before "Active".
8. Dashboard empty state: 4 stat cards showing "No data yet" add visual noise. Fix: hide or replace with onboarding CTA.

### MINOR
9. Requirement priority badges: text label present but no ArrowUp/Minus/ArrowDown icon.
10. Dialog close button h-7 (28px) on mobile. Fix: h-9 w-9.
11. Mobile nav toggle h-8 (32px). Fix: h-10 w-10.
12. Landing: no skip-to-content link (no AppShell on marketing routes).

## Key decisions
- Shadcn aliases (`bg-card`, `text-muted-foreground`) preserved pointing to new semantic tokens — backward compat
- Framer Motion `^12.38.0` already in project deps (was in package.json, confirmed working)
- `useReducedMotion` guard on all page transitions — prefers-reduced-motion respected
- ProposalCard click target: `<Link>` chosen over `<button>` for semantic correctness (navigation)
- FilterTabBar: roving tabindex pattern (tabIndex={isActive ? 0 : -1}) — correct per ARIA spec
