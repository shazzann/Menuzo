import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Card } from '@/components/ui/card';

const managementRows = [
  { name: 'Hot Butter Mushroom', category: 'Starters', price: 'LKR 1,150', status: 'Special offer' },
  { name: 'Seafood Fried Rice', category: 'Rice & Curry', price: 'From LKR 1,250', status: '2 portions' },
  { name: 'Fresh Lime Mint', category: 'Beverages', price: 'LKR 550', status: 'Available' },
];

const portionOptions = [
  { label: 'Regular', serve: 'Standard plate', price: 'Rs. 1250.00' },
  { label: 'Large', serve: 'Sharing portion', price: 'Rs. 1650.00' },
];

export function ProductShowcaseSection() {
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
  const activePortion = portionOptions[selectedPortionIndex];

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
              Sort categories cleanly, reorder featured specials, and maintain consistent LKR pricing across starters, mains, and beverages from a simple list.
            </p>
          </div>

          <Card className="rounded-2xl border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Category order</span>
              <span className="text-xs text-muted-foreground">Owner view</span>
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
        </div>

        {/* Beat 2: Interactive Portions & Variations (FoodDetailPage Radio UI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <Card className="landing-demo-preview rounded-2xl border-border bg-card p-5 sm:p-6 space-y-4 order-2 lg:order-1">
            <div className="flex items-center gap-4">
              <img
                src="/Landing/demo-seafood-rice.webp"
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

        {/* Beat 3: Custom URL & QR Export Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-lg">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
              Export branded QR codes and custom menu links
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Download crisp PNG or SVG files ready for table tents and counters. Menuzo Plus adds custom URLs, rounded QR patterns, brand colors, and your shop logo.
            </p>
          </div>

          <Card className="rounded-2xl border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <QrCode className="w-4 h-4 text-[#C2530A] dark:text-primary" strokeWidth={1.5} aria-hidden="true" />
                <span>QR & URL settings</span>
              </div>
              <span className="text-xs text-muted-foreground">PNG & SVG export</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Menu link</p>
                <p className="font-medium text-foreground truncate">menuzo.lk/your-venue</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Export options</p>
                <p className="font-medium text-foreground">Square or rounded QR</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
