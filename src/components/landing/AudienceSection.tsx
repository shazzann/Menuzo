import { useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { CURATED_THEMES, type CuratedTheme } from '@/components/admin/theme/curatedThemes';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { FoodCard } from '@/components/shared/FoodCard';
import { getShopThemeStyles, isBrandTheme } from '@/lib/themeUtils';
import type { Category, FoodItem } from '@/types';

interface VenuePreset {
  id: string;
  label: string;
  summary: string;
  defaultThemeId: string;
  shopName: string;
  location: string;
  primaryCategory: string;
  secondaryCategory: string;
  featuredDish: FoodItem;
  secondaryDish: {
    name: string;
    note: string;
    price: string;
  };
}

const VENUE_PRESETS: VenuePreset[] = [
  {
    id: 'restaurants',
    label: 'Restaurants & hotels',
    summary: 'Structured dining, buffet, and poolside menus without reprinting.',
    defaultThemeId: 'menuzo-signature',
    shopName: 'Spice Garden Dining',
    location: 'Colombo 03',
    primaryCategory: 'Rice & Curry',
    secondaryCategory: 'Beverages',
    featuredDish: {
      id: 'audience-lamprais',
      name: 'Lamprais Platter',
      description: 'Baked in banana leaf with spiced meat curry and seeni sambol.',
      tagline: 'House banana-leaf roast',
      image: '/Landing/audience-hotels.webp',
      category: 'primary',
      originalPrice: 2100,
      finalPrice: 1850,
      discount: 12,
      isAvailable: true,
      isSpecialOffer: true,
    },
    secondaryDish: {
      name: 'Passion Fruit Cooler',
      note: 'Chilled local passion fruit with lime',
      price: 'Rs. 650.00',
    },
  },
  {
    id: 'cafes',
    label: 'Cafés & coffee bars',
    summary: 'Highlight morning bakes, iced drinks, and seasonal counter specials.',
    defaultThemeId: 'forest-retreat',
    shopName: 'Ceylon Roast & Co.',
    location: 'Kandy',
    primaryCategory: 'Pastries',
    secondaryCategory: 'Brew Bar',
    featuredDish: {
      id: 'audience-danish',
      name: 'Butter Chocolate Danish',
      description: 'Flaky laminated pastry layered with dark chocolate chips.',
      tagline: 'Fresh from the counter tray',
      image: '/Landing/audience-cafe.webp',
      category: 'primary',
      originalPrice: 780,
      finalPrice: 780,
      discount: 0,
      isAvailable: true,
      isSpecialOffer: false,
    },
    secondaryDish: {
      name: 'Iced Pour Over',
      note: 'Single-estate hill country roast',
      price: 'Rs. 850.00',
    },
  },
  {
    id: 'bakeries',
    label: 'Bakeries & pastry counters',
    summary: 'Mark daily batches sold out the moment a tray finishes.',
    defaultThemeId: 'golden-harvest',
    shopName: 'Hearth & Crumb',
    location: 'Galle Fort',
    primaryCategory: 'Morning Bake',
    secondaryCategory: 'Loaves',
    featuredDish: {
      id: 'audience-cinnamon-brioche',
      name: 'Morning Cinnamon Swirl',
      description: 'Soft brioche spiral finished with warm vanilla glaze.',
      tagline: 'Warm glazed batch',
      image: '/Landing/audience-bakery.webp',
      category: 'primary',
      originalPrice: 750,
      finalPrice: 650,
      discount: 13,
      isAvailable: true,
      isSpecialOffer: true,
    },
    secondaryDish: {
      name: 'Country Sourdough Loaf',
      note: 'Naturally leavened 24-hour bake',
      price: 'Rs. 1150.00',
    },
  },
  {
    id: 'desserts',
    label: 'Dessert & beverage shops',
    summary: 'Showcase sundaes, scoops, and cold drinks on compact table menus.',
    defaultThemeId: 'rosewood-charm',
    shopName: 'Scoop & Sip',
    location: 'Negombo',
    primaryCategory: 'Sundaes',
    secondaryCategory: 'Milkshakes',
    featuredDish: {
      id: 'audience-berry-sundae',
      name: 'Berry Fudge Sundae',
      description: 'Double scoop gelato topped with warm chocolate fudge drizzle.',
      tagline: 'Rich hot fudge topping',
      image: '/Landing/audience-dessert.webp',
      category: 'primary',
      originalPrice: 920,
      finalPrice: 920,
      discount: 0,
      isAvailable: true,
      isSpecialOffer: false,
    },
    secondaryDish: {
      name: 'Salted Caramel Shake',
      note: 'Blended with whole milk and cream',
      price: 'Rs. 880.00',
    },
  },
];

const SHOWCASE_THEME_IDS = [
  'menuzo-signature',
  'forest-retreat',
  'ocean-breeze',
  'classic-elegance',
  'urban-minimal',
  'golden-harvest',
  'rosewood-charm',
  'warm-terracotta',
];

const SHOWCASE_THEMES: CuratedTheme[] = SHOWCASE_THEME_IDS.map((id) =>
  CURATED_THEMES.find((theme) => theme.id === id)
).filter((theme): theme is CuratedTheme => Boolean(theme));

export function AudienceSection() {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(VENUE_PRESETS[0].id);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(VENUE_PRESETS[0].defaultThemeId);
  const [selectedMenuTab, setSelectedMenuTab] = useState<string>('all');

  const activeVenue = useMemo(
    () => VENUE_PRESETS.find((venue) => venue.id === selectedVenueId) ?? VENUE_PRESETS[0],
    [selectedVenueId]
  );

  const activeTheme = useMemo(
    () => SHOWCASE_THEMES.find((theme) => theme.id === selectedThemeId) ?? SHOWCASE_THEMES[0],
    [selectedThemeId]
  );

  const menuCategories: Category[] = useMemo(
    () => [
      { id: 'all', name: 'All' },
      { id: 'primary', name: activeVenue.primaryCategory },
      { id: 'secondary', name: activeVenue.secondaryCategory },
    ],
    [activeVenue]
  );

  const previewThemeStyles = useMemo(
    () => getShopThemeStyles(activeTheme.colors),
    [activeTheme]
  );

  const handleSelectVenue = (venue: VenuePreset) => {
    setSelectedVenueId(venue.id);
    setSelectedThemeId(venue.defaultThemeId);
    setSelectedMenuTab('all');
  };

  return (
    <section id="who-its-for" className="landing-section bg-background border-b border-border">
      <div className="landing-container space-y-8 sm:space-y-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Styled for every kind of food business
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Match your restaurant, café, bakery, or dessert counter with 5 free preset themes or custom Plus colors.
          </p>
        </div>

        {/* Asymmetric Split: Venue & Theme Selector (Left) + Live Themed Menu Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.86fr_1.14fr] gap-6 lg:gap-10 items-start">
          {/* Left: Venue Format Selector */}
          <div
            role="radiogroup"
            aria-label="Food business formats and menu themes"
            className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-hide min-w-0"
          >
            {VENUE_PRESETS.map((venue) => {
              const selected = venue.id === activeVenue.id;
              const defaultTheme =
                SHOWCASE_THEMES.find((theme) => theme.id === venue.defaultThemeId) ?? SHOWCASE_THEMES[0];

              return (
                <button
                  key={venue.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleSelectVenue(venue)}
                  className={`shrink-0 lg:shrink lg:w-full flex items-center justify-between gap-3 px-4 py-3 sm:py-3.5 rounded-xl border text-left min-h-[44px] transition-[color,background-color,border-color] cursor-pointer ${
                    selected
                      ? 'bg-primary/10 border-primary ring-1 ring-primary/35'
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`hidden lg:flex w-4 h-4 mt-0.5 rounded-full border-2 items-center justify-center shrink-0 transition-colors ${
                        selected ? 'border-primary' : 'border-muted-foreground/40'
                      }`}
                      aria-hidden="true"
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </span>
                    <div className="min-w-0">
                      <span
                        className={`block text-sm font-semibold whitespace-nowrap lg:whitespace-normal ${
                          selected ? 'text-[#C2530A] dark:text-primary' : 'text-foreground'
                        }`}
                      >
                        {venue.label}
                      </span>
                      <span className="hidden lg:block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {venue.summary}
                      </span>
                    </div>
                  </div>

                  <span
                    className="flex items-center gap-1 shrink-0"
                    title={`${defaultTheme.name} palette`}
                    aria-hidden="true"
                  >
                    {defaultTheme.swatches.map((swatch) => (
                      <span
                        key={swatch.label}
                        className="w-3 h-3 rounded-full border border-black/15 dark:border-white/20"
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Live Themed Menu Canvas + Curated Swatch Strip */}
          <div className="space-y-4 min-w-0">
            <div
              className="landing-theme-preview rounded-2xl border border-border overflow-hidden shadow-xs"
              data-shop-theme={isBrandTheme(activeTheme.colors) ? 'brand' : 'custom'}
              style={previewThemeStyles}
              aria-label={`Live themed menu preview for ${activeVenue.shopName} using ${activeTheme.name}`}
            >
              <div className="bg-background text-foreground transition-colors duration-200">
                {/* Preview Browser Bar */}
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground truncate">{activeTheme.name}</span>
                  <span className="shrink-0">
                    {activeTheme.isPro ? 'Plus theme' : 'Free preset'}
                  </span>
                </div>

                {/* Shop Header Surface */}
                <div className="p-4 space-y-3">
                  <div className="rounded-xl bg-card text-card-foreground card-border p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold truncate">{activeVenue.shopName}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full bg-primary/20 text-primary shrink-0">
                          Open
                        </span>
                      </div>
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>{activeVenue.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Static Menu Search Look */}
                  <div
                    className="shop-search rounded-xl bg-card card-border px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground"
                    aria-hidden="true"
                  >
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>Search dishes...</span>
                  </div>
                </div>

                {/* Category Tabs */}
                <CategoryTabs
                  categories={menuCategories}
                  selectedCategory={selectedMenuTab}
                  onSelectCategory={setSelectedMenuTab}
                  className="static py-2.5 px-4 border-y border-border bg-background"
                />

                {/* Themed Menu Cards */}
                <div className="p-4 space-y-2.5" aria-live="polite">
                  {(selectedMenuTab === 'all' || selectedMenuTab === 'primary') && (
                    <FoodCard item={activeVenue.featuredDish} variant="list" />
                  )}

                  {(selectedMenuTab === 'all' || selectedMenuTab === 'secondary') && (
                    <div className="rounded-xl bg-card text-card-foreground card-border px-3.5 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{activeVenue.secondaryDish.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activeVenue.secondaryDish.note}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary tabular-nums shrink-0">
                        {activeVenue.secondaryDish.price}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Swatch Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Try a menu theme</span>
                <span>5 free presets · More on Plus</span>
              </div>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Preview Menuzo curated themes"
              >
                {SHOWCASE_THEMES.map((theme) => {
                  const selected = theme.id === activeTheme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 min-h-[44px] sm:min-h-[36px] rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span className="flex items-center -space-x-1 shrink-0" aria-hidden="true">
                        {theme.swatches.map((swatch) => (
                          <span
                            key={swatch.label}
                            className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/25"
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </span>
                      <span>{theme.name}</span>
                      {theme.isPro && (
                        <span className="text-[10px] text-muted-foreground font-normal">Plus</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
