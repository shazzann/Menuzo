import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { FoodCard } from '@/components/shared/FoodCard';
import type { Category, FoodItem } from '@/types';

const showcaseCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'kottu', name: 'Kottu' },
  { id: 'rice', name: 'Rice & Curry' },
  { id: 'desserts', name: 'Desserts' },
];

const showcaseItems: FoodItem[] = [
  {
    id: 'showcase-beef-kottu',
    name: 'Beef Kottu',
    description: 'Chopped godamba roti stir-fried with spiced beef and fresh vegetables.',
    tagline: 'Spicy Beef Delight',
    image: '/Landing/food-beef-kottu.webp',
    category: 'kottu',
    originalPrice: 1700,
    finalPrice: 1700,
    discount: 0,
    isAvailable: true,
    isSpecialOffer: false,
  },
  {
    id: 'showcase-cheese-kottu',
    name: 'Cheese Chicken Kottu',
    description: 'Extra cheesy delight with house-roasted spices.',
    tagline: 'Extra Cheesy Delight',
    image: '/Landing/food-cheese-kottu.webp',
    category: 'kottu',
    originalPrice: 1850,
    finalPrice: 1650,
    discount: 11,
    isAvailable: true,
    isSpecialOffer: true,
  },
  {
    id: 'showcase-seafood-rice',
    name: 'Seafood Fried Rice',
    description: 'Wok-tossed basmati rice with prawns and cuttlefish.',
    tagline: 'Wok-tossed basmati rice',
    image: '/Landing/food-seafood-rice.webp',
    category: 'rice',
    originalPrice: 1250,
    finalPrice: 1250,
    discount: 0,
    isAvailable: true,
    isSpecialOffer: false,
    pricingType: 'variants',
    options: [
      { id: 'regular', name: 'Regular', price: 1250, isAvailable: true },
      { id: 'large', name: 'Large', price: 1650, isAvailable: true },
    ],
  },
  {
    id: 'showcase-biryani',
    name: 'Spice Garden Biryani',
    description: 'Fragrant spiced basmati rice served with roast chicken.',
    tagline: 'Served with roast chicken',
    image: '/Landing/food-biryani.webp',
    category: 'rice',
    originalPrice: 1550,
    finalPrice: 1550,
    discount: 0,
    isAvailable: true,
    isSpecialOffer: false,
  },
  {
    id: 'showcase-sundae',
    name: 'Chocolate Fudge Sundae',
    description: 'Velvety vanilla scoops topped with warm chocolate fudge.',
    tagline: 'Rich hot fudge topping',
    image: '/Landing/food-chocolate-sundae.webp',
    category: 'desserts',
    originalPrice: 750,
    finalPrice: 750,
    discount: 0,
    isAvailable: true,
    isSpecialOffer: false,
  },
  {
    id: 'showcase-cinnamon-roll',
    name: 'Glazed Cinnamon Roll',
    description: 'Warm baked swirl finished with vanilla bean glaze.',
    tagline: 'Fresh morning bake',
    image: '/Landing/audience-bakery.webp',
    category: 'desserts',
    originalPrice: 680,
    finalPrice: 590,
    discount: 13,
    isAvailable: true,
    isSpecialOffer: true,
  },
];

const portionOptions = [
  { label: 'Regular', serve: 'Standard plate', price: 'Rs. 1250.00' },
  { label: 'Large', serve: 'Sharing portion', price: 'Rs. 1650.00' },
];

function QRExportBeat() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Left — copy */}
      <div className="max-w-lg">
        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
          Print-ready QR codes for your menu link
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Every Menuzo menu gets a QR code the moment you publish. Download crisp PNG or SVG files
          sized for table tents, countertop stands, or signage, styled with your custom link,
          rounded dot pattern, brand colours, and shop logo.
        </p>

        {/* Feature list */}
        <ul className="mt-6 space-y-2">
          {[
            { label: 'URL', value: 'Custom link' },
            { label: 'Pattern', value: 'Rounded pattern' },
            { label: 'Logo', value: 'Shop logo in centre' },
            { label: 'Brand colours', value: 'Your palette' },
          ].map(({ label, value }) => (
            <li key={label} className="flex items-baseline gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right — QR print-frame mock */}
      <Card className="rounded-2xl border-border bg-card p-5 sm:p-6">
        {/* Print card mock */}
        <div className="relative rounded-xl border border-border bg-muted/25 p-6 flex flex-col items-center gap-4">
          {/* Venue name */}
          <div className="text-center">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Spice Garden Kitchen
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Scan to view our menu</p>
          </div>

          {/* QR image */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-white p-1.5 shadow-xs">
            <img
              src="/Landing/spice-garden-kitchen-qr-code.png"
              alt="Branded QR code with Spice Garden Kitchen logo"
              width={160}
              height={160}
              loading="lazy"
              className="w-40 h-40 block bg-white object-contain rounded-xl"
            />
          </div>

          {/* URL pill */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs px-3 py-1 rounded-full border border-primary/25 text-[#C2530A] dark:text-primary bg-primary/10">
              menuzo.lk/spicegardenkitchen
            </span>
          </div>
        </div>

        {/* Download badges */}
        <div className="mt-4 flex items-center gap-2 justify-end">
          <span className="text-xs text-muted-foreground">Export as</span>
          {['.PNG', '.SVG'].map((ext) => (
            <span
              key={ext}
              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-foreground border border-border rounded-md px-2 py-1 bg-muted/30"
            >
              <Download className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
              {ext}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ProductShowcaseSection() {
  const [selectedCategory, setSelectedCategory] = useState('kottu');
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
  const activePortion = portionOptions[selectedPortionIndex];

  const visibleSections =
    selectedCategory === 'all'
      ? showcaseCategories.filter((category) => category.id === 'kottu' || category.id === 'rice')
      : showcaseCategories.filter((category) => category.id === selectedCategory);

  return (
    <section id="product" className="landing-section bg-background border-b border-border">
      <div className="landing-container space-y-14 sm:space-y-18">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Built for menu structure, portions, and sharing
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Beyond instant price and stock toggles, Menuzo organizes categories, multi-portion pricing, and branded QR exports cleanly.
          </p>
        </div>

        {/* Beat 1: Owner Menu & Category Organization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-lg">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Organize dishes and categories without layout tools
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Sort categories cleanly, highlight specials with discount pricing, and turn every dish into scannable menu cards automatically.
            </p>
          </div>

          <Card className="landing-demo-preview rounded-2xl border-border bg-card overflow-hidden p-0 gap-0">
            <CategoryTabs
              categories={showcaseCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              className="static py-3 px-4 border-b border-border bg-card"
            />
            <div className="p-4 sm:p-5 bg-muted/20 space-y-5" aria-live="polite">
              {visibleSections.map((section) => {
                const sectionItems = showcaseItems.filter((item) => item.category === section.id);
                const isFiltered = selectedCategory === section.id;
                return (
                  <div key={section.id}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="font-semibold text-sm text-foreground">{section.name}</h4>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(isFiltered ? 'all' : section.id)}
                        className="text-xs text-primary hover:underline font-medium min-h-[44px] sm:min-h-0 px-1 cursor-pointer"
                      >
                        {isFiltered ? 'All categories' : 'More'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {sectionItems.map((item) => (
                        <FoodCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Beat 2: Interactive Portions & Variations (FoodDetailPage Radio UI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <Card className="landing-demo-preview rounded-2xl border-border bg-card p-5 sm:p-6 space-y-4 order-2 lg:order-1">
            <div className="flex items-center gap-4">
              <img
                src="/Landing/food-seafood-rice.webp"
                alt="Seafood Fried Rice"
                width={80}
                height={80}
                loading="lazy"
                className="w-20 h-20 shrink-0 object-cover rounded-xl border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base text-foreground truncate">Seafood Fried Rice</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  Wok-tossed basmati rice with prawns and cuttlefish.
                </p>
                <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                  <span className="text-lg font-bold text-[#C2530A] dark:text-primary tabular-nums">
                    {activePortion.price}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {activePortion.label} · {activePortion.serve}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-border space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-muted-foreground">
                  Portion size
                </span>
                <span className="text-muted-foreground">
                  Tap an option to preview
                </span>
              </div>

              <div className="space-y-2" role="radiogroup" aria-label="Portion sizes">
                {portionOptions.map((opt, idx) => {
                  const selected = idx === selectedPortionIndex;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSelectedPortionIndex(idx)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-[color,background-color,border-color,transform] active:scale-[0.99] min-h-[56px] cursor-pointer ${
                        selected
                          ? 'bg-primary/10 border-primary ring-1 ring-primary/35'
                          : 'bg-muted/40 hover:bg-muted/70 border-border text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            selected ? 'border-primary' : 'border-muted-foreground/40'
                          }`}
                          aria-hidden="true"
                        >
                          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`text-sm font-semibold block truncate ${
                              selected ? 'text-[#C2530A] dark:text-primary' : 'text-foreground'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-xs text-muted-foreground block truncate mt-0.5">
                            {opt.serve}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold tabular-nums shrink-0 pl-3 ${
                          selected ? 'text-[#C2530A] dark:text-primary' : 'text-foreground'
                        }`}
                      >
                        {opt.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="max-w-lg order-1 lg:order-2">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Set distinct portions under a single dish
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Give Regular, Large, or sharing options their own LKR prices and availability so your category list stays uncluttered.
            </p>
          </div>
        </div>

        {/* Beat 3: QR Export — real QR visual with Free/Plus toggle */}
        <QRExportBeat />
      </div>
    </section>
  );
}
