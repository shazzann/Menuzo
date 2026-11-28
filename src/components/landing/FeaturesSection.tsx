import { FREE_PLAN_LIMITS, PLUS_PLAN_LIMITS } from '@/lib/subscription';

const capabilityGroups = [
  {
    category: 'Menu authoring',
    items: [
      {
        title: 'Digital dishes & categories',
        detail: `Organize up to ${FREE_PLAN_LIMITS.items} items across ${FREE_PLAN_LIMITS.categories} categories free, or ${PLUS_PLAN_LIMITS.items} items across ${PLUS_PLAN_LIMITS.categories} categories on Plus.`,
      },
      {
        title: 'Portion options & discounts',
        detail: 'Offer fixed dish prices, discount pricing, or size variants (such as Regular and Large) under one listing.',
      },
      {
        title: 'Food imagery & descriptions',
        detail: 'Upload dish photos and short tasting notes so guests browse with confidence.',
      },
    ],
  },
  {
    category: 'Live menu control',
    items: [
      {
        title: 'Price & detail updates',
        detail: 'Edit LKR prices anytime without replacing printed QR table cards.',
      },
      {
        title: 'Availability switches',
        detail: 'Mark sold-out items unavailable while keeping your dishes saved in your menu.',
      },
      {
        title: 'Preset & custom themes',
        detail: 'Start with 5 curated preset themes on Free, or apply custom brand colors on Plus.',
      },
    ],
  },
  {
    category: 'Sharing & insights',
    items: [
      {
        title: 'PNG & SVG QR code export',
        detail: 'Download clean square QR codes free, with brand styling, rounded patterns, and logo support on Plus.',
      },
      {
        title: 'Shareable & custom URLs',
        detail: 'Get an instant Menuzo menu link, or claim a custom URL path on Plus.',
      },
      {
        title: 'Menu views & QR scan tracking',
        detail: 'Basic visit tracking on Free. Plus adds Today, 7-day, and 30-day menu view and QR scan charts.',
      },
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section bg-muted/30 border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Everything included to run your digital menu
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Built around digital menu publishing and QR sharing, so owners manage dishes from one dashboard while guests order directly with your staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-8">
          {capabilityGroups.map((group) => (
            <div key={group.category} className="space-y-5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h3>
              <dl className="space-y-5">
                {group.items.map((item) => (
                  <div key={item.title} className="border-t border-border/70 pt-3">
                    <dt className="text-base font-medium text-foreground mb-1">{item.title}</dt>
                    <dd className="text-sm text-muted-foreground leading-relaxed">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
