import { LandingNav } from "./_components/landing/nav";
import { LandingHero } from "./_components/landing/hero";
import { ProblemSolution } from "./_components/landing/problem-solution";
import { HowItWorks } from "./_components/landing/how-it-works";
import { Features } from "./_components/landing/features";
import { Pricing } from "./_components/landing/pricing";
import { LandingFooter } from "./_components/landing/footer";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
        <ProblemSolution />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
      <LandingFooter />
    </div>
  );
}
