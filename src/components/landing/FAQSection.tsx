import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  return (
    <section id="faq" className="bg-white">
      <div className="landing-section">
        <div className="landing-container max-w-3xl">
          <div className="mb-8 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3D4A44] mb-2">
              FAQ
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#12261F]">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full border-t border-[#D2D8CF]">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.q}
                value={`item-${index}`}
                className="border-b border-[#D2D8CF]"
              >
                <AccordionTrigger className="py-4 text-left text-base sm:text-lg font-semibold text-[#12261F] hover:text-[#3D4A44] hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-[#3D4A44] leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <FinalCTASection />
    </section>
  );
}
