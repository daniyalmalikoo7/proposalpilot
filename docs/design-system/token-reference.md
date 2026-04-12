# Design Token Reference — ProposalPilot

Generated: 2026-04-12
Phase: 4 — Ship & Document
Source: `src/app/globals.css` + `tailwind.config.ts`

All tokens are HSL-based CSS custom properties consumed via Tailwind utility classes.
Single source of truth: `globals.css :root` (light) and `globals.css .dark` (dark).

---

## Architecture

```
globals.css  :root { --background: 40 23% 97%; }   ← source of truth (light)
globals.css  .dark  { --background: 30 7% 5%;  }   ← dark override
tailwind.config.ts  background: 'hsl(var(--background))'  ← Tailwind binding
Component  className="bg-background"               ← usage
```

Never hardcode hex values. Never use raw Tailwind color utilities (`bg-slate-900`, `text-gray-400`).
Every color decision traces to a token below.

---

## Color Tokens

### Backgrounds

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--background` | `bg-background` | `#faf9f7` (warm white) | `#0f0e0d` (warm deep dark) | Page-level background |
| `--background-elevated` | `bg-background-elevated` | `#ffffff` (white) | `#1a1816` (card surface) | Cards, modals, popovers |
| `--background-subtle` | `bg-background-subtle` | `#f4f1ed` (warm off-white) | `#242220` (sidebar) | Sidebar, secondary panels, hover states |

**Visual swatches:**
- `background`: ██████ Light: off-white with warmth (#faf9f7) / ██████ Dark: near-black with warmth (#0f0e0d)
- `background-elevated`: ██████ Light: pure white (#ffffff) / ██████ Dark: dark card (#1a1816)
- `background-subtle`: ██████ Light: cream (#f4f1ed) / ██████ Dark: darkest panel (#242220)

**Do:** Use `bg-background` for all page wrappers. Use `bg-background-elevated` for all cards. Use `bg-background-subtle` for sidebar backgrounds and zebra rows.
**Don't:** Use `bg-white`, `bg-gray-900`, `bg-slate-800`, or any raw color for these surfaces.

---

### Foreground / Text

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--foreground` | `text-foreground` | `#1a1614` (warm near-black) | `#f0ece8` (warm off-white) | Primary body text, headings |
| `--foreground-muted` | `text-foreground-muted` | `#6b6560` (warm gray) | `#9c9590` (warm gray) | Secondary text, author lines, metadata |
| `--foreground-dim` | `text-foreground-dim` | `#9c9590` (light warm gray) | `#6b6560` (dim warm gray) | Captions, timestamps, disabled labels |

**Visual swatches:**
- `foreground`: ██████ Warm near-black with brown undertone — NOT #000000
- `foreground-muted`: ██████ Mid-tone warm gray — for supporting text
- `foreground-dim`: ██████ Light warm gray — for tertiary / disabled text

**Do:** Use `text-foreground` for all primary text. Reserve `text-foreground-muted` for secondary info. Use `text-foreground-dim` sparingly for truly tertiary content.
**Don't:** Use `text-black`, `text-white`, `text-gray-*`, `text-slate-*`.

---

### Borders

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--border` | `border-border` | `#e8e2db` (warm light) | `#2e2b28` (subtle dark) | Default borders on all components |
| `--border-subtle` | `border-border-subtle` | `#f0ece6` (very light) | `#242220` (near-background) | Section dividers, light separators |

**Do:** Use `border-border` on cards, inputs, and component boundaries. Use `border-border-subtle` for within-section dividers.
**Don't:** Use `border-gray-200`, `border-slate-700`, or any hardcoded border color.

---

### Accent (Brand Indigo)

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--accent` | `bg-accent` / `text-accent` | `#5b5bd6` (warmed indigo) | `#818cf8` (lighter indigo) | Primary CTAs, active states, links |
| `--accent-hover` | `bg-accent-hover` | `#4f4ec4` (deeper) | `#a5b4fc` (lighter) | Hover state for accent elements |
| `--accent-muted` | `bg-accent-muted` | `#eeeef9` (tinted surface) | `#1e1d3f` (deep muted) | Selected/active backgrounds, wizard steps |
| `--accent-foreground` | `text-accent-foreground` | `#ffffff` | `#ffffff` | Text on accent background |

**Contrast verification:** `accent` text on `background`: ≥4.5:1 ✅ | `accent-foreground` on `accent` bg: ≥4.5:1 ✅

**Do:** Use `bg-accent text-accent-foreground` for primary buttons. Use `bg-accent-muted text-accent` for selected states.
**Don't:** Use gradients on accent. Don't use `bg-indigo-500` or any raw Tailwind indigo class.

---

### Status Tokens

#### Success

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--success` | `text-success` / `border-success` | `#16a34a` | `#4ade80` | Success text, borders |
| `--success-bg` | `bg-success-bg` | `#f0fdf4` | dark tint | Success badge background |
| `--success-foreground` | `text-success-foreground` | `#15803d` | `#86efac` | Text on success-bg |

**Usage:** `<Badge className="bg-success-bg text-success-foreground">Active</Badge>` — always pair with a Check icon or text label.

#### Warning

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--warning` | `text-warning` / `border-warning` | `#d97706` | `#fbbf24` | Warning text, borders |
| `--warning-bg` | `bg-warning-bg` | `#fffbeb` | dark tint | Warning badge background |
| `--warning-foreground` | `text-warning-foreground` | `#b45309` | `#fcd34d` | Text on warning-bg |

#### Danger

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--danger` | `text-danger` / `border-danger` | `#dc2626` | `#f87171` | Error text, destructive states |
| `--danger-bg` | `bg-danger-bg` | `#fef2f2` | dark tint | Error badge background |
| `--danger-foreground` | `text-danger-foreground` | `#b91c1c` | `#fca5a5` | Text on danger-bg |

#### Info

| Token | Tailwind class | Light | Dark | Usage |
|-------|---------------|-------|------|-------|
| `--info` | `text-info` / `border-info` | `#2563eb` | `#60a5fa` | Info text, borders |
| `--info-bg` | `bg-info-bg` | `#eff6ff` | dark tint | Info badge background |
| `--info-foreground` | `text-info-foreground` | `#1d4ed8` | `#93c5fd` | Text on info-bg |

**Rule for all status colors:** Status color is NEVER the sole indicator. Always pair with:
- A text label ("Active", "Overdue", "Warning")
- An icon (CheckCircle2, AlertCircle, AlertTriangle, Info)

---

### Shadcn Compatibility Aliases

These aliases exist so Shadcn components work without modification. They map to the same CSS vars.

| Shadcn alias | Maps to semantic token |
|-------------|----------------------|
| `card` | `background-elevated` |
| `popover` | `background-elevated` |
| `primary` | `accent` |
| `secondary` | `background-subtle` + `foreground-muted` |
| `muted` | `background-subtle` + `foreground-dim` |
| `destructive` | `danger` |
| `input` | `border` |
| `ring` | `accent` |

**Do:** Add new Shadcn components without token modification — aliases handle it.
**Don't:** Override Shadcn token classes directly in component code.

---

## Border Radius Tokens

| CSS var | Value | Tailwind | Usage |
|---------|-------|---------|-------|
| `--radius-sm` | 6px | `rounded-sm` | Badges, chips, small pill labels |
| `--radius` | 8px | `rounded` | Inputs, toggle buttons |
| `--radius-md` | 10px | `rounded-md` | Standard components, dropdowns |
| `--radius-lg` | 12px | `rounded-lg` | Cards, list items |
| `--radius-xl` | 16px | `rounded-xl` | Modals, sheet panels |
| `--radius-2xl` | 20px | `rounded-2xl` | Large overlays, hero blocks |
| n/a | 9999px | `rounded-full` | Avatars, pill badges, toggle switches |

**Hierarchy rule:** The radius scale creates subtle depth cues. Don't flatten everything to `rounded-lg` or round everything to `rounded-full`.

---

## Spacing Tokens

Based on 8px grid. All standard Tailwind spacing values (p-1=4px, p-2=8px, etc.) are valid. Semantic names are aliases:

| Token | Value | Tailwind equivalent | Usage |
|-------|-------|---------------------|-------|
| `2xs` | 2px | `p-0.5` | Micro-adjustments, icon offsets |
| `xs` | 4px | `p-1` / `gap-1` | Inline element gaps |
| `sm` | 8px | `p-2` / `gap-2` | Component internal padding |
| `md` | 16px | `p-4` / `gap-4` | Standard component padding |
| `lg` | 24px | `p-6` / `gap-6` | Section internal gaps |
| `xl` | 32px | `p-8` / `gap-8` | Section outer margins |
| `2xl` | 48px | `p-12` | Major section breaks |
| `3xl` | 64px | `p-16` | Hero/feature section spacing |
| `4xl` | 80px | `p-20` | Large-screen generous whitespace |

**Rule:** All spacing must be on the 4/8/12/16/20/24/32/40/48/64px grid. No arbitrary bracket values.

---

## Typography Tokens

| Scale | Size | Line-height | Usage |
|-------|------|-------------|-------|
| `text-2xs` | 11px | 1.4 | Fine print, legal, version numbers |
| `text-xs` | 12px | 1.4 | Badge labels, metadata chips |
| `text-sm` | 14px | 1.5 | Secondary labels, table cells, sidebars |
| `text-base` / `text-md` | 16px | 1.6 | Body text — minimum for content |
| `text-lg` | 20px | 1.4 | Card headings, section subheadings |
| `text-xl` | 24px | 1.3 | Section headings (h2) |
| `text-2xl` | 30px | 1.2 | Page headings (h1) |
| `text-3xl` | 36px | 1.1 | Hero subheadings |
| `text-4xl` | 48px | 1.1 | Hero display headings |

**Font weights in use:**
- `font-normal` (400) — Body text
- `font-medium` (500) — Labels, metadata with emphasis
- `font-semibold` (600) — Component headings, button text
- `font-bold` (700) — Page headings, hero text

**Tracking:**
- Headings ≥24px: `tracking-tight` (-0.01em) or `tracking-tighter` (-0.02em)
- Body: `tracking-normal` (0em)
- Badges, all-caps labels: `tracking-wide` (0.05em)

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Subtle elevation — active inputs |
| `shadow` / `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Standard card elevation |
| `shadow-lg` | `0 16px 40px rgba(0,0,0,0.12)` | Dropdowns, popovers |
| `shadow-xl` | `0 24px 60px rgba(0,0,0,0.15)` | Modals, dialogs |
| `shadow-sticky` | `0 2px 8px rgba(0,0,0,0.06)` | Sticky headers on scroll |
| `shadow-none` | none | Cards in flat layout sections |

**Elevation rule:** Shadow indicates elevation. Apply to: modals, dropdowns, popovers, sticky headers. Cards in a flat layout use `border-border` not shadow. Never apply shadow to every element indiscriminately.
