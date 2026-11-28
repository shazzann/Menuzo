import '@/components/landing/landing.css';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ProofSection } from '@/components/landing/ProofSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

export function LandingPage() {
  return (
    <div className="landing min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ProofSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
