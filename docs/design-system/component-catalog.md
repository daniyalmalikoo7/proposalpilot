# Component Catalog — ProposalPilot

Generated: 2026-04-12
Phase: 4 — Ship & Document
Scope: All components modified or created during the Phase 2 uplift.

For each component: location, all interaction states, code example, and post-uplift status.

---

## Atoms

### Button

**File:** `src/components/atoms/button.tsx`
**Built with:** CVA (class-variance-authority) + Tailwind tokens

**Variants:**
- `primary` — `bg-accent text-accent-foreground` — main CTA
- `secondary` — `bg-background-subtle text-foreground` — secondary actions
- `ghost` — transparent bg, `text-foreground` — tertiary/icon actions
- `destructive` — `bg-danger text-white` — delete/irreversible actions
- `outline` — `border-border bg-transparent` — low-emphasis actions

**Sizes:** `sm` (h-8), `md` (h-10, default), `lg` (h-11)

**All states:**
```tsx
// Default
<Button>Save</Button>

// Hover — bg shifts to accent-hover (CSS transition-colors 150ms)
// Active — scale-[0.98] (active: pseudo-class)
// Focus-visible — 2px outline in accent color, 2px offset
// Disabled — opacity-50, cursor-not-allowed, pointer-events-none
// Loading — spinner replaces content, aria-busy="true", disabled
```

**Code pattern:**
```tsx
import { Button } from "@/components/atoms/button";

// Primary CTA
<Button variant="primary" size="md" onClick={handleSave}>
  Save proposal
</Button>

// Loading state
<Button variant="primary" loading={isSaving} disabled={isSaving}>
  {isSaving ? "Saving…" : "Save proposal"}
</Button>

// Destructive
<Button variant="destructive" size="sm">
  Delete
</Button>
```

**Post-uplift status:** ✅ All 4 states confirmed. `active:scale-[0.98]` tap feedback. `focus-visible` ring. `disabled:opacity-50`. Loading state with spinner.

---

### Badge

**File:** `src/components/atoms/badge.tsx`
**Variants:** `default`, `success`, `warning`, `danger`, `info`, `info-secondary`, `outline`

**All states:**
- No interactive states (Badge is display-only)
- Every variant uses semantic tokens from the status system

**Code pattern:**
```tsx
// Status badge — ALWAYS pair color with text or icon
<Badge variant="success">
  <CheckCircle2 className="h-3 w-3 mr-1" />
  Active
</Badge>

<Badge variant="danger">
  <AlertCircle className="h-3 w-3 mr-1" />
  Overdue
</Badge>

<Badge variant="info">In Progress</Badge>
<Badge variant="warning">Pending Review</Badge>
```

**Rule:** Color alone is never sufficient. Every badge that communicates status must have a text label. Icon is recommended for Overdue/Active/Error states.

**Post-uplift status:** ✅ Token-based variants. All status colors use semantic tokens (no `blue-950`, `purple-950`, `cyan-950`).

---

### Page Transition

**File:** `src/components/atoms/page-transition.tsx`
**Purpose:** Soft opacity+y animation on every route change.

```tsx
// Applied automatically via src/app/(app)/layout.tsx
// Do not add route-level page transitions separately.

import { PageTransition } from "@/components/atoms/page-transition";

// In layout:
<PageTransition>
  {children}
</PageTransition>
```

**Reduced motion:** Respects `prefers-reduced-motion` via `useReducedMotion()`.

**Post-uplift status:** ✅ Implemented. All auth routes covered. No separate route wrappers needed.

---

## Molecules

### FilterTabBar

**File:** `src/components/molecules/filter-tab-bar.tsx`
**Used on:** `/dashboard`, `/knowledge-base`, `/settings`

**States:**
- Default tab — `text-foreground-muted`
- Active tab — `text-accent` + `bg-accent-muted` underlay (animated with `layoutId`)
- Hover tab — `bg-background-subtle` (CSS hover)
- Focus-visible — accent outline ring

**Accessibility:**
- Container: `role="tablist"`
- Each tab button: `role="tab"`, `aria-selected={isActive}`, `tabIndex={isActive ? 0 : -1}`

**Code pattern:**
```tsx
import { FilterTabBar } from "@/components/molecules/filter-tab-bar";

<FilterTabBar
  tabs={[
    { id: "all",      label: "All",      count: 12 },
    { id: "active",   label: "Active",   count: 4 },
    { id: "draft",    label: "Drafts",   count: 8 },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  layoutId="dashboard-filter-tabs"  // unique per page
/>
```

**Post-uplift status:** ✅ Animated indicator. ARIA roles. Focus rings. Known issue: `py-1.5` tab height = ~28px on mobile (below 44px). Tracked as post-ship HIGH.

---

### ProposalTableSkeleton

**File:** `src/components/molecules/proposal-table-skeleton.tsx`
**Purpose:** Shape-matched loading skeleton for the proposals table.

```tsx
import { ProposalTableSkeleton } from "@/components/molecules/proposal-table-skeleton";

// In dashboard:
{isLoading ? <ProposalTableSkeleton rows={5} /> : <ProposalTable proposals={data} />}
```

**Post-uplift status:** ✅ Replaces the old `Loader2` spinner. Shape matches the real table (title column, status badge, date, actions). Shimmer animation via `animate-shimmer`.

---

## Organisms

### AppShell

**File:** `src/components/organisms/app-shell.tsx`
**Changes:**
- Skip-to-content link added: `<a href="#main-content" className="skip-to-content">Skip to content</a>`
- Header height standardized to `h-14` (56px)
- Main content area has `id="main-content"` for skip-link target

**Post-uplift status:** ✅ Skip link. Correct header height. `focus-visible` on skip link shows it on keyboard navigation.

---

### Sidebar

**File:** `src/components/organisms/sidebar.tsx`
**Changes:**
- Active nav item uses `layoutId="sidebar-active"` for animated background indicator
- Token cleanup: all `pp-*` references removed
- Collapsed state: icon-only with `tooltip` on hover

```tsx
// Active indicator pattern:
{isActive && (
  <motion.div
    layoutId="sidebar-active"
    className="absolute inset-0 rounded-md bg-background-subtle"
    transition={{ type: "spring", stiffness: 300, damping: 24 }}
  />
)}
```

**Post-uplift status:** ✅ Animated active indicator. Token-clean. Accessible nav landmark.

---

## Landing Page Components

### Hero

**File:** `src/app/_components/landing/hero.tsx`
**Before:** Centered hero, gradient H1, centered CTA — canonical AI slop.
**After:** Split-screen layout. Left: text-left content ladder. Right: product mockup panel.

```tsx
// Layout structure (not centered):
<section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div className="space-y-6">
    <h1 className="text-4xl font-bold tracking-tighter text-foreground">...</h1>
    <p className="text-lg text-foreground-muted max-w-prose">...</p>
    <div className="flex gap-3">
      <Button variant="primary" size="lg">Get started</Button>
      <Button variant="ghost" size="lg">See how it works</Button>
    </div>
  </div>
  <div className="relative">
    {/* Product UI mockup panel */}
  </div>
</section>
```

**Anti-slop checks:**
- ❌ No centered layout — split-screen ✅
- ❌ No gradient H1 — `text-foreground` solid ✅
- ❌ No gradient button — solid `bg-accent` ✅
- ❌ No glow blob — removed ✅

**Post-uplift status:** ✅ Route score: 4.0 → 8.5.

---

### Features (Bento Grid)

**File:** `src/app/_components/landing/features.tsx`
**Before:** Three-column icon grid (banned pattern).
**After:** Bento grid with varied card sizes for visual hierarchy.

```tsx
// Bento grid — NOT identical 3-column:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <FeatureCard className="lg:col-span-2" featured />  {/* wider featured card */}
  <FeatureCard />
  <FeatureCard />
  <FeatureCard className="lg:col-span-2" />
</div>
```

**Post-uplift status:** ✅ Varied sizes. No emoji icons (uses Lucide icons). All tokens.

---

## Form Components

### Inputs (Shadcn Input)

**Accessibility requirements (enforced post-uplift):**
- Label must be visible and associated via `htmlFor` / `id` pair
- Placeholder is supplementary only — never a substitute for a label
- Error state: inline message below input with `text-danger`
- Focus: `focus-visible:ring-2 focus-visible:ring-accent`

```tsx
// Correct pattern:
<div className="space-y-1.5">
  <Label htmlFor="org-name">Organization name</Label>
  <Input
    id="org-name"
    placeholder="Acme Corp"
    value={value}
    onChange={onChange}
  />
  {error && (
    <p className="text-sm text-danger">{error}</p>
  )}
</div>
```

**Post-uplift status:** ✅ All form labels associated. `htmlFor`/`id` pairs confirmed in: `new-proposal-dialog.tsx`, `kb-upload-form.tsx`, `settings/page.tsx`.

---

## State: Interactive Element Checklist

Every interactive element in this codebase must have all four states:

| State | Implementation |
|-------|---------------|
| **Hover** | `hover:bg-*` or `hover:text-*` with `transition-colors duration-150` |
| **Focus-visible** | `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` |
| **Active/Pressed** | `active:scale-[0.98]` or `active:bg-*` (darker than hover) |
| **Disabled** | `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none` |

If adding a new interactive element and any state is missing, the component is incomplete.

---

## Known Gaps (Post-Ship Tracked)

| Component | Gap | Severity | Ticket |
|-----------|-----|----------|--------|
| `FilterTabBar` | Tab buttons `py-1.5` = ~28px on mobile (below 44px) | HIGH | post-ship sprint |
| Toolbar buttons in editor | `px-2 py-1` = ~26px on mobile | HIGH | post-ship sprint |
| `RequirementsSidebar` `<aside>` × 3 | Missing `aria-label` | MODERATE | post-ship sprint |
| `KBSearchPanel` `<aside>` | Missing `aria-label` | MODERATE | post-ship sprint |
| Requirement priority badges | Text label only, no icon (ArrowUp/Minus/ArrowDown) | MINOR | backlog |
| Dialog close button `h-7 w-7` | 28px on mobile | MINOR | backlog |
