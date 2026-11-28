import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
    q: 'How can agencies or hospitality consultants partner with Menuzo?',
    a: 'Select Become a partner above or Contact sales in Pricing to message our team directly via WhatsApp or email (menuzoapp@gmail.com).',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background">
      <div className="landing-section">
        <div className="landing-container max-w-3xl">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
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
                      className="w-full min-h-[48px] py-4 flex items-center justify-between gap-4 text-left text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        strokeWidth={1.5}
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
