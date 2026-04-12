# Motion Specification: ProposalPilot

Generated: 2026-04-12
Phase: 1 — Design System
Agent: Motion & Animation Designer

Source inputs:
- `docs/design/04a-aesthetic-direction.md` — MOTION_LEVEL: standard, warm-refined, saas-dashboard
- `docs/audit/03-interaction-report.md` — zero active states, no page transitions, no spring physics
- `docs/design/05-component-strategy.md` — 25 components inventoried, motion applied in Batch 4-6
- `tailwind.config.ts` — `animate-shimmer` already defined (preserved)

---

## Installation

Framer Motion is NOT currently installed. Install before Phase 2 execution:

```bash
npm install framer-motion
```

Verify install by importing in a test file:
```ts
import { motion } from "framer-motion"; // must resolve without error
```

---

## Motion Token Table

All durations, easings, and spring configs referenced by name throughout this spec.

### Duration tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `duration-instant` | 100ms | Micro-feedback: checkbox, toggle, badge |
| `duration-fast` | 150ms | Button hover/tap, small state changes, exit animations |
| `duration-normal` | 250ms | Page transitions, modal open, dropdown open |
| `duration-slow` | 400ms | Complex sequences, first-paint list reveals |

### Easing tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering or settling (most UI transitions) |
| `ease-in` | `cubic-bezier(0.7, 0, 1, 0.5)` | Elements exiting (use sparingly — prefer fade-out) |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric transitions (tab content swap) |

### Spring configs

| Token | Config | Purpose |
|-------|--------|---------|
| `spring-snappy` | `{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }` | Button/interactive press feedback, modal enter |
| `spring-gentle` | `{ type: "spring", stiffness: 150, damping: 20, mass: 1 }` | Layout shifts, sidebar collapse, resize |
| `spring-layout` | `{ type: "spring", stiffness: 400, damping: 30 }` | Framer Motion layout animations (layoutId) |

---

## Missing Motion Gap Table

From Phase 0 audit (`03-interaction-report.md`). Every interaction currently producing zero visual feedback.

| Interaction | Element | Gap | Fix |
|-------------|---------|-----|-----|
| Route navigation | All pages | No page transition — instant render swap | Page transition wrapper (Pattern 1) |
| Button press | All 47 interactive elements | Zero `active:` classes in entire codebase | Button feedback with `whileTap` (Pattern 2) |
| Modal open/close | `NewProposalDialog` | No enter/exit animation | Modal enter-exit (Pattern 3) |
| Toast appear/dismiss | Radix Toast (all routes) | No slide-in animation | Toast notification (Pattern 4) |
| Loading state | Dashboard proposals table | `<Loader2>` spinner (banned) | Skeleton shimmer (Pattern 5) |
| Dropdown open | `KBItemCard` actions menu | Instant appear, no feedback | Dropdown open (Pattern 6) |
| Tab switch | Dashboard filters, KB filters, Settings tabs | Active tab changes instantly, no indicator motion | Tab indicator layoutId (Pattern 7) |
| List first load | ProposalCard list, KB item list | Items render instantly with no sequence | List items on mount (Pattern 8) |
| AI generation | `proposal-editor/index.tsx` sections | No visible activity during streaming | AI streaming indicator (Pattern 9) |
| Sidebar active route | `sidebar.tsx` nav links | Background highlight appears instantly | Sidebar active state layoutId (Pattern 10) |

---

## GPU Acceleration Rules

### Safe to animate (composited — no layout repaint)

```
transform: translate, translateX, translateY, scale, rotate
opacity
filter: blur, brightness, saturate
```

### Never animate (triggers layout — causes jank)

```
width, height, min-height, max-height
top, right, bottom, left, inset
margin, padding
border-radius       ← animate box-shadow instead
font-size, line-height
background-color    ← use opacity on an overlay instead for perf-critical cases
```

### ProposalPilot-specific rule

The proposal editor (`/proposals/[id]`) is a complex 3-panel layout. Animate only `opacity` and `transform` inside panel transitions — never `width` on the KBSearchPanel toggle. Use `AnimatePresence` with `initial={false}` to prevent mount animations on already-visible panels.

---

## Next.js App Router Integration

### Problem

Next.js App Router does not support `AnimatePresence` directly in Server Components. Framer Motion requires `"use client"`. Page transition animations require wrapping the layout.

### Pattern: Client layout wrapper

Create `src/components/atoms/page-transition.tsx` (Pattern 1 below). Import it inside `src/app/(app)/layout.tsx` and `src/app/layout.tsx` at the outermost client boundary.

```tsx
// src/app/(app)/layout.tsx  — existing server component
import { PageTransition } from "@/components/atoms/page-transition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <PageTransition>{children}</PageTransition>
    </AppShell>
  );
}
```

### Why this works

`PageTransition` is a client component. It receives `children` (a Server Component subtree) as a prop, which is valid in Next.js 13+. The `AnimatePresence` key must change on route change — use `usePathname()` from `next/navigation`.

---

## Accessibility: useReducedMotion()

All Framer Motion animations must respect the user's `prefers-reduced-motion` OS setting.

**Required pattern — apply to every animated component:**

```tsx
"use client";

import { useReducedMotion } from "framer-motion";

export function AnimatedComponent() {
  const shouldReduce = useReducedMotion();

  const variants = shouldReduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
      };

  return <motion.div variants={variants} />;
}
```

**Rule:** When `shouldReduce` is `true`, collapse all transforms to zero. Retain opacity transitions (opacity 0→1 is still communicative and gentle). Never remove transitions entirely — state changes still need feedback, just without spatial movement.

---

## Performance Rules

### useMotionValue vs useState

```tsx
// CORRECT — no re-render on value change
const x = useMotionValue(0);

// INCORRECT for animation — triggers React re-render on every frame
const [x, setX] = useState(0);
```

Use `useMotionValue` + `useTransform` for values that drive visual properties. Reserve `useState` for discrete state (open/closed, loading/loaded).

### will-change

```tsx
// Apply sparingly — only when animation is about to start
// Framer Motion handles this automatically for most cases
// Manual use: only for persistent hover states on many elements
style={{ willChange: "transform" }}
```

Do NOT apply `will-change: transform` to every card or list item — it promotes each to its own compositor layer, increasing GPU memory usage. Let Framer Motion manage this.

### AnimatePresence placement

```tsx
// CORRECT — AnimatePresence is as close to the animated element as possible
<AnimatePresence>
  {isOpen && <ModalContent key="modal" />}
</AnimatePresence>

// INCORRECT — AnimatePresence wrapping large component trees
<AnimatePresence>
  <EntirePage />
</AnimatePresence>
```

---

## Pattern 1 — Page Transition Wrapper

**File:** `src/components/atoms/page-transition.tsx`
**Purpose:** Fade + translate-y(8px → 0) between route navigations. Communicates that navigation occurred and new content has arrived.

```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduce = useReducedMotion();

  const variants = {
    initial: shouldReduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    exit: shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4 },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="contents"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Note:** `className="contents"` prevents the motion wrapper from affecting layout. The `key={pathname}` change drives `AnimatePresence` to unmount/mount children on route change.

---

## Pattern 2 — Button Feedback

**File:** Applied to `src/components/atoms/button.tsx` (IMPROVE) and any `motion.button` usage.
**Purpose:** Confirm interactivity and press. Spring physics make buttons feel tactile.

```tsx
"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionButtonProps extends React.ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
}

export function MotionButton({ className, children, ...props }: MotionButtonProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.button
      whileHover={shouldReduce ? undefined : { scale: 1.02 }}
      whileTap={shouldReduce ? { opacity: 0.8 } : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

**For the existing `button.tsx` CVA atom** — add `active:scale-[0.98]` as a Tailwind class to the base variant string. This provides non-Framer feedback for elements using the Tailwind Button atom without Framer Motion wrapping:

```tsx
// In buttonVariants base string, add:
"active:scale-[0.98] active:transition-transform active:duration-[100ms]"
```

---

## Pattern 3 — Modal / Dialog Enter-Exit

**File:** Applied inside `src/components/organisms/new-proposal-dialog.tsx` (IMPROVE).
**Purpose:** Focus attention, confirm dialog opened. Scale from 0.96 gives a "emerging from the page" feel consistent with warm-refined tone.

```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";

// Wrap the DialogContent with a motion.div for enter/exit animation
// AnimatePresence must be placed OUTSIDE Dialog.Root to detect open state changes

interface AnimatedDialogContentProps {
  open: boolean;
  children: React.ReactNode;
}

export function AnimatedDialogContent({ open, children }: AnimatedDialogContentProps) {
  const shouldReduce = useReducedMotion();

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = shouldReduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: 4 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: 2 },
      };

  return (
    <AnimatePresence>
      {open && (
        <Dialog.Portal forceMount>
          {/* Backdrop */}
          <Dialog.Overlay asChild>
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
          </Dialog.Overlay>

          {/* Content */}
          <Dialog.Content asChild>
            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
                         w-full max-w-[560px] rounded-2xl bg-[hsl(var(--background-elevated))]
                         shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]
                         p-6 focus:outline-none"
            >
              {children}
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </AnimatePresence>
  );
}
```

**Integration in `NewProposalDialog`:**

```tsx
// Replace Dialog.Portal + Dialog.Overlay + Dialog.Content with:
<AnimatedDialogContent open={open}>
  {/* existing dialog body */}
</AnimatedDialogContent>
```

---

## Pattern 4 — Toast Notification

**File:** Applied to Radix Toast in `src/components/atoms/` (add `toast.tsx` or update existing).
**Purpose:** Alert without interrupting. Slides in from the right so it feels non-blocking.

```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as Toast from "@radix-ui/react-toast";

interface AnimatedToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

export function AnimatedToast({
  open,
  onOpenChange,
  title,
  description,
  variant = "default",
}: AnimatedToastProps) {
  const shouldReduce = useReducedMotion();

  const toastVariants = shouldReduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: "100%", scale: 0.95 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
      };

  return (
    <AnimatePresence>
      {open && (
        <Toast.Root asChild forceMount onOpenChange={onOpenChange}>
          <motion.li
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
            className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))]
                       bg-[hsl(var(--background-elevated))] p-4
                       shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]
                       w-[360px]"
          >
            <Toast.Title className="text-sm font-medium text-[hsl(var(--foreground))]">
              {title}
            </Toast.Title>
            {description && (
              <Toast.Description className="text-sm text-[hsl(var(--foreground-muted))]">
                {description}
              </Toast.Description>
            )}
            <Toast.Close className="ml-auto rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]">
              {/* X icon from Lucide */}
            </Toast.Close>
          </motion.li>
        </Toast.Root>
      )}
    </AnimatePresence>
  );
}
```

**Toast viewport placement:** `position: fixed; bottom: 24px; right: 24px; z-index: 9999`

---

## Pattern 5 — Skeleton Shimmer

**Purpose:** Indicate content loading with shape-matched placeholders. Replaces the banned `<Loader2>` spinner on the dashboard.

The `animate-shimmer` keyframe is **already in `tailwind.config.ts`** (preserved as-is):

```ts
// tailwind.config.ts — DO NOT MODIFY THESE
keyframes: {
  shimmer: {
    "0%": { backgroundPosition: "200% 0" },
    "100%": { backgroundPosition: "-200% 0" },
  },
},
animation: {
  shimmer: "shimmer 1.5s linear infinite",
},
```

**CSS class to apply on skeleton elements:**

```tsx
// Reusable skeleton class combination — add to src/components/atoms/skeleton.tsx
const skeletonClass = cn(
  "animate-shimmer rounded-md",
  "bg-gradient-to-r from-[hsl(var(--background-subtle))] via-[hsl(var(--border-subtle))] to-[hsl(var(--background-subtle))]",
  "[background-size:200%_100%]",
);
```

**Shape-matched skeleton for ProposalCard list** (`ProposalTableSkeleton`):

```tsx
"use client";

import { cn } from "@/lib/utils";

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded",
        "bg-gradient-to-r from-[hsl(var(--background-subtle))] via-[hsl(var(--border))] to-[hsl(var(--background-subtle))]",
        "[background-size:200%_100%]",
        className,
      )}
    />
  );
}

export function ProposalTableSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading proposals" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border-subtle))]
                     bg-[hsl(var(--background-elevated))] p-4"
        >
          {/* Status badge placeholder */}
          <SkeletonLine className="h-5 w-16 rounded-full flex-shrink-0" />
          {/* Title */}
          <SkeletonLine className="h-4 w-48 flex-1" />
          {/* Client name */}
          <SkeletonLine className="h-4 w-24 hidden md:block" />
          {/* Date */}
          <SkeletonLine className="h-4 w-20 hidden lg:block" />
          {/* Actions placeholder */}
          <SkeletonLine className="h-7 w-7 rounded-md flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
```

---

## Pattern 6 — Dropdown Menu Open

**File:** Applied to `src/components/molecules/kb-item-card.tsx` when migrating to Radix `DropdownMenu`.
**Purpose:** Confirm dropdown opened. Small translateY gives a "falling from trigger" feel.

```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

// Animated dropdown content wrapper
interface AnimatedDropdownContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function AnimatedDropdownContent({ children, align = "end" }: AnimatedDropdownContentProps) {
  const shouldReduce = useReducedMotion();

  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content asChild align={align} sideOffset={4}>
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -2, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="z-50 min-w-[160px] overflow-hidden rounded-xl
                     border border-[hsl(var(--border))]
                     bg-[hsl(var(--background-elevated))]
                     shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]
                     p-1 focus:outline-none"
        >
          {children}
        </motion.div>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}
```

**Note:** Radix `DropdownMenu` uses `AnimatePresence` internally via `forceMount` + its own open/close detection. Wrap the Content in `AnimatePresence` at the DropdownMenu.Root level if using custom `AnimatePresence`:

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <Button variant="ghost" size="icon" aria-label={`Open menu for ${item.title}`}>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <AnimatedDropdownContent>
    {/* menu items */}
  </AnimatedDropdownContent>
</DropdownMenu.Root>
```

---

## Pattern 7 — Tab Indicator (Shared Layout)

**File:** `src/components/atoms/filter-tab-bar.tsx` (new CUSTOM component from component strategy).
**Purpose:** Show active tab relationship. The sliding underline communicates which tab is selected without an abrupt visual jump.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface FilterTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  layoutId?: string; // unique per instance to avoid shared layout conflicts
}

export function FilterTabBar({
  tabs,
  activeTab,
  onTabChange,
  layoutId = "tab-indicator",
}: FilterTabBarProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Filter tabs"
      className="flex items-center gap-1 rounded-lg bg-[hsl(var(--background-subtle))] p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-3 py-1.5",
              "text-sm font-medium transition-colors duration-150",
              "min-h-[36px] min-w-[44px]",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
              "select-none",
              isActive
                ? "text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]",
            )}
          >
            {/* Shared layout background — slides between tabs */}
            {isActive && (
              <motion.span
                layoutId={shouldReduce ? undefined : layoutId}
                className="absolute inset-0 rounded-md bg-[hsl(var(--background-elevated))]
                           shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]"
                transition={
                  shouldReduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
              />
            )}

            <span className="relative z-10">{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={cn(
                  "relative z-10 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive
                    ? "bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]"
                    : "bg-[hsl(var(--background-subtle))] text-[hsl(var(--foreground-dim))]",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

---

## Pattern 8 — List Items on First Load

**File:** Applied to `ProposalCard` list in `src/app/(app)/dashboard/page.tsx` and `src/app/(app)/proposals/page.tsx`.
**Purpose:** Guide the eye through ordered content on initial mount. Stagger 0.04s between items so the eye follows the list from top to bottom.

**Rule:** Mount only — no stagger on data refetches (would feel noisy). Use `initial={false}` on `AnimatePresence` for list updates.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
};

const itemVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerList({ children, className }: StaggerListProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.ul
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.ul>
  );
}

export function StaggerListItem({ children, className }: StaggerListProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.li
      variants={shouldReduce ? itemVariantsReduced : itemVariants}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.li>
  );
}

// Usage in dashboard/page.tsx:
// <StaggerList className="space-y-2">
//   {proposals.map((p) => (
//     <StaggerListItem key={p.id}>
//       <ProposalCard proposal={p} />
//     </StaggerListItem>
//   ))}
// </StaggerList>
```

---

## Pattern 9 — AI Streaming Indicator

**File:** Applied to `src/components/organisms/proposal-editor/index.tsx` (IMPROVE).
**Purpose:** Show AI is generating content for a specific proposal section. The pulsing border communicates ongoing activity without obscuring the content being written.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreamingIndicatorProps {
  isStreaming: boolean;
  children: React.ReactNode;
  className?: string;
}

export function StreamingSection({ isStreaming, children, className }: StreamingIndicatorProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div className={cn("relative", className)}>
      {/* Animated border ring during streaming */}
      {isStreaming && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl"
          animate={
            shouldReduce
              ? { opacity: [0.3, 0.6, 0.3] }
              : {
                  boxShadow: [
                    "0 0 0 2px hsl(var(--accent) / 0.2)",
                    "0 0 0 2px hsl(var(--accent) / 0.5)",
                    "0 0 0 2px hsl(var(--accent) / 0.2)",
                  ],
                  opacity: [0.6, 1, 0.6],
                }
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      )}

      {children}

      {/* Streaming cursor — three animated dots */}
      {isStreaming && (
        <span
          className="ml-1 inline-flex items-center gap-0.5"
          aria-label="AI is generating"
          role="status"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block h-1 w-1 rounded-full bg-[hsl(var(--accent))]"
              animate={shouldReduce ? { opacity: [0, 1, 0] } : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />
          ))}
        </span>
      )}
    </div>
  );
}
```

**Integration:** Wrap each `ProposalSection` component in `StreamingSection`, passing `isStreaming={section.id === activelyGeneratingId}`.

---

## Pattern 10 — Sidebar Nav Active State

**File:** Applied to `src/components/organisms/sidebar.tsx` (IMPROVE).
**Purpose:** Show current route in sidebar navigation. The sliding background communicates which page you're on without abrupt color jumps.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  items: NavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const shouldReduce = useReducedMotion();

  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-0.5 px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2",
                  "text-sm font-medium transition-colors duration-150",
                  "min-h-[40px]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
                  isActive
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Shared layout background — follows active route */}
                {isActive && (
                  <motion.span
                    layoutId={shouldReduce ? undefined : "sidebar-active-bg"}
                    className="absolute inset-0 rounded-lg bg-[hsl(var(--background-subtle))]"
                    transition={
                      shouldReduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 30 }
                    }
                  />
                )}

                <Icon
                  className="relative z-10 h-4 w-4 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="relative z-10">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

---

## Shimmer Animation Reference (Preserved from tailwind.config.ts)

The following is documented here for reference — do NOT modify `tailwind.config.ts`:

```ts
// Current tailwind.config.ts shimmer — PRESERVED AS-IS
keyframes: {
  shimmer: {
    "0%": { backgroundPosition: "200% 0" },
    "100%": { backgroundPosition: "-200% 0" },
  },
},
animation: {
  shimmer: "shimmer 1.5s linear infinite",
},
```

**Usage:** Apply `animate-shimmer` class to skeleton elements along with the gradient background:

```tsx
<div
  className="animate-shimmer h-4 w-32 rounded
             bg-gradient-to-r from-[hsl(var(--background-subtle))]
             via-[hsl(var(--border))] to-[hsl(var(--background-subtle))]
             [background-size:200%_100%]"
/>
```

---

## Anti-Patterns Banned for ProposalPilot

| Pattern | Why banned | Alternative |
|---------|------------|-------------|
| `<Loader2 className="animate-spin">` at page level | Generic, non-informative | Shape-matched `ProposalTableSkeleton` (Pattern 5) |
| Linear easing on UI interactions | Feels robotic, mechanical | `ease-out` or `spring-snappy` |
| Animations >400ms duration | Users perceive as laggy in a work tool | Cap all transitions at 300ms (400ms for complex sequences only) |
| Animating `width` on sidebar collapse | Triggers layout reflow | Use `scaleX` + `opacity`, or CSS `max-width` transition |
| Stagger on data refetch | Feels noisy — users expect instant updates on actions | Stagger only on initial mount (`initial="initial"` then `animate="animate"` once) |
| `Infinity` repeat on non-loading animations | Distracting in a focus tool | Infinite only for streaming/loading indicators |
| Missing `AnimatePresence` on exit animations | Exit animations silently fail | Wrap all conditionally rendered animated elements |
| `useState` for hover animation values | Re-renders on every hover frame | `useMotionValue` + `useTransform` for smooth tracking |

---

## Phase 2 Execution Notes

1. Install `framer-motion` before any component work starts
2. Create `src/components/atoms/page-transition.tsx` (Pattern 1) in Batch 2 alongside `app-shell.tsx`
3. Apply `active:scale-[0.98]` to `button.tsx` base variant in Batch 1 (no Framer Motion dependency)
4. Patterns 7 and 10 (tab indicator, sidebar active state) require `usePathname()` — mark files `"use client"`
5. Pattern 9 (AI streaming) integrates into `proposal-editor/index.tsx` in Batch 4
6. Every file using Framer Motion APIs must have `"use client"` as its first line
7. Server components that receive animated children as props do NOT need `"use client"`
8. After all motion is applied: verify Lighthouse Performance score is not degraded vs Phase 0 baseline
