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
        DEFAULT: "var(--radius)",    // 8px — inputs, buttons
        md: "var(--radius-md)",      // 10px — standard components
        lg: "var(--radius-lg)",      // 12px — cards, panels
        xl: "var(--radius-xl)",      // 16px — modals, overlays
        "2xl": "var(--radius-2xl)", // 20px — large panels
        full: "9999px",              // pills, avatars
      },

      // ─────────────────────────────────────────────────
      // SPACING — semantic names on 8px grid
      // ─────────────────────────────────────────────────
      spacing: {
        "2xs": "2px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "80px",
      },

      // ─────────────────────────────────────────────────
      // TYPOGRAPHY — size scale
      // ─────────────────────────────────────────────────
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
        xs: ["12px", { lineHeight: "1.4" }],
        sm: ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.6" }],
        md: ["16px", { lineHeight: "1.6" }],
        lg: ["20px", { lineHeight: "1.4" }],
        xl: ["24px", { lineHeight: "1.3" }],
        "2xl": ["30px", { lineHeight: "1.2" }],
        "3xl": ["36px", { lineHeight: "1.1" }],
        "4xl": ["48px", { lineHeight: "1.1" }],
      },

      // ─────────────────────────────────────────────────
      // FONT WEIGHT
      // ─────────────────────────────────────────────────
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      // ─────────────────────────────────────────────────
      // LINE HEIGHT
      // ─────────────────────────────────────────────────
      lineHeight: {
        tight: "1.1",
        snug: "1.3",
        normal: "1.5",
        relaxed: "1.6",
        loose: "1.8",
      },

      // ─────────────────────────────────────────────────
      // LETTER SPACING
      // ─────────────────────────────────────────────────
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0em",
        wide: "0.05em",
      },

      // ─────────────────────────────────────────────────
      // BOX SHADOW — warm-refined elevation system
      // ─────────────────────────────────────────────────
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        DEFAULT:
          "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        lg: "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
        xl: "0 24px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)",
        sticky: "0 2px 8px rgba(0,0,0,0.06)",
        none: "none",
      },

      // ─────────────────────────────────────────────────
      // KEYFRAMES
      // ─────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-4px)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s linear infinite",
        "fade-in": "fade-in 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-out": "fade-out 150ms cubic-bezier(0.7, 0, 1, 0.5) forwards",
        "slide-in": "slide-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        sweep: "sweep 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
