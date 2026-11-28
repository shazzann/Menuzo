import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, MessageCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { FoodCard } from '@/components/shared/FoodCard';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import { getPublicWhatsAppUrl } from '@/lib/contact';
import type { Category, FoodItem } from '@/types';

const LIVE_MENU_URL = 'https://menuzo.lk/spicegardenkitchen';
const DEFAULT_DISH_PRICE = 1350;

const demoCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'kottu', name: 'Kottu' },
  { id: 'specials', name: 'Our Special' },
];

export function HeroSection() {
  const { state, dispatch } = useApp();
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishPrice, setDishPrice] = useState(DEFAULT_DISH_PRICE);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const hasInteractedRef = useRef(false);

  const whatsappUrl = getPublicWhatsAppUrl(
    'Hello Menuzo, I would like to learn more about setting up a digital QR menu.'
  );

  const recordFirstDemoInteraction = () => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      trackEvent('demo_first_interaction', { source: 'hero_demo' });
    }
  };

  const handleAvailabilityToggle = (checked: boolean) => {
    recordFirstDemoInteraction();
    setDishAvailable(checked);
    trackEvent('demo_toggled', {
      control: 'availability',
      value: checked ? 'available' : 'sold_out',
    });
  };

  const handlePriceChange = (raw: string) => {
    recordFirstDemoInteraction();
    const digits = raw.replace(/\D/g, '').slice(0, 5);
    const parsed = digits ? Number(digits) : 0;
    setDishPrice(parsed);
    trackEvent('demo_toggled', {
      control: 'price',
      value: parsed,
    });
  };

  const handleReset = () => {
    recordFirstDemoInteraction();
    setDishAvailable(true);
    setDishPrice(DEFAULT_DISH_PRICE);
    setSelectedCategory('all');
    trackEvent('demo_toggled', { control: 'reset', value: 'default' });
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

  const handleContactFallback = () => {
    trackEvent('whatsapp_clicked', { source: 'hero_contact_fallback' });
    dispatch({ type: 'SET_VIEW', payload: 'contact' });
  };

  const demoItems: FoodItem[] = useMemo(
    () => [
      {
        id: 'demo-chicken-kottu',
        name: 'Chicken Kottu',
        description: "Sri Lanka's favorite street food, made fresh to order.",
        tagline: "Sri Lanka's Favorite",
        category: 'kottu',
        image: '/Landing/demo-chicken-kottu.webp',
        originalPrice: dishPrice,
        finalPrice: dishPrice,
        isSpecialOffer: false,
        isAvailable: dishAvailable,
      },
      {
        id: 'demo-cheese-kottu',
        name: 'Cheese Chicken Kottu',
        description: 'Extra cheesy delight with house-roasted spices.',
        tagline: 'Extra Cheesy Delight',
        category: 'specials',
        image: '/Landing/demo-cheese-kottu.webp',
        originalPrice: 1850,
        discount: 200,
        discountedPrice: 1650,
        finalPrice: 1650,
        isSpecialOffer: true,
        isAvailable: true,
      },
    ],
    [dishAvailable, dishPrice]
  );

  const visibleDemoItems = useMemo(() => {
    if (selectedCategory === 'all') return demoItems;
    return demoItems.filter((item) => item.category === selectedCategory);
  }, [demoItems, selectedCategory]);

  const formattedOwnerPrice = `LKR ${(dishPrice || 0).toLocaleString('en-US')}`;

  return (
    <section id="home" className="pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-border bg-background">
      <div className="landing-container grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-12 items-center">
        {/* Left: Core Product Message & Conversion CTAs */}
        <div className="max-w-xl">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Your menu, online
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight text-foreground mb-5">
            Update your menu once. Every table sees it instantly.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mb-8">
            Menuzo gives Sri Lankan cafés and restaurants a QR menu you can change any time, so prices and sold-out dishes are always right.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            <Button
              size="lg"
              onClick={handlePrimaryCTA}
              className="h-12 px-6 rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium text-base w-full sm:w-auto transition-colors"
            >
              Build my free menu
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>

            {whatsappUrl ? (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-5 rounded-xl font-medium text-base w-full sm:w-auto transition-colors"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_clicked', { source: 'hero' })}
                >
                  <MessageCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  Chat with us on WhatsApp
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={handleContactFallback}
                className="h-12 px-5 rounded-xl font-medium text-base w-full sm:w-auto transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                Contact us
              </Button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Free plan, no card, and no app for your guests
          </p>
        </div>

        {/* Right: Calm, Unified Live Product Example Using Menuzo UI Components */}
        <Card
          className="landing-demo-preview rounded-2xl border border-border bg-card shadow-xs overflow-hidden p-0 gap-0"
          aria-label="Live Spice Garden Kitchen menu example"
        >
          {/* Header with Real Restaurant QR & Live Menu Link */}
          <div className="p-4 sm:px-5 sm:py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/Landing/spice-garden-qr.svg"
                alt="QR code for Spice Garden Kitchen live Menuzo menu"
                width={44}
                height={44}
                className="w-11 h-11 rounded-lg border border-border bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    Spice Garden Kitchen
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F8A4C] dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F8A4C] dark:bg-emerald-400" aria-hidden="true" />
                    Live menu
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan QR or open the guest menu
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-colors shrink-0"
            >
              Explore a live menu
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>

          {/* Owner Quick-Sync Control Strip (Single Hairline Band) */}
          <div className="px-4 py-3 sm:px-5 bg-muted/30 border-b border-border space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">Owner control: Chicken Kottu</span>
                <span className="text-muted-foreground tabular-nums">· {formattedOwnerPrice}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5 items-center">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="hero-demo-price"
                  className="text-xs text-muted-foreground shrink-0"
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
                  className="h-9 rounded-lg bg-background font-medium tabular-nums"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 px-3 h-9 rounded-lg bg-background border border-border">
                <label
                  htmlFor="hero-demo-available"
                  className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      dishAvailable
                        ? 'bg-[#1F8A4C] dark:bg-emerald-400'
                        : 'bg-[#C8372D] dark:bg-red-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={
                      dishAvailable
                        ? 'text-[#1F8A4C] dark:text-emerald-400'
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

          {/* Guest Menu Preview Using Existing CategoryTabs + FoodCard */}
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
            <div className="p-4 space-y-3" aria-live="polite">
              {visibleDemoItems.map((item) => (
                <FoodCard key={item.id} item={item} variant="list" />
              ))}
            </div>
            <p className="px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center">
              Guest browser preview · Customers browse here and order with staff
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
