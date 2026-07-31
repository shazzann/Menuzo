export interface PricingPlan {
  id: string;
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

const defaultPlans: PricingPlan[] = [
  {
    id: 'free',
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
    id: 'pro',
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

export const PricingService = {
  getPlans: (): PricingPlan[] => {
    if (typeof window === 'undefined') return defaultPlans;
    const stored = localStorage.getItem('menuzo_pricing_plans');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return defaultPlans;
      }
    }
    return defaultPlans;
  },

  updatePlanPrice: (id: string, newPrice: string): void => {
    if (typeof window === 'undefined') return;
    const plans = PricingService.getPlans();
    const updated = plans.map(p => p.id === id ? { ...p, price: newPrice } : p);
    localStorage.setItem('menuzo_pricing_plans', JSON.stringify(updated));
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new Event('pricing_updated'));
  }
};
