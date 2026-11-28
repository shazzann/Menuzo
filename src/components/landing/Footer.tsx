import type { MouseEvent } from 'react';
import { useApp } from '@/store';
import type { View } from '@/types';
import { getPublicEmailUrl, getPublicWhatsAppUrl } from '@/lib/contact';

export function Footer() {
  const { dispatch } = useApp();

  const supportHref =
    getPublicWhatsAppUrl('Hello Menuzo, I would like to get in touch regarding Menuzo.') ||
    getPublicEmailUrl('Menuzo Support Enquiry');

  const handleNavigate = (view: View) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionLink = (e: MouseEvent<HTMLAnchorElement>, selector: string) => {
    e.preventDefault();
    const scrollToSection = () => {
      if (selector === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    scrollToSection();
  };

  return (
    <footer className="bg-card border-t border-border py-12 text-foreground">
      <div className="landing-container">
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
              Digital QR menu management for cafés, restaurants, and food businesses. Update prices and sold-out dishes anytime.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-muted-foreground"
          >
            <a
              href="#product"
              onClick={(e) => handleSectionLink(e, '#product')}
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors"
            >
              Product
            </a>
            <a
              href="#features"
              onClick={(e) => handleSectionLink(e, '#features')}
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSectionLink(e, '#pricing')}
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSectionLink(e, '#faq')}
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors"
            >
              FAQ
            </a>
            <a
              href={supportHref}
              target={supportHref.startsWith('http') ? '_blank' : undefined}
              rel={supportHref.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors text-left"
            >
              Support
            </a>
            <button
              type="button"
              onClick={() => handleNavigate('about')}
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors text-left"
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
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('terms')}
              className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-primary transition-colors"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
