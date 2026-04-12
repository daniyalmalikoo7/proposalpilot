# Component Strategy: ProposalPilot

Generated: 2026-04-11
Phase: 1 — Design System
Agent: Component Strategist

Source inputs:
- `docs/design/04a-aesthetic-direction.md` — warm-refined, saas-dashboard, standard motion, balanced density
- `docs/design/04-design-tokens.md` — unified CSS variable token system, pp-* retired
- `docs/audit/02-visual-quality-report.md` — 5 CRITICAL, 11 HIGH, 14 MEDIUM findings
- `docs/audit/03-interaction-report.md` — 47 interactive elements, zero active states, 14 missing focus-visible, 4 CRITICAL ARIA violations

---

## Summary

Components inventoried: 25
KEEP: 3
IMPROVE: 16
REPLACE: 3
CUSTOM: 3

---

## Migration matrix

| Component | Current state | Decision | Target | Priority | Complexity |
|-----------|--------------|----------|--------|----------|------------|
| `button.tsx` | CVA/Radix Slot, focus-visible OK, missing active:, wrong ring color, height off-spec | IMPROVE | Self — add active: states, token migration, motion | P1 | Low |
| `input.tsx` | Functional, focus-visible OK, missing hover:, height 36px (spec is 40px) | IMPROVE | Self — add hover:, correct height, token migration | P1 | Low |
| `badge.tsx` | `focus:ring` not `focus-visible:ring`, raw blue/purple colors in callers | IMPROVE | Self — fix focus ring, extend status variants | P1 | Low |
| `progress.tsx` | Functional, uses `bg-primary`, missing aria-valuenow/min/max | IMPROVE | Self — add ARIA, token migration, animated fill | P2 | Low |
| `skeleton.tsx` | Wrong shimmer — gradient direction + linear easing flagged MEDIUM | IMPROVE | Self — fix shimmer pattern per motion spec | P1 | Low |
| `tooltip.tsx` | Clean Radix wrapper, tokens OK (popover), no issues | KEEP | — | — | — |
| `sidebar.tsx` | `focus-visible:` missing on all nav links, arbitrary text-[11px], pp-* tokens | IMPROVE | Self — add focus rings, token migration, type scale fix | P1 | Medium |
| `theme-toggle.tsx` | Clean, aria-label present, uses Button atom | KEEP | — | — | — |
| `new-proposal-dialog.tsx` | Labels unlinked (no htmlFor/id), RFP picker missing focus-visible, aria-describedby suppressed | IMPROVE | Self — fix a11y, token migration, add Dialog.Description | P1 | Medium |
| `kb-search-panel.tsx` | Raw `focus:` not `focus-visible:`, result buttons missing focus ring, raw pp-* tokens | IMPROVE | Self — fix focus states, token migration | P1 | Medium |
| `kb-upload-form.tsx` | Labels unlinked (no htmlFor/id), file picker missing focus-visible, raw select element | IMPROVE | Self — fix a11y, token migration | P1 | Medium |
| `upload-dropzone.tsx` | Mostly clean, uses Shadcn tokens, remove file buttons missing focus-visible | IMPROVE | Self — add focus-visible to remove buttons | P2 | Low |
| `requirements-sidebar.tsx` | Requirement buttons missing focus-visible, arbitrary text-[13px]/text-[10px], pp-* tokens | IMPROVE | Self — fix focus, type scale, token migration | P1 | Medium |
| `proposal-card.tsx` | `<div onClick>` CRITICAL ARIA violation, raw blue/purple tokens, actions invisible to keyboard | REPLACE | Convert to `<Link>` with full interaction states | P1 | Medium |
| `kb-item-card.tsx` | Custom dropdown (no Radix), "..." button no aria-label, h-6 w-6 touch target (24px, below 44px), raw cyan/purple tokens | REPLACE | Use Radix DropdownMenu, fix token migration | P1 | High |
| `brand-voice-profile-card.tsx` | Clean, uses Shadcn tokens correctly, no interaction issues (display-only) | KEEP | — | — | — |
| `proposal-editor/editor-toolbar.tsx` | ToolbarButton missing focus-visible, no aria-pressed for active state, text labels only (no icons) | IMPROVE | Self — add focus-visible, aria-pressed, icon+label upgrade | P1 | Medium |
| `proposal-editor/index.tsx` | ConfidenceBadge uses pp-* tokens, no AnimatePresence on streaming state changes | IMPROVE | Self — token migration, add AnimatePresence on state transitions | P2 | Medium |
| `app-shell.tsx` | h-11 header (44px, below 56px spec), no skip-to-content link, pp-* tokens | IMPROVE | Self — height fix, add skip link, token migration | P1 | Low |
| `FilterTabs` (inline in pages) | `<button>` with no role="tab"/aria-selected, no focus-visible, active uses bg-primary (wrong token) | CUSTOM | Reusable `<FilterTabBar>` component | P1 | Medium |
| `DashboardPage` loading state | `<Loader2>` spinner (banned per anti-slop), no shape-matched skeleton | CUSTOM | `<ProposalTableSkeleton>` component | P1 | Low |
| Landing page | Centered hero, gradient text, 3-column icon grid, raw Slate/Indigo tokens — all banned patterns | CUSTOM | Full landing redesign to split-screen layout | P2 | High |
| `onboarding/page.tsx` | text-2xl H1 (inconsistent with other pages at text-xl), muted-foreground not migrated token | IMPROVE | Self — standardize H1 size, token migration | P3 | Low |

---

## Execution order

Execute in this sequence — base atoms before molecules, molecules before organisms, organisms before pages. Motion work is last.

**Batch 1 — Atom foundation (no dependencies)**
1. `skeleton.tsx` — fix shimmer first (used by requirements-sidebar and proposal-editor)
2. `badge.tsx` — fix focus:ring → focus-visible:ring, add status variants (used everywhere)
3. `input.tsx` — add hover:, height 40px, token migration (used by all forms)
4. `button.tsx` — add active: states, height corrections, token alignment (used everywhere)
5. `progress.tsx` — add ARIA attributes, token migration

**Batch 2 — Navigation & shell (used on every route)**
6. `app-shell.tsx` — skip link, header height, token migration
7. `sidebar.tsx` — focus-visible on nav links, text-[11px] → text-xs, token migration

**Batch 3 — Molecules (depend on atoms)**
8. `proposal-card.tsx` — REPLACE: div onClick → Link, all interaction states, token migration (P1 CRITICAL ARIA)
9. `kb-item-card.tsx` — REPLACE: custom dropdown → Radix DropdownMenu, aria-label, touch target fix, token migration
10. `upload-dropzone.tsx` — focus-visible on remove buttons

**Batch 4 — Organisms (depend on atoms + molecules)**
11. `new-proposal-dialog.tsx` — htmlFor/id pairing, Dialog.Description, token migration
12. `kb-upload-form.tsx` — htmlFor/id pairing, focus-visible on file picker, token migration
13. `kb-search-panel.tsx` — focus-visible on search input and results, token migration
14. `requirements-sidebar.tsx` — focus-visible on requirement buttons, type scale fix, token migration
15. `proposal-editor/editor-toolbar.tsx` — focus-visible, aria-pressed, type improvements
16. `proposal-editor/index.tsx` — token migration, AnimatePresence on streaming states

**Batch 5 — Custom components (no existing base)**
17. `FilterTabBar` — new reusable accessible tab component (used in dashboard, KB, settings)
18. `ProposalTableSkeleton` — shape-matched loading skeleton for dashboard proposals table

**Batch 6 — Pages (use all of the above)**
19. `dashboard/page.tsx` — swap inline FilterTabs for FilterTabBar, swap spinner for ProposalTableSkeleton, token migration
20. `onboarding/page.tsx` — standardize H1, token migration
21. Landing page components — full redesign against anti-slop rules

---

## Component specs

### button.tsx
**Decision: IMPROVE**
Reason: Missing `active:` states (confirmed by audit: 47 elements, zero active: classes codebase-wide). Height spec mismatch: current `h-10` (40px) for default, spec says 40px — correct. `h-9` for sm (36px), spec says 36px — correct. `h-11` for lg (44px), spec says 44px — correct. However `ring-ring` must migrate to use `--accent` token. `bg-primary` must map to `--accent`. `rounded-md` should be `rounded-[var(--radius-md)]` = 8px.

Target: Self — extend `buttonVariants` in cva
States required: default | hover ✅ | focus-visible ✅ | **active ❌** | disabled ✅ | loading (via Loader2 child)
Responsive behavior: Same across breakpoints. icon size stays 40px on all.
Token migration:
- `ring-ring` → `ring-[hsl(var(--accent))]`
- `bg-primary` → `bg-[hsl(var(--accent))]`
- `text-primary-foreground` → `text-[hsl(var(--accent-foreground))]`
- `hover:bg-primary/90` → `hover:bg-[hsl(var(--accent-hover))]`
- `bg-secondary` → `bg-[hsl(var(--background-subtle))]`
- `bg-accent` (ghost/outline hover) → `bg-[hsl(var(--background-subtle))]`
Accessibility fixes: Add `active:scale-[0.98]` for tap feedback. Add `aria-busy` when loading variant used.
Priority: P1
Complexity: Low

---

### input.tsx
**Decision: IMPROVE**
Reason: Missing `hover:` state — audit line 22 confirms "No hover state". Height is `h-9` (36px), spec requires 40px (`h-10`). Border color `border-input` must migrate to `border-[hsl(var(--border))]`. `focus-visible:ring-ring` must migrate to `--accent`.

Target: Self
States required: default | **hover ❌** | focus-visible ✅ | active (N/A for inputs) | disabled ✅ | error (new — via `data-[invalid]` or `aria-invalid`)
Responsive behavior: Full-width at all breakpoints (already w-full).
Token migration:
- `border-input` → `border-[hsl(var(--border))]`
- `bg-background` → `bg-[hsl(var(--background))]`
- `placeholder:text-muted-foreground` → `placeholder:text-[hsl(var(--foreground-dim))]`
- `focus-visible:ring-ring` → `focus-visible:ring-[hsl(var(--accent))]`
Accessibility fixes:
- Callers must add `id` + `htmlFor` pairs (tracked separately per form component)
- Add `aria-invalid` support: `aria-invalid:border-[hsl(var(--danger))]`
- Add `hover:border-[hsl(var(--border))]` (slightly darker on hover)
Priority: P1
Complexity: Low

---

### badge.tsx
**Decision: IMPROVE**
Reason: Uses `focus:ring-2` not `focus-visible:ring-2` — mouse clicks trigger ring (audit line 23, severity HIGH). The primary colors for status badges (IN_PROGRESS, REVIEW, CAPABILITY) use raw `blue-950`, `purple-950`, `cyan-950` Tailwind classes not in the token system — callers must use new semantic variants. The badge component itself needs new `status-info`, `status-secondary-info`, `status-teal` variants to replace these.

Target: Self — extend variants in cva
States required: default | hover ✅ (per variant) | **focus-visible ❌ (fix focus→focus-visible)** | active N/A | disabled ❌ (add)
Responsive behavior: Inline, no responsive changes needed.
Token migration:
- `focus:ring-2 focus:ring-ring` → `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]`
- Add variant `info`: `bg-[hsl(var(--info-bg))] text-[hsl(var(--info))]`
- Add variant `info-secondary`: `bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]`
- Add variant `success`: `bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]`
- Add variant `warning`: `bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))]`
- Add variant `danger`: `bg-[hsl(var(--danger-bg))] text-[hsl(var(--danger))]`
Accessibility fixes: Remove `focus:` ring (fires on mouse); keep only `focus-visible:`.
Priority: P1
Complexity: Low

---

### progress.tsx
**Decision: IMPROVE**
Reason: Missing ARIA semantics (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`). Uses `bg-secondary` for track and `bg-primary` for fill — both must migrate to tokens. `transition-all duration-300` is acceptable but should use `ease-out` explicit easing.

Target: Self
States required: default (animated fill only)
Responsive behavior: Width driven by parent (already w-full).
Token migration:
- `bg-secondary` → `bg-[hsl(var(--background-subtle))]`
- `bg-primary` → `bg-[hsl(var(--accent))]`
Accessibility fixes:
- Add `role="progressbar"` to outer div
- Add `aria-valuenow={clamped}` `aria-valuemin={0}` `aria-valuemax={100}`
- Add `aria-label` prop support
Priority: P2
Complexity: Low

---

### skeleton.tsx
**Decision: IMPROVE**
Reason: Shimmer animation uses `linear` easing and incorrect gradient spec (audit P2 MEDIUM). Current: `from-muted via-muted-foreground/10 to-muted` with `animate-shimmer`. Correct per motion-patterns.md: `linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.06) 50%, transparent 75%)` with `background-size: 200% 100%` and GPU-composited `background-position` animation.

Target: Self — rewrite className to use proper CSS inline style for shimmer
States required: animating (always)
Token migration:
- Replace Tailwind gradient classes with inline `style={{ background: '...', backgroundSize: '200% 100%' }}`
- Animate via `animate-shimmer` (update keyframe in tailwind.config.ts to use background-position not opacity)
- Track color should use `hsl(var(--background-subtle))` / `hsl(var(--border-subtle))`
Accessibility fixes: Add `aria-hidden="true"` — skeletons are decorative
Priority: P1
Complexity: Low

---

### sidebar.tsx
**Decision: IMPROVE**
Reason: All nav Links missing `focus-visible:` ring — audit line 31-32 CRITICAL keyboard failure. Arbitrary `text-[11px]` on version string (audit P3 MEDIUM). All `pp-*` tokens must migrate. Sidebar width is `w-60` (240px), spec is 256px (`w-64`).

Target: Self
States required: default | hover ✅ | **focus-visible ❌** | active ✅ (via isActive) | disabled N/A
Responsive behavior: Fixed overlay on mobile (`-translate-x-full` / `translate-x-0`), static on md+. Correct.
Token migration:
- `bg-pp-background-card` → `bg-[hsl(var(--background-subtle))]`
- `border-pp-border` → `border-[hsl(var(--border))]`
- `text-pp-accent` → `text-[hsl(var(--accent))]`
- `bg-pp-accent/10` → `bg-[hsl(var(--accent-muted))]`
- `text-pp-foreground-muted` → `text-[hsl(var(--foreground-muted))]`
- `hover:bg-pp-background-elevated` → `hover:bg-[hsl(var(--background-elevated))]`
Accessibility fixes:
- Add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:outline-none` to each `<Link>` className
- `text-[11px]` → `text-xs` (12px)
- Wrap nav in `<nav aria-label="Main navigation">`
- `w-60` → `w-64` (256px per spec)
Priority: P1
Complexity: Medium

---

### new-proposal-dialog.tsx
**Decision: IMPROVE**
Reason: Three form inputs have `<label>` without `htmlFor` (audit SERIOUS ARIA violation). RFP picker button missing `focus-visible:` ring (audit line 36). `aria-describedby={undefined}` explicitly suppressed — Radix emits warning, screen readers receive no dialog description. Dialog Content uses `rounded-xl` and `max-w-md` (448px), spec is 560px `max-w-[560px]` and `rounded-2xl` (16px).

Target: Self
States required: Form inputs: default | hover | focus-visible | disabled ✅ | error ✅. Dialog: open/close animations ✅ (Radix data-state).
Responsive behavior: Full-width on mobile with `w-full max-w-[560px] mx-4`.
Token migration:
- `border-border` → `border-[hsl(var(--border))]`
- `bg-card` → `bg-[hsl(var(--background-elevated))]`
- `border-primary/60` → `border-[hsl(var(--accent)/0.6)]`
- All hover/focus states migrate to accent tokens
Accessibility fixes:
- Input `id="proposal-title"` + label `htmlFor="proposal-title"`
- Input `id="proposal-client"` + label `htmlFor="proposal-client"`
- Button `id="proposal-rfp"` + label `htmlFor="proposal-rfp"` (or `aria-labelledby`)
- Add `<Dialog.Description className="sr-only">` with brief description text
- RFP picker button: add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2`
Priority: P1
Complexity: Medium

---

### kb-search-panel.tsx
**Decision: IMPROVE**
Reason: Raw `<input>` uses `focus:outline-none focus:ring-1` (not focus-visible, audit line 39 HIGH). Result item buttons missing focus-visible ring (audit line 40). Uses mixed `pp-*` tokens and Shadcn `border-primary/40`. Text sizes `text-[11px]` and `text-[10px]` are off-scale (audit P3 HIGH).

Target: Self
States required: Search input: default | hover ❌ | focus-visible ❌→fix | disabled N/A. Result buttons: default | hover ✅ (selected) | focus-visible ❌→fix | active ❌.
Responsive behavior: Fixed width `w-64` (256px), part of 3-panel editor layout. Should collapse to off-canvas panel on < 1024px.
Token migration:
- `border-pp-border` → `border-[hsl(var(--border))]`
- `bg-pp-background-card` → `bg-[hsl(var(--background-subtle))]`
- `bg-pp-background` → `bg-[hsl(var(--background))]`
- `text-pp-foreground` → `text-[hsl(var(--foreground))]`
- `text-pp-foreground-muted` → `text-[hsl(var(--foreground-muted))]`
- `border-primary/40 bg-primary/5` (selected) → `border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent-muted))]`
- `text-[11px]` / `text-[10px]` → `text-xs` (12px)
Accessibility fixes:
- Raw `<input>` focus: `focus:` → `focus-visible:`
- Add `aria-label="Search knowledge base"` to raw input
- Result buttons: add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1`
- Add `aria-selected` to result buttons (selected state)
Priority: P1
Complexity: Medium

---

### kb-upload-form.tsx
**Decision: IMPROVE**
Reason: Type and Title `<label>` elements have no `htmlFor` (audit SERIOUS). File picker button missing `focus-visible:` (audit line 43 HIGH). Raw `<select>` element with no Radix replacement.

Target: Self
States required: File picker button: default | hover ✅ | focus-visible ❌ | disabled ✅. Inputs: per input.tsx improvements.
Responsive behavior: Form container is full-width within its parent.
Token migration:
- `border-border bg-card` → `border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))]`
- `border-primary/60` → `border-[hsl(var(--accent)/0.6)]`
Accessibility fixes:
- `<select id="kb-type">` + `<label htmlFor="kb-type">`
- `<Input id="kb-title">` + `<label htmlFor="kb-title">`
- File picker button: add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:outline-none`
- Replace raw `<select>` with Radix Select (Shadcn Select component) for consistent styling and keyboard nav
Priority: P1
Complexity: Medium

---

### upload-dropzone.tsx
**Decision: IMPROVE**
Reason: Remove-file `<button>` elements missing `focus-visible:` ring (audit line 42). Uses Shadcn tokens (`border-border`, `bg-muted`, `text-muted-foreground`) which is correct direction but must align with new warm token values. The dropzone `<label>` wrapping a file input is accessible but has no visible focus ring when reached via keyboard.

Target: Self
States required: Remove buttons: default | hover ✅ | **focus-visible ❌** | active ❌. Dropzone label: default | hover ✅ | focus-visible ❌ (needs `focus-within:` ring on the label).
Responsive behavior: Full-width at all breakpoints (already).
Token migration:
- `border-border` → `border-[hsl(var(--border))]`
- `bg-muted/30` → `bg-[hsl(var(--background-subtle)/0.3)]`
- `bg-card` → `bg-[hsl(var(--background-elevated))]`
- `border-primary` → `border-[hsl(var(--accent))]`
- `bg-primary/5` → `bg-[hsl(var(--accent-muted))]`
- `text-primary` → `text-[hsl(var(--accent))]`
Accessibility fixes:
- Remove buttons: add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:outline-none`
- Dropzone label: add `has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[hsl(var(--accent))]` (CSS :has selector supported in all modern browsers)
Priority: P2
Complexity: Low

---

### requirements-sidebar.tsx
**Decision: IMPROVE**
Reason: Requirement buttons missing `focus-visible:` ring (audit line 41). Arbitrary `text-[13px]` (2 occurrences), `text-[11px]`, `text-[10px]` — 4 off-scale type sizes (audit P3 HIGH). All `pp-*` tokens must migrate. `✓ addressed` text is color-only success indicator without icon backup.

Target: Self
States required: Requirement buttons: default | hover ✅ | **focus-visible ❌** | active ❌ | disabled N/A. selected state: ✅.
Responsive behavior: Fixed width `w-72` (288px), collapses at < 1024px.
Token migration:
- `border-pp-border` → `border-[hsl(var(--border))]`
- `bg-pp-background-card` → `bg-[hsl(var(--background-subtle))]`
- `bg-pp-background-elevated/60` → `bg-[hsl(var(--background-elevated)/0.6)]`
- `text-pp-foreground` → `text-[hsl(var(--foreground))]`
- `text-pp-foreground-muted` → `text-[hsl(var(--foreground-muted))]`
- `border-primary/40 bg-primary/5` → `border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent-muted))]`
- `text-pp-success-text` → `text-[hsl(var(--success))]`
Accessibility fixes:
- Requirement buttons: add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1`
- `text-[13px]` → `text-sm` (14px) — closest scale match
- `text-[11px]`, `text-[10px]` → `text-xs` (12px)
- `✓ addressed` → replace with `<CheckCircle2 className="h-3 w-3" /> addressed` (icon + text, not color alone)
- Add `aria-pressed={isSelected}` to requirement toggle buttons
Priority: P1
Complexity: Medium

---

### proposal-card.tsx
**Decision: REPLACE (structural)**
Reason: `<div onClick>` is a CRITICAL ARIA violation (audit line 92) — not keyboard-focusable, not announced as interactive. Must become `<Link>` for accessibility. Actions column ("...") is `opacity-0 group-hover:opacity-100` — keyboard users cannot discover it. Raw `bg-blue-950 text-blue-400` and `bg-purple-950 text-purple-400` badge colors not in token system. All `pp-*` tokens must migrate.

Target: Convert outer `<div onClick>` to `<Link href={/proposals/${proposal.id}}>`. Convert "..." to always-visible-on-focus (use `group-hover:opacity-100 group-focus-within:opacity-100`).
States required: Row: default | hover ✅ | **focus-visible ❌** | active ❌. "..." button: per button.tsx.
Responsive behavior: Table-row layout on md+; compact stacked layout on mobile (future enhancement, P3).
Token migration:
- `bg-pp-border` → `border-[hsl(var(--border))]`
- `bg-pp-background-elevated` → `bg-[hsl(var(--background-elevated))]`
- `bg-blue-950 text-blue-400` → `bg-[hsl(var(--info-bg))] text-[hsl(var(--info))]`
- `bg-purple-950 text-purple-400` → `bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]`
- `bg-pp-warning-bg text-pp-warning-text` → `bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))]`
- `bg-pp-success-bg text-pp-success-text` → `bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]`
- `bg-pp-danger-bg text-pp-danger-text` → `bg-[hsl(var(--danger-bg))] text-[hsl(var(--danger))]`
- `text-pp-foreground-muted` → `text-[hsl(var(--foreground-muted))]`
- `text-pp-danger-text` → `text-[hsl(var(--danger))]`
Accessibility fixes:
- Replace `<div onClick>` with `<Link href=...>` wrapping the entire row minus the "..." button
- Add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:outline-none` to the Link
- "..." button: `opacity-0 group-hover:opacity-100` → add `group-focus-within:opacity-100`
- "..." button: add `aria-label={`More options for ${proposal.title}`}`
Priority: P1
Complexity: Medium

---

### kb-item-card.tsx
**Decision: REPLACE (dropdown only)**
Reason: Custom dropdown menu (`<div>` + `useState`) with no keyboard navigation (no arrow keys, no Escape-to-close) — audit line 84. "..." button is `h-6 w-6` (24px × 24px) — below 44px touch target minimum, audit CRITICAL. No `aria-label` on "..." button, audit CRITICAL. Raw `bg-cyan-950 text-cyan-400`, `bg-purple-950 text-purple-400`, `bg-blue-950 text-blue-400` token violations.

Target: Replace custom dropdown with Shadcn `DropdownMenu` (Radix DropdownMenu underneath). Increase "..." button to `h-8 w-8` (32px) — still below 44px but inside a card where full 44px would destroy layout. On mobile, the entire card tap area exceeds 44px. Alternatively, use `h-9 w-9` with negative margin compensation.
States required: "..." button: default | hover ✅ | focus-visible ✅ (Button atom) | active ❌. Dropdown items: default | hover ✅ | focus-visible ❌. Title expand button: **hover ❌ | focus-visible ❌**.
Responsive behavior: Card-grid layout, responsive via parent grid.
Token migration:
- `bg-pp-border bg-pp-background-card` → new tokens
- `bg-blue-950 text-blue-400` → `bg-[hsl(var(--info-bg))] text-[hsl(var(--info))]`
- `bg-purple-950 text-purple-400` → `bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]`
- `bg-cyan-950 text-cyan-400` → `bg-[hsl(var(--info-bg)/0.7)] text-[hsl(var(--info)/0.8)]` (interim; recommend adding teal token in future)
Accessibility fixes:
- Replace custom div dropdown with `<DropdownMenu>` (Shadcn — `npx shadcn-ui@latest add dropdown-menu`)
- "..." button: `h-6 w-6` → `h-8 w-8` minimum; add `aria-label={`Open menu for ${item.title}`}`
- Title expand button: add `hover:text-[hsl(var(--foreground))]` + `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:outline-none`
- Add `aria-expanded={expanded}` to title button
Priority: P1
Complexity: High

---

### proposal-editor/editor-toolbar.tsx
**Decision: IMPROVE**
Reason: `ToolbarButton` has no `focus-visible:` ring (audit line 50). Active state uses `bg-primary` which is wrong token. No `aria-pressed` for toggle buttons (B, I, H2, H3, UL, OL) — screen readers cannot determine active formatting state. Text-only labels (B, I, H2) — not localized and cryptic for non-English screen reader users.

Target: Self
States required: ToolbarButton: default | hover ✅ | **focus-visible ❌** | **active ❌** (add `active:scale-[0.97]`) | disabled N/A | pressed ✅ (via isActive, but needs aria-pressed).
Responsive behavior: Wraps on narrow screens (`flex-wrap` already in place).
Token migration:
- `bg-primary text-primary-foreground` (active) → `bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]`
- `bg-accent text-accent-foreground` (hover) → `bg-[hsl(var(--background-subtle))] text-[hsl(var(--foreground))]`
- `bg-muted/30` (toolbar bg) → `bg-[hsl(var(--background-subtle)/0.3)]`
- `border-border` → `border-[hsl(var(--border))]`
Accessibility fixes:
- Add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1 focus-visible:outline-none` to ToolbarButton
- Add `aria-pressed={isActive}` to ToolbarButton
- Add `title` attribute to each button (e.g., `title="Bold (Ctrl+B)"`) as tooltip label
Priority: P1
Complexity: Medium

---

### proposal-editor/index.tsx
**Decision: IMPROVE**
Reason: `ConfidenceBadge` uses `pp-*` tokens (`bg-pp-success-bg`, `bg-pp-warning-bg`, `bg-pp-danger-bg`). State transitions (generating → idle → error) are instant swaps with no AnimatePresence — audit P2 HIGH.

Target: Self — token migration + add AnimatePresence wrapping on conditional state UI
States required: Editor section: loading (skeleton) | generating (streaming) | idle | error. All transitions should use AnimatePresence with 150ms opacity.
Token migration:
- `bg-pp-success-bg text-pp-success-text` → `bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]`
- `bg-pp-warning-bg text-pp-warning-text` → `bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))]`
- `bg-pp-danger-bg text-pp-danger-text` → `bg-[hsl(var(--danger-bg))] text-[hsl(var(--danger))]`
Accessibility fixes:
- Add `aria-live="polite"` to the streaming content area so screen readers announce completion
- Add `aria-busy={isGenerating}` to the editor container
Priority: P2
Complexity: Medium

---

### app-shell.tsx
**Decision: IMPROVE**
Reason: Header height is `h-11` (44px); spec and audit P1 MEDIUM recommends `h-14` (56px) for standard app header. No skip-to-content link anywhere in app (audit: every app route FAIL for keyboard). `bg-pp-background` and `border-pp-border` must migrate.

Target: Self
States required: Mobile menu button: per Button atom improvements.
Responsive behavior: Header visible at all breakpoints. Mobile burger visible < md.
Token migration:
- `bg-pp-background` → `bg-[hsl(var(--background))]`
- `border-pp-border` → `border-[hsl(var(--border))]`
Accessibility fixes:
- Add skip-to-content link as first child: `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ...">Skip to content</a>`
- Add `id="main-content"` to the `<main>` element
- `h-11` → `h-14` on header
Priority: P1
Complexity: Low

---

### FilterTabBar (CUSTOM — new component)
**Decision: CUSTOM**
Reason: Inline `<button>` tab implementations in `/dashboard/page.tsx`, `/knowledge-base/page.tsx`, and `/settings/page.tsx` have 3 CRITICAL ARIA violations (no role="tab"/role="tablist"/aria-selected). No focus-visible rings. Active state uses `bg-primary text-primary-foreground` (wrong token — resolves to near-white in dark mode per audit). Each page reimplements the same pattern. Extract to a single reusable component.

Target: New file `src/components/molecules/filter-tab-bar.tsx`
States required: Tab button: default | hover ✅ | **focus-visible ❌ (add)** | active ✅ (via isActive) | disabled (optional) | count badge ✅.
Responsive behavior: `flex-wrap` for overflow; tabs should scroll horizontally on narrow mobile screens rather than wrapping to multiple rows.
Token migration: All new tokens from the start.
Accessibility fixes:
- Outer container: `<div role="tablist" aria-label={ariaLabel}>`
- Each button: `role="tab"` `aria-selected={isActive}` `tabIndex={isActive ? 0 : -1}`
- Arrow key navigation (← → between tabs, standard tablist keyboard pattern)
- Count badge is decorative: `aria-hidden="true"` on the count span
Priority: P1
Complexity: Medium

```tsx
// Component shape
interface FilterTab<T extends string> {
  label: string;
  value: T;
  count?: number;
}

interface FilterTabBarProps<T extends string> {
  tabs: FilterTab<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}
```

---

### ProposalTableSkeleton (CUSTOM — new component)
**Decision: CUSTOM**
Reason: Dashboard loading state uses `<Loader2>` spinner + text — banned per anti-slop rules (audit P2 HIGH). Must be replaced with shape-matched skeleton rows that mirror the ProposalCard layout (icon column + title/subtitle block + status badge block + deadline + progress bar + date).

Target: New file `src/components/molecules/proposal-table-skeleton.tsx`
States required: Animating skeleton shimmer only.
Responsive behavior: Matches ProposalCard column widths exactly.
Token migration: All new tokens from the start.
Accessibility fixes:
- Wrap in `<div aria-busy="true" aria-label="Loading proposals">`
- Each skeleton row: `aria-hidden="true"`
- Use `role="status"` on the container so screen readers announce loading
Priority: P1
Complexity: Low

```tsx
// Renders N skeleton rows (default 5) matching ProposalCard layout
interface ProposalTableSkeletonProps {
  rows?: number; // default 5
}
```

---

### Landing page (CUSTOM — redesign)
**Decision: CUSTOM**
Reason: Every major anti-slop pattern is present (audit P1 HIGH):
1. Centered H1 with gradient text — BANNED (hero.tsx L6, L22–25)
2. Three-column identical icon grid (features.tsx L42, problem-solution.tsx L33) — BANNED
3. Raw `#060b18` background (7 files) — must use token
4. 40+ raw Slate/Indigo Tailwind classes — zero token usage
5. Indigo radial glow blob (`h-[600px] w-[600px]`) — arbitrary, off-grid, dated

Target: Redesign all landing components:
- `hero.tsx` → split-screen: left-aligned headline + CTA / right side: product screenshot or feature preview
- `features.tsx` → bento grid with 1 large featured card + 4 smaller cards (varied sizes)
- `problem-solution.tsx` → single-column with alternating layout (text left/right)
- All components: migrate from raw Slate/bg-[#060b18] to dark-mode semantic tokens

States required: CTAs per button spec. Nav links: hover + focus-visible. All interactive elements.
Responsive behavior: Split-screen collapses to single-column below 768px. Bento grid reflows to 2×2 or single column.
Token migration: Complete — no raw Tailwind color classes remain.
Accessibility fixes:
- Add skip-to-main-content link in nav
- Landing nav anchor links: add `focus-visible:ring-2`
- CTA "See how it works" (hero.tsx L41): add focus-visible ring
Priority: P2
Complexity: High

---

## Deferred decisions

The following were flagged during review and documented for tracking:

1. **Teal token for CAPABILITY badge type** — `bg-cyan-950 text-cyan-400` currently maps to interim `info-bg/info` workaround. A dedicated `--teal` / `--teal-bg` semantic token should be added in `globals.css` Phase 2 if the capability category is prominent enough to warrant distinction from info.

2. **Select component** — `kb-upload-form.tsx` uses a raw `<select>`. Recommended: `npx shadcn-ui@latest add select` (Radix Select) for consistent styling, keyboard nav, and portal behavior. Tracked as part of KBUploadForm improvement (P1).

3. **Mobile ProposalCard** — Currently table-row layout on all screens. A card-stacked mobile layout is a P3 enhancement deferred to post-Phase-2 iteration.

4. **Framer Motion installation** — `framer-motion` is not installed (audit CRITICAL P2). Required before any motion work in Phase 2 (`npm install framer-motion`). The AnimatePresence-based transitions for proposal-editor/index.tsx, FilterTabBar tab indicators, and page-level transitions all depend on this.
