# Maintenance Guide — ProposalPilot Design System

Generated: 2026-04-12
Phase: 4 — Ship & Document
For: Any engineer adding features, building components, or modifying the UI.

---

## TL;DR

1. Use tokens. Never hardcode colors, spacing, or radius.
2. Use Shadcn first, then Radix, then custom.
3. Every interactive element needs hover, focus-visible, active, disabled.
4. Every animation needs a stated purpose and must use GPU-accelerated properties.
5. Run `tsc + lint + build` before committing. They must pass.

---

## How to Add a New Token

Only add tokens when a semantic need isn't met by existing tokens. Before adding, check:
1. Is there an existing token that semantically fits? (e.g., use `background-subtle` for panel backgrounds before adding a new surface token)
2. Is this truly a new semantic category, or a one-off?

**If you must add a token:**

1. Add the CSS custom property to `globals.css` `:root` (light value) and `.dark` (dark value):
```css
/* globals.css */
:root {
  --sidebar-width: 260px;   /* layout token — no dark variant needed */
}

:root {
  --surface-highlight: 44 100% 96%;   /* color token */
}
.dark {
  --surface-highlight: 44 80% 12%;    /* must have dark variant */
}
```

2. Add the Tailwind binding in `tailwind.config.ts`:
```ts
// tailwind.config.ts
colors: {
  "surface-highlight": "hsl(var(--surface-highlight))",
}
```

3. Document it in `docs/design-system/token-reference.md`.

**Never:** Add a token without a dark mode value for color tokens. Never add a token that duplicates an existing semantic category.

---

## How to Add a New Component

Follow the assembly test (in order):

1. **Does Shadcn have it?** → `npx shadcn-ui@latest add [name]` — configure with tokens
2. **Does Radix have a primitive?** → Install from `@radix-ui/react-*`, style with Tailwind tokens
3. **Improve existing?** → Extend what's there; don't create a duplicate
4. **Build custom** → Use the template below

**Component template:**
```tsx
// src/components/[atoms|molecules|organisms]/my-component.tsx

import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface MyComponentProps extends ComponentProps<"div"> {
  variant?: "default" | "muted";
}

export function MyComponent({
  variant = "default",
  className,
  children,
  ...props
}: MyComponentProps) {
  return (
    <div
      className={cn(
        // Base: layout and structure
        "rounded-lg border border-border p-4",
        // Variant styles
        variant === "default" && "bg-background-elevated",
        variant === "muted" && "bg-background-subtle",
        // Merge consumer className
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

**Checklist before shipping a new component:**
- [ ] All colors use semantic tokens (no `bg-gray-*`, `text-slate-*`)
- [ ] All spacing on 4/8px grid (no `p-[13px]`, `gap-[22px]`)
- [ ] Border radius from scale (no `rounded-[7px]`)
- [ ] Interactive elements have hover, focus-visible, active, disabled states
- [ ] Accepts and forwards `className` via `cn()`
- [ ] Under 300 lines — extract if needed
- [ ] No business logic inside the component — props and handlers only

---

## How to Add a New Animation

Read `docs/design-system/motion-library.md` first.

**Decision tree:**
1. Is this a state change on an existing component? → Add `transition-colors duration-150` or `active:scale-[0.98]` via CSS. No Framer Motion needed.
2. Is this an element entering or exiting conditionally? → Use `AnimatePresence` + `motion.div` with `initial`/`animate`/`exit`.
3. Is this a shared layout transition (tab indicator, sliding panel)? → Use `layoutId`.
4. Is this a list stagger? → Use container + item variants with `staggerChildren: 0.04`.

**Before shipping any animation:**
- [ ] Can you state the purpose in one sentence?
- [ ] Duration ≤400ms?
- [ ] Easing is `ease-out` or spring (not `linear`)?
- [ ] Only animating `transform` or `opacity`?
- [ ] `useReducedMotion()` respected for positional animations?
- [ ] `AnimatePresence` wraps any conditionally-rendered animated element?

---

## How to Update the Color Palette

The palette should not change frequently. If brand requirements demand a shift:

1. Update `globals.css` `:root` and `.dark` values for the affected tokens
2. Run `npm run build` — verify no TypeScript errors
3. Visually verify every route at light and dark mode (especially: landing, dashboard, editor)
4. Run axe-core to confirm contrast ratios still pass WCAG AA
5. Update `docs/design-system/token-reference.md` with new hex values

**Never:** Change individual component colors. Change the token value — all components update automatically.

---

## Quality Verification Before Deployment

Run this checklist before every deploy:

```bash
# 1. TypeScript — zero errors required
npx tsc --noEmit

# 2. Lint — zero errors required
npm run lint

# 3. Build — must succeed
npm run build

# 4. axe-core check (run dev server first, then):
# Open browser console: 
# const axe = await import('axe-core'); axe.run(document, {}, console.log)
# Zero Critical, zero Serious violations required.
```

The `.github/workflows/visual-quality.yml` runs tsc + lint + build + axe-core automatically on every PR.

---

## Anti-Patterns — What NOT to Do

These are drawn from the actual Phase 0 findings. Each one was found in this codebase before the uplift.

### BANNED: Hardcoded hex colors
```tsx
// ❌ BEFORE — caused active dark-mode bugs
className="bg-[#0a0f1a] text-[#e5e7eb]"

// ✅ AFTER
className="bg-background text-foreground"
```
**Why it's banned:** `#0a0f1a` is cold-blue, not warm-dark. The token value `--background` resolves to `#0f0e0d` (warm dark) — a subtle but meaningful difference. Hardcoded values cannot be themed.

---

### BANNED: pp-* token namespace (retired)
```tsx
// ❌ DEAD — pp-* no longer exists
className="bg-pp-background-card text-pp-foreground"
border-pp-border pp-accent

// ✅ CURRENT
className="bg-background-elevated text-foreground"
border-border accent
```
**Why it's banned:** The pp-* namespace ran parallel to Shadcn vars, causing conflicts in dark mode where `border-primary` (Shadcn) resolved to near-white while `border-pp-border` resolved to dark. This class of bugs was the impetus for the full uplift. The pp-* namespace is retired — do not reintroduce it.

---

### BANNED: Gradient text headings
```tsx
// ❌ BEFORE — AI slop, generically "tech startup"
<h1 className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
  Build better proposals
</h1>

// ✅ AFTER
<h1 className="text-foreground font-bold tracking-tighter">
  Build better proposals
</h1>
```
**Why it's banned:** Gradient text is the single most common LLM-generated design pattern. It reads as generic and unfinished to design-literate users. ProposalPilot's `warm-refined` visual tone relies on typographic weight and spacing — not color tricks.

---

### BANNED: Centered hero layout
```tsx
// ❌ BEFORE — centered, generic, forgettable
<section className="text-center py-20">
  <h1 className="text-5xl font-bold text-center">...</h1>
  <p className="text-center text-xl mt-4">...</p>
  <div className="flex justify-center mt-8">...</div>
</section>

// ✅ AFTER — split-screen, intentional, distinctive
<section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div className="space-y-6">
    <h1 className="text-4xl font-bold tracking-tighter">...</h1>
    ...
  </div>
  <div>{/* product visual */}</div>
</section>
```
**Why it's banned:** Centered heroes are the default layout for generic marketing sites. ProposalPilot is a saas-dashboard product — it should communicate capability and depth, not "another SaaS."

---

### BANNED: Three-column icon grid (features section)
```tsx
// ❌ BEFORE — the canonical "features" AI pattern
<div className="grid grid-cols-3 gap-6">
  <div className="text-center"><Icon /><h3>Feature</h3><p>...</p></div>
  <div className="text-center"><Icon /><h3>Feature</h3><p>...</p></div>
  <div className="text-center"><Icon /><h3>Feature</h3><p>...</p></div>
</div>

// ✅ AFTER — bento grid with hierarchy
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <FeatureCard className="lg:col-span-2" />  {/* featured — wider */}
  <FeatureCard />
  ...
</div>
```
**Why it's banned:** Three identical columns with icons is the single most recognizable LLM-generated layout pattern. Bento grids use varied sizes to create visual hierarchy.

---

### BANNED: Gradient primary buttons
```tsx
// ❌ NEVER
<button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
  Get started
</button>

// ✅ ALWAYS
<Button variant="primary">Get started</Button>
// which renders: bg-accent text-accent-foreground
```
**Why it's banned:** Gradient buttons are immediately identifiable as AI-generated UI. The warm-refined tone calls for solid, confident color usage.

---

### BANNED: Color as the only status indicator
```tsx
// ❌ Color alone — inaccessible and generic
<Badge className="bg-green-100 text-green-700" />  {/* no text, no icon */}
<div className="h-2 w-2 rounded-full bg-red-500" />  {/* just a dot */}

// ✅ Color + text (minimum) or color + icon
<Badge variant="success">Active</Badge>
<Badge variant="danger"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>
```
**Why it's banned:** 8% of users are red-green colorblind. A red dot communicating "overdue" is invisible to them. WCAG 1.4.1 requires color not to be the sole means of conveying information.

---

### BANNED: Spinner for page-level loads
```tsx
// ❌ Generic spinner — no context, disorienting
{isLoading && <Loader2 className="animate-spin h-8 w-8 mx-auto" />}

// ✅ Shape-matched skeleton
{isLoading ? <ProposalTableSkeleton /> : <ProposalTable />}
```
**Why it's banned:** Spinners give no indication of what is loading or how long it will take. Shape-matched skeletons set layout expectations and reduce CLS.

---

## Framer Motion Maintenance Notes

38 Framer Motion instances are in the codebase. Key patterns to understand:

1. **`AnimatePresence`** — Required for any element that conditionally renders. Without it, exit animations don't run.
2. **`layoutId`** — Used for tab indicators and sidebar active state. Must be unique per independent layout group.
3. **`useReducedMotion()`** — Call this hook when animating position (`y`, `x`, `scale`). Skip the animation if it returns `true`.
4. **`mode="wait"`** in AnimatePresence — Used for text swaps (save state). Ensures exit completes before enter begins.

When adding new Framer Motion usage, reference `docs/design-system/motion-library.md` for the specific pattern.

---

## File Structure Reference

```
src/
├── app/
│   ├── globals.css              ← TOKEN SOURCE OF TRUTH — do not split
│   ├── layout.tsx               ← Inter font, dark mode class strategy
│   ├── (app)/layout.tsx         ← PageTransition wraps all auth routes
│   └── _components/landing/     ← Landing page (anti-slop compliant)
├── components/
│   ├── atoms/                   ← Button, Badge, PageTransition, Input
│   ├── molecules/               ← FilterTabBar, ProposalTableSkeleton, cards
│   └── organisms/               ← AppShell, Sidebar, full-page compositions
└── lib/
    └── utils.ts                 ← cn() utility (clsx + tailwind-merge)
tailwind.config.ts               ← Tailwind token bindings (reads CSS vars)
```
