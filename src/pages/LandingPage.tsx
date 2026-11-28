import { useEffect, useRef, type RefObject } from 'react';
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

/** Fades `.landing-reveal` blocks in once as they scroll into view (CSS-only motion, no-op under reduced motion). */
function useScrollReveal(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    root.querySelectorAll('.landing-reveal').forEach((el) => observer.observe(el));
    root.dataset.reveal = 'on';

    return () => {
      observer.disconnect();
      delete root.dataset.reveal;
    };
  }, [rootRef]);
}

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div
      ref={rootRef}
      className="landing min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-foreground"
    >
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
