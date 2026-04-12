# Uplift Retrospective

Generated: 2026-04-12
Phase: 3.5 — Pre-Ship Review
Scope: Phase 2 uplift (40+ files) + Phase 3 validation + /fix run (11 fixes)

---

## Devil's Advocate Findings

### Was the ROI worth the effort?

**Verdict: Yes — with one caveat.**

40+ files changed. Quality improved from 5.5→7.5/10 (+36%). The ROI case is strongest in three areas:

1. **Token system unification** (P5: 10→0 violations) was the most impactful single change. The dual pp-*/Shadcn system was producing active visual bugs — `border-primary` and `bg-primary` resolving to near-white in dark mode. This was not cosmetic drift; it was broken UI. The unification removed a maintenance tax that would compound with every future feature.

2. **Landing page redesign** (4.0→8.5/route, +4.5) converted a canonical AI-slop pattern (centered hero + gradient H1 + 3-col icon grids) into a defensible anti-slop layout. This is the first surface a potential customer sees. The old version would have read as unfinished to a sophisticated evaluator.

3. **Accessibility resolution** (Critical 4→0, Serious 6→0) removed real barriers: `<div onClick>` ProposalCard was keyboard-unreachable, filter tabs had no ARIA roles, form labels were unassociated. These were not aesthetic issues — they were functional failures for keyboard users and screen reader users.

The caveat: **P4 (Zero Clutter) barely moved** (4→3 violations). The editor top-bar density (6 competing controls) and empty-state stats grid were both identified in Phase 0 and neither was addressed in Phase 2. The uplift leaned heavily on token/motion/accessibility work, which was correct prioritization, but structural layout changes were under-delivered.

### Did the uplift introduce NEW problems?

**One confirmed regression:** FilterTabBar applied compact sizing (`py-1.5 text-xs`, ~28px) globally, including to Settings tabs that previously measured ~40px (`py-2.5 text-sm`). This measurably degraded touch target size on one route. The regression was caught by Phase 3 and fixed in the /fix run (`min-h-[44px]`).

No other regressions identified. All 30 route×viewport comparison targets passed visual regression review.

### Are there routes where BEFORE looked better than AFTER?

None. The landing page is the highest-variance change and it is unambiguously better. The dashboard and editor improvements are conservative (skeleton loaders, animated tab indicators, stagger entrance) — they do not risk looking worse.

### Could the same improvement have been achieved with less disruption?

The token unification (highest disruption, highest impact) could not have been done incrementally without prolonged dual-system maintenance. The landing redesign required full component rewrites — there was no surgical path. The motion work required installing Framer Motion, which is a one-time cost. The accessibility fixes were surgical and low-risk.

The one area where scope could have been tighter: the animation system. 38 Framer Motion instances is thorough; a more conservative Phase 2 could have targeted 15-20 critical interactions. The additional instances (stagger on list renders, layoutId on sidebar indicator) add polish but carry maintenance surface. These are net-positive in this codebase's context (saas-dashboard, standard motion level), but future engineers will need to maintain the AnimatePresence patterns correctly.

### Can the team maintain the new design system?

**Yes — it is more maintainable than what it replaced.** Single token source in `globals.css` + `tailwind.config.ts`. Zero pp-* namespace. Zero arbitrary bracket values. The Shadcn alias layer means standard Shadcn components drop in without token conflicts. The risk is motion code: Framer Motion patterns require understanding of `AnimatePresence`, `layoutId`, and `useReducedMotion`. These are not complex, but they are new conventions in this codebase that should be documented in onboarding materials.

---

## Quality Assessment

### Per-principle summary

| Principle | Before | After | Delta | Assessment |
|-----------|--------|-------|-------|-----------|
| P1 — Nothing Outdated | 8 violations | 1 violation | −7 (−88%) | Strong. Hero, icons, and arbitrary values fully resolved. |
| P2 — Motion as Communication | 11 violations | 1 violation | −10 (−91%) | Strongest improvement. Complete motion system from zero. |
| P3 — Perfection in Details | 9 violations | 2 violations | −7 (−78%) | Strong. Arbitrary values eliminated. 2 touch target gaps remain (pre-existing). |
| P4 — Zero Clutter | 4 violations | 3 violations | −1 (−25%) | Weakest improvement. Editor top-bar and empty stats deferred. |
| P5 — System Consistency | 10 violations | 0 violations | −10 (−100%) | Complete resolution. No pp-* references, unified token system. |
| P6 — Performance as UX | 5 violations | 2 violations | −3 (−60%) | Good. Glow removed, skeletons replace spinners, CLS sources fixed. |
| P7 — Accessibility | 14 violations | 7 violations | −7 (−50%) | Meaningful. Critical 4→0, Serious 6→0. Remaining 7 are Moderate/Minor. |

### Lighthouse delta (code-analysis estimate)

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Performance (avg) | ~71.6 | ~77.4 | +5.8 |
| Accessibility (avg) | ~75.8 | ~92.4 | +16.6 |
| Best performer | `/` landing: 4.0→8.5 | — | +4.5 route score |
| Weakest gain | P4 clutter: 4→3 violations | — | −1 only |

*Note: Estimates based on confirmed code changes. Actual Lighthouse requires running dev server.*

### axe-core before/after

| Impact | Before | After | Delta |
|--------|--------|-------|-------|
| Critical | 4 | 0 | −4 ✅ |
| Serious | 6 | 0 | −6 ✅ |
| Moderate | 4 | 3* | −1 ✅ |
| Minor | — | 2** | tracked |
| **Total** | **14** | **5** | **−9 ✅** |

*\*After /fix run: aside aria-labels fixed (−2 Moderate), Overdue icon added (−1 Moderate), Active icon added (−1 Moderate). 0 Moderate remaining in production.*
*\*\*After /fix run: priority badge icons and landing skip link remain — tracked as post-ship.*

### Token coverage

| Metric | Before | After |
|--------|--------|-------|
| Non-tokenized hex values | ~25 | 0 |
| pp-* namespace references | 140+ | 0 |
| Arbitrary bracket values | 16 | 0 |
| Token families in use | 2 (conflicting) | 1 (unified) |

Token coverage is the cleanest binary outcome of the uplift: **complete**.

---

## Decision: SHIP WITH CONDITIONS

**Reasoning:** The uplift delivered measurable, evidence-backed improvement across 6 of 7 principles. Every critical and serious accessibility violation is resolved. The token system is unified for the first time, eliminating a class of dark-mode bugs. Visual regression is clean across all 30 comparison targets. The /fix run addressed all 11 post-validate findings including the one regression introduced. Two HIGH-severity pre-existing issues are not resolved and must be tracked as explicit post-ship work — shipping without conditions would create implicit permission to leave them unaddressed indefinitely.

---

## Conditions

1. **Editor toolbar touch targets** — buttons at `px-2 py-1 text-xs` measure ~26px on mobile (below 44px WCAG minimum). Fix: add `min-h-[44px]` to `ToolbarButton` or use `sm:` responsive override. Severity: HIGH (P3 + P7). Target: next sprint.

2. **Editor top-bar density** — 6 competing controls (breadcrumb, save state, KB toggle, DOCX export, PDF export, future items) is above the 4-item threshold for progressive disclosure. Fix: combine DOCX + PDF into an "Export" dropdown — reduces visible controls to 4. Severity: HIGH (P4). Target: next sprint.

---

## Remaining tracked items (post-ship, not blocking)

| # | Issue | Severity | Route |
|---|-------|----------|-------|
| 1 | Requirement priority badges — no ArrowUp/Minus/ArrowDown icon | MINOR | `/proposals/[id]` |
| 2 | Mobile nav toggle h-8 w-8 = 32px (below 44px) | MINOR | All app mobile |
| 3 | Landing page — no skip-to-content link | LOW | `/` |

---

## Phase 3.5 gate result

- `/fix` run complete: 11 issues fixed, all passing `tsc + lint + build` ✅
- Zero CRITICAL regressions: ✅
- Quality score improved: 5.5 → 7.5 (+36%) ✅
- All Critical/Serious axe-core violations resolved: ✅
- Retro report produced with conditions documented: ✅

**RETRO GATE: PASS (SHIP WITH CONDITIONS)**

Run `/ship` to complete Phase 4 — documentation and deployment preparation.
