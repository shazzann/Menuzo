const secondaryVenues = [
  {
    name: 'Cafés & coffee bars',
    summary: 'Update seasonal drinks, pastry trays, and cup sizes right from the counter.',
    image: '/Landing/audience-cafe.webp',
    alt: 'Fresh baked pastry menu preview for cafés',
    width: 480,
    height: 360,
  },
  {
    name: 'Bakeries & pastry counters',
    summary: 'Mark fresh batches sold out the moment a daily bake finishes.',
    image: '/Landing/audience-bakery.webp',
    alt: 'Cinnamon roll dessert preview for bakeries',
    width: 480,
    height: 360,
  },
  {
    name: 'Dessert & beverage shops',
    summary: 'Showcase sundaes, flavors, and scoops cleanly on compact counter tables.',
    image: '/Landing/audience-dessert.webp',
    alt: 'Ice cream sundae preview for dessert shops',
    width: 480,
    height: 360,
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
            Built for independent dining rooms, hotels, cafés, and counter-service venues across Sri Lanka.
          </p>
        </div>

        {/* Lead Venue Panel: Restaurants & Hotel Dining */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] rounded-2xl border border-border bg-card overflow-hidden">
          <div className="aspect-[3/2] lg:aspect-auto bg-muted overflow-hidden">
            <img
              src="/Landing/audience-hotels.webp"
              alt="Plated Sri Lankan restaurant and hotel dining dishes"
              width={480}
              height={320}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Restaurants & hotel dining rooms
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Manage breakfast, lunch, poolside, and dinner menus with clean categories, dish specials, and multi-portion pricing without reprinting table booklets.
            </p>
          </div>
        </div>

        {/* Supporting Venues */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
