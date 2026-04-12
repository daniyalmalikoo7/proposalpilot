// C1 fix: ClerkProvider requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY at runtime.
// Forcing dynamic rendering on the root layout prevents static prerender from
// running before the key is available in the build environment.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearanceLight } from "@/lib/clerk-appearance";
import { TRPCReactProvider } from "@/lib/trpc/provider";
import { ThemeProvider } from "@/lib/theme";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ProposalPilot — AI-Powered Proposal Engine",
  description:
    "Win more bids with AI-generated proposals that match your brand voice and meet every requirement.",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
      appearance={clerkAppearanceLight}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <TRPCReactProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
