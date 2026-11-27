import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

export function FAQSection() {
  const faqs = [
    {
      q: 'Do I need a credit card to sign up?',
      a: 'No. You can create and publish a menu on the Free plan without entering card details.'
    },
    {
      q: 'Can customers order and pay through the menu?',
      a: 'Not today. Menuzo is a digital menu, not an ordering or payment system. Guests browse the menu and place their orders with your staff.'
    },
    {
      q: 'How do I update my menu?',
      a: 'Edit a dish, change a price or mark an item sold out from your dashboard. The published menu updates, and your QR code stays the same.'
    },
    {
      q: 'Does it work offline?',
      a: 'Guests need an internet connection to open and browse the online menu.'
    },
    {
      q: 'Can I use my own domain name?',
      a: 'Custom menu links are available on eligible paid plans. The Free plan uses a Menuzo menu link.'
    }
  ];

  return (
    <section id="faq" className="py-32 px-4 bg-muted/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Common questions.</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/50 py-4">
                <AccordionTrigger className="text-left text-xl font-bold hover:text-primary transition-colors hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
