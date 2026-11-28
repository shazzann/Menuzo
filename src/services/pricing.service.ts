export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  billingNote?: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
  popular: boolean;
  badge?: string;
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'LKR 0',
    period: 'Forever free',
    description: 'For small restaurants and cafés getting started with digital menus.',
    features: [
      '10 Food Items',
      '2 Categories',
      'Digital Menu',
      'QR Code Generation',
      'Limited Themes (3–5 preset themes)',
      'Basic QR Branding',
      'Restaurant Profile',
      'Shareable Menu Link',
      'Standard Support',
    ],
    notIncluded: [
      'Custom Themes',
      'QR Branding',
      'Custom Menu URL',
      'Analytics Dashboard',
      'Advanced Customization',
      'Priority Support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 'LKR 1,500',
    period: '/month',
    billingNote: 'Monthly plan: LKR 1,500 per month.',
    description: 'Everything you need to run a professional digital menu with custom themes, QR branding, analytics, and higher limits.',
    features: [
      '100 Food Items',
      '20 Categories',
      'Digital Menu & QR Code',
      'Custom Themes',
      'QR Branding',
      'Custom Menu URL',
      'Analytics Dashboard',
      'Restaurant Profile',
      'Shareable Menu Link',
      'Priority Support',
    ],
    notIncluded: [
      'Advanced Customization',
      '500 Food Items & 50 Categories',
      'All Enterprise Features',
    ],
    cta: 'Upgrade to Plus',
    popular: true,
    badge: 'Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'LKR 6,000',
    period: '/month',
    billingNote: 'Monthly plan: LKR 6,000 per month.',
    description: 'For established restaurants and growing businesses wanting full feature access, advanced customization, and priority support.',
    features: [
      '500 Food Items',
      '50 Categories',
      'All Plus Features',
      'Digital Menu & QR Code',
      'Custom Themes & QR Branding',
      'Custom Menu URL',
      'Advanced Analytics',
      'Advanced Customization',
      'Priority Support',
      'All Available Menuzo Features',
    ],
    cta: 'Choose Enterprise',
    popular: false,
    badge: 'Advanced',
  },
];

export const PricingService = {
  getPlans: (): PricingPlan[] => {
    if (typeof window === 'undefined') return defaultPlans;
    const stored = localStorage.getItem('menuzo_pricing_plans');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          (parsed.length < 3 ||
            parsed.some(
              p =>
                p.id === 'pro' ||
                p.price === '$19' ||
                p.price === '3500' ||
                p.price === 'LKR 3,500' ||
                p.price === 'LKR 3,500.00'
            ))
        ) {
          localStorage.removeItem('menuzo_pricing_plans');
          return defaultPlans;
        }
        return parsed;
      } catch {
        return defaultPlans;
      }
    }
    return defaultPlans;
  },

};
