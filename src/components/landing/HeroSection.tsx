import { useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, MessageCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  return (
    <section id="home" className="pt-8 pb-16 sm:pt-12 sm:pb-20 border-b border-border bg-background">
      <div className="landing-container grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-12 items-center">
        {/* Left: Core Product Message & Conversion CTAs */}
        <div className="max-w-xl">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider"
          >
            A simpler way to manage your restaurant menu
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-foreground mb-5">
            Update your menu once. Every table sees it instantly.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mb-7">
            Menuzo gives Sri Lankan cafés and restaurants a QR menu you can change any time, so prices and sold-out dishes are always right.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <Button
              size="lg"
              onClick={handlePrimaryCTA}
              className="h-12 px-6 rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-semibold text-base w-full sm:w-auto"
            >
              Build my free menu
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>

            {whatsappUrl ? (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-5 rounded-xl font-semibold text-base w-full sm:w-auto"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_clicked', { source: 'hero' })}
                >
                  <MessageCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                  Chat with us on WhatsApp
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={handleContactFallback}
                className="h-12 px-5 rounded-xl font-semibold text-base w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Contact us
              </Button>
            )}
          </div>

          <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Free plan. No card. Your guests need no app.</span>
          </p>
        </div>

        {/* Right: Live Product Example Built With Existing Menuzo UI Components */}
        <Card
          className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm gap-4"
          aria-label="Live Menuzo menu example using Menuzo UI components"
        >
          {/* Card Header with Live Menu Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/Landing/spice-garden-qr.svg"
                alt="QR code for Spice Garden Kitchen live Menuzo menu"
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg border border-border bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground truncate">
                    Spice Garden Kitchen
                  </p>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    Live example
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan QR or open the live Menuzo menu
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild className="rounded-xl shrink-0">
              <a
                href={LIVE_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('demo_first_interaction', { source: 'hero_live_menu_link' })
                }
              >
                Explore a live menu
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </Button>
          </div>

          {/* Owner Quick-Sync Controls */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Owner control · Chicken Kottu
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 px-2 text-xs rounded-lg"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
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
                  className="h-9 rounded-lg bg-background font-semibold tabular-nums"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 px-3 py-1.5 rounded-lg bg-background border border-border">
                <label
                  htmlFor="hero-demo-available"
                  className="text-xs font-medium text-foreground cursor-pointer"
                >
                  {dishAvailable ? 'Available' : 'Sold out'}
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

          {/* Real Customer Menu UI Components (CategoryTabs + FoodCard) */}
          <div className="rounded-xl border border-border bg-background overflow-hidden">
            <CategoryTabs
              categories={demoCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                recordFirstDemoInteraction();
                setSelectedCategory(cat);
              }}
              className="static py-2.5 px-3"
            />
            <div className="p-3 space-y-2.5" aria-live="polite">
              {visibleDemoItems.map((item) => (
                <FoodCard key={item.id} item={item} variant="list" />
              ))}
            </div>
            <p className="px-3 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground text-center">
              Customer browser view · Guests order directly with restaurant staff
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
