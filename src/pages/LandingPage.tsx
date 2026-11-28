import '@/components/landing/landing.css';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProofSection } from '@/components/landing/ProofSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AudienceSection } from '@/components/landing/AudienceSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

export function LandingPage() {
  return (
    <div className="landing min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <ProofSection />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <ProductShowcaseSection />
        <FeaturesSection />
        <AudienceSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
