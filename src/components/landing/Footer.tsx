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
    <footer className="bg-[#F3F5F0] border-t border-[#D2D8CF] py-12 text-[#12261F]">
      <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-8 border-b border-[#D2D8CF]">
          <div className="max-w-sm">
            <img
              src="/logo/Logo main4tight.png"
              alt="Menuzo"
              width={120}
              height={32}
              className="h-7 w-auto mb-3"
              loading="lazy"
            />
            <p className="text-sm text-[#3D4A44] leading-relaxed">
              QR-based digital menus for Sri Lankan cafés and restaurants. Update prices and sold-out dishes any time.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-[#3D4A44]">
            <a
              href="#home"
              onClick={(e) => handleSectionLink(e, '#home')}
              className="hover:text-[#12261F]"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSectionLink(e, '#how-it-works')}
              className="hover:text-[#12261F]"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={(e) => handleSectionLink(e, '#features')}
              className="hover:text-[#12261F]"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSectionLink(e, '#pricing')}
              className="hover:text-[#12261F]"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSectionLink(e, '#faq')}
              className="hover:text-[#12261F]"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => handleNavigate('contact')}
              className="hover:text-[#12261F] text-left"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('about')}
              className="hover:text-[#12261F] text-left"
            >
              About Us
            </button>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#3D4A44]">
          <p>© {new Date().getFullYear()} Menuzo. Sri Lanka (LKR). All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavigate('privacy')}
              className="hover:text-[#12261F]"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('terms')}
              className="hover:text-[#12261F]"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
