# Design Tokens: ProposalPilot

Generated: 2026-04-11
Phase: 1 — Design System
Agent: Design System Architect
Source truth for all Phase 2 implementation work.

---

## 1. Token System Overview

ProposalPilot's current implementation has **two parallel token systems** that coexist without a bridge:

| System | Location | Values | Problem |
|--------|----------|--------|---------|
| Shadcn CSS vars | `globals.css` `:root` / `.dark` | Default Slate/blue palette, cold dark mode | Wrong palette — cool-blue, not warm-refined |
| `pp-*` hex tokens | `tailwind.config.ts` | Dark-first hex values (`#0a0f1a` etc.) | Hard-coded hex bypasses CSS vars; no theming |
| Raw Tailwind utilities | Landing page components | `bg-slate-800`, `text-indigo-400`, `#060b18` | Zero token coverage on public-facing pages |

**Target:** One unified system — semantic CSS custom properties (HSL, space-separated) in `globals.css`, consumed by `tailwind.config.ts` via `hsl(var(--token))`. The `pp-*` family is retired. All components migrate.

### Architecture

```
globals.css  :root { --background: 40 23% 97%; }   ← single source of truth
globals.css  .dark { --background: 30 7% 5%; }      ← dark mode override
tailwind.config.ts  background: 'hsl(var(--background))'  ← consumed as Tailwind class
Component  className="bg-background"                ← usage
```

---

## 2. Current vs Target Comparison

### Colors — Background

| Token | Current (pp-*) | Current (Shadcn) | Target | Justification |
|-------|----------------|------------------|--------|---------------|
| `background` | `#0a0f1a` (cold deep navy) | `hsl(0 0% 100%)` pure white | `hsl(40 23% 97%)` `#faf9f7` | Warm white base — approachable, easier on eyes for long writing sessions |
| `background-elevated` | `#111827` (card) | `hsl(0 0% 100%)` same as bg | `hsl(0 0% 100%)` `#ffffff` | Clean white cards float above warm base; creates subtle depth without shadow |
| `background-subtle` | `#1a2234` (elevated) | N/A | `hsl(34 24% 94%)` `#f4f1ed` | Warm off-white for sidebar, secondary panels; replaces the cold elevated |

### Colors — Foreground

| Token | Current | Target | Justification |
|-------|---------|--------|---------------|
| `foreground` | `#e5e7eb` (cold gray-200) / `hsl(222.2 84% 4.9%)` | `hsl(20 13% 9%)` `#1a1614` | Near-black with warm undertone — pairs with warm background |
| `foreground-muted` | `#9ca3af` (cold gray-400) | `hsl(27 5% 40%)` `#6b6560` | Warm gray for secondary text (author lines, metadata) |
| `foreground-dim` | `#6b7280` (cold gray-500) | `hsl(25 6% 59%)` `#9c9590` | Warm gray for captions, timestamps, disabled labels |

### Colors — Border

| Token | Current | Target | Justification |
|-------|---------|--------|---------------|
| `border` | `#1f2937` (dark), `hsl(214.3 31.8% 91.4%)` (light) | `hsl(32 22% 88%)` `#e8e2db` | Warm light border — replaces cold blue-gray |
| `border-subtle` | N/A (no subtle variant) | `hsl(36 25% 92%)` `#f0ece6` | For section dividers, light separators |

### Colors — Accent (Indigo brand preserved, warmed)

| Token | Current | Target | Justification |
|-------|---------|--------|---------------|
| `accent` | `#6366f1` (Tailwind indigo-500) | `hsl(240 60% 60%)` `#5b5bd6` | Slightly warmer/darker indigo; brand recognition preserved; less saturated than generic Tailwind default |
| `accent-hover` | `#818cf8` (lighter on hover in dark) | `hsl(241 50% 54%)` `#4f4ec4` | Deeper on hover — clear affordance |
| `accent-muted` | N/A | `hsl(240 48% 95%)` `#eeeef9` | Tinted bg for accent areas (wizard steps, selected states) |
| `accent-foreground` | `hsl(210 40% 98%)` | `hsl(0 0% 100%)` | White text on indigo bg — verified AA contrast |

### Colors — Status

| Token | Current | Target | Justification |
|-------|---------|--------|---------------|
| `success` | `#22c55e` + dark bg `#052e16` + `#4ade80` | `hsl(142 76% 36%)` / `hsl(138 76% 97%)` / `hsl(142 72% 29%)` | Light-mode-first; dark bg was "terminal green" dark-mode-only |
| `warning` | `#f59e0b` + `#451a03` + `#fbbf24` | `hsl(32 95% 44%)` / `hsl(48 100% 96%)` / `hsl(26 90% 37%)` | Warmer amber; bg is light tint not near-black |
| `danger` | `#ef4444` + `#450a0a` + `#f87171` | `hsl(0 72% 51%)` / `hsl(0 86% 97%)` / `hsl(0 74% 42%)` | Light-mode danger red with proper tint bg |
| `info` | N/A (no info token — used raw `blue-950 text-blue-400`) | `hsl(221 83% 53%)` / `hsl(214 100% 97%)` / `hsl(224 76% 48%)` | Fixes the 14 off-token `blue-950` references in KB and dashboard |

### Colors — Off-token fixes

| Off-token usage | Routes | Target replacement |
|-----------------|--------|-------------------|
| `bg-blue-950 text-blue-400` (past-proposal, in-progress badges) | `/dashboard`, `/knowledge-base` | `bg-info-bg text-info-foreground` |
| `bg-purple-950 text-purple-400` (review status, methodology badges) | `/dashboard`, `/knowledge-base` | New `info-secondary` or repurpose `accent-muted` |
| `bg-cyan-950 text-cyan-400` (capability badges) | `/knowledge-base` | New `teal` semantic or `accent-muted` |
| `bg-[#060b18]` (landing bg) | 7 landing files | `bg-background` (dark mode) |
| `text-slate-400`, `bg-slate-800`, etc. | All landing files (40+ instances) | Semantic tokens |
| `bg-primary` (active filter tabs — resolves to near-white in dark) | `/dashboard`, `/knowledge-base`, `/settings` | `bg-accent text-accent-foreground` |

### Radius

| Token | Current | Target | Justification |
|-------|---------|--------|---------------|
| `--radius` | `0.5rem` (8px) | `0.5rem` (8px) | Unchanged — correct base |
| `rounded-sm` | `calc(var(--radius) - 4px)` = 4px | 6px | Badge minimum; 4px is dated |
| `rounded-md` | `calc(var(--radius) - 2px)` = 6px | 8px | Inputs, buttons — matches --radius |
| `rounded-lg` | `var(--radius)` = 8px | 10px | Component cards — bump for warm-refined feel |
| `rounded-xl` | Standard Tailwind (12px) | 12px | Larger cards, panels |
| `rounded-2xl` | Standard Tailwind (16px) | 16px | Modals, overlays |
| `rounded-full` | Standard Tailwind | 9999px | Badges, avatars, pills |

### Shadows

| Token | Current | Target | Justification |
|-------|---------|--------|---------------|
| Shadow on cards | `none` (most cards) | Level 1: soft 3px spread | Cards are flat against warm bg — need minimal elevation cue |
| `shadow-lg` on elements | `box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)` (Tailwind default) | Replaced with `shadow-md` warm-refined | Default Tailwind shadows too strong/cool |
| `shadow-indigo-500/25` on CTAs | Landing only, off-token color | Removed — no colored shadows in warm-refined | Dated SaaS startup aesthetic |

---

## 3. Tailwind Config Extension

Full replacement for the `theme.extend` block in `tailwind.config.ts`. Paste verbatim to replace the existing `colors` and `borderRadius` blocks, and extend `spacing`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `boxShadow`.

```typescript
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─────────────────────────────────────────────────
      // COLORS — unified CSS-var-backed semantic system
      // All values: hsl(var(--token-name))
      // CSS vars defined in globals.css :root and .dark
      // ─────────────────────────────────────────────────
      colors: {
        // Surfaces
        background: {
          DEFAULT: "hsl(var(--background))",
          elevated: "hsl(var(--background-elevated))",
          subtle: "hsl(var(--background-subtle))",
        },
        // Text
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          muted: "hsl(var(--foreground-muted))",
          dim: "hsl(var(--foreground-dim))",
        },
        // Borders
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
        },
        // Brand accent (indigo)
        accent: {
          DEFAULT: "hsl(var(--accent))",
          hover: "hsl(var(--accent-hover))",
          muted: "hsl(var(--accent-muted))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Status — success
        success: {
          DEFAULT: "hsl(var(--success))",
          bg: "hsl(var(--success-bg))",
          foreground: "hsl(var(--success-foreground))",
        },
        // Status — warning
        warning: {
          DEFAULT: "hsl(var(--warning))",
          bg: "hsl(var(--warning-bg))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // Status — danger
        danger: {
          DEFAULT: "hsl(var(--danger))",
          bg: "hsl(var(--danger-bg))",
          foreground: "hsl(var(--danger-foreground))",
        },
        // Status — info (replaces off-token blue-950/blue-400 usage)
        info: {
          DEFAULT: "hsl(var(--info))",
          bg: "hsl(var(--info-bg))",
          foreground: "hsl(var(--info-foreground))",
        },
        // ── Shadcn compatibility aliases ──────────────────
        // Keeps Shadcn components working without modification.
        // Wired to the same CSS vars as semantic tokens above.
        background: {
          DEFAULT: "hsl(var(--background))",
          elevated: "hsl(var(--background-elevated))",
          subtle: "hsl(var(--background-subtle))",
        },
        card: {
          DEFAULT: "hsl(var(--background-elevated))",
          foreground: "hsl(var(--foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--background-elevated))",
          foreground: "hsl(var(--foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--background-subtle))",
          foreground: "hsl(var(--foreground-muted))",
        },
        muted: {
          DEFAULT: "hsl(var(--background-subtle))",
          foreground: "hsl(var(--foreground-dim))",
        },
        destructive: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        input: "hsl(var(--border))",
        ring: "hsl(var(--accent))",
      },

      // ─────────────────────────────────────────────────
      // BORDER RADIUS — named scale
      // ─────────────────────────────────────────────────
      borderRadius: {
        sm: "var(--radius-sm)",      // 6px — badges, chips
        DEFAULT: "var(--radius)",     // 8px — inputs, buttons
        md: "var(--radius-md)",      // 10px — standard components (was rounded-lg)
        lg: "var(--radius-lg)",      // 12px — cards, panels
        xl: "var(--radius-xl)",      // 16px — modals, overlays
        "2xl": "var(--radius-2xl)",  // 20px — large panels
        full: "9999px",              // pills, avatars
      },

      // ─────────────────────────────────────────────────
      // SPACING — semantic names on 8px grid
      // These are in ADDITION to Tailwind defaults (1-96 scale)
      // ─────────────────────────────────────────────────
      spacing: {
        "2xs": "2px",  // hairline
        "xs":  "4px",  // tight internal gap
        "sm":  "8px",  // component internal gap
        "md":  "16px", // standard padding
        "lg":  "24px", // section padding
        "xl":  "32px", // section gap
        "2xl": "48px", // between major sections
        "3xl": "64px", // hero / large section
        "4xl": "80px", // page-level vertical rhythm
      },

      // ─────────────────────────────────────────────────
      // TYPOGRAPHY — size scale
      // Values: 12/14/16/20/24/30/36/48px
      // ─────────────────────────────────────────────────
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],  // tiny metadata (replaces text-[10px], text-[11px])
        "xs":  ["12px", { lineHeight: "1.4" }],  // captions, badge counts
        "sm":  ["14px", { lineHeight: "1.5" }],  // body small, button labels, metadata
        "base":["16px", { lineHeight: "1.6" }],  // body default
        "md":  ["16px", { lineHeight: "1.6" }],  // alias for base
        "lg":  ["20px", { lineHeight: "1.4" }],  // subsection headings (h3)
        "xl":  ["24px", { lineHeight: "1.3" }],  // section headings (h2)
        "2xl": ["30px", { lineHeight: "1.2" }],  // page headings (h1)
        "3xl": ["36px", { lineHeight: "1.1" }],  // display / landing section h2
        "4xl": ["48px", { lineHeight: "1.1" }],  // display hero
        // Replaces arbitrary: text-[10px], text-[11px], text-[13px], text-[15px]
        // text-[10px] → text-2xs (11px, 1px difference imperceptible)
        // text-[11px] → text-2xs
        // text-[13px] → text-sm (14px, 1px difference imperceptible)
        // text-[15px] → text-base (16px, 1px difference imperceptible)
      },

      // ─────────────────────────────────────────────────
      // FONT WEIGHT — named scale
      // ─────────────────────────────────────────────────
      fontWeight: {
        normal:   "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
        // 100-300 excluded — never on body text per design-rules T7
      },

      // ─────────────────────────────────────────────────
      // LINE HEIGHT — named scale
      // ─────────────────────────────────────────────────
      lineHeight: {
        tight:   "1.1",  // display headings ≥36px
        snug:    "1.3",  // section headings 24-30px
        normal:  "1.5",  // body small (14px)
        relaxed: "1.6",  // body default (16px) — warm-refined needs breathing room
        loose:   "1.8",  // editorial long-form content
      },

      // ─────────────────────────────────────────────────
      // LETTER SPACING — named scale
      // ─────────────────────────────────────────────────
      letterSpacing: {
        tighter: "-0.02em", // headings ≥24px
        tight:   "-0.01em", // headings 20-22px
        normal:  "0em",     // body text
        wide:    "0.05em",  // uppercase labels, CAPS metadata
      },

      // ─────────────────────────────────────────────────
      // BOX SHADOW — warm-refined elevation system
      // Soft, diffused. Low opacity. No colored shadows.
      // ─────────────────────────────────────────────────
      boxShadow: {
        sm:  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        DEFAULT: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        md:  "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        lg:  "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
        xl:  "0 24px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)",
        sticky: "0 2px 8px rgba(0,0,0,0.06)", // sticky header only
        none: "none",
      },

      // ─────────────────────────────────────────────────
      // KEYFRAMES — animation definitions
      // ─────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to:   { opacity: "0", transform: "translateY(-4px)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer:        "shimmer 1.5s linear infinite",
        "fade-in":      "fade-in 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-out":     "fade-out 150ms cubic-bezier(0.7, 0, 1, 0.5) forwards",
        "slide-in":     "slide-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in":     "scale-in 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
```

> **Implementation note — TypeScript duplicate key:** The `colors` block above shows `background` twice to illustrate the Shadcn alias strategy. In the actual `tailwind.config.ts`, collapse both into one `background` entry with the `elevated` and `subtle` sub-keys. The `card`, `popover`, `primary`, `secondary`, `muted`, `destructive`, `input`, and `ring` keys are kept as Shadcn compatibility aliases pointing to the same CSS vars.

---

## 4. globals.css — CSS Custom Properties

Complete replacement for `globals.css`. Both `:root` (light mode default) and `.dark` blocks. HSL values are space-separated without the `hsl()` wrapper — Tailwind adds that via `hsl(var(--token))`.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ── Backgrounds ────────────────────────────────── */
    --background:          40 23% 97%;   /* #faf9f7 — warm white */
    --background-elevated: 0 0% 100%;    /* #ffffff — clean white cards */
    --background-subtle:   34 24% 94%;   /* #f4f1ed — warm off-white panels */

    /* ── Foreground / Text ──────────────────────────── */
    --foreground:          20 13% 9%;    /* #1a1614 — warm near-black */
    --foreground-muted:    27 5% 40%;    /* #6b6560 — warm gray secondary */
    --foreground-dim:      25 6% 59%;    /* #9c9590 — warm gray metadata */

    /* ── Borders ────────────────────────────────────── */
    --border:              32 22% 88%;   /* #e8e2db — warm light border */
    --border-subtle:       36 25% 92%;   /* #f0ece6 — section dividers */

    /* ── Accent (brand indigo) ──────────────────────── */
    --accent:              240 60% 60%;  /* #5b5bd6 — warmer indigo */
    --accent-hover:        241 50% 54%;  /* #4f4ec4 — deeper on hover */
    --accent-muted:        240 48% 95%;  /* #eeeef9 — tinted surface */
    --accent-foreground:   0 0% 100%;    /* #ffffff — white text on accent */

    /* ── Status: success ────────────────────────────── */
    --success:             142 76% 36%;  /* #16a34a */
    --success-bg:          138 76% 97%;  /* #f0fdf4 */
    --success-foreground:  142 72% 29%;  /* #15803d */

    /* ── Status: warning ────────────────────────────── */
    --warning:             32 95% 44%;   /* #d97706 */
    --warning-bg:          48 100% 96%;  /* #fffbeb */
    --warning-foreground:  26 90% 37%;   /* #b45309 */

    /* ── Status: danger ─────────────────────────────── */
    --danger:              0 72% 51%;    /* #dc2626 */
    --danger-bg:           0 86% 97%;    /* #fef2f2 */
    --danger-foreground:   0 74% 42%;    /* #b91c1c */

    /* ── Status: info (replaces blue-950/blue-400) ───── */
    --info:                221 83% 53%;  /* #2563eb */
    --info-bg:             214 100% 97%; /* #eff6ff */
    --info-foreground:     224 76% 48%;  /* #1d4ed8 */

    /* ── Radius scale ───────────────────────────────── */
    --radius:      0.5rem;    /* 8px — base, inputs/buttons */
    --radius-sm:   0.375rem;  /* 6px — badges, chips */
    --radius-md:   0.625rem;  /* 10px — standard components */
    --radius-lg:   0.75rem;   /* 12px — cards, panels */
    --radius-xl:   1rem;      /* 16px — modals, large panels */
    --radius-2xl:  1.25rem;   /* 20px — special large panels */
  }

  .dark {
    /* ── Backgrounds ────────────────────────────────── */
    --background:          30 7% 5%;     /* #0f0e0d — warm deep dark */
    --background-elevated: 30 8% 9%;     /* #1a1816 — card surface */
    --background-subtle:   30 6% 13%;    /* #242220 — sidebar, secondary */

    /* ── Foreground / Text ──────────────────────────── */
    --foreground:          30 21% 93%;   /* #f0ece8 — warm off-white */
    --foreground-muted:    25 6% 59%;    /* #9c9590 — warm gray secondary */
    --foreground-dim:      27 5% 40%;    /* #6b6560 — warm gray metadata */

    /* ── Borders ────────────────────────────────────── */
    --border:              30 7% 17%;    /* #2e2b28 — subtle dark border */
    --border-subtle:       30 6% 13%;    /* #242220 — same as bg-subtle */

    /* ── Accent (indigo — lighter for dark bg) ────────── */
    --accent:              234 89% 74%;  /* #818cf8 — lighter indigo */
    --accent-hover:        230 94% 82%;  /* #a5b4fc — even lighter on hover */
    --accent-muted:        242 37% 18%;  /* #1e1d3f — dark indigo surface */
    --accent-foreground:   0 0% 100%;    /* #ffffff — unchanged */

    /* ── Status: success (dark-adjusted) ───────────────
       Backgrounds become dark tints; foreground stays readable */
    --success:             142 72% 45%;  /* brightened for dark bg */
    --success-bg:          142 76% 8%;   /* dark green tint */
    --success-foreground:  142 69% 58%;  /* bright green text on dark */

    /* ── Status: warning (dark-adjusted) ─────────────── */
    --warning:             38 92% 55%;   /* brightened amber */
    --warning-bg:          38 92% 8%;    /* dark amber tint */
    --warning-foreground:  38 95% 68%;   /* bright amber text on dark */

    /* ── Status: danger (dark-adjusted) ─────────────── */
    --danger:              0 84% 60%;    /* brightened red */
    --danger-bg:           0 74% 8%;     /* dark red tint */
    --danger-foreground:   0 86% 72%;    /* bright red text on dark */

    /* ── Status: info (dark-adjusted) ───────────────── */
    --info:                217 91% 65%;  /* brightened blue */
    --info-bg:             221 83% 8%;   /* dark blue tint */
    --info-foreground:     217 91% 75%;  /* bright blue text on dark */

    /* ── Radius scale — unchanged in dark mode ─────── */
  }
}

@layer base {
  /* Global resets — applied once */
  * {
    @apply border-border;
    box-sizing: border-box;
  }

  html {
    /* Prevent flash on dark mode switch */
    color-scheme: light dark;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
    font-feature-settings: "cv11", "ss01";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Focus visible — global baseline */
  :focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 2px;
  }

  /* Remove focus for mouse users; keep for keyboard */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Shimmer utility — used by Skeleton atom */
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--background-subtle)) 25%,
      hsl(var(--border-subtle)) 50%,
      hsl(var(--background-subtle)) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
  }

  /* Skip-to-content link — accessibility requirement */
  .skip-to-content {
    @apply sr-only;
  }

  .skip-to-content:focus {
    @apply not-sr-only fixed top-4 left-4 z-50 bg-background text-foreground border border-border rounded-md px-4 py-2 text-sm font-medium;
  }
}
```

---

## 5. Token Naming Reference

Full index of every CSS custom property and its corresponding Tailwind class.

### Surface tokens

| CSS Var | Tailwind Class | Hex (light) | Usage |
|---------|---------------|-------------|-------|
| `--background` | `bg-background` / `text-background` | `#faf9f7` | Page backgrounds, sidebar bg |
| `--background-elevated` | `bg-background-elevated` | `#ffffff` | Cards, popovers, modals |
| `--background-subtle` | `bg-background-subtle` | `#f4f1ed` | Secondary panels, hover states |

### Text tokens

| CSS Var | Tailwind Class | Hex (light) | Usage |
|---------|---------------|-------------|-------|
| `--foreground` | `text-foreground` | `#1a1614` | Primary body text, headings |
| `--foreground-muted` | `text-foreground-muted` | `#6b6560` | Secondary text, descriptions |
| `--foreground-dim` | `text-foreground-dim` | `#9c9590` | Metadata, timestamps, captions |

### Border tokens

| CSS Var | Tailwind Class | Hex (light) | Usage |
|---------|---------------|-------------|-------|
| `--border` | `border-border` | `#e8e2db` | Component borders, inputs |
| `--border-subtle` | `border-border-subtle` | `#f0ece6` | Dividers, section separators |

### Accent tokens

| CSS Var | Tailwind Class | Hex (light) | Usage |
|---------|---------------|-------------|-------|
| `--accent` | `bg-accent` / `text-accent` | `#5b5bd6` | Primary CTA, active states, links |
| `--accent-hover` | `hover:bg-accent-hover` | `#4f4ec4` | Hover state on accent elements |
| `--accent-muted` | `bg-accent-muted` | `#eeeef9` | Wizard step bg, selected row bg |
| `--accent-foreground` | `text-accent-foreground` | `#ffffff` | Text on accent backgrounds |

### Status tokens

| CSS Var | Tailwind Classes | Hex (light) | Usage |
|---------|-----------------|-------------|-------|
| `--success` | `text-success` / `bg-success` | `#16a34a` | Won badge text, checkmarks |
| `--success-bg` | `bg-success-bg` | `#f0fdf4` | Won badge bg, success alert bg |
| `--success-foreground` | `text-success-foreground` | `#15803d` | Text on success-bg surface |
| `--warning` | `text-warning` / `bg-warning` | `#d97706` | Warning alert text |
| `--warning-bg` | `bg-warning-bg` | `#fffbeb` | Warning alert bg, case-study badge |
| `--warning-foreground` | `text-warning-foreground` | `#b45309` | Text on warning-bg surface |
| `--danger` | `text-danger` / `bg-danger` | `#dc2626` | Error text, lost badge text |
| `--danger-bg` | `bg-danger-bg` | `#fef2f2` | Error bg, lost badge bg |
| `--danger-foreground` | `text-danger-foreground` | `#b91c1c` | Text on danger-bg surface |
| `--info` | `text-info` / `bg-info` | `#2563eb` | In-progress badge text, info alert |
| `--info-bg` | `bg-info-bg` | `#eff6ff` | In-progress badge bg, past-proposal badge |
| `--info-foreground` | `text-info-foreground` | `#1d4ed8` | Text on info-bg surface |

### Radius tokens

| CSS Var | Tailwind Class | Value | Usage |
|---------|---------------|-------|-------|
| `--radius-sm` | `rounded-sm` | 6px | Badges, chips, tiny elements |
| `--radius` | `rounded` / `rounded-md` | 8px | Inputs, buttons |
| `--radius-md` | `rounded-md` | 10px | Standard components (formerly rounded-lg) |
| `--radius-lg` | `rounded-lg` | 12px | Cards, panels, containers |
| `--radius-xl` | `rounded-xl` | 16px | Modals, drawers, large overlays |
| `--radius-2xl` | `rounded-2xl` | 20px | Special large panels |
| N/A | `rounded-full` | 9999px | Avatars, pill badges, step circles |

### Shadow elevation system

| Tailwind Class | Value | Elevation level | Usage |
|---------------|-------|-----------------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | 1 — cards | Cards resting on background |
| `shadow` / `shadow-md` | `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | 2 — floating | Dropdowns, popovers, floating panels |
| `shadow-lg` | `0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)` | 3 — modal | Modals, dialogs |
| `shadow-xl` | `0 24px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)` | 4 — spotlight | Command palettes, top-level overlays |
| `shadow-sticky` | `0 2px 8px rgba(0,0,0,0.06)` | 1.5 — sticky | Sticky header only |
| `shadow-none` | none | 0 — flat | Content cards embedded in surface |

> Dark mode: shadows are naturally less visible on dark backgrounds. No dark-mode shadow override required — the rgba values are already low-opacity.

### Spacing semantic names

| Token | Value | Tailwind equiv | Usage |
|-------|-------|---------------|-------|
| `spacing-2xs` | 2px | `p-0.5`, `gap-0.5` | Hairline separators |
| `spacing-xs` | 4px | `p-1`, `gap-1` | Tight internal (icon to label) |
| `spacing-sm` | 8px | `p-2`, `gap-2` | Component internal, badge padding |
| `spacing-md` | 16px | `p-4`, `gap-4` | Card padding, section padding |
| `spacing-lg` | 24px | `p-6`, `gap-6` | Section padding, row padding |
| `spacing-xl` | 32px | `p-8`, `gap-8` | Between major sections |
| `spacing-2xl` | 48px | `p-12`, `gap-12` | Large section gaps |
| `spacing-3xl` | 64px | `p-16` | Hero / feature section |
| `spacing-4xl` | 80px | `p-20` | Landing section vertical rhythm |

### Typography scale

| Token | Size | Weight | Line-height | Letter-spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-2xs` | 11px | 400 | 1.4 | 0 | Count badges, tiny metadata (replaces text-[10px], text-[11px]) |
| `text-xs` | 12px | 400 | 1.4 | 0 | Captions, timestamps, breadcrumbs |
| `text-sm` | 14px | 400/500 | 1.5 | 0 | Body small, button labels, table cells (replaces text-[13px]) |
| `text-base` | 16px | 400 | 1.6 | 0 | Body default, form labels (replaces text-[15px]) |
| `text-lg` | 20px | 500 | 1.4 | -0.01em | Subsection headings (h3) |
| `text-xl` | 24px | 600 | 1.3 | -0.02em | Section headings (h2), page H1 — app pages |
| `text-2xl` | 30px | 600 | 1.2 | -0.02em | Page headings (h1) — landing sections |
| `text-3xl` | 36px | 700 | 1.1 | -0.02em | Display / large landing headings |
| `text-4xl` | 48px | 700 | 1.1 | -0.02em | Hero display heading |

---

## 6. Migration Notes for Phase 2

### Tokens retired — exact replacements

| Retired token | Replace with |
|---------------|-------------|
| `bg-pp-background` | `bg-background` |
| `bg-pp-background-card` | `bg-background-elevated` |
| `bg-pp-background-elevated` | `bg-background-subtle` |
| `text-pp-foreground` | `text-foreground` |
| `text-pp-foreground-muted` | `text-foreground-muted` |
| `text-pp-foreground-dim` | `text-foreground-dim` (new) |
| `text-pp-accent` | `text-accent` |
| `bg-pp-accent` | `bg-accent` |
| `bg-pp-accent/10` | `bg-accent-muted` |
| `border-pp-border` | `border-border` |
| `border-pp-accent/60` | `border-accent/60` |
| `bg-pp-success-bg` | `bg-success-bg` |
| `text-pp-success-text` | `text-success-foreground` |
| `bg-pp-danger-bg` | `bg-danger-bg` |
| `text-pp-danger-text` | `text-danger-foreground` |
| `bg-pp-warning-bg` | `bg-warning-bg` |
| `text-pp-warning-text` | `text-warning-foreground` |

### Off-token classes to replace

| Current usage | Replace with | Notes |
|---------------|-------------|-------|
| `bg-blue-950 text-blue-400` | `bg-info-bg text-info-foreground` | In-progress and past-proposal badges |
| `bg-purple-950 text-purple-400` | `bg-accent-muted text-accent` | Review status and methodology badges |
| `bg-cyan-950 text-cyan-400` | `bg-background-subtle text-foreground-muted` | Capability badges (no strong semantic match) |
| `bg-[#060b18]` | `bg-background` (dark mode default) | 7 landing files |
| `text-slate-400` | `text-foreground-muted` | Landing text |
| `bg-slate-800` / `bg-slate-900/60` | `bg-background-elevated` or `bg-background-subtle` | Landing cards |
| `bg-indigo-600` | `bg-accent` | Landing CTAs |
| `text-indigo-400` | `text-accent` | Landing links |
| `border-slate-800` | `border-border` | Landing dividers |
| `bg-primary text-primary-foreground` (active tabs) | `bg-accent text-accent-foreground` | Filter tabs on dashboard/KB/settings |
| `text-destructive` | `text-danger` | Error text on forms and errors |
| `bg-card border-border` (Shadcn defaults on brand-voice) | `bg-background-elevated border-border` | Brand voice profile card |

### Arbitrary font sizes to replace

| Current | Replace with | Location |
|---------|-------------|----------|
| `text-[10px]` | `text-2xs` | dashboard badge, KB count badge |
| `text-[11px]` | `text-2xs` | sidebar version, KB search, requirements sidebar |
| `text-[13px]` | `text-sm` | requirements sidebar text (1px diff, imperceptible) |
| `text-[15px]` | `text-base` | proposal editor body (1px diff, imperceptible) |

### Spacing off-grid fixes

| Current | Replace with | Notes |
|---------|-------------|-------|
| `px-2.5 py-1.5` (filter tabs) | `px-3 py-2` | Achieves 40px min touch target |
| `py-2.5` (settings tabs) | `py-2` or `py-3` | Aligns to 8px grid |
| `gap-1.5` (filter tab group) | `gap-2` | On-grid |
| `gap-3` (stats grid) | `gap-4` | On-grid, better visual separation |

### Landing page card radius fix

Landing cards currently use `rounded-xl` (12px), app cards use `rounded-lg` (8px). With the new scale, this maps to:
- Landing cards: `rounded-lg` → 12px (--radius-lg)
- App cards: `rounded-lg` → 12px (--radius-lg) — now unified

Both use the same `rounded-lg` class which now resolves to 12px via `--radius-lg: 0.75rem`.

---

## 7. Quality Checklist (Phase 2 agents verify before completing any file)

- [ ] Zero `pp-*` class references remain in modified files
- [ ] Zero arbitrary color values (`bg-[#...]`, `text-[#...]`) remain
- [ ] Zero `bg-slate-*`, `text-slate-*`, `bg-indigo-*`, `text-indigo-*` raw classes remain
- [ ] Zero `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]` arbitrary sizes remain
- [ ] All status badges use `bg-{status}-bg text-{status}-foreground` pattern
- [ ] `bg-primary` active tabs migrated to `bg-accent text-accent-foreground`
- [ ] `text-destructive` migrated to `text-danger`
- [ ] `border-border` (Shadcn compat) and `border-border` (semantic) resolve to same CSS var
- [ ] `tsc --noEmit` passes after each file migration
- [ ] Dark mode tested: no white-on-white or black-on-black text
