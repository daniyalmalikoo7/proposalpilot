# Migration Plan: ProposalPilot UI Uplift

Generated: 2026-04-12
Phase: 1 — Design System
Agent: Migration Planner

Source inputs:
- `docs/design/04-design-tokens.md` — unified CSS variable token system (light + dark)
- `docs/design/05-component-strategy.md` — 25 components, KEEP/IMPROVE/REPLACE/CUSTOM decisions
- `docs/design/06-motion-spec.md` — Framer Motion spec, 10 motion gaps, install required
- `docs/audit/02-visual-quality-report.md` — 5 CRITICAL, 11 HIGH, 14 MEDIUM, 4 LOW findings
- `docs/audit/03-interaction-report.md` — 47 interactive elements, 4 CRITICAL ARIA violations
- `docs/design/04a-aesthetic-direction.md` — saas-dashboard, warm-refined, standard motion, balanced density
- `package.json` — 100 source files, no framer-motion, Tailwind v3, Radix primitives present

---

## Devil's Advocate: Is This Uplift Worth Doing?

This section is mandatory. It exists to prevent scope creep and wasted effort. Read it before proceeding.

---

### Question 1: Is the app actually broken visually? Is 5.5/10 bad enough to justify a full uplift?

**Honest answer: For a B2B SaaS product, yes — but the case is stronger on accessibility grounds than aesthetics.**

5.5/10 means the app is coherent and functional. It is not embarrassing. A non-designer user would call it "looks fine." However, the score masks two specific failures that matter in a B2B context:

1. The landing page scores 4/10 and is textbook AI-generated — centered hero, gradient headline, three-column icon grid. For a product selling to professionals who evaluate many SaaS tools, a generic landing page damages trust before the app is even loaded. The landing page is a first-impression surface and it currently reads as a weekend project, not a serious professional tool.

2. The dual token system (pp-* hex tokens alongside Shadcn CSS vars) is not a visual problem today — it is a compounding technical debt problem. Every new feature has a 50/50 chance of landing in the wrong token family, silently. Over 6-12 months this drift accelerates. Fixing it now, while the codebase is ~100 files, takes hours. Fixing it at 300 files takes days.

**Conclusion on Question 1:** The visual quality alone would not justify the full 14-step plan described below. The accessibility failures and token system debt together do justify it. The aesthetic improvement is a bonus, not the primary driver.

---

### Question 2: Will users notice? Do professionals care about warm-refined vs clinical-minimal?

**Honest answer: They won't articulate it, but they will feel it — and for a proposal writing tool, it matters more than average.**

ProposalPilot users spend multiple hours per session writing proposals. A cold, dark-navy UI is fatiguing on long writing sessions. The warm-refined direction is not a stylistic preference — it is ergonomically appropriate for extended reading and writing contexts. Apple, Notion, and Linear (all warm-leaning tools for focused work) have demonstrated this preference in the professional knowledge-work segment.

What users will notice concretely:
- The landing page redesign: prospects who compare ProposalPilot to competitors will immediately see the difference between a confident brand and a template
- The focus rings: keyboard power users (a disproportionately high percentage of professional SaaS users) will notice that every tab key press now shows them where they are
- The skeleton loading states replacing spinners: the app will feel faster even if it is not

**Conclusion on Question 2:** The token consolidation and accessibility fixes are imperceptible to most users but reduce support burden. The landing redesign and skeleton states are perceptible to all users and directly affect conversion and perceived quality.

---

### Question 3: What is the maintenance burden? Is a solo/small team prepared to maintain a design system with 24 tokens, Framer Motion, and Shadcn components?

**Honest answer: The token system is net-negative maintenance burden. Framer Motion adds marginal overhead. Shadcn is already partially in use.**

The current state has TWO token systems to maintain. The pp-* family and the Shadcn CSS vars are already diverging. The proposed migration consolidates to ONE system. After migration, a developer who wants to change the accent color edits one CSS variable. Today they would edit it in tailwind.config.ts AND globals.css AND scattered inline hex values. The unified token system reduces long-term maintenance.

Framer Motion adds ~47KB to the bundle (gzipped ~14KB) and one new dependency to keep updated. The API is stable (v11 is a minor evolution of v6). The risk is low.

Shadcn is already installed for Dialog, Toast, Tooltip, ScrollArea, Separator, DropdownMenu, and Label. Adding DropdownMenu (for kb-item-card) means running one CLI command to install a component the project already has as a Radix dependency. The "new dependency" risk is negligible.

**The real maintenance risk is discipline:** design tokens only work if every future developer uses them. This is a team culture question, not a technical question. Adding a lint rule (no raw hex colors in className strings) would enforce it mechanically.

**Conclusion on Question 3:** Maintenance burden is net-negative for the token system (simplification). Framer Motion is an acceptable addition. Shadcn is already in use. The risk is team discipline on token usage going forward.

---

### Question 4: Are there bigger priorities? The audit found CRITICAL ARIA violations and keyboard inaccessibility — should those be fixed standalone first?

**Honest answer: The CRITICAL ARIA fixes should be extracted as a standalone minimum viable fix if the full uplift is not approved — but doing them as part of the uplift is more efficient.**

The four CRITICAL ARIA violations are:
1. ProposalCard `<div onClick>` — keyboard users cannot navigate the main proposal list
2. Filter tabs missing `role="tab"` / `aria-selected` on dashboard, KB, and settings
3. Settings tab buttons missing `role="tab"` / `aria-selected`
4. KBItemCard "..." button has no `aria-label` (icon-only button, invisible to screen readers)

These are not cosmetic. They are functional failures for keyboard users and screen reader users. In an enterprise context, accessibility compliance is increasingly a procurement requirement.

**If the full uplift is blocked:** The CRITICAL items (4 ARIA violations + 14 missing focus-visible rings) should be fixed as a standalone PR that takes approximately 4-6 hours. This is not a substitute for the uplift — it would leave the token system chaos, the landing page, and the motion gaps untouched — but it addresses the most urgent user-harm issues.

**If the full uplift is approved:** These fixes are absorbed into Steps 4-10 at no incremental cost. There is no reason to do them twice.

**Conclusion on Question 4:** Biggest priority is the CRITICAL accessibility work. The most efficient path is to do it inside the uplift. The worst path is to ignore it. If the uplift is delayed for any reason, the accessibility fixes must be extracted and shipped standalone.

---

### Question 5: Is the scope realistic? 22 components + Framer Motion + landing page redesign — what is the honest effort estimate?

**Honest answer: 40-60 hours for a solo developer. 25-35 hours for a pair. This is a meaningful but bounded commitment.**

The scope is not a "full design system build from scratch." The design system is already partially implemented. The tokens are defined and ready to inject. The components exist and need targeted edits, not rewrites. The component complexity distribution is:
- LOW complexity: 9 components (button, input, badge, progress, skeleton, app-shell, upload-dropzone, ProposalTableSkeleton, onboarding page)
- MEDIUM complexity: 10 components (sidebar, new-proposal-dialog, kb-search-panel, kb-upload-form, requirements-sidebar, proposal-card, editor-toolbar, proposal-editor index, FilterTabBar, most pages)
- HIGH complexity: 3 components (kb-item-card — custom dropdown → Radix, landing page — full redesign, proposal-editor suite — motion + ARIA)

The landing page redesign is the single largest item and could be descoped to a later phase if needed (it does not block any app functionality).

The Framer Motion install is a `npm install framer-motion` followed by implementing ~10 animation patterns across stable components. None of the patterns are novel — all are provided in the motion spec.

**Conclusion on Question 5:** Scope is realistic for a focused sprint. The honest risk is not effort — it is scope creep during execution. The step ordering below is designed to produce value at each checkpoint so work can stop at any point with a shippable state.

---

## PROCEED / RECONSIDER Decision

**PROCEED — with the following conditions:**

1. **Condition: CRITICAL accessibility fixes cannot be skipped.** Steps 4, 5, 6, 7 (which contain the CRITICAL ARIA repairs) are non-negotiable. The landing page redesign (Step 11) may be deferred to a Phase 2.5 if time is constrained.

2. **Condition: Token injection (Step 1) must be validated before any component work begins.** If the Tailwind config or globals.css injection breaks the build, stop and diagnose before continuing. Token drift caused by a failed injection is worse than the current state.

3. **Condition: Steps 1-5 (tokens + atoms + shell) should be reviewed and QA'd before Steps 6-14.** This is the foundation. If the foundation is wrong, all subsequent work inherits the error.

4. **Condition: If Framer Motion causes Lighthouse performance regression >5 points** (measured in Phase 3), remove it from non-critical paths and keep it only on page transitions and modal animations.

5. **Condition: The landing page redesign (Step 11) may be deferred** to its own PR/sprint if the core app uplift (Steps 1-10, 12-14) is the priority.

**RECONSIDER if:** The team has fewer than 20 engineering hours to commit to this sprint. In that case, extract CRITICAL ARIA fixes (Steps 5-7 partial) as a standalone PR and defer the rest.

---

## Migration Steps

### Step 1 — Token Injection

**Description:** Replace the dual token system (pp-* hex + Shadcn CSS vars) with a single unified system. This is the foundational step — nothing else can run correctly without it.

**Files affected:**
- `tailwind.config.ts` — replace `theme.extend` colors, borderRadius, spacing, fontSize, fontWeight, lineHeight, boxShadow, keyframes blocks verbatim from `04-design-tokens.md`
- `src/app/globals.css` — replace `:root` and `.dark` CSS custom property blocks with warm-refined HSL values from `04-design-tokens.md`

**File count:** 2

**Visual impact:** MAJOR — the entire app color scheme shifts from cold dark navy to warm white light mode. This is intentional. The app was dark-first; it becomes light-first with dark mode toggle support.

**Verification checkpoint:**
- `npm run build` passes with zero TypeScript errors
- In browser: `bg-background` renders `#faf9f7` in light mode, `#0f0e0d` in dark mode
- In browser: `bg-accent` renders `#5b5bd6` in light mode, `#818cf8` in dark mode
- All existing Shadcn components (Dialog, Toast) still render correctly (they use CSS vars that are now remapped)

**Rollback approach:** `git revert` on the two files. The old values are fully recoverable from git history. No other files are touched in this step, so rollback is clean.

---

### Step 2 — Global Styles

**Description:** Apply global typography, body background, and layout baseline to the root layout. This anchors the warm-refined typographic system across all routes.

**Files affected:**
- `src/app/globals.css` — add body font-family (Inter via next/font), font-smoothing, and base heading letter-spacing rules
- `src/app/layout.tsx` — add `font-sans` class and Inter font import via `next/font/google`

**File count:** 2

**Visual impact:** MINOR — font rendering improves slightly. Background color for the root shell applies.

**Verification checkpoint:**
- `npm run build` passes
- Rendered text uses Inter with antialiasing
- `letter-spacing: -0.02em` applies to headings ≥24px

**Rollback approach:** `git revert` on two files. No component dependencies.

---

### Step 3 — Framer Motion Install + Page Transition Wrapper

**Description:** Install Framer Motion and create the `PageTransition` client component for route-level animations. This step creates no visual changes in the app beyond route transitions.

**Files affected:**
- `package.json` — `npm install framer-motion` (adds dependency)
- `src/components/atoms/page-transition.tsx` — NEW FILE: client component wrapping `AnimatePresence` + `motion.div` with `usePathname` key and `useReducedMotion` guard
- `src/app/(app)/layout.tsx` — wrap `children` with `<PageTransition>`
- `src/app/layout.tsx` — wrap root content with `<PageTransition>` (landing routes)

**File count:** 4 (1 new, 3 modified)

**Visual impact:** MINOR — route navigation now fades in (opacity 0→1, y 8→0, 250ms ease-out). Previously instant.

**Verification checkpoint:**
- `import { motion } from "framer-motion"` resolves without error
- Navigating between `/dashboard` and `/proposals` produces a visible fade transition
- `prefers-reduced-motion: reduce` disables the y-translate (opacity only, matches `useReducedMotion()` guard)
- Bundle size increase is <20KB gzipped

**Rollback approach:** Remove `<PageTransition>` from both layout files, delete `page-transition.tsx`, remove framer-motion from package.json.

---

### Step 4 — Base Atoms

**Description:** Migrate all five atom components to the unified token system and fix interaction gaps. These components are used on every route; fixing them here propagates improvements everywhere.

**Files affected:**
- `src/components/atoms/skeleton.tsx` — fix shimmer gradient direction, easing, and GPU compositing
- `src/components/atoms/badge.tsx` — fix `focus:ring` → `focus-visible:ring`; add info, success, warning, danger, info-secondary variants
- `src/components/atoms/input.tsx` — add `hover:border` state, correct height to 40px (`h-10`), full token migration
- `src/components/atoms/button.tsx` — add `active:scale-[0.98]` and Framer Motion `whileHover`/`whileTap` spring feedback; token migration; `aria-busy` on loading state
- `src/components/atoms/progress.tsx` — add `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`; token migration; explicit ease-out on fill transition

**File count:** 5

**Visual impact:** MINOR — badge variants change color, button has spring press feedback, input height increases 4px, skeleton shimmer is smoother.

**Verification checkpoint:**
- All existing Storybook or test renders pass (if any)
- Badge renders correct color per variant: `<Badge variant="info">` → blue tint
- Button `whileTap` produces visible scale-down on click (check in browser)
- Input height is 40px (inspect via DevTools)
- Progress bar announces `role="progressbar"` (check with axe-core or browser accessibility tree)
- `focus-visible` ring appears on keyboard tab but NOT on mouse click (for badge)

**Rollback approach:** `git revert` on 5 files. These atoms have no external state; rollback is isolated.

---

### Step 5 — Navigation Shell

**Description:** Fix the app shell and sidebar — the persistent frame visible on every app route. This step delivers the skip-to-content link (critical for keyboard users) and focus-visible rings on all navigation links.

**Files affected:**
- `src/components/templates/app-shell.tsx` — add skip-to-content link as first child; add `id="main-content"` to `<main>`; fix header height `h-11` → `h-14`; token migration
- `src/components/organisms/sidebar.tsx` — add `focus-visible:ring-2` to all `<Link>` elements; wrap nav in `<nav aria-label="Main navigation">`; fix `text-[11px]` → `text-xs`; `w-60` → `w-64`; full token migration (pp-* → CSS vars)

**File count:** 2

**Visual impact:** MAJOR — entire sidebar color palette shifts to warm-refined. Header grows by 12px. Skip link is visible on first Tab press.

**Verification checkpoint:**
- Press Tab on any app route: first focusable element is "Skip to content" link that is visually hidden but becomes visible on focus
- Tab through sidebar nav links: each shows a clear indigo ring
- Sidebar background is warm off-white (`#f4f1ed` in light mode), not dark navy
- `nav[aria-label="Main navigation"]` present in accessibility tree

**Rollback approach:** `git revert` on 2 files.

---

### Step 6 — Molecules Group 1

**Description:** Migrate the three highest-priority molecule components. This group contains one CRITICAL ARIA violation (ProposalCard `<div onClick>`) and one HIGH-complexity replacement (KBItemCard custom dropdown → Radix DropdownMenu).

**Files affected:**
- `src/components/molecules/proposal-card.tsx` — REPLACE: outer `<div onClick>` → `<Link>`; add `focus-visible:ring`; make "..." button discoverable on focus-within; badge token migration
- `src/components/molecules/kb-item-card.tsx` — REPLACE: custom `<div>` dropdown → Shadcn `DropdownMenu` (`npx shadcn-ui@latest add dropdown-menu` if not present — Radix already in package.json); fix "..." button `h-6 w-6` → `h-8 w-8`; add `aria-label`; token migration
- `src/components/organisms/new-proposal-dialog.tsx` — fix three unlinked labels (`htmlFor`/`id` pairs); add `<Dialog.Description>`; fix RFP picker `focus-visible:`; token migration; modal size to `max-w-[560px]`

**File count:** 3

**Visual impact:** MAJOR — ProposalCard rows change background color; KBItemCard dropdown is now styled via Shadcn; dialog size and styling update.

**Verification checkpoint:**
- Keyboard: Tab to proposal list, press Enter on a row → navigates to proposal (was impossible before)
- Keyboard: Tab to KBItemCard "..." button, press Enter → dropdown opens with arrow-key navigation and Escape-to-close
- axe-core: `<div onClick>` CRITICAL violation no longer reported on `/dashboard`
- Screen reader: KBItemCard "..." button announces label "Open menu for [title]"
- `<Dialog.Description>` present in accessibility tree on NewProposalDialog

**Rollback approach:** `git revert` on 3 files. The Shadcn DropdownMenu component installed via CLI can remain (it is an additive change to `src/components/ui/`).

---

### Step 7 — Molecules Group 2

**Description:** Migrate four organism components. Each has a mix of accessibility fixes and token migration. No structural replacements in this group.

**Files affected:**
- `src/components/organisms/kb-search-panel.tsx` — fix `focus:` → `focus-visible:` on search input and result buttons; add `aria-label` to input; `aria-selected` on result buttons; type scale fixes; token migration
- `src/components/organisms/kb-upload-form.tsx` — add `htmlFor`/`id` to Type and Title labels; add `focus-visible:` to file picker; replace raw `<select>` with Shadcn `Select` component; token migration
- `src/components/organisms/requirements-sidebar.tsx` — add `focus-visible:ring` to requirement buttons; fix 4 arbitrary type sizes; add `aria-pressed`; replace `✓` color-only indicator with icon + text; token migration
- `src/components/organisms/upload-dropzone.tsx` — add `focus-visible:ring` to remove buttons; add `has-[:focus-visible]:ring` on dropzone label; token migration

**File count:** 4

**Visual impact:** MINOR — input heights and focus rings change; dropzone border color updates; requirement sidebar background shifts to warm palette.

**Verification checkpoint:**
- Keyboard: Tab to KB search input, type query, Tab to first result — focus ring visible
- Keyboard: Tab to file picker in KB Upload Form — focus ring visible
- `<select>` element replaced by Shadcn Select with keyboard navigation
- Requirement satisfied state shows CheckCircle2 icon + text "addressed" (not color alone)
- `aria-pressed` on requirement toggle buttons confirmed in accessibility tree

**Rollback approach:** `git revert` on 4 files. Shadcn Select component (if CLI-installed) can remain.

---

### Step 8 — Custom Components

**Description:** Build the two new custom components that replace inline patterns repeated across multiple pages.

**Files affected:**
- `src/components/molecules/filter-tab-bar.tsx` — NEW FILE: reusable `<FilterTabBar>` with `role="tablist"`, `role="tab"`, `aria-selected`, `focus-visible:ring`, count badge support, horizontal scroll on narrow mobile
- `src/components/molecules/proposal-table-skeleton.tsx` — NEW FILE: shape-matched skeleton for the proposals table (rows with icon + title + badge + date column proportions); uses updated `skeleton.tsx` atom

**File count:** 2 (both new)

**Visual impact:** NONE at this step — new files only, not yet imported by any page.

**Verification checkpoint:**
- `FilterTabBar` renders correctly in isolation (manually test in a single page import temporarily)
- `ProposalTableSkeleton` renders skeleton rows that match the ProposalCard column layout
- Both components pass TypeScript check (`npx tsc --noEmit`)
- No Tailwind arbitrary values in either component

**Rollback approach:** Delete 2 files. No page has imported them yet.

---

### Step 9 — Organisms: Proposal Editor Suite

**Description:** Migrate the proposal editor components — the most complex surface in the app. These are used only on `/proposals/[id]` so the blast radius is contained.

**Files affected:**
- `src/components/organisms/proposal-editor/editor-toolbar.tsx` — add `focus-visible:ring` and `active:scale-[0.97]` to ToolbarButton; add `aria-pressed`; add `title` attributes; token migration
- `src/components/organisms/proposal-editor/index.tsx` — migrate `pp-*` tokens on ConfidenceBadge; wrap conditional state UI (generating / error / idle) in `AnimatePresence` with 150ms opacity fade; add `aria-live="polite"` and `aria-busy={isGenerating}` to streaming area

**File count:** 2

**Visual impact:** MINOR — ConfidenceBadge colors shift to warm palette; state transitions gain 150ms opacity fade.

**Verification checkpoint:**
- In `/proposals/[id]`: click a toolbar button — `aria-pressed` toggles in accessibility tree
- Generate a proposal section: the state change (generating → complete) fades rather than snaps
- `aria-live="polite"` present on the streaming content region
- ToolbarButton focus ring visible on keyboard tab

**Rollback approach:** `git revert` on 2 files.

---

### Step 10 — Pages

**Description:** Update all five app pages to use FilterTabBar and ProposalTableSkeleton, standardize H1 sizing, fix inline off-token values, and standardize spacing.

**Files affected:**
- `src/app/(app)/dashboard/page.tsx` — swap inline filter tabs for `<FilterTabBar>`; swap `<Loader2>` spinner for `<ProposalTableSkeleton>`; fix H1 to `text-2xl` (24px); standardize `space-y-6`; fix stats grid `gap-3` → `gap-4`
- `src/app/(app)/proposals/page.tsx` — swap inline proposal rows to use `<Link>` wrapper (consistent with ProposalCard); add `focus-visible:ring` to row buttons; standardize H1 to `text-2xl`; `space-y-6`
- `src/app/(app)/knowledge-base/page.tsx` — swap inline filter tabs for `<FilterTabBar>`; fix H1 to `text-2xl`; fix `text-[10px]` occurrences; token migration
- `src/app/(app)/settings/page.tsx` — swap inline tabs for `<FilterTabBar>`; fix `border-primary` active tab → `border-accent`; fix Settings Organisation form label `htmlFor`; fix `text-muted-foreground` → CSS var token; `space-y-6`
- `src/app/(app)/onboarding/page.tsx` — fix H1 `text-2xl`; fix `text-muted-foreground` → `text-[hsl(var(--foreground-muted))]`; standardize spacing
- `src/app/(app)/error.tsx` — fix `bg-card border-border` → CSS var tokens
- `src/app/(app)/proposals/[id]/error.tsx` — same fix as above

**File count:** 7

**Visual impact:** MAJOR — filter tabs gain ARIA semantics and consistent styling; dashboard loading state becomes a skeleton; H1 sizes standardize; spacing consistency improves across all routes.

**Verification checkpoint:**
- axe-core: CRITICAL "Filter tabs have no role=tab" violations no longer reported on `/dashboard`, `/knowledge-base`, `/settings`
- Dashboard loading state shows skeleton rows, not spinner
- All app H1 headings are `text-2xl` (24px)
- All app routes use `space-y-6` section spacing (inspect DevTools)
- `FilterTabBar` keyboard navigation: arrow keys move between tabs, Tab moves to next focusable element

**Rollback approach:** `git revert` on 7 files.

---

### Step 11 — Landing Page Redesign

**Description:** Full redesign of the landing page to eliminate all anti-slop patterns and apply the warm-refined token system. This is the largest single-step in the plan.

**Files affected:**
- `src/app/page.tsx` — remove raw `bg-[#060b18]`; apply token-based background and section alternation
- `src/app/_components/landing/hero.tsx` — REPLACE centered hero with split-screen layout (left: text + CTA, right: product screenshot or minimal geometric asset); remove gradient headline; remove radial glow blob; token migration
- `src/app/_components/landing/nav.tsx` — add `focus-visible:ring` to all nav links; token migration from `slate-*`
- `src/app/_components/landing/features.tsx` — REPLACE three-column icon grid with bento grid (varied sizes); token migration
- `src/app/_components/landing/problem-solution.tsx` — REPLACE three-column icon grid with single-column + progressive disclosure or 2-column varied layout; token migration
- `src/app/_components/landing/how-it-works.tsx` — token migration; minimal layout refinement
- `src/app/_components/landing/pricing.tsx` — token migration; ensure pricing card radius consistent with app cards (`rounded-lg` = 12px)
- `src/app/_components/landing/footer.tsx` — token migration from `slate-*`

**File count:** 8

**Visual impact:** MAJOR — landing page completely transforms. Light mode default replaces the dark navy. Split-screen hero replaces centered gradient. Bento grid replaces icon-grid.

**Verification checkpoint:**
- Landing page: no `bg-[#060b18]`, no `bg-gradient-to-r ... bg-clip-text text-transparent` on H1, no three-column icon grid (anti-slop check)
- Landing page: all colors use CSS variable tokens (`bg-background`, `text-foreground`, `bg-accent`, etc.)
- Hero section: text is left-aligned or split-screen, not centered
- Keyboard: all landing nav links show focus ring
- `npm run build` passes

**Rollback approach:** `git revert` on 8 files. Landing page is visually isolated from app routes; rollback has no side effects on app UI.

**Note — deferral option:** This step can be deferred to its own PR without blocking Steps 12-14. If the sprint timeline is at risk, defer this step and ship Steps 1-10, 12-14 first.

---

### Step 12 — Motion Application

**Description:** Apply Framer Motion animation patterns to the now-stable components. Motion is applied AFTER all structural and token work is complete to avoid compounding changes.

**Files affected:**
- `src/components/atoms/page-transition.tsx` — already created in Step 3; verify key changes correctly on route switch
- `src/components/molecules/proposal-card.tsx` — add list stagger pattern (`containerVariants` with `staggerChildren: 0.04`) to the card list render
- `src/components/molecules/filter-tab-bar.tsx` — add `layoutId` animated indicator for active tab (shared layout animation)
- `src/app/(app)/proposals/[id]/page.tsx` — add `AnimatePresence` with opacity fade on save-state text transitions ("Saving…" ↔ "Saved ✓")
- `src/app/(app)/settings/brand-voice/brand-voice-client.tsx` — add multi-stage progress indicator with named stages ("Uploading → Extracting → Analyzing → Building profile") replacing bare spinner
- `src/components/organisms/sidebar.tsx` — add `layoutId="sidebar-active"` indicator on the active nav item background

**File count:** 6

**Visual impact:** MAJOR — the app gains purposeful motion. Proposal list items stagger in on load. Filter tab active indicator slides between tabs. Save state fades. Sidebar active state slides.

**Verification checkpoint:**
- Navigate between routes: fade + y-translate transition visible
- Tab through filter tabs: active indicator animates position change (not instant)
- Save a proposal section: "Saving…" fades to "Saved ✓" (not instant swap)
- `prefers-reduced-motion: reduce` in OS settings: all animations except opacity disabled
- Lighthouse performance: score does not drop more than 5 points from Step 1 baseline

**Rollback approach:** `git revert` on 6 files. Framer Motion remains installed (it may be used for AnimatePresence in organism steps); removing it entirely requires checking all imports.

---

### Step 13 — Accessibility Hardening Pass

**Description:** Final sweep of all remaining accessibility gaps not covered in earlier steps. This step targets medium-severity items and ensures zero axe-core violations.

**Files affected:**
- `src/components/organisms/proposal-editor/index.tsx` — verify `aria-live="polite"` and `aria-busy` are correctly implemented; add `role="region"` with `aria-label` to each proposal section
- `src/app/(app)/proposals/[id]/_components/rfp-upload-panel.tsx` — add `focus-visible:ring` to `role="button"` div; add `aria-label` to RFP dismiss button
- `src/app/(app)/proposals/[id]/page.tsx` — update KB toggle button `title` attr → `aria-label`; confirm export buttons have `aria-label` describing format
- `src/app/(app)/settings/brand-voice/brand-voice-client.tsx` — add `focus-visible:ring` to `<label>` dropzone wrapper (using `has-[:focus-visible]:` selector); fix remove-sample button focus ring
- `src/app/layout.tsx` — add `<html lang="en">` if not already present; verify meta viewport is correct
- `src/components/organisms/new-proposal-dialog.tsx` — final verification that all label/input associations are correct from Step 6

**File count:** 6

**Visual impact:** NONE — accessibility changes are structural, not visual.

**Verification checkpoint:**
- Run `npx axe-core` (or equivalent) against all primary routes: zero CRITICAL, zero SERIOUS violations
- Keyboard complete flow test: sign in → dashboard (skip link → sidebar → filter tabs → proposal rows → "New Proposal" dialog) all reachable and usable via keyboard only
- Screen reader test (VoiceOver or NVDA): navigate to `/dashboard`, open new proposal dialog, complete the form without mouse
- Touch targets: all interactive elements ≥44×44px on mobile (check DevTools device emulation)

**Rollback approach:** `git revert` on 6 files.

---

### Step 14 — Polish Pass

**Description:** Final consistency sweep. Dark mode audit, edge cases, and any issues surfaced by the previous 13 steps.

**Files affected:**
- `tailwind.config.ts` — final check: zero arbitrary bracket values in any class used by components (lint)
- `src/app/globals.css` — verify dark mode `.dark` CSS vars are complete; verify no missing token causes fallback to browser default
- Any file identified during Steps 1-13 as having residual off-token values (cannot enumerate in advance — these will surface during execution)

**Estimated file count:** 3-8 (polish pass scope varies)

**Visual impact:** MINOR — edge case fixes, dark mode parity, minor spacing corrections.

**Verification checkpoint:**
- Switch to dark mode: all surfaces use warm dark palette (no cold navy or pure black)
- Zero raw hex values in any component file (grep for `#[0-9a-fA-F]{3,6}` excluding globals.css and tailwind.config.ts where they are defined)
- Zero `bg-pp-*` or `text-pp-*` token references remain in any component
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run build` passes

**Rollback approach:** Individual file reverts. If this step introduces regressions, revert the specific files — the polish pass does not touch logic.

---

## Scope Estimate Table

| Step | Description | Files | Estimated Hours |
|------|-------------|-------|----------------|
| 1 | Token Injection | 2 | 2h |
| 2 | Global Styles | 2 | 1h |
| 3 | Framer Motion Install + Page Transition | 4 | 2h |
| 4 | Base Atoms | 5 | 4h |
| 5 | Navigation Shell | 2 | 3h |
| 6 | Molecules Group 1 | 3 | 6h |
| 7 | Molecules Group 2 | 4 | 5h |
| 8 | Custom Components (new) | 2 | 4h |
| 9 | Organisms: Proposal Editor | 2 | 4h |
| 10 | Pages | 7 | 5h |
| 11 | Landing Page Redesign | 8 | 10h |
| 12 | Motion Application | 6 | 5h |
| 13 | Accessibility Hardening | 6 | 4h |
| 14 | Polish Pass | 3-8 | 3h |
| **Total** | | **56-61 files** | **58h solo / ~34h pair** |

**Minimum viable delivery (Steps 1-10, 13 only, skip landing + motion):**
- 38-42 files
- ~33h solo / ~20h pair
- Delivers: token unification, CRITICAL ARIA fixes, all accessibility hardening, consistent UI across app
- Does not deliver: motion system, landing redesign

**Maximum scope (all 14 steps):**
- 56-61 files
- ~58h solo / ~34h pair
- Delivers: full Phase 2 as specified

---

## Dependency Graph

```
Step 1 (Tokens) ──────────────────────────┐
Step 2 (Global Styles) ────────────────┐  │
Step 3 (Framer Motion) ──────────────┐ │  │
Step 4 (Atoms)  ──────────────────┐  │ │  │ all depend on Step 1
Step 5 (Shell)  ────────────────┐ │  │ │  │
Step 6 (Molecules 1) ─────────┐ │ │  │ │  │ depends on Step 4 + 5
Step 7 (Molecules 2) ─────────┤ │ │  │ │  │ depends on Step 4 + 5
Step 8 (Custom) ─────────────┐│ │ │  │ │  │ depends on Step 4
Step 9 (Editor) ─────────────┤│ │ │  │ │  │ depends on Step 4 + 3
Step 10 (Pages) ─────────────┴┘ │ │  │ │  │ depends on Step 5-8
Step 11 (Landing) ──────────────┘ │  │ │  │ depends on Step 1 + 2 only (isolated)
Step 12 (Motion) ──────────────────┘  │ │  │ depends on Step 3-10 all stable
Step 13 (A11y)  ────────────────────────┘ │  depends on Step 4-10
Step 14 (Polish) ──────────────────────────┘  depends on all prior
```

**Parallelization opportunity:** Steps 2, 3, and 4 can be done in parallel after Step 1 is validated. Steps 6 and 7 can be done in parallel after Steps 4 and 5 are validated. Step 11 (landing) can be worked in parallel with Steps 6-10 since it shares no files with the app routes.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Token injection breaks existing Shadcn components | Medium | HIGH | Shadcn compatibility aliases in tailwind.config.ts (already in token spec) map `card`, `popover`, `primary`, `secondary`, `muted` to new CSS vars |
| Framer Motion + Next.js App Router `AnimatePresence` conflict | Low | MEDIUM | Use `usePathname` as key, wrap in client component, test immediately after Step 3 |
| Light mode shift alienates dark mode users | Low | MEDIUM | Dark mode toggle is preserved and tested in Step 14; dark mode values are specified in token spec |
| Landing redesign (Step 11) over-runs | Medium | LOW | Deferral condition already stated; Steps 1-10 + 12-14 are independently shippable |
| TypeScript errors from new component structure | Low | MEDIUM | Each step ends with `npx tsc --noEmit`; do not proceed to next step until clean |
| Framer Motion performance regression | Low | HIGH | Lighthouse baseline taken after Step 1; compared after Step 12; rollback motion from non-critical paths if >5pt regression |

---

## Non-Negotiable Ordering Rules (Summary)

1. Step 1 (Tokens) completes and validates before ANY other step begins
2. Steps 4 (Atoms) completes before any molecule or organism work
3. Steps 5 (Shell) completes before page-level work (Step 10)
4. Step 3 (Framer Motion) completes before Step 12 (Motion Application)
5. Steps 6-10 (all components and pages) complete and are stable before Step 12 (Motion)
6. Step 12 (Motion) completes before Step 13 (Accessibility) — motion components need to be stable for keyboard/screen reader testing
7. Step 14 (Polish) is always last

No two steps in this plan modify the same file simultaneously.
