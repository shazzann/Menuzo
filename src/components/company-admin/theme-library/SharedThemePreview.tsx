import { ShoppingBag, Star, Plus, Search, UtensilsCrossed, Wifi, Battery } from 'lucide-react';
import { getShopThemeStyles } from '@/lib/themeUtils';
import type { PreviewMode } from './types';

interface SharedThemePreviewProps {
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    name?: string;
  };
  mode?: 'mini' | PreviewMode;
  className?: string;
}

export function SharedThemePreview({
  theme,
  mode = 'mini',
  className = '',
}: SharedThemePreviewProps) {
  const styles = getShopThemeStyles({
    primary: theme.primary,
    secondary: theme.secondary,
    accent: theme.accent,
  });

  // MINI MODE (For Card Headers)
  if (mode === 'mini') {
    return (
      <div
        className={`w-full h-36 relative overflow-hidden bg-background select-none ${className}`}
        style={styles}
      >
        {/* Cover image & gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80)',
          }}
        />

        {/* Header content */}
        <div className="absolute top-2.5 left-3 right-3 z-20 flex items-start justify-between">
          <div className="min-w-0">
            <h4 className="text-white font-bold text-xs sm:text-sm truncate drop-shadow-xs">
              {theme.name || 'Restaurant Name'}
            </h4>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-2.5 h-2.5 fill-current"
                  style={{ color: theme.accent }}
                />
              ))}
            </div>
          </div>
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-primary-foreground shadow-xs"
            style={{ backgroundColor: theme.accent }}
          >
            <ShoppingBag className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Bottom sheet mini mockup */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-background/95 backdrop-blur-xs border-t border-border/40">
          <div className="flex gap-1 mb-1.5 overflow-hidden">
            <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-semibold bg-primary text-primary-foreground">
              All
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-medium border bg-card text-card-foreground">
              Burgers
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-medium border bg-card text-card-foreground">
              Drinks
            </span>
          </div>

          <div className="rounded-lg p-1.5 flex items-center gap-2 border border-border/50 bg-card text-card-foreground shadow-2xs">
            <div
              className="w-8 h-8 rounded-md bg-muted flex-shrink-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80)',
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold truncate leading-tight">Classic Burger</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] font-bold text-primary">Rs. 1,200</span>
                <span
                  className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-primary-foreground text-[8px] font-bold"
                  style={{ backgroundColor: theme.accent }}
                >
                  +
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MOBILE FULL VIEW (For Editor & Expanded Preview)
  if (mode === 'mobile') {
    return (
      <div className="flex justify-center w-full">
        <div
          className={`w-[310px] sm:w-[330px] h-[540px] rounded-[36px] border-[6px] border-neutral-900 bg-background shadow-2xl overflow-hidden relative flex flex-col ring-1 ring-white/10 ${className}`}
          style={styles}
        >
          {/* Status Bar with Dynamic Island Overlay */}
          <div className="absolute top-0 left-0 right-0 z-40 px-5 pt-2.5 pb-1 flex items-center justify-between pointer-events-none select-none text-white">
            <span className="text-[11px] font-semibold tracking-tight drop-shadow-xs">9:41</span>
            {/* Dynamic Island Pill */}
            <div className="w-20 h-4 bg-black/95 rounded-full flex items-center justify-center border border-white/10 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-neutral-800 mr-1" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/80" />
            </div>
            {/* Status Icons */}
            <div className="flex items-center gap-1.5 drop-shadow-xs">
              <Wifi className="w-3 h-3 text-white" />
              <Battery className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Scrollable restaurant menu body - starts at top with zero space gap */}
          <div className="flex-1 overflow-y-auto pb-16 scrollbar-none relative">
            {/* Hero Cover Image - Bleeds directly to the very top */}
            <div className="h-44 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/85 z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80)',
                }}
              />
              <div className="absolute bottom-3 left-4 right-4 z-20 text-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-primary shadow-xs">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-white/80 block">
                      Digital QR Menu
                    </span>
                    <h3 className="font-bold text-sm sm:text-base leading-tight">The Garden Kitchen</h3>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-white/80">Artisanal Dining & Bar • Open Now</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-2.5 h-2.5 fill-current"
                      style={{ color: theme.accent }}
                    />
                  ))}
                  <span className="text-[9.5px] text-white/90 ml-1 font-semibold">4.9 (320 reviews)</span>
                </div>
              </div>
            </div>

            {/* Menu Content Area */}
            <div className="p-3.5 space-y-3">
              {/* Search in Menu */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes or drinks..."
                  readOnly
                  className="w-full bg-card border border-border/60 text-card-foreground text-xs rounded-xl pl-8 pr-3 py-1.5 outline-hidden cursor-default placeholder:text-muted-foreground shadow-2xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-2xs whitespace-nowrap">
                  Popular
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-card text-card-foreground whitespace-nowrap">
                  Main Course
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-card text-card-foreground whitespace-nowrap">
                  Beverages
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-card text-card-foreground whitespace-nowrap">
                  Desserts
                </span>
              </div>

              {/* Food Item Cards */}
              <div className="space-y-2.5">
                {[
                  {
                    name: 'Grilled Herb Chicken',
                    desc: 'Organic chicken with rosemary glaze and roasted potatoes.',
                    price: 'Rs. 1,650',
                    img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&q=80',
                  },
                  {
                    name: 'Signature Truffle Burger',
                    desc: 'Aged Angus beef, black truffle aioli, gouda, brioche bun.',
                    price: 'Rs. 1,450',
                    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
                  },
                  {
                    name: 'Iced Velvet Matcha',
                    desc: 'Ceremonial grade matcha whisked with oat milk & vanilla.',
                    price: 'Rs. 650',
                    img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&q=80',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl border border-border/60 bg-card text-card-foreground shadow-xs flex items-center gap-3"
                  >
                    <div
                      className="w-16 h-16 rounded-xl bg-muted bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${item.img})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-xs leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {item.desc}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-bold text-primary">{item.price}</span>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-primary-foreground flex items-center gap-1 shadow-2xs"
                          style={{ backgroundColor: theme.accent }}
                        >
                          <Plus className="w-2.5 h-2.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Bottom View Cart Bar */}
          <div className="absolute bottom-3 left-4 right-4 z-30">
            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl text-primary-foreground font-semibold text-xs flex items-center justify-between shadow-lg"
              style={{ backgroundColor: theme.accent }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>View Order (2 items)</span>
              </div>
              <span>Rs. 3,100</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP PREVIEW MODE
  if (mode === 'desktop') {
    return (
      <div
        className={`w-full h-[480px] rounded-2xl border border-border bg-background shadow-lg overflow-hidden flex flex-col ${className}`}
        style={styles}
      >
        {/* Desktop Navbar */}
        <div className="px-6 py-3 border-b border-border/60 bg-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm"
              style={{ backgroundColor: theme.accent }}
            >
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-card-foreground">The Garden Kitchen</h3>
              <p className="text-[10px] text-muted-foreground">Digital Dining Experience</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              Main Menu
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium border bg-card text-card-foreground">
              Drink Specials
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground shadow-xs"
              style={{ backgroundColor: theme.accent }}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Cart (3)
            </button>
          </div>
        </div>

        {/* Desktop Menu Grid Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Chef's Signature Selections</h2>
            <p className="text-xs text-muted-foreground">Fresh ingredients delivered from local farms</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Truffle Angus Burger',
                price: 'Rs. 1,450',
                desc: 'Brioche, black truffle aioli, caramelized onions, french fries.',
                img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
              },
              {
                name: 'Crispy Salmon Fillet',
                price: 'Rs. 2,100',
                desc: 'Pan-seared Atlantic salmon on asparagus bed with hollandaise.',
                img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
              },
              {
                name: 'Artisan Woodfired Pizza',
                price: 'Rs. 1,800',
                desc: 'San Marzano tomatoes, buffalo mozzarella, fresh basil & oregano.',
                img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
              },
            ].map((food, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card text-card-foreground overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                <div
                  className="h-32 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${food.img})` }}
                />
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{food.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{food.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/40">
                    <span className="font-bold text-sm text-primary">{food.price}</span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-primary-foreground"
                      style={{ backgroundColor: theme.accent }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // COMPONENTS SHOWCASE MODE
  return (
    <div
      className={`w-full p-6 rounded-2xl border border-border bg-background shadow-md space-y-6 ${className}`}
      style={styles}
    >
      <div>
        <h3 className="font-bold text-base text-foreground">Theme UI Component Tokens</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Live rendering of buttons, pills, cards, and highlight indicators for this theme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buttons */}
        <div className="p-4 rounded-xl border border-border/60 bg-card text-card-foreground space-y-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Button Variants
          </span>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-primary-foreground shadow-xs"
              style={{ backgroundColor: theme.accent }}
            >
              Primary Action
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted text-foreground border border-border hover:bg-muted/80"
            >
              Surface Button
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-foreground hover:bg-muted/40"
            >
              Outline Button
            </button>
          </div>
        </div>

        {/* Category Pills & Badges */}
        <div className="p-4 rounded-xl border border-border/60 bg-card text-card-foreground space-y-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Navigation Pills & Badges
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              Active Category
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-card text-card-foreground">
              Inactive Category
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary-foreground uppercase tracking-wider"
              style={{ backgroundColor: theme.accent }}
            >
              Special
            </span>
          </div>
        </div>

        {/* Card and Price Display */}
        <div className="p-4 rounded-xl border border-border/60 bg-card text-card-foreground space-y-3 md:col-span-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Surface Card & Price Highlights
          </span>
          <div className="p-4 rounded-xl border border-border/60 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm">Artisanal Dining Experience</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Accent tokens format typography and interactive price values.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">Rs. 2,400</span>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-primary-foreground shadow-xs"
                style={{ backgroundColor: theme.accent }}
              >
                Select Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
