# Motion Library — ProposalPilot

Generated: 2026-04-12
Phase: 4 — Ship & Document
Dependency: Framer Motion ^12.38.0

Every animation in this codebase has a stated purpose. If you cannot state the purpose in one sentence, the animation does not ship.

---

## Motion Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `duration-instant` | 100ms | Micro-feedback (checkbox, toggle state) |
| `duration-fast` | 150ms | Button hover/tap, small state changes |
| `duration-normal` | 250ms | Page transitions, modal open/close |
| `duration-slow` | 400ms | Complex sequences, first-paint animations |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering or settling |
| `ease-in` | `cubic-bezier(0.7, 0, 1, 0.5)` | Elements exiting |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric transitions |
| `spring-snappy` | `{ stiffness: 300, damping: 24, mass: 0.8 }` | Interactive element feedback |
| `spring-gentle` | `{ stiffness: 150, damping: 20, mass: 1 }` | Layout shifts, panel resizing |

CSS keyframe aliases defined in `tailwind.config.ts`:
```css
animate-shimmer       /* shimmer 1.5s linear infinite */
animate-fade-in       /* fade-in 250ms ease-out forwards */
animate-fade-out      /* fade-out 150ms ease-in forwards */
animate-slide-in      /* slide-in-right 250ms ease-out forwards */
animate-scale-in      /* scale-in 250ms ease-out forwards */
```

---

## Pattern 1 — Page Transition

**File:** `src/components/atoms/page-transition.tsx`
**Purpose:** Confirm navigation occurred, soften route-to-route context switch.

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={shouldReduce ? undefined : pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Usage:** Applied in `src/app/(app)/layout.tsx` — wraps all authenticated routes automatically.
**Do not** add route-level AnimatePresence separately — it is already provided by the layout.

---

## Pattern 2 — List Stagger

**File:** Used in `src/app/(app)/dashboard/page.tsx` and `proposals/page.tsx`
**Purpose:** Guide the eye through an ordered list — makes the list feel alive on mount.

```tsx
const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

// Usage:
<motion.ul variants={containerVariants} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.li key={item.id} variants={itemVariants}>
      <ProposalCard {...item} />
    </motion.li>
  ))}
</motion.ul>
```

**Constraint:** Stagger delay `0.04s` × item count should not exceed 400ms total. For lists >10 items, cap stagger at `0.02s` or skip stagger entirely.

---

## Pattern 3 — Tab Indicator (Shared Layout)

**File:** `src/components/molecules/filter-tab-bar.tsx`, `src/components/organisms/sidebar.tsx`, `src/app/(app)/settings/page.tsx`
**Purpose:** Show which tab is active via smooth indicator movement — spatial relationship between tabs.

```tsx
// Indicator uses layoutId — Framer Motion animates it across positions automatically
{isActive && (
  <motion.div
    layoutId="filter-tab-active"  // unique per tab group
    className="absolute inset-0 rounded bg-accent-muted"
    transition={{ type: "spring", stiffness: 300, damping: 24 }}
  />
)}
```

**Critical:** Each tab group must have a unique `layoutId`. Reusing the same `layoutId` across separate FilterTabBar instances causes them to animate into each other.

---

## Pattern 4 — Skeleton Shimmer

**File:** `src/components/molecules/proposal-table-skeleton.tsx` and inline uses
**Purpose:** Indicate content is loading while matching the expected content shape.

```tsx
// Tailwind keyframe approach (CSS-only, no Framer Motion needed):
<div className="h-4 w-3/4 rounded bg-gradient-to-r from-background-subtle via-background-elevated to-background-subtle bg-[length:200%_100%] animate-shimmer" />

// Full skeleton pattern:
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      <div className="h-4 w-1/3 rounded animate-shimmer bg-gradient-to-r from-background-subtle via-background-elevated to-background-subtle bg-[length:200%_100%]" />
      <div className="h-4 w-1/4 rounded animate-shimmer bg-gradient-to-r from-background-subtle via-background-elevated to-background-subtle bg-[length:200%_100%]" />
      <div className="h-4 w-1/5 rounded animate-shimmer bg-gradient-to-r from-background-subtle via-background-elevated to-background-subtle bg-[length:200%_100%]" />
    </div>
  );
}
```

**Shape rule:** The skeleton must match the content layout. A table skeleton shows rows. A card skeleton shows card proportions. Never use a generic spinner for page-level loads.

---

## Pattern 5 — Button Micro-feedback

**File:** `src/components/atoms/button.tsx`
**Purpose:** Confirm the button is interactive (hover) and was tapped (active/click).

```tsx
// CSS-only approach used in codebase:
<button className="transition-all duration-150 hover:bg-accent-hover active:scale-[0.98] ..." />

// Framer Motion approach (for more complex buttons):
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

**Rule:** All interactive elements must have `active:scale-[0.98]` or equivalent tap feedback. This is defined in the shared Button component — do not reimplement per-component.

---

## Pattern 6 — Modal / Dialog

**File:** Radix `Dialog` + Shadcn `Dialog` components
**Purpose:** Focus attention, confirm a modal context is active.

```tsx
// Shadcn Dialog uses tailwindcss-animate with data-state attributes:
// data-[state=open]:animate-in data-[state=closed]:animate-out
// fade-in-0 zoom-in-95 for content
// fade-in-0 for overlay

// If adding custom dialog animations via Framer Motion:
const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 0.5, transition: { duration: 0.2 } },
  exit:    { opacity: 0,   transition: { duration: 0.15 } },
};
const contentVariants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1,    y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit:    { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.15 } },
};
```

**Exit rule:** Exit animations are always faster than enter animations (150ms vs 250ms). Closing feels snappy; opening feels considered.

---

## Pattern 7 — Save State / AnimatePresence Text Swap

**File:** `src/app/(app)/proposals/[id]/editor/proposal-editor-shell.tsx`
**Purpose:** Confirm save state changed without jarring text jump.

```tsx
<AnimatePresence mode="wait">
  <motion.span
    key={saveState} // triggers re-animation on state change
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.15 }}
    className="text-sm text-foreground-muted"
  >
    {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Unsaved changes"}
  </motion.span>
</AnimatePresence>
```

**`mode="wait"`:** Ensures the exit animation completes before the enter animation begins. Required for text swaps to avoid overlap.

---

## Pattern 8 — Multi-Stage Progress Panel

**File:** `src/app/(app)/settings/brand-voice/brand-voice-client.tsx` (AnalysisProgress)
**Purpose:** Show a long async operation's stages — reduces perceived wait time.

```tsx
const stages = ["Extracting text", "Analysing tone", "Building profile"];

<div className="space-y-2">
  {stages.map((stage, i) => (
    <motion.div
      key={stage}
      initial={{ opacity: 0, x: -8 }}
      animate={currentStage >= i ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
      transition={{ duration: 0.25, delay: i * 0.1 }}
      className="flex items-center gap-2"
    >
      {currentStage > i ? <CheckCircle2 className="text-success h-4 w-4" /> : <Loader2 className="animate-spin h-4 w-4 text-foreground-dim" />}
      <span className="text-sm">{stage}</span>
    </motion.div>
  ))}
</div>
```

---

## GPU Acceleration Rules

**Always animate (composited — no repaint):**
- `transform: translate, scale, rotate`
- `opacity`
- `filter: blur, brightness`

**Never animate (triggers layout/paint — will jank):**
- `width`, `height`, `min-height`, `max-height`
- `top`, `right`, `bottom`, `left`
- `margin`, `padding`
- `border-width`
- `font-size`, `line-height`

---

## Reduced Motion

Every Framer Motion component that animates position or scale must respect `prefers-reduced-motion`:

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    />
  );
}
```

`PageTransition` already applies this globally. For component-level animations, add the hook.

---

## Anti-Patterns

| Anti-pattern | Why | Correct approach |
|---|---|---|
| `linear` easing on UI interactions | Feels robotic/mechanical | Use `ease-out` or spring for enter, `ease-in` for exit |
| Duration >500ms | Feels laggy | Cap at 400ms for complex, 250ms for standard |
| Duration <80ms | Too fast to register | Minimum 100ms for any perceivable animation |
| Animating `width`/`height` | Triggers layout — causes jank | Animate `scaleX`/`scaleY` or use `AnimatePresence` with height:auto |
| Missing `AnimatePresence` wrapper | Exit animations never run | Wrap any conditionally-rendered animated element |
| `useState` for hover animation | Causes React re-renders on hover | Use `whileHover` / `whileTap` in Framer, or CSS `hover:` classes |
| Infinite animations on content | Distracting — violates focus | Reserve `animate-spin` / `animate-shimmer` for loading states only |
| Same `layoutId` on two tab groups | They animate into each other | Each tab group needs a unique `layoutId` string |
