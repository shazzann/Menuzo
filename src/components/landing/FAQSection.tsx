import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FREE_PLAN_LIMITS, PLUS_GRACE_DAYS, PLUS_PLAN_LIMITS } from '@/lib/subscription';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

const faqs = [
  {
    q: 'What is Menuzo?',
    a: 'Menuzo is a digital menu management platform for cafés, restaurants, and food businesses. Owners create and update dishes, prices, and availability in one place and share the menu through a QR code.',
  },
  {
    q: 'How does the QR menu work?',
    a: 'Once you publish dishes in Menuzo, you download your restaurant’s QR code as a PNG or SVG file and place it on tables. Scanning the QR code opens your live mobile menu in any browser.',
  },
  {
    q: 'Do customers need an app?',
    a: 'No. Customers open the digital menu directly in their phone browser. Menuzo focuses on clear menu browsing while customers continue ordering directly with your staff.',
  },
  {
    q: 'Can I update prices after publishing?',
    a: 'Yes. You can change dish names, descriptions, discounts, and LKR prices at any time, and your printed QR code stays the same.',
  },
  {
    q: 'Can I mark a dish as sold out?',
    a: 'Yes. Toggle an item’s availability switch in your dashboard to mark it unavailable immediately without removing it from your saved menu.',
  },
  {
    q: 'Can I manage multiple categories?',
    a: `Yes. The Free plan supports up to ${FREE_PLAN_LIMITS.categories} categories, and Plus expands this to ${PLUS_PLAN_LIMITS.categories} categories that you can reorder anytime.`,
  },
  {
    q: 'Are different portion sizes supported?',
    a: 'Yes. Dishes can use either a single price or multiple portion variants (such as Regular and Large) with separate prices and availability per option.',
  },
  {
    q: 'What is included in the Free plan?',
    a: `The Free plan includes up to ${FREE_PLAN_LIMITS.items} food items, ${FREE_PLAN_LIMITS.categories} menu categories, standard QR download, a shareable menu URL, curated preset themes, and basic view counts—with no card required. If you exceed Free limits after a paid plan expires, extra dishes stay saved and are hidden after a ${PLUS_GRACE_DAYS}-day grace period.`,
  },
  {
    q: 'Can I upgrade my subscription?',
    a: 'Yes. You can start free and upgrade to Monthly or Annual Menuzo Plus from your dashboard whenever your menu grows beyond Free limits.',
  },
  {
    q: 'How can I contact Menuzo or discuss a partnership?',
    a: 'Use Contact sales in Pricing or Become a partner above to message our team via WhatsApp or email (menuzoapp@gmail.com).',
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
