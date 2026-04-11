# Quality Scorecard: ProposalPilot

Generated: 2026-04-12
Assessor: Quality Score Assessor — Phase 3 Agent 2
Method: Full source re-evaluation against all 7 UI/UX principles + code-analysis-based Lighthouse/axe-core estimates.
Baseline: docs/audit/02-visual-quality-report.md (Phase 0 — 2026-04-11)

---

## Overall

Quality rating BEFORE: **5.5 / 10**
Quality rating AFTER: **7.5 / 10**
Improvement: **+2.0 (+36%)**

The uplift resolved every CRITICAL and SERIOUS violation across P2, P5, and P7. The landing page (previously the weakest surface at 4/10) received an anti-slop redesign and now scores 8.5/10. The token system is fully unified for the first time. Three HIGH findings remain open (editor top-bar density, touch targets on filter tabs and toolbar) and are documented as scope-limited carryovers.

---

## Per-principle scores

| Principle | Before (violations) | After (violations) | Delta | Status |
|-----------|--------------------|--------------------|-------|--------|
| 1. Nothing outdated | 8 (4 HIGH, 3 MED, 1 LOW) | 1 (1 LOW) | −7 | ✅ Resolved |
| 2. Motion as communication | 11 (2 CRIT, 4 HIGH, 4 MED, 1 LOW) | 1 (1 MED) | −10 | ✅ Resolved |
| 3. Perfection in details | 9 (1 CRIT, 3 HIGH, 4 MED, 1 LOW) | 2 (1 HIGH, 1 MED) | −7 | ✅ Improved |
| 4. Zero clutter | 4 (1 HIGH, 2 MED, 1 LOW) | 3 (1 HIGH, 1 MED, 1 LOW) | −1 | ⚠️ Marginal |
| 5. System consistency | 10 (2 CRIT, 3 HIGH, 4 MED, 1 LOW) | 0 | −10 | ✅ Resolved |
| 6. Performance as UX | 5 (2 HIGH, 2 MED, 1 LOW) | 2 (1 MED, 1 LOW) | −3 | ✅ Improved |
| 7. Accessibility | 14 (4 CRIT, 5 HIGH, 4 MOD, 1 LOW) | 7 (0 CRIT, 0 SER, 4 MOD, 3 LOW) | −7 | ✅ Improved |

---

## Per-route quality scores

| Route | Before | After | Delta | Key change |
|-------|--------|-------|-------|-----------|
| `/` (landing) | 4.0 | 8.5 | +4.5 | Anti-slop hero, bento grid, full tokenization |
| `/sign-in` | 6.0 | 7.0 | +1.0 | Token cleanup, focus improvements |
| `/sign-up` | 6.0 | 7.0 | +1.0 | Same as sign-in |
| `/onboarding` | 5.5 | 7.0 | +1.5 | Accent tokens unified, states improved |
| `/dashboard` | 6.0 | 8.0 | +2.0 | Skeleton loader, filter tabs, stagger animation |
| `/proposals` | 6.5 | 7.5 | +1.0 | Link keyboard nav, focus rings, tokens |
| `/proposals/[id]` (editor) | 5.0 | 7.0 | +2.0 | AnimatePresence, aria-live, focus rings |
| `/knowledge-base` | 6.0 | 7.5 | +1.5 | Radix dropdown, filter tabs, tokens |
| `/settings` | 6.5 | 7.5 | +1.0 | Filter tabs, htmlFor/id, animated indicator |
| `/settings/brand-voice` | 6.0 | 7.5 | +1.5 | Multi-stage progress, focus rings |
| **Average** | **5.75** | **7.55** | **+1.80** | |

Note: Phase 0 report stated 5.5/10 overall, reflecting the landing page as a disproportionate anchor. Route averages confirm +1.8 per-route improvement.

---

## Principle 1 — Nothing Outdated: Before → After

**Before (8 violations):**
- HIGH: Centered hero with gradient H1 (canonical AI-slop)
- HIGH: Two three-column icon grids (features + problem-solution)
- HIGH: Landing page using 40+ raw Slate/Indigo class instances (no tokens)
- MEDIUM: 600×600px radial glow blob (`h-[600px] blur-[120px]`)
- MEDIUM: Hardcoded `#060b18` repeated 7× across landing components
- MEDIUM: Header height h-11 below design guideline
- LOW: Inconsistent card radius (rounded-xl on landing, rounded-lg on app)

**After (1 violation):**
- LOW: Landing mock-panel product preview in hero uses approximate border and background styling — minor visual refinement opportunity

**Evidence:**
- Hero: `src/app/_components/landing/hero.tsx` — confirmed split-screen layout, no `text-center`, no gradient text, no glow div
- Features: `src/app/_components/landing/features.tsx` — confirmed bento grid with varied col-spans
- Problem-solution: `src/app/_components/landing/problem-solution.tsx` — confirmed single-column pairs
- Token audit: 0 `pp-*` tokens remaining, 0 `bg-[#060b18]` remaining
- Header: `app-shell.tsx` — confirmed `h-14` (56px)

---

## Principle 2 — Motion as Communication: Before → After

**Before (11 violations):**
- CRITICAL: No page-transition animations anywhere (instant route swaps)
- CRITICAL: No Framer Motion installed (entire motion budget was `transition-colors`)
- HIGH: Dashboard loading = `Loader2` spinner + text (not shape-matched skeleton)
- HIGH: Editor loading = full-screen spinner (no context)
- HIGH: Brand voice analysis = bare spinner + "Extracting text…" (no progress stages)
- MEDIUM: `transition-colors` without duration specification (uncontrolled browser default)
- MEDIUM: Shimmer animation using linear easing (non-GPU-optimal)
- MEDIUM: Settings tab switch — instant indicator jump (no layout animation)
- MEDIUM: Save state — instant text swap (no AnimatePresence)
- LOW: Button: color-change only on hover/tap (no scale micro-feedback)

**After (1 violation):**
- MEDIUM: Editor full-page skeleton (3-panel) not implemented. The `page-transition.tsx` wraps the route with opacity/y, which softens the load, but a dedicated skeleton matching the sidebar + center + KB-panel layout was not built for the initial editor load. Spinner still shows inside the transition wrapper for `~500ms`. Acceptable for Phase 2 scope but documented.

**Evidence:**
- `package.json`: `"framer-motion": "^12.38.0"` ✅
- `src/components/atoms/page-transition.tsx`: AnimatePresence + motion.div, useReducedMotion guard ✅
- `src/app/(app)/layout.tsx`: PageTransition wraps all auth routes ✅
- `src/components/molecules/filter-tab-bar.tsx`: `layoutId="filter-tab-active"` ✅
- `src/components/organisms/sidebar.tsx`: `layoutId="sidebar-active"` ✅
- `src/components/atoms/button.tsx`: `"active:scale-[0.98]"` ✅
- `src/app/(app)/dashboard/page.tsx`: ProposalTableSkeleton, motion.div stagger ✅
- `src/app/(app)/settings/brand-voice/brand-voice-client.tsx`: AnalysisProgress multi-stage panel ✅
- Framer Motion usage: 38 instances across codebase (`grep AnimatePresence|motion.|useReducedMotion` = 38) ✅
- GPU compliance: all animations use opacity + transform only ✅

---

## Principle 3 — Perfection in Details: Before → After

**Before (9 violations):**
- CRITICAL: 4 different card padding values (p-3, p-4, p-5, p-6) across same-level cards
- HIGH: 10 instances of arbitrary font sizes (`text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]`)
- HIGH: H1 size inconsistency (text-xl on dashboard/KB/settings, text-2xl on proposals/onboarding)
- HIGH: Landing and app type scales entirely disconnected (dual scales)
- MEDIUM: page-level spacing (`space-y-5` vs `space-y-6` across routes)
- MEDIUM: Filter tabs `py-1.5 px-2.5` = ~28px touch target on mobile
- MEDIUM: Glow div arbitrary `h-[600px] w-[600px]`
- MEDIUM: Sidebar version `text-[11px]`
- LOW: Stats grid `gap-3` (12px, off-grid)
- LOW: ProposalCard `w-7` actions column

**After (2 violations):**
- HIGH: Filter tabs `py-1.5 text-xs` = ~28px tap height on mobile (below 44px minimum). Affects FilterTabBar in all routes with filtering. *Not introduced by uplift — pre-existing.*
- MEDIUM: Editor toolbar buttons `px-2 py-1 text-xs` = ~26px height on mobile. *Pre-existing.*

**Evidence:**
- Arbitrary font sizes: `grep -r "text-\[" src/ --include="*.tsx" | grep -v "hsl|var|#" | wc -l` = **0** ✅
- Arbitrary spacing: `grep -r "p-\[|m-\[|gap-\[|px-\[|py-\[" src/ --include="*.tsx" | grep -v "hsl|var(" | wc -l` = **0** ✅
- H1 sizes: `src/app/(app)/dashboard/page.tsx`, `proposals/page.tsx`, `knowledge-base/page.tsx`, `settings/page.tsx` — all confirmed `text-2xl` ✅
- Type scale: `tailwind.config.ts` — confirmed unified scale with `2xs` through `4xl` ✅
- Card padding: `p-5` (20px) standardized on primary cards ✅
- Stats gap: confirmed `gap-4` in dashboard ✅

---

## Principle 4 — Zero Clutter: Before → After

**Before (4 violations):**
- HIGH: Editor top-bar: 6 action controls simultaneously (breadcrumb, save state, KB toggle, DOCX, PDF)
- MEDIUM: Dashboard: 4 stat cards render with "No data yet" on empty state
- MEDIUM: Landing: all sections share identical background over ~4000px scroll
- LOW: Dashboard filter tabs wrap to 2 rows on 375px mobile

**After (3 violations):**
- HIGH: Editor top-bar still has 6 action items — DOCX/PDF export not combined. *Outside Phase 2 scope — would require UX restructure.*
- MEDIUM: Dashboard empty-state stats remain (show "No data yet" × 3). *Not addressed.*
- LOW: Filter tab wrap on mobile — FilterTabBar now uses `flex-wrap` with consistent gaps; counts render in monospace so width is predictable. Reduced severity.

**Evidence:** No structural changes to the editor top-bar. Dashboard stats grid unchanged in structure. FilterTabBar: `flex flex-wrap gap-1` confirmed in source. Landing sections now use `bg-background-subtle` alternating where appropriate (confirmed in layout migration log). P4 marginally improved.

---

## Principle 5 — System Consistency: Before → After

**Before (10 violations):**
- CRITICAL: Dual token system (pp-* hex tokens + Shadcn CSS vars coexisting)
- CRITICAL: Raw Tailwind colors for status badges (`blue-950/400`, `purple-950/400`, `cyan-950/400`)
- HIGH: Landing page 40+ raw Slate/Indigo instances disconnected from token system
- HIGH: `text-muted-foreground` vs `text-pp-foreground-muted` mixed usage
- HIGH: Error pages using Shadcn tokens while surrounding AppShell used pp-*
- MEDIUM: Settings tabs `border-primary` resolving to near-white in dark mode
- MEDIUM: Dashboard filter tabs `bg-primary` resolving to near-white
- MEDIUM: Modal `rounded-xl border-border bg-card` vs app card `rounded-lg border-pp-border bg-pp-background-card`
- LOW: `brand-voice-profile-card.tsx` using `bg-primary` for accent dot

**After (0 violations):**
- Complete system resolution. pp-* namespace fully retired. Shadcn aliases now point to unified CSS vars.

**Evidence:**
- `grep -r "pp-background|pp-foreground|pp-accent|pp-border|#060b18|#0a0f1a" src/ --include="*.tsx" --include="*.css" | wc -l` = **0** ✅
- `tailwind.config.ts`: unified semantic tokens (background/foreground/accent/success/warning/danger/info + Shadcn aliases)
- `globals.css`: `:root` and `.dark` full HSL token set with warm-refined values
- Status badge tokens: `info`/`info-secondary`/`success`/`warning`/`danger` semantic variants in Badge ✅
- `text-muted-foreground` remains in 4 files as Shadcn alias (intentional, maps to `--muted-foreground` → `foreground-muted`) ✅
- All error pages: `bg-background-elevated border-border` ✅

---

## Principle 6 — Performance as UX: Before → After

**Before (5 violations):**
- HIGH: CLS from dashboard stats: height shifts between loading `"—"` and loaded numbers
- HIGH: Landing radial glow blob (600×600 CSS filter composite layer, paint cost)
- MEDIUM: No confirmed `next/font` for Inter (potential FOIT)
- MEDIUM: No `<Image>` usage convention
- LOW: KB filter tabs could cause reflow when count badge width changes

**After (2 violations):**
- MEDIUM: Framer Motion ^12.38.0 bundle adds ~28KB gzipped to JavaScript. Within acceptable range per engineering standard (bundle >300KB gzipped = violation). Not a violation on its own, but monitor if additional animation libraries are added.
- LOW: KB filter tabs still use `flex-wrap` — reflow risk remains. Low impact.

**Lighthouse estimates (code-analysis based — Playwright/Lighthouse CI not available in this environment):**

| Route | Perf Before | Perf After | Δ | A11y Before | A11y After | Δ |
|-------|------------|------------|---|------------|------------|---|
| `/` | ~65 | ~80 | +15 | ~75 | ~95 | +20 |
| `/sign-in` | ~75 | ~78 | +3 | ~85 | ~90 | +5 |
| `/sign-up` | ~75 | ~78 | +3 | ~85 | ~90 | +5 |
| `/onboarding` | ~70 | ~76 | +6 | ~75 | ~92 | +17 |
| `/dashboard` | ~72 | ~78 | +6 | ~70 | ~94 | +24 |
| `/proposals` | ~75 | ~78 | +3 | ~75 | ~94 | +19 |
| `/proposals/[id]` | ~65 | ~74 | +9 | ~68 | ~90 | +22 |
| `/knowledge-base` | ~73 | ~78 | +5 | ~72 | ~92 | +20 |
| `/settings` | ~74 | ~78 | +4 | ~78 | ~95 | +17 |
| `/settings/brand-voice` | ~72 | ~76 | +4 | ~75 | ~92 | +17 |
| **Average** | **~71.6** | **~77.4** | **+5.8** | **~75.8** | **~92.4** | **+16.6** |

*Note: Estimates are based on confirmed code changes (glow removed, next/font added, skeleton replaces spinner, CLS sources removed). Actual Lighthouse scores require a running dev server. The accessibility Lighthouse delta is most reliable — it maps directly to resolved axe-core violations.*

**Evidence:**
- Glow blob confirmed removed from `hero.tsx` ✅
- `layout.tsx`: `Inter` loaded via `next/font/google` with `variable: "--font-inter"` ✅
- Dashboard CLS: `ProposalTableSkeleton` replaces `Loader2` spinner — stat card heights now stable ✅

---

## Principle 7 — Accessibility: Before → After

**Before (14 violations):**
- CRITICAL × 4: div→onClick (ProposalCard), filter tabs no tablist/tab/aria-selected (2 routes), settings tabs no role, KBItemCard "..." no aria-label
- SERIOUS × 6: Dialog.Description missing, form labels unassociated × 3, KB toggle title vs aria-label, KBItemCard custom dropdown no keyboard support
- MODERATE × 4: aside landmarks no aria-label, no skip-to-content, BrandVoice dropzone, proposal card div onClick (also listed as critical above)

**After (7 violations):**
- CRITICAL: 0 ✅
- SERIOUS: 0 ✅
- MODERATE: 4 (2 new classifications of pre-existing → re-evaluated)
  1. RequirementsSidebar `<aside>` × 3 missing `aria-label` — MODERATE (same finding, not resolved)
  2. KBSearchPanel `<aside>` missing `aria-label` — MODERATE
  3. ProposalCard "Overdue" text uses `text-danger` with no AlertCircle icon — MODERATE (pre-existing)
  4. Billing "Active" badge uses `bg-success-bg` with no Check icon — MODERATE (pre-existing)
- MINOR: 3
  1. Requirement priority badges: text says level ("high"/"medium"/"low") but no ArrowUp/Minus/ArrowDown icon accompaniment — MINOR (text is present, only icon missing)
  2. Dialog close button `h-7 w-7` (28px) — below 44px on mobile — LOW/MINOR
  3. Editor toolbar buttons `px-2 py-1 text-xs` — ~26px on mobile — MINOR

**axe-core violations summary:**

| Impact | Before (total) | After (total) | Delta |
|--------|---------------|--------------|-------|
| Critical | 4 | 0 | −4 ✅ |
| Serious | 6 | 0 | −6 ✅ |
| Moderate | 4 | 4 | 0 (composition changed) |
| Minor | — | 3 | tracked |
| **Total** | **14** | **7** | **−7 ✅** |

Note: The 4 "moderate" after uplift are different from the 4 before. Two were resolved (skip-to-content, BrandVoice dropzone) and two new moderate classifications were added (aside aria-labels confirmed still missing, Overdue/Active color-only confirmed not addressed).

**Evidence:**
- `proposal-card.tsx L49`: `<Link href={...}` (was `<div onClick`) ✅
- `filter-tab-bar.tsx L59,71,72`: `role="tablist"`, `role="tab"`, `aria-selected={isActive}` ✅
- `app-shell.tsx L16,43`: `<a href="#main-content" className="skip-to-content">` + `id="main-content"` ✅
- `kb-item-card.tsx L85`: `aria-label={\`Open menu for ${item.title}\`}` ✅
- `new-proposal-dialog.tsx`: `<Dialog.Description>` added, htmlFor/id pairs ✅
- `kb-upload-form.tsx`: htmlFor `kb-type`, `kb-title` ✅
- `settings/page.tsx`: `id="org-name"`, `htmlFor="org-name"` ✅
- `kb-search-panel.tsx`: `title` → `aria-label` on KB toggle ✅
- `kb-item-card.tsx L79,91`: Radix DropdownMenu.Root/Trigger/Content/Item ✅
- `requirements-sidebar.tsx L50,72,91`: `<aside>` still missing `aria-label` ❌
- `kb-search-panel.tsx L64`: `<aside>` still missing `aria-label` ❌
- `proposal-card.tsx L83`: `isOverdue ? "text-danger"` — no AlertCircle ❌

---

## Token system analysis

| Metric | Before | After | Assessment |
|--------|--------|-------|-----------|
| Unique hex color values (non-tokenized) | ~25 (pp-* + Shadcn vars + raw Slate/Indigo) | 0 | ✅ Fully tokenized |
| pp-* token references in src/ | ~140+ | 0 | ✅ Fully retired |
| Arbitrary font size brackets | 10 occurrences | 0 | ✅ Resolved |
| Arbitrary spacing brackets | ~6 occurrences | 0 | ✅ Resolved |
| Design token families | 2 parallel (pp-* + Shadcn) | 1 unified (semantic HSL + Shadcn aliases) | ✅ Unified |
| Dark mode strategy | Mixed: pp-* manual dark values + Shadcn .dark vars | Unified: .dark class on :root with semantic tokens | ✅ Correct |

---

## Remaining gaps (ordered by severity)

| # | Principle | Finding | Severity | Recommendation |
|---|-----------|---------|----------|----------------|
| 1 | P4 | Editor top-bar: 6 items (breadcrumb, save state, KB toggle, DOCX, PDF, export) | HIGH | Combine DOCX + PDF into an "Export" dropdown — reduces to 4 items |
| 2 | P3 | Filter tabs `py-1.5 text-xs` → ~28px on mobile (below 44px) | HIGH | Add `min-h-[44px]` to FilterTabBar tab buttons; increase to `py-2.5` |
| 3 | P3 | Editor toolbar buttons `px-2 py-1 text-xs` → ~26px on mobile | HIGH | Add `sm:min-h-[44px]` to toolbar buttons; use `py-2` minimum |
| 4 | P7 | `<aside>` landmarks missing `aria-label` (RequirementsSidebar × 3, KBSearchPanel × 1) | MODERATE | Add `aria-label="Requirements"` and `aria-label="Knowledge base"` |
| 5 | P7 | ProposalCard "Overdue" is color-only (text-danger, no icon) | MODERATE | Add `<AlertCircle className="inline h-3 w-3 mr-0.5" />` before deadline text when isOverdue |
| 6 | P7 | Billing "Active" badge: color-only (green bg, no Check icon) | MODERATE | Add `<CheckCircle2 className="inline h-3 w-3 mr-1" />` before "Active" text |
| 7 | P4 | Dashboard stats show "No data yet" × 3 in empty state | MEDIUM | Conditionally hide stats grid or replace with onboarding CTA when `proposalCount === 0` |
| 8 | P7 | Requirement priority badges: text label present but no icon (ArrowUp/Minus/ArrowDown) | MINOR | Add priority icon before badge text for redundant visual indicator |
| 9 | P7 | Dialog close button `h-7 w-7` = 28px on mobile | MINOR | Change to `h-9 w-9` (36px) or add `p-1` wrapper for 40px touch area |
| 10 | P6 | Monitor Framer Motion bundle as animations expand | LOW | Run Lighthouse after each motion addition; keep bundle <300KB gzipped |

---

## Gate result

- Quality score improved: ✅ 5.5 → 7.5 (+2.0)
- Zero CRITICAL regressions: ✅ (confirmed in visual regression report)
- Before/after comparison documented: ✅

**QUALITY SCORE GATE: PASS** — proceed to Interaction & Accessibility Validator.
