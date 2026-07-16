import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';

import { QRShowcaseSection } from '@/components/landing/QRShowcaseSection';
import { AnalyticsSection } from '@/components/landing/AnalyticsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';
import { MobileFloatingCTA } from '@/components/landing/MobileFloatingCTA';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main className="relative">
        <HeroSection />
        <ProblemSolutionSection />
        <FeaturesSection />
        <UseCasesSection />
        <HowItWorksSection />
        <QRShowcaseSection />

        <AnalyticsSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <MobileFloatingCTA />
    </div>
  );
}
