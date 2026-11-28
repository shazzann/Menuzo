import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FoodCard } from '@/components/shared/FoodCard';
import type { FoodItem } from '@/types';

const managementRows = [
  { name: 'Chicken Kottu', category: 'Kottu', price: 'LKR 1,350', status: 'Available' },
  { name: 'Cheese Chicken Kottu', category: 'Our Special', price: 'LKR 1,650', status: 'Discounted' },
  { name: 'Seafood Fried Rice', category: 'Rice', price: 'From LKR 1,250', status: '2 portions' },
];

export function ProductShowcaseSection() {
  const [kitchenAvailable, setKitchenAvailable] = useState(true);
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);

  const availabilityItem: FoodItem = {
    id: 'showcase-availability-kottu',
    name: 'Chicken Kottu',
    description: "Sri Lanka's favorite street food, made fresh to order.",
    image: '/Landing/demo-chicken-kottu.webp',
    originalPrice: 1350,
    finalPrice: 1350,
    discount: 0,
    category: 'kottu',
    tagline: 'Spice Garden Kitchen',
    isAvailable: kitchenAvailable,
    isSpecialOffer: false,
  };

  const portionOptions = [
    { label: 'Regular', serve: 'Standard plate', price: 'Rs. 1250.00' },
    { label: 'Large', serve: 'Sharing portion', price: 'Rs. 1650.00' },
  ];
  const activePortion = portionOptions[selectedPortionIndex];

  return (
    <section id="product" className="landing-section bg-background border-b border-border">
      <div className="landing-container space-y-16 sm:space-y-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Built for both sides of the dining table
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every change in your owner dashboard updates the exact mobile menu your guests see.
          </p>
        </div>

        {/* Beat A: Guest menu experience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-lg">
            <p className="text-xs font-medium text-[#C2530A] dark:text-primary mb-2">
              Guest experience
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Clear dish photos, descriptions, and specials in any browser
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Guests scan a QR code and read an organized mobile menu with clear dish photography, optional discount highlights, and light or dark mode support, with nothing to download.
            </p>
          </div>

          <Card className="landing-demo-preview rounded-2xl border-border bg-muted/30 p-5 sm:p-6">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border">
              <div className="relative w-20 h-20 shrink-0">
                <img
                  src="/Landing/demo-cheese-kottu.webp"
                  alt="Cheese Chicken Kottu"
                  width={80}
                  height={80}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-xl"
                />
                <span className="absolute -top-1 -left-1 px-2 py-0.5 text-[10px] font-medium bg-primary text-[#12261F] rounded-full">
                  Our Special
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">Cheese Chicken Kottu</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  Extra cheesy delight with house-roasted spices.
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    Rs. 1850.00
                  </span>
                  <span className="text-sm font-bold text-[#C2530A] dark:text-primary tabular-nums">
                    Rs. 1650.00
                  </span>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 bg-[#C8372D]/15 text-[#991B1B] dark:text-red-300 rounded-full">
                    -11%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Beat B: Menu management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <Card className="rounded-2xl border-border bg-card p-5 sm:p-6 order-2 lg:order-1">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Menu items</span>
              <span className="text-xs text-muted-foreground">Sorted by category</span>
            </div>
            <ul className="divide-y divide-border">
              {managementRows.map((row) => (
                <li key={row.name} className="py-3 flex items-center justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-foreground tabular-nums">{row.price}</p>
                    <p className="text-xs text-muted-foreground">{row.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="max-w-lg order-1 lg:order-2">
            <p className="text-xs font-medium text-[#C2530A] dark:text-primary mb-2">
              Menu management
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Organize dishes and categories without editing layouts
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Create structured menu categories, add or reorder dishes, update LKR prices, and highlight specials without wrestling with design tools or PDF files.
            </p>
          </div>
        </div>

        {/* Beat C: Interactive Availability Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-lg">
            <p className="text-xs font-medium text-[#C2530A] dark:text-primary mb-2">
              Availability control
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Mark dishes sold out before guests order them
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When an ingredient runs out mid-service, toggle availability off in seconds. Guests immediately see the dish marked unavailable without losing it from your saved menu.
            </p>
          </div>

          <Card className="landing-demo-preview rounded-2xl border-border bg-muted/30 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <label
                htmlFor="showcase-availability-toggle"
                className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    kitchenAvailable
                      ? 'bg-[#18753F] dark:bg-emerald-400'
                      : 'bg-[#C8372D] dark:bg-red-400'
                  }`}
                  aria-hidden="true"
                />
                <span>
                  Kitchen status:{' '}
                  <span
                    className={
                      kitchenAvailable
                        ? 'text-[#18753F] dark:text-emerald-400'
                        : 'text-[#C8372D] dark:text-red-400'
                    }
                  >
                    {kitchenAvailable ? 'Available' : 'Sold out'}
                  </span>
                </span>
              </label>
              <Switch
                id="showcase-availability-toggle"
                checked={kitchenAvailable}
                onCheckedChange={setKitchenAvailable}
                aria-label="Toggle showcase dish availability"
              />
            </div>

            <FoodCard item={availabilityItem} variant="list" />
          </Card>
        </div>

        {/* Beat D: Portions and Variations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <Card className="landing-demo-preview rounded-2xl border-border bg-muted/30 p-5 sm:p-6 space-y-4 order-2 lg:order-1">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border">
              <img
                src="/Landing/demo-seafood-rice.webp"
                alt="Seafood Fried Rice"
                width={80}
                height={80}
                loading="lazy"
                className="w-20 h-20 shrink-0 object-cover rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">Seafood Fried Rice</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  Wok-tossed basmati rice with prawns and cuttlefish.
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-[#C2530A] dark:text-primary tabular-nums">
                    {activePortion.price}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-primary/15 text-[#9A3D06] dark:text-primary border border-primary/25 rounded-full font-medium">
                    {activePortion.label} selected
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Portion sizes">
              {portionOptions.map((opt, idx) => {
                const selected = idx === selectedPortionIndex;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedPortionIndex(idx)}
                    className={`rounded-xl border px-3.5 py-2.5 text-left transition-colors min-h-[44px] ${
                      selected
                        ? 'border-primary bg-card text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {opt.serve} — {opt.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="max-w-lg order-1 lg:order-2">
            <p className="text-xs font-medium text-[#C2530A] dark:text-primary mb-2">
              Portions & variations
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Set distinct sizes and prices under a single dish
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Offer Regular, Large, or sharing sizes with individual pricing and availability per option, keeping all variations under one clean item.
            </p>
          </div>
        </div>

        {/* Beat E: QR Menu Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-lg">
            <p className="text-xs font-medium text-[#C2530A] dark:text-primary mb-2">
              QR distribution
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Ready for table tents, counters, and takeaways
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Export print-ready QR codes in PNG or SVG format and pair them with a shareable link. Plus plans add branded QR colors, rounded patterns, your restaurant logo, and a custom URL.
            </p>
          </div>

          <Card className="rounded-2xl border-border bg-card p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 rounded-xl border border-border bg-white shrink-0">
              <img
                src="/Landing/spice-garden-qr.svg"
                alt="Printable Menuzo QR code preview"
                width={120}
                height={120}
                loading="lazy"
                className="w-28 h-28"
              />
            </div>
            <div className="min-w-0 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Table QR ready</span>
              </div>
              <p className="text-base font-medium text-foreground">
                Spice Garden Kitchen
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                menuzo.lk/spicegardenkitchen
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your QR stays the same on printed tables while dish updates happen online.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
