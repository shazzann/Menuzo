import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
  popular: boolean;
  badge?: string;
}

export function PricingSection() {
  const plans: PricingPlan[] = [
    {
      name: 'Free',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for cafés and small restaurants getting started with digital menus.',
      features: [
        'Up to 10 Menu Items',
        'Up to 2 Categories',
        'QR Code Menu',
        'Custom Theme Designer',
        'Custom QR Code Branding',
        'Analytics Dashboard',
        'Restaurant Profile',
        'Shareable Menu Link'
      ],
      notIncluded: [
        'Custom Menu URL',
        'Priority Support'
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/mo',
      description: 'Everything you need to run a professional digital menu with your own branding, advanced analytics, and higher limits.',
      features: [
        'Up to 100 Menu Items',
        'Up to 20 Categories',
        'QR Code Menu',
        'Custom Theme Designer',
        'Custom QR Code Branding',
        'Custom Menu URL',
        'Advanced Analytics Dashboard',
        'Priority Support',
        'Restaurant Profile',
        'Shareable Menu Link'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
    }
  ];

  return (
    <section id="pricing" className="py-32 px-4 bg-muted/20 relative overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade when you need more power. No hidden fees.
          </p>
        </motion.div>

        <div 
          className={`grid gap-8 items-center mx-auto max-w-5xl ${
            plans.length === 1
              ? "grid-cols-1 max-w-md"
              : plans.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative p-10 rounded-[2.5rem] border ${plan.popular ? 'border-primary bg-primary/5 shadow-2xl scale-105 z-10' : 'border-border/50 bg-card shadow-lg hover:shadow-xl'}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground font-medium text-lg">{plan.period}</span>}
              </div>
              <p className="text-muted-foreground mb-8 pb-8 border-b border-border/50 text-lg">
                {plan.description}
              </p>
              <ul className="space-y-5 mb-10">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-base font-medium">
                    <CheckCircle2 className={`w-6 h-6 shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    {feat}
                  </li>
                ))}
                {plan.notIncluded?.map((feat, idx) => (
                  <li key={`not-${idx}`} className="flex items-center gap-4 text-base font-medium text-muted-foreground/40">
                    <XCircle className="w-6 h-6 shrink-0 text-muted-foreground/30" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full h-14 rounded-2xl text-lg font-semibold" 
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.cta}
                {plan.popular && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
