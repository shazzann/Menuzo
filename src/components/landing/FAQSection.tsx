import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FREE_PLAN_LIMITS, PLUS_GRACE_DAYS, PLUS_PLAN_LIMITS } from '@/lib/subscription';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

const faqs = [
  {
    q: 'Does Menuzo handle customer ordering or payments?',
    a: 'No. Menuzo provides fast digital menu browsing in any phone browser while customers continue placing orders directly with your restaurant staff.',
  },
  {
    q: 'Do printed QR codes need replacing when prices or dishes change?',
    a: 'No. Your printed PNG or SVG QR code keeps the same link while price adjustments and Sold out toggles update immediately online.',
  },
  {
    q: 'Are multiple categories and portion sizes supported?',
    a: `Yes. Free supports up to ${FREE_PLAN_LIMITS.categories} categories and Plus supports ${PLUS_PLAN_LIMITS.categories}, with optional Regular/Large portion pricing under individual dishes.`,
  },
  {
    q: 'What happens if my menu exceeds Free plan limits?',
    a: `The Free plan includes ${FREE_PLAN_LIMITS.items} items and ${FREE_PLAN_LIMITS.categories} categories with no card required. After a Plus subscription expires, everything stays live for a ${PLUS_GRACE_DAYS}-day grace period before items over the Free allowance are hidden until you renew.`,
  },
  {
    q: 'How do custom themes, QR styling, and custom URLs work?',
    a: 'Free plans pick from 5 preset themes with a standard square QR code. Upgrading to Plus adds custom brand colors, rounded QR patterns with your logo, and a custom URL.',
  },
  {
    q: 'Can I track menu visits and QR scans?',
    a: 'Yes. Free accounts receive basic view counts, and Plus adds 7-day and 30-day charts separating total menu views from QR scans.',
  },
  {
    q: 'How can I contact Menuzo?',
    a: 'Select Contact sales in Pricing or Support in the footer to reach our team via WhatsApp or email (menuzoapp@gmail.com).',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background">
      <div className="landing-section">
        <div className="landing-container grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16">
          <div className="landing-reveal">
            <span className="landing-rule" aria-hidden="true" />
            <h2 className="landing-h2 text-foreground lg:sticky lg:top-28">
              Frequently asked questions
            </h2>
          </div>

          <div className="landing-reveal w-full border-t landing-divider">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const panelId = `landing-faq-panel-${index}`;
              const buttonId = `landing-faq-trigger-${index}`;

              return (
                <div key={faq.q} className="border-b landing-divider">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="group w-full min-h-[48px] py-5 sm:py-6 flex items-center justify-between gap-6 text-left text-base sm:text-[17px] font-medium tracking-tight text-foreground transition-colors"
                    >
                      <span className="group-hover:text-foreground/70 transition-colors">{faq.q}</span>
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border shrink-0 transition-[transform,background-color,border-color,color] duration-300 ${
                          isOpen
                            ? 'rotate-45 bg-foreground text-background border-foreground'
                            : 'landing-divider text-muted-foreground group-hover:border-foreground/30'
                        }`}
                        aria-hidden="true"
                      >
                        <Plus className="w-4 h-4" strokeWidth={1.75} />
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="landing-fade-down -mt-1 pb-6 pr-12 text-sm sm:text-base text-muted-foreground leading-relaxed"
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
