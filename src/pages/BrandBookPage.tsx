import { useState, useEffect, useCallback } from 'react';
import { brandBookSections } from '@/content/brand-book';
import { BrandBookNav } from '@/components/brand-book/BrandBookNav';
import { BrandBookMobileNav } from '@/components/brand-book/BrandBookMobileNav';
import { BackToTop } from '@/components/brand-book/BrandBookPrimitives';
import { BrandBookHero, IntroductionSection, BrandDNASection, IdentitySection, VoiceSection } from '@/components/brand-book/BrandBookStrategySections';
import { VisualLanguageSection, ComponentsSection } from '@/components/brand-book/BrandBookVisualSections';
import { ApplicationsSection, ResourcesSection } from '@/components/brand-book/BrandBookResourceSections';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useApp } from '@/store';
import { ArrowLeft } from 'lucide-react';

export function BrandBookPage() {
  const { dispatch } = useApp();
  const [activeSection, setActiveSection] = useState('introduction');
  const [progress, setProgress] = useState(0);

  // SEO — dynamic title, meta description, and JSON-LD
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Menuzo Brand Book — Complete Identity System';
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') || '';
    metaDesc?.setAttribute('content', 'The official Menuzo brand identity guide. Colors, typography, voice, components, and design tokens for designers, developers, and partners.');

    // Inject JSON-LD
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.id = 'brand-book-json-ld';
    jsonLd.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Menuzo Brand Book",
      "description": "The official Menuzo brand identity guide.",
      "url": window.location.href,
      "publisher": {
        "@type": "Organization",
        "name": "Menuzo",
        "logo": {
          "@type": "ImageObject",
          "url": "https://menuzo.com/logo/Logo%20main4tight.png"
        }
      }
    });
    document.head.appendChild(jsonLd);

    return () => {
      document.title = originalTitle;
      metaDesc?.setAttribute('content', originalDesc);
      document.getElementById('brand-book-json-ld')?.remove();
    };
  }, []);

  // Scroll spy — detect which section is in view
  useEffect(() => {
    const allIds: string[] = [];
    brandBookSections.forEach((s) => {
      allIds.push(s.id);
      if (s.subsections) s.subsections.forEach((sub) => allIds.push(sub.id));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        let maxVisibility = 0;
        let mostVisibleSection = activeSection;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            mostVisibleSection = entry.target.id;
          }
        });

        if (maxVisibility > 0 && mostVisibleSection !== activeSection) {
          setActiveSection(mostVisibleSection);
        }
      },
      { root: null, rootMargin: '-10% 0px -80% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSection]);

  // Update progress bar based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const scrollTop = window.scrollY;
      const progressAmount = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, progressAmount)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = window.innerWidth >= 1024 ? 24 : 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // Compute Breadcrumbs
  let currentBreadcrumbs = ['Brand Book'];
  const activeParent = brandBookSections.find((s) => s.id === activeSection || s.subsections?.some((sub) => sub.id === activeSection));
  if (activeParent && activeParent.id !== 'introduction') {
    currentBreadcrumbs.push(activeParent.title);
    if (activeParent.id !== activeSection) {
      const sub = activeParent.subsections?.find((sub) => sub.id === activeSection);
      if (sub) currentBreadcrumbs.push(sub.title);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <BrandBookNav activeSection={activeSection} onNavigate={navigateToSection} progress={progress} />

      {/* Mobile nav */}
      <BrandBookMobileNav activeSection={activeSection} onNavigate={navigateToSection} progress={progress} />

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Top bar with back + theme toggle */}
        <div className="hidden lg:flex sticky top-0 z-20 items-center justify-between px-8 py-3 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Menuzo
            </button>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
              {currentBreadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={i === currentBreadcrumbs.length - 1 ? 'text-foreground font-semibold' : ''}>{crumb}</span>
                  {i < currentBreadcrumbs.length - 1 && <span>/</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="px-5 md:px-8 lg:px-12 xl:px-16 max-w-[900px] pt-16 lg:pt-4 pb-24 space-y-20">
          <div className="lg:hidden flex items-center gap-2 text-[10px] font-medium text-muted-foreground/60 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
             {currentBreadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <span className={i === currentBreadcrumbs.length - 1 ? 'text-foreground font-semibold' : ''}>{crumb}</span>
                  {i < currentBreadcrumbs.length - 1 && <span>/</span>}
                </div>
              ))}
          </div>
          
          <BrandBookHero />
          <IntroductionSection />
          <BrandDNASection />
          <IdentitySection />
          <VoiceSection />
          <VisualLanguageSection />
          <ComponentsSection />
          <ApplicationsSection />
          <ResourcesSection />

          {/* Footer */}
          <footer className="pt-12 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Menuzo. Brand Book v1.0 — Confidential.
            </p>
          </footer>
        </div>
      </main>

      <BackToTop />
    </div>
  );
}
