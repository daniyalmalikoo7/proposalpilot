"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "@/lib/theme";
import { clerkAppearanceLight, clerkAppearanceDark } from "@/lib/clerk-appearance";

export function ClerkThemedSignIn() {
  const { theme } = useTheme();
  const appearance = theme === "dark" ? clerkAppearanceDark : clerkAppearanceLight;
  return <SignIn appearance={appearance} />;
}

export function ClerkThemedSignUp() {
  const { theme } = useTheme();
  const appearance = theme === "dark" ? clerkAppearanceDark : clerkAppearanceLight;
  return <SignUp appearance={appearance} />;
}
