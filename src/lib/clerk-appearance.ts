/**
 * Clerk appearance configuration — maps ProposalPilot's design tokens to
 * Clerk's widget styling API. Values mirror globals.css :root and .dark tokens.
 *
 * Light:  bg #faf9f7, accent #5b5bd6, text #1a1614
 * Dark:   bg #0f0e0d, accent #818cf8, text #f0ece8
 */

import type { Appearance } from "@clerk/types";

const shared = {
  fontFamily:
    'var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  borderRadius: "0.75rem",
} as const;

export const clerkAppearanceLight: Appearance = {
  variables: {
    ...shared,
    colorPrimary: "hsl(240 60% 60%)",          /* --accent */
    colorBackground: "hsl(40 23% 97%)",         /* --background */
    colorInputBackground: "hsl(0 0% 100%)",     /* --background-elevated */
    colorInputText: "hsl(20 13% 9%)",           /* --foreground */
    colorText: "hsl(20 13% 9%)",                /* --foreground */
    colorTextSecondary: "hsl(27 5% 40%)",       /* --foreground-muted */
    colorNeutral: "hsl(32 22% 88%)",            /* --border */
    colorDanger: "hsl(0 72% 51%)",              /* --danger */
    colorSuccess: "hsl(142 76% 36%)",           /* --success */
  },
};

export const clerkAppearanceDark: Appearance = {
  variables: {
    ...shared,
    colorPrimary: "hsl(234 89% 74%)",           /* --accent dark */
    colorBackground: "hsl(30 7% 5%)",           /* --background dark */
    colorInputBackground: "hsl(30 8% 9%)",      /* --background-elevated dark */
    colorInputText: "hsl(30 21% 93%)",          /* --foreground dark */
    colorText: "hsl(30 21% 93%)",               /* --foreground dark */
    colorTextSecondary: "hsl(25 6% 59%)",       /* --foreground-muted dark */
    colorNeutral: "hsl(30 7% 17%)",             /* --border dark */
    colorDanger: "hsl(0 84% 60%)",              /* --danger dark */
    colorSuccess: "hsl(142 72% 45%)",           /* --success dark */
  },
};
