"use client";

// ThemedUserButton — mirrors the ClerkThemedSignIn/SignUp pattern:
// switches between clerkAppearanceLight/Dark so Clerk's own variable
// system matches the active theme, then layers CSSObject element overrides
// that reference our CSS custom properties.
//
// CSS variables (hsl(var(--token))) resolve at browser paint time from
// :root / .dark — no !important needed, no hard-coded hex values.

import { UserButton } from "@clerk/nextjs";
import type { Appearance } from "@clerk/types";
import { useTheme } from "@/lib/theme";
import { clerkAppearanceLight, clerkAppearanceDark } from "@/lib/clerk-appearance";

// Popover element overrides — shared across light and dark.
// CSSObject values reference CSS custom properties defined in globals.css.
// The browser evaluates hsl(var(--token)) against :root / .dark at paint time,
// so the same rules produce the correct result in both themes automatically.
const popoverElements: Appearance["elements"] = {
  avatarBox: "h-9 w-9",

  userButtonPopoverCard: {
    backgroundColor: "hsl(var(--background-elevated))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "1rem",   // --radius-xl (16px)
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  },

  userButtonPopoverActionButton: {
    color: "hsl(var(--foreground))",
    borderRadius: "0.75rem", // --radius-lg (12px)
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },

  userButtonPopoverActionButtonText: {
    color: "hsl(var(--foreground))",
    fontSize: "14px",
    fontWeight: "500",
  },

  userButtonPopoverActionButtonIcon: {
    color: "hsl(var(--foreground-muted))",
  },

  // Hide "Secured by Clerk" / dev-mode footer — not relevant to users.
  userButtonPopoverFooter: { display: "none" },
};

export function ThemedUserButton() {
  const { theme } = useTheme();
  const base = theme === "dark" ? clerkAppearanceDark : clerkAppearanceLight;

  return (
    <UserButton
      signInUrl="/sign-in"
      appearance={{ ...base, elements: popoverElements }}
    />
  );
}
