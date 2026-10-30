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
    description: 'Perfect for cafés and small restaurants getting started with digital menus.',
    features: [
      '10 Food Items',
      '2 Categories',
      'QR Menu',
      'Limited Themes (3–5 preset themes)',
      'Basic QR Branding',
      'Restaurant Profile',
      'Shareable Menu Link',
      'Standard Support'
    ],
    notIncluded: [
      'Analytics Dashboard',
      'Custom Menu URL',
      'Full Theme Customization',
      'Advanced QR Branding'
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'LKR 1,500',
    period: '/month',
    billingNote: 'Monthly plan: LKR 1,500 per month.',
    description: 'Everything you need to run a professional digital menu with your own branding, advanced analytics, and higher limits.',
    features: [
      '100 Food Items',
      '20 Categories',
      'QR Menu',
      'Full Theme Customization',
      'Advanced QR Branding',
      'Analytics Dashboard',
      'Restaurant Profile',
      'Shareable Menu Link',
      'Custom Menu URL',
      'Priority Support'
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
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.some(p => p.id === 'pro' && (p.price === '$19' || p.price === '3500' || p.price === 'LKR 3,500' || p.price === 'LKR 3,500.00' || p.price === '1500'))) {
          localStorage.removeItem('menuzo_pricing_plans');
          return defaultPlans;
        }
        return parsed;
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
