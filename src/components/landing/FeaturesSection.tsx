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
    <section id="features" className="landing-section bg-muted/30 border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Capabilities built for restaurant menus
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Focused tools for managing what guests see in their browser while your staff handles service and orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-8">
          {capabilityGroups.map((group) => (
            <div key={group.category} className="space-y-5">
              <h3 className="text-sm font-medium text-foreground">
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
