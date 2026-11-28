import { useEffect, useState } from 'react';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { useApp } from '@/store';
import { SwitchAccountButton } from '@/components/shared/SwitchAccountButton';
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
          ? 'bg-[#F3F5F0]/95 border-b border-[#D2D8CF]'
          : 'bg-[#F3F5F0] border-b border-transparent'
      }`}
    >
      <div className="landing-container h-16 flex items-center justify-between gap-4">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget('#home');
          }}
          className="inline-flex items-center shrink-0 rounded-[4px]"
          aria-label="Menuzo home"
        >
          <img
            src="/logo/Logo main4tight.png"
            alt="Menuzo"
            width={120}
            height={32}
            className="h-7 w-auto"
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
              className="text-sm font-medium text-[#3D4A44] hover:text-[#12261F] transition-colors whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {state.authChecking && !state.user ? (
            <div
              className="h-9 w-44 rounded-[4px] bg-[#E3E7DF]"
              role="status"
              aria-label="Checking account status"
            />
          ) : state.user ? (
            <>
              <SwitchAccountButton />
              <button
                type="button"
                onClick={() => handlePrimaryClick('navbar')}
                className="landing-btn landing-btn-dark !min-h-[38px] !py-2 !px-4 text-sm"
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
                className="px-3 py-2 text-sm font-semibold text-[#12261F] hover:text-[#3D4A44] rounded-[4px]"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => handlePrimaryClick('navbar')}
                className="landing-btn landing-btn-primary !min-h-[38px] !py-2 !px-4 text-sm"
              >
                Build my free menu
              </button>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          {state.authChecking && !state.user ? (
            <div className="h-9 w-28 rounded-[4px] bg-[#E3E7DF]" aria-hidden="true" />
          ) : (
            <button
              type="button"
              onClick={() => handlePrimaryClick('navbar_mobile')}
              className="landing-btn landing-btn-primary !min-h-[38px] !py-1.5 !px-3 text-xs sm:text-sm"
            >
              {state.user ? 'Dashboard' : 'Start free'}
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 rounded-[4px] border border-[#D2D8CF] bg-white text-[#12261F]"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="landing-mobile-nav"
          className="md:hidden border-t border-[#D2D8CF] bg-white px-4 py-4"
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
                className="py-2.5 px-2 text-base font-medium text-[#12261F] border-b border-[#EAECE6] last:border-b-0"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="mt-4 pt-3 border-t border-[#D2D8CF] flex flex-col gap-2">
            {state.authChecking && !state.user ? (
              <div className="h-11 w-full rounded-[4px] bg-[#EAECE6]" aria-label="Checking account status" />
            ) : state.user ? (
              <>
                <p className="text-xs text-[#3D4A44] break-all">{state.user.email}</p>
                <div className="flex items-center justify-between gap-2">
                  <SwitchAccountButton />
                  <button
                    type="button"
                    onClick={() => handlePrimaryClick('navbar_mobile_drawer')}
                    className="landing-btn landing-btn-dark flex-1"
                  >
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    Dashboard
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    dispatch({ type: 'SET_VIEW', payload: 'login' });
                  }}
                  className="landing-btn landing-btn-secondary w-full"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => handlePrimaryClick('navbar_mobile_drawer')}
                  className="landing-btn landing-btn-primary w-full"
                >
                  Build my free menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
