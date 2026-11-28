import { useEffect, useState } from 'react';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SwitchAccountButton } from '@/components/shared/SwitchAccountButton';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'How it works', href: '#how-it-works' },
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const { state, dispatch } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTarget = (href: string) => {
    setMobileMenuOpen(false);
    const scrollNow = () => {
      if (href === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const element = document.querySelector(href);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    if (state.currentView !== 'landing' && href.startsWith('#')) {
      dispatch({ type: 'SET_VIEW', payload: 'landing' });
      window.setTimeout(scrollNow, 40);
      return;
    }
    scrollNow();
  };

  const handlePrimaryClick = (source: string) => {
    setMobileMenuOpen(false);
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
      <div className="landing-container h-16 flex items-center justify-between gap-4">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget('#home');
          }}
          className="inline-flex items-center shrink-0 rounded-md"
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
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget(link.href);
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
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
                className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium px-4 gap-2"
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
                className="px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                Log in
              </button>
              <Button
                size="sm"
                onClick={() => handlePrimaryClick('navbar')}
                className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium px-4"
              >
                Build my free menu
              </Button>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          {state.authChecking && !state.user ? (
            <div className="h-9 w-24 rounded-xl bg-muted/70" aria-hidden="true" />
          ) : (
            <Button
              size="sm"
              onClick={() => handlePrimaryClick('navbar_mobile')}
              className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium px-3 text-xs sm:text-sm"
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
            className="rounded-xl"
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
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget(link.href);
                }}
                className="py-2.5 px-2 text-base font-medium text-foreground hover:text-primary transition-colors border-b border-border/60 last:border-b-0"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2.5">
            {state.authChecking && !state.user ? (
              <div className="h-10 w-full rounded-xl bg-muted/70" aria-label="Checking account status" />
            ) : state.user ? (
              <>
                <p className="text-xs text-muted-foreground break-all">{state.user.email}</p>
                <div className="flex items-center justify-between gap-2">
                  <SwitchAccountButton />
                  <Button
                    onClick={() => handlePrimaryClick('navbar_mobile_drawer')}
                    className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium flex-1 gap-2"
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
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </button>
                <Button
                  onClick={() => handlePrimaryClick('navbar_mobile_drawer')}
                  className="rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium flex-1"
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
