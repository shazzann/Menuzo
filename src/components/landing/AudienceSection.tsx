import { useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { createThemeTokens, type CuratedTheme } from '@/components/admin/theme/curatedThemes';
import { useCuratedThemes } from '@/components/admin/theme/useCuratedThemes';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { FoodCard } from '@/components/shared/FoodCard';
import { getShopThemeStyles, isBrandTheme, isDarkColor } from '@/lib/themeUtils';
import type { Category, FoodItem, ThemeConfig } from '@/types';

interface VenuePreset {
  id: string;
  label: string;
  summary: string;
  themeName: string;
  fallbackTheme: {
    tagline: string;
    isPro: boolean;
    colors: ThemeConfig;
  };
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

function buildFallbackTheme(name: string, tagline: string, isPro: boolean, colors: ThemeConfig): CuratedTheme {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    tagline,
    category: isDarkColor(colors.primary) ? 'dark' : 'light',
    isPro,
    colors,
    tokens: createThemeTokens(colors, isDarkColor(colors.primary)),
    swatches: [
      { label: 'Background', hex: colors.primary },
      { label: 'Cards', hex: colors.secondary },
      { label: 'Accent', hex: colors.accent },
    ],
  };
}

const VENUE_PRESETS: VenuePreset[] = [
  {
    id: 'restaurants',
    label: 'Restaurants & hotels',
    summary: 'Dining rooms, buffets, and table menus without reprinting.',
    themeName: 'Menuzo Signature',
    fallbackTheme: {
      tagline: 'Warm, bold, and energetic.',
      isPro: false,
      colors: { primary: '#090A0C', secondary: '#1C1E22', accent: '#FB8500' },
    },
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
    summary: 'Morning bakes, iced drinks, and seasonal counter specials.',
    themeName: 'Matcha Garden',
    fallbackTheme: {
      tagline: 'Naturally fresh, beautifully delicious.',
      isPro: false,
      colors: { primary: '#E9EFE3', secondary: '#D2DFC8', accent: '#668653' },
    },
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
    themeName: 'Rustic Mocha',
    fallbackTheme: {
      tagline: 'Warm, cozy, and handcrafted.',
      isPro: true,
      colors: { primary: '#2B1203', secondary: '#542B0D', accent: '#FFF0D9' },
    },
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
    summary: 'Sundaes, scoops, and cold drinks on compact table menus.',
    themeName: 'Creamy Pink',
    fallbackTheme: {
      tagline: 'Cream, Sweet',
      isPro: false,
      colors: { primary: '#FFA6B9', secondary: '#FFE4E9', accent: '#F05B82' },
    },
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

function resolveVenueTheme(databaseThemes: CuratedTheme[], venue: VenuePreset): CuratedTheme {
  const target = venue.themeName.trim().toLowerCase();
  const match = databaseThemes.find((theme) => theme.name.trim().toLowerCase() === target);
  if (match) return match;
  return buildFallbackTheme(
    venue.themeName,
    venue.fallbackTheme.tagline,
    venue.fallbackTheme.isPro,
    venue.fallbackTheme.colors
  );
}

export function AudienceSection() {
  const databaseThemes = useCuratedThemes();
  const [selectedVenueId, setSelectedVenueId] = useState<string>(VENUE_PRESETS[0].id);
  const [selectedMenuTab, setSelectedMenuTab] = useState<string>('all');

  const activeVenue = useMemo(
    () => VENUE_PRESETS.find((venue) => venue.id === selectedVenueId) ?? VENUE_PRESETS[0],
    [selectedVenueId]
  );

  const activeTheme = useMemo(
    () => resolveVenueTheme(databaseThemes, activeVenue),
    [databaseThemes, activeVenue]
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
            Each venue format can choose a curated Menuzo theme from our library or tailor its own menu colors.
          </p>
        </div>

        {/* Asymmetric Split: Venue Format List (Left) + Live Database-Themed Menu Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.84fr_1.16fr] gap-6 lg:gap-10 items-center">
          {/* Left: Quiet Venue Format Selector */}
          <div
            role="radiogroup"
            aria-label="Food business formats and curated themes"
            className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-hide min-w-0"
          >
            {VENUE_PRESETS.map((venue) => {
              const selected = venue.id === activeVenue.id;
              const venueTheme = resolveVenueTheme(databaseThemes, venue);

              return (
                <button
                  key={venue.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleSelectVenue(venue)}
                  className={`shrink-0 lg:shrink lg:w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl border text-left min-h-[44px] transition-[color,background-color,border-color,box-shadow] cursor-pointer ${
                    selected
                      ? 'bg-card border-foreground/25 shadow-xs'
                      : 'bg-transparent border-border/80 hover:bg-muted/40 hover:border-border'
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
                      <span className="block text-sm font-medium text-foreground whitespace-nowrap lg:whitespace-normal">
                        {venue.label}
                      </span>
                      <span className="hidden lg:block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {venue.summary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-xs text-muted-foreground">
                      {venueTheme.name}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      title={`${venueTheme.name} palette`}
                      aria-hidden="true"
                    >
                      {venueTheme.swatches.map((swatch) => (
                        <span
                          key={swatch.label}
                          className="w-3 h-3 rounded-full border border-black/15 dark:border-white/20"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Live Database-Themed Menu Canvas */}
          <div
            className="landing-theme-preview rounded-2xl border border-border overflow-hidden shadow-xs min-w-0"
            data-shop-theme={isBrandTheme(activeTheme.colors) ? 'brand' : 'custom'}
            style={previewThemeStyles}
            aria-label={`Live themed menu preview for ${activeVenue.shopName} using ${activeTheme.name}`}
          >
            <div className="bg-background text-foreground transition-colors duration-200">
              {/* Theme Header Bar */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex items-center gap-1 shrink-0" aria-hidden="true">
                    {activeTheme.swatches.map((swatch) => (
                      <span
                        key={swatch.label}
                        className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/25"
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                  </span>
                  <span className="font-medium text-foreground truncate">{activeTheme.name}</span>
                </div>
                <span className="shrink-0">
                  {activeTheme.isPro ? 'Plus theme' : 'Free preset'}
                </span>
              </div>

              {/* Shop Header & Search Look */}
              <div className="p-4 space-y-3">
                <div className="rounded-2xl bg-card text-card-foreground card-border p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold truncate">{activeVenue.shopName}</h3>
                      <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-primary/15 text-primary shrink-0">
                        Open
                      </span>
                    </div>
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      <span>{activeVenue.location}</span>
                    </p>
                  </div>
                </div>

                <div
                  className="shop-search rounded-xl bg-card card-border px-3.5 py-2.5 flex items-center gap-2 text-xs text-muted-foreground"
                  aria-hidden="true"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span>Search dishes</span>
                </div>
              </div>

              {/* Category Tabs */}
              <CategoryTabs
                categories={menuCategories}
                selectedCategory={selectedMenuTab}
                onSelectCategory={setSelectedMenuTab}
                className="static py-3 px-4 border-b border-border bg-background"
              />

              {/* Themed Menu Cards */}
              <div className="p-4 space-y-3" aria-live="polite">
                {(selectedMenuTab === 'all' || selectedMenuTab === 'primary') && (
                  <FoodCard item={activeVenue.featuredDish} variant="list" />
                )}

                {(selectedMenuTab === 'all' || selectedMenuTab === 'secondary') && (
                  <div className="rounded-2xl bg-card text-card-foreground card-border p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{activeVenue.secondaryDish.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
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
        </div>
      </div>
    </section>
  );
}
