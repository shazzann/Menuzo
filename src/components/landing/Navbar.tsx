import { useEffect, useState } from 'react';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SwitchAccountButton } from '@/components/shared/SwitchAccountButton';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';

const navLinks = [
  { name: 'Product', href: '#product', id: 'product' },
  { name: 'Features', href: '#features', id: 'features' },
  { name: 'Pricing', href: '#pricing', id: 'pricing' },
  { name: 'FAQ', href: '#faq', id: 'faq' },
];

export function Navbar() {
  const { state, dispatch } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sectionIds = navLinks.map((link) => link.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.4] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToTarget = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('');
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrimaryClick = (source: string) => {
    setMobileMenuOpen(false);
    trackEvent('hero_cta_clicked', { source });
    if (state.user) {
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
      return;
    }
    trackEvent('signup_started', { source });
    dispatch({ type: 'SET_VIEW', payload: 'signup' });
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-150 ${
        isScrolled
          ? 'bg-background/95 border-b border-border'
          : 'bg-background border-b border-transparent'
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-primary focus:text-[#12261F] focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>

      <div className="landing-container h-16 flex items-center justify-between gap-4">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget('#home');
          }}
          className="inline-flex items-center shrink-0 min-h-[44px] py-1.5 rounded-md"
          aria-label="Menuzo home"
        >
          <img
            src="/logo/logo-light-sm.webp"
            alt="Menuzo"
            width={240}
            height={120}
            className="h-7 w-auto dark:hidden"
          />
          <img
            src="/logo/logo-dark-sm.webp"
            alt="Menuzo"
            width={240}
            height={120}
            className="h-7 w-auto hidden dark:block"
          />
        </a>

        <nav className="hidden md:flex items-center gap-6 lg:gap-7" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget(link.href);
                }}
                className={`text-sm font-medium transition-colors whitespace-nowrap py-2 ${
                  isActive
                    ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {state.authChecking && !state.user ? (
            <div
              className="h-9 w-40 rounded-xl bg-muted/70"
              role="status"
              aria-label="Checking account status"
            />
          ) : state.user ? (
            <>
              <SwitchAccountButton />
              <Button
                size="sm"
                onClick={() => handlePrimaryClick('navbar')}
                className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium px-4 gap-2 h-10"
              >
                <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                Log in
              </button>
              <Button
                size="sm"
                onClick={() => handlePrimaryClick('navbar')}
                className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium px-4 h-10 transition-[color,background-color,transform] active:scale-[0.98]"
              >
                Build my free menu
              </Button>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1.5">
          <div className="inline-flex items-center justify-center [&_button]:min-h-[44px] [&_button]:min-w-[44px]">
            <ThemeToggle />
          </div>
          {state.authChecking && !state.user ? (
            <div className="h-11 w-24 rounded-xl bg-muted/70" aria-hidden="true" />
          ) : (
            <Button
              size="sm"
              onClick={() => handlePrimaryClick('navbar_mobile')}
              className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium px-3.5 min-h-[44px] text-xs sm:text-sm"
            >
              {state.user ? 'Dashboard' : 'Start free'}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="rounded-xl min-h-[44px] min-w-[44px]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="landing-mobile-nav"
          className="md:hidden border-t border-border bg-card px-4 py-4"
        >
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget(link.href);
                }}
                className="min-h-[44px] flex items-center px-2 text-base font-medium text-foreground hover:text-primary transition-colors border-b border-border/60 last:border-b-0"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2.5">
            {state.authChecking && !state.user ? (
              <div className="h-11 w-full rounded-xl bg-muted/70" aria-label="Checking account status" />
            ) : state.user ? (
              <>
                <p className="text-xs text-muted-foreground break-all">{state.user.email}</p>
                <div className="flex items-center justify-between gap-2">
                  <SwitchAccountButton />
                  <Button
                    onClick={() => handlePrimaryClick('navbar_mobile_drawer')}
                    className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium flex-1 min-h-[44px] gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                    Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    dispatch({ type: 'SET_VIEW', payload: 'login' });
                  }}
                  className="min-h-[44px] px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl"
                >
                  Log in
                </button>
                <Button
                  onClick={() => handlePrimaryClick('navbar_mobile_drawer')}
                  className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium flex-1 min-h-[44px]"
                >
                  Build my free menu
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
