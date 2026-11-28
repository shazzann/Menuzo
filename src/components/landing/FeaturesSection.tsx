const capabilityGroups = [
  {
    category: 'Menu authoring',
    items: [
      {
        title: 'Dishes, photos, and categories',
        detail: 'Group dishes into clear sections with tasting notes, discount tags, and square dish thumbnails.',
      },
      {
        title: 'Single and portion pricing',
        detail: 'Publish fixed prices or multi-size portion variants with individual availability per option.',
      },
    ],
  },
  {
    category: 'Live control',
    items: [
      {
        title: 'Real-time stock switches',
        detail: 'Mark sold-out items unavailable during service while keeping them saved for tomorrow.',
      },
      {
        title: 'Preset and brand themes',
        detail: 'Choose from 5 curated themes on Free, or apply custom restaurant colors on Plus.',
      },
    ],
  },
  {
    category: 'Sharing and insights',
    items: [
      {
        title: 'PNG and SVG QR downloads',
        detail: 'Export table-ready square codes free, or style rounded brand QR exports with your logo on Plus.',
      },
      {
        title: 'Menu views and QR scan charts',
        detail: 'Track basic views on Free. Plus adds Today, 7-day, and 30-day visit and scan trend charts.',
      },
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section landing-paper border-b landing-divider">
      <div className="landing-container">
        <div className="landing-reveal max-w-2xl mb-12 sm:mb-16">
          <span className="landing-rule" aria-hidden="true" />
          <h2 className="landing-h2 text-foreground mb-5">
            Capabilities built for restaurant menus
          </h2>
          <p className="landing-lede">
            Focused tools for managing what guests see in their browser while your staff handles service and orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {capabilityGroups.map((group, index) => (
            <div
              key={group.category}
              className="landing-reveal"
              style={{ '--reveal-delay': `${index * 110}ms` } as React.CSSProperties}
            >
              <div className="landing-card landing-lift h-full p-6 sm:p-7">
                <h3 className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {group.category}
                </h3>
                <dl className="divide-y landing-divider">
                  {group.items.map((item) => (
                    <div key={item.title} className="py-5 first:pt-0 last:pb-0">
                      <dt className="text-base sm:text-[17px] font-semibold tracking-tight text-foreground mb-1.5">{item.title}</dt>
                      <dd className="text-sm text-muted-foreground leading-relaxed">{item.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
