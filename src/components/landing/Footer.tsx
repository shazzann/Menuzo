import { useApp } from '@/store';

export function Footer() {
  const { state, dispatch } = useApp();

  const handleNavigate = (view: 'terms' | 'privacy' | 'contact' | 'about') => {
    dispatch({ type: 'SET_VIEW', payload: view });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const scrollToSection = () => {
      if (href === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    if (state.currentView !== 'landing') {
      dispatch({ type: 'SET_VIEW', payload: 'landing' });
      window.setTimeout(scrollToSection, 40);
      return;
    }
    scrollToSection();
  };

  return (
    <footer className="bg-card border-t border-border py-12 text-foreground">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-8 border-b border-border">
          <div className="max-w-sm">
            <img
              src="/logo/logo-light-sm.webp"
              alt="Menuzo"
              width={240}
              height={120}
              className="h-7 w-auto mb-3 dark:hidden"
              loading="lazy"
            />
            <img
              src="/logo/logo-dark-sm.webp"
              alt="Menuzo"
              width={240}
              height={120}
              className="h-7 w-auto mb-3 hidden dark:block"
              loading="lazy"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              QR-based digital menus for Sri Lankan cafés and restaurants. Update prices and sold-out dishes any time.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground"
          >
            <a
              href="#home"
              onClick={(e) => handleSectionLink(e, '#home')}
              className="hover:text-primary transition-colors"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSectionLink(e, '#how-it-works')}
              className="hover:text-primary transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={(e) => handleSectionLink(e, '#features')}
              className="hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSectionLink(e, '#pricing')}
              className="hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSectionLink(e, '#faq')}
              className="hover:text-primary transition-colors"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => handleNavigate('contact')}
              className="hover:text-primary transition-colors text-left"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('about')}
              className="hover:text-primary transition-colors text-left"
            >
              About Us
            </button>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Menuzo. Sri Lanka (LKR). All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavigate('privacy')}
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('terms')}
              className="hover:text-primary transition-colors"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
