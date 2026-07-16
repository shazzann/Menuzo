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
      a: 'No, you can start building your menu completely free without a credit card. You only need one if you decide to upgrade to a paid plan later.'
    },
    {
      q: 'Can customers order and pay through the menu?',
      a: 'Currently, Menuzo is focused on providing a beautiful, fast browsing experience. Ordering and payments are on our roadmap for future updates.'
    },
    {
      q: 'How do I update my menu?',
      a: 'You can update your menu instantly from your dashboard on any device. Changes go live immediately—no need to reprint QR codes.'
    },
    {
      q: 'Does it work offline?',
      a: 'Yes, once a customer loads your menu, it works perfectly even if they lose their internet connection while browsing.'
    },
    {
      q: 'Can I use my own domain name?',
      a: 'Custom domains are available on our Business plan. Otherwise, you get a clean menuzo.app/your-restaurant link.'
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
