const secondaryVenues = [
  {
    name: 'Cafés & coffee bars',
    summary: 'Update seasonal drinks, pastry trays, and add-on sizes right from the counter.',
    image: '/Landing/audience-cafe.webp',
    alt: 'Fresh baked pastry menu preview for cafés',
    width: 480,
    height: 360,
  },
  {
    name: 'Bakeries & pastry counters',
    summary: 'Mark fresh batches unavailable the moment a tray sells out for the day.',
    image: '/Landing/audience-bakery.webp',
    alt: 'Cinnamon roll dessert preview for bakeries',
    width: 480,
    height: 360,
  },
  {
    name: 'Dessert & beverage shops',
    summary: 'Display vibrant sundaes, flavors, and cup sizes without cluttering small tables.',
    image: '/Landing/audience-dessert.webp',
    alt: 'Ice cream sundae preview for dessert shops',
    width: 480,
    height: 360,
  },
  {
    name: 'Hotels & guesthouses',
    summary: 'Share clean breakfast, poolside, and dining menus via room or table QR cards.',
    image: '/Landing/audience-hotels.webp',
    alt: 'Plated Sri Lankan specialty dish for hotel dining',
    width: 480,
    height: 320,
  },
];

export function AudienceSection() {
  return (
    <section id="who-its-for" className="landing-section bg-background border-b border-border">
      <div className="landing-container space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Designed for food businesses of every format
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Whether you run a single neighborhood café or a multi-category dining room, Menuzo keeps every table’s menu clear and up to date.
          </p>
        </div>

        {/* Lead Venue Panel: Full-Service Restaurants */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] rounded-2xl border border-border bg-card overflow-hidden">
          <div className="aspect-[16/10] lg:aspect-auto bg-muted overflow-hidden">
            <img
              src="/Landing/audience-restaurant.webp"
              alt="Seafood fried rice menu presentation for full-service restaurants"
              width={640}
              height={400}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <p className="text-xs font-medium text-[#C2530A] dark:text-primary mb-2">
              Full-service restaurants
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Keep multi-category dining menus accurate across every shift
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Manage main courses, rice & curry specials, portions, and chef promotions across lunch and dinner service without paying for new table booklets.
            </p>
          </div>
        </div>

        {/* Supporting Venues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {secondaryVenues.map((venue) => (
            <div
              key={venue.name}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={venue.image}
                  alt={venue.alt}
                  width={venue.width}
                  height={venue.height}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1">
                <h3 className="text-base font-medium text-foreground mb-1.5">{venue.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{venue.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
