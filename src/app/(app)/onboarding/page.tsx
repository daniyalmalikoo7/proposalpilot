import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/organisms/onboarding-wizard";

export const metadata: Metadata = {
  title: "Get Started — ProposalPilot",
};

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to ProposalPilot
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set up in 3 quick steps so the AI can write proposals in your voice.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
