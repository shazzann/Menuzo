import { useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, ExternalLink, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { FoodCard } from '@/components/shared/FoodCard';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import type { Category, FoodItem } from '@/types';

const LIVE_MENU_URL = 'https://menuzo.lk/spicegardenkitchen';
const INITIAL_DISH_PRICE = 1350;

const demoCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'kottu', name: 'Kottu' },
  { id: 'special', name: 'Our Special' },
];

export function HeroSection() {
  const { state, dispatch } = useApp();

  const [dishPrice, setDishPrice] = useState(INITIAL_DISH_PRICE);
  const [dishAvailable, setDishAvailable] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const firstInteractionSent = useRef(false);

  const recordFirstDemoInteraction = () => {
    if (firstInteractionSent.current) return;
    firstInteractionSent.current = true;
    trackEvent('demo_first_interaction', { source: 'hero_live_demo' });
  };

  const handlePrimaryCTA = () => {
    trackEvent('hero_cta_clicked', { source: 'hero' });
    if (state.user) {
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
      return;
    }
    trackEvent('signup_started', { source: 'hero' });
    dispatch({ type: 'SET_VIEW', payload: 'signup' });
  };

  const handlePriceChange = (raw: string) => {
    recordFirstDemoInteraction();
    const digitsOnly = raw.replace(/[^\d]/g, '').slice(0, 6);
    setDishPrice(digitsOnly ? Number(digitsOnly) : 0);
  };

  const handleAvailabilityToggle = (checked: boolean) => {
    recordFirstDemoInteraction();
    setDishAvailable(checked);
  };

  const handleReset = () => {
    recordFirstDemoInteraction();
    setDishPrice(INITIAL_DISH_PRICE);
    setDishAvailable(true);
    setSelectedCategory('all');
  };

  const demoItems: FoodItem[] = useMemo(
    () => [
      {
        id: 'demo-chicken-kottu',
        name: 'Chicken Kottu',
        description: "Sri Lanka's favorite street food, made fresh to order.",
        image: '/Landing/demo-chicken-kottu.webp',
        originalPrice: dishPrice || 0,
        finalPrice: dishPrice || 0,
        discount: 0,
        category: 'kottu',
        tagline: 'Spice Garden Kitchen',
        isAvailable: dishAvailable,
        isSpecialOffer: false,
      },
      {
        id: 'demo-cheese-kottu',
        name: 'Cheese Chicken Kottu',
        description: 'Extra cheesy delight with house-roasted spices.',
        image: '/Landing/demo-cheese-kottu.webp',
        originalPrice: 1850,
        finalPrice: 1650,
        discount: 11,
        category: 'special',
        tagline: 'Chef recommendation',
        isAvailable: true,
        isSpecialOffer: true,
      },
    ],
    [dishPrice, dishAvailable]
  );

  const visibleDemoItems = useMemo(() => {
    if (selectedCategory === 'all') return demoItems;
    return demoItems.filter((item) => item.category === selectedCategory);
  }, [demoItems, selectedCategory]);

  const formattedOwnerPrice = `LKR ${(dishPrice || 0).toLocaleString('en-US')}`;

  return (
    <section id="home" className="pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-border bg-background">
      <div className="landing-container grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-12 items-center">
        {/* Left: Core Product Message & Primary Owner Conversion */}
        <div className="max-w-xl landing-hero-enter">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            A smarter menu for every table
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight text-foreground mb-5">
            Your restaurant menu, made smarter.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mb-7">
            Create a digital menu, share it through a QR code and update your dishes, prices and availability whenever you need.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <Button
              size="lg"
              onClick={handlePrimaryCTA}
              className="h-12 px-6 rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium text-base w-full sm:w-auto transition-[color,background-color,transform] active:scale-[0.98]"
            >
              Build my free menu
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-5 rounded-xl font-medium text-base w-full sm:w-auto transition-[color,background-color,transform] active:scale-[0.98]"
            >
              <a
                href={LIVE_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('demo_first_interaction', { source: 'hero_secondary_live_menu' })
                }
              >
                Explore live menu
                <ExternalLink className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </Button>
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
            {['Free plan available', 'No customer app required', 'Update anytime'].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#18753F] dark:text-emerald-400 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Synced Owner Control + Realistic Smartphone Menu Preview */}
        <div className="landing-demo-preview landing-hero-enter-delayed space-y-3">
          <h2 className="sr-only">Live Spice Garden Kitchen interactive menu demonstration</h2>

          {/* Supporting Visual: Owner Management Bar */}
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">Owner control: Chicken Kottu</span>
                <span className="text-muted-foreground tabular-nums">{formattedOwnerPrice}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] sm:min-h-0 px-2 -my-2 sm:my-0 rounded-md"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5 items-center">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="hero-demo-price"
                  className="text-xs font-medium text-muted-foreground shrink-0"
                >
                  Price (LKR)
                </label>
                <Input
                  id="hero-demo-price"
                  type="text"
                  inputMode="numeric"
                  value={dishPrice === 0 ? '' : String(dishPrice)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="1350"
                  className="h-11 sm:h-9 rounded-lg bg-background font-medium tabular-nums"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 px-3 h-11 sm:h-9 rounded-lg bg-background border border-border">
                <label
                  htmlFor="hero-demo-available"
                  className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dishAvailable
                        ? 'bg-[#18753F] dark:bg-emerald-400'
                        : 'bg-[#C8372D] dark:bg-red-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={
                      dishAvailable
                        ? 'text-[#18753F] dark:text-emerald-400'
                        : 'text-[#C8372D] dark:text-red-400'
                    }
                  >
                    {dishAvailable ? 'Available' : 'Sold out'}
                  </span>
                </label>
                <Switch
                  id="hero-demo-available"
                  checked={dishAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                  aria-label="Toggle Chicken Kottu availability"
                />
              </div>
            </div>
          </div>

          {/* Subtle Visual Connection Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ArrowDownRight className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>Updates reflect immediately on the guest phone menu</span>
          </div>

          {/* Main Visual: Smartphone Frame Displaying Spice Garden Kitchen */}
          <div
            className="landing-phone-frame overflow-hidden max-w-[460px] mx-auto lg:max-w-none"
            aria-label="Smartphone view of Spice Garden Kitchen live Menuzo menu"
          >
            <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate font-medium">menuzo.lk/spicegardenkitchen</span>
              <span className="inline-flex items-center gap-1.5 text-[#18753F] dark:text-emerald-400 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18753F] dark:bg-emerald-400" aria-hidden="true" />
                Live menu
              </span>
            </div>

            <div className="p-3.5 sm:px-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/Landing/spice-garden-qr.svg"
                  alt="QR code for Spice Garden Kitchen live Menuzo menu"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-lg border border-border bg-white p-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    Spice Garden Kitchen
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Scan QR or open in browser
                  </p>
                </div>
              </div>

              <a
                href={LIVE_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('demo_first_interaction', { source: 'hero_live_menu_link' })
                }
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] sm:min-h-0 sm:py-1.5 rounded-lg border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-colors shrink-0"
              >
                Open live menu
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>

            <div className="bg-background">
              <CategoryTabs
                categories={demoCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  recordFirstDemoInteraction();
                  setSelectedCategory(cat);
                }}
                className="static py-2.5 px-4 border-b border-border"
              />
              <div className="p-3.5 sm:p-4 space-y-3" aria-live="polite">
                {visibleDemoItems.map((item) => (
                  <FoodCard key={item.id} item={item} variant="list" />
                ))}
              </div>
              <p className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center">
                Interactive preview: edit Chicken Kottu above to test live guest sync
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
