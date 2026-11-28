import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FREE_PLAN_LIMITS } from '@/lib/subscription';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

const faqs = [
  {
    q: 'Do customers need to download an app?',
    a: 'No. Customers can scan the QR code and open the menu directly in their browser.',
  },
  {
    q: 'Can customers order and pay through Menuzo?',
    a: 'Menuzo currently provides digital menu browsing. Customers place orders directly with restaurant staff.',
  },
  {
    q: 'Can I change a menu after publishing it?',
    a: 'Yes. Changes made to the published menu are reflected when customers open it.',
  },
  {
    q: 'Can I use Menuzo for free?',
    a: `Yes. The Free plan supports up to ${FREE_PLAN_LIMITS.items} food items and ${FREE_PLAN_LIMITS.categories} categories with no credit card required.`,
  },
  {
    q: 'Do I need technical knowledge?',
    a: 'No. The menu management interface is designed to help restaurant owners manage their menus without coding.',
  },
  {
    q: 'Can I customize my menu?',
    a: 'The Free plan includes preset menu themes, while Plus adds custom brand themes, QR branding, and a custom menu URL.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-muted/30">
      <div className="landing-section">
        <div className="landing-container max-w-3xl">
          <div className="mb-8 sm:mb-10">
            <Badge
              variant="outline"
              className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider"
            >
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
          </div>

          <div className="w-full border-t border-border">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const panelId = `landing-faq-panel-${index}`;
              const buttonId = `landing-faq-trigger-${index}`;

              return (
                <div key={faq.q} className="border-b border-border">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full py-4 flex items-center justify-between gap-4 text-left text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="pb-4 text-sm sm:text-base text-muted-foreground leading-relaxed"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <FinalCTASection />
    </section>
  );
}
