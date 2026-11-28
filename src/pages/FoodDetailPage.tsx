import { getShopMenuUrl } from '@/lib/shopUrls';
import { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, EyeOff, Lock, Sparkles, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';
import { useApp } from '@/store';
import { hasPaidFeatures } from '@/lib/subscription';
import { motion, AnimatePresence, useMotionValue, useTransform, type Variants } from 'framer-motion';
import type { FoodItem } from '@/types';
import { cn } from '@/lib/utils';

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 440, damping: 32, mass: 0.5 },
      opacity: { duration: 0.16, ease: 'easeOut' },
      scale: { duration: 0.16, ease: 'easeOut' },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring', stiffness: 440, damping: 32, mass: 0.5 },
      opacity: { duration: 0.12, ease: 'easeIn' },
      scale: { duration: 0.12, ease: 'easeIn' },
    },
  }),
};

interface SwipeableFoodCardProps {
  item: FoodItem;
  categoryName?: string;
  shop: {
    name?: string;
    logo?: string;
    tagline?: string;
  };
  discountPercent: number;
  isFreePlan?: boolean;
  // Over the plan's item limit: hidden from customers; its photo is greyed out and locked here.
  isLocked?: boolean;
  onNext: () => void;
  onPrev: () => void;
}

function SwipeableFoodCard({
  item,
  categoryName,
  shop,
  discountPercent,
  isFreePlan,
  isLocked,
  onNext,
  onPrev,
}: SwipeableFoodCardProps) {
  const dragX = useMotionValue(0);
  const opacity = useTransform(
    dragX,
    [-150, -70, 0, 70, 150],
    [0.05, 0.7, 1, 0.7, 0.05],
    { clamp: true }
  );
  const scale = useTransform(
    dragX,
    [-150, 0, 150],
    [0.97, 1, 0.97],
    { clamp: true }
  );

  const isVariants = item.pricingType === 'variants' && Array.isArray(item.options) && item.options.length > 0;
  
  // Sorted ascending by price (lowest to highest)
  const sortedOptions = useMemo(() => {
    if (!isVariants || !item.options) return [];
    return [...item.options].sort((a, b) => a.price - b.price);
  }, [isVariants, item.options]);

  // Initially focus/select the lowest priced option (first available option in the price-sorted list)
  const defaultOption = useMemo(() => {
    if (!isVariants || sortedOptions.length === 0) return null;
    return sortedOptions.find((o) => o.isAvailable) || sortedOptions[0];
  }, [isVariants, sortedOptions]);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(defaultOption?.id || null);

  useEffect(() => {
    setSelectedOptionId(defaultOption?.id || null);
  }, [item.id, defaultOption]);

  const selectedOption = useMemo(() => {
    if (!isVariants || sortedOptions.length === 0) return null;
    return sortedOptions.find((o) => o.id === selectedOptionId) || defaultOption;
  }, [isVariants, sortedOptions, selectedOptionId, defaultOption]);

  const activePrice = selectedOption ? selectedOption.price : item.finalPrice;

  return (
    <motion.div
      style={{ x: dragX, opacity, scale }}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={(_e, { offset, velocity }) => {
        const isFlickLeft = velocity.x < -140 && offset.x < -8;
        const isFlickRight = velocity.x > 140 && offset.x > 8;
        const isDragLeft = offset.x < -30;
        const isDragRight = offset.x > 30;

        if (isFlickLeft || isDragLeft) {
          onNext();
        } else if (isFlickRight || isDragRight) {
          onPrev();
        }
      }}
      className="w-full min-h-full flex flex-col cursor-grab active:cursor-grabbing touch-pan-y will-change-transform"
    >
      {/* Hero Food Image Header */}
      <div className="relative h-[40vh] min-h-[300px] max-h-[440px] w-full overflow-hidden shrink-0 bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="eager"
            decoding="async"
            className={cn('w-full h-full object-cover pointer-events-none select-none', isLocked && 'grayscale brightness-[0.55]')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No photo available</span>
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 backdrop-blur-sm">
              <Lock className="h-7 w-7 text-white" />
            </span>
          </div>
        )}
        {/* Subtle top vignette for crystal clear floating button readability */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />
        {/* Gentle bottom transition where the sheet overlaps */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Seamless Bottom-Sheet Content Surface */}
      <div className="w-full bg-card rounded-t-[32px] px-5 sm:px-8 pt-4 pb-6 sm:pb-8 -mt-7 relative z-10 flex flex-col shadow-2xl min-h-[calc(60vh+28px)] shrink-0 grow">
        {/* Subtle Sheet Grab Handle Indicator */}
        <div className="w-10 h-1 rounded-full bg-border/60 mx-auto mb-4 shrink-0" />

        <div className="space-y-4">
          {/* Category Pill & Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-foreground/85 text-xs font-medium">
              {categoryName || item.category || 'Unassigned'}
            </span>
            {item.isSpecialOffer && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                Special Offer
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/10 text-foreground/80 text-xs font-semibold" title="Hidden from customers on your current plan">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
            {!item.isAvailable && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                Unavailable
              </span>
            )}
          </div>

          {/* Dish Title & Tagline */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              {item.name}
            </h1>
            {item.tagline && (
              <p className="text-sm text-muted-foreground mt-1 font-normal leading-relaxed">
                {item.tagline}
              </p>
            )}
          </div>

          {/* Price Block */}
          {isVariants ? (
            <div className="flex items-baseline gap-2.5 flex-wrap pt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                Rs. {activePrice.toFixed(2)}
              </span>
              {selectedOption?.name && (
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                  {selectedOption.name}
                  {selectedOption.description ? ` • ${selectedOption.description}` : ''}
                </span>
              )}
            </div>
          ) : item.discount ? (
            <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                Rs. {item.finalPrice.toFixed(2)}
              </span>
              <span className="text-base text-muted-foreground/80 line-through">
                Rs. {item.originalPrice.toFixed(2)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-bold">
                Save {discountPercent}%
              </span>
            </div>
          ) : (
            <div className="pt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Rs. {item.finalPrice.toFixed(2)}
              </span>
            </div>
          )}

          {/* Multiple Portions / Options List (Sorted Lowest to Highest) */}
          {isVariants && sortedOptions.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-border/30">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Portion / Size
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {sortedOptions.map((opt) => {
                  const isSelected = selectedOption?.id === opt.id;
                  const isAvailable = opt.isAvailable;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={cn(
                        'w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all select-none',
                        isSelected
                          ? 'bg-primary/10 border-primary ring-1 ring-primary/40 shadow-sm'
                          : isAvailable
                          ? 'bg-muted/40 hover:bg-muted/70 border-border/60 text-foreground'
                          : 'bg-muted/15 border-border/30 text-muted-foreground/40 opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Radio indicator */}
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                            isSelected
                              ? 'border-primary'
                              : 'border-muted-foreground/40'
                          )}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className={cn('text-sm font-semibold truncate block', isSelected ? 'text-primary' : 'text-foreground')}>
                            {opt.name}
                          </span>
                          {opt.description && (
                            <span className="text-xs text-muted-foreground block truncate mt-0.5">
                              {opt.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right pl-3">
                        <span className={cn('text-sm font-bold', isSelected ? 'text-primary' : 'text-foreground')}>
                          Rs. {opt.price.toFixed(2)}
                        </span>
                        {!isAvailable && (
                          <span className="block text-[10px] text-destructive uppercase tracking-wider font-semibold mt-0.5">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Item Description */}
          {item.description && (
            <div className="pt-4 border-t border-border/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                About this item
              </p>
              <p className="text-sm sm:text-base text-foreground/85 leading-relaxed whitespace-pre-line font-normal">
                {item.description}
              </p>
            </div>
          )}

          {/* Prepared by / Shop Attribution */}
          <div className="pt-5 border-t border-border/30 flex items-center gap-3.5">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-border/40 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                {shop.name ? shop.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/80 block">
                Prepared by
              </span>
              <p className="font-bold text-sm text-foreground truncate mt-0.5">
                {shop.name}
              </p>
              {shop.tagline && (
                <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                  {shop.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Powered by Menuzo (Tiny, Centered, Only for Free Plans) */}
          {isFreePlan && (
            <div className="pt-5 pb-1 flex items-center justify-center">
              <a
                href="https://menuzo.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 opacity-55 hover:opacity-100 transition-opacity select-none group"
              >
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Powered by
                </span>
                <img
                  src="/logo/Logo favicon.png"
                  alt="Menuzo"
                  className="w-3.5 h-3.5 object-contain"
                />
                <span className="text-[11px] font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                  Menuzo
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function FoodDetailPage() {
  const { state, dispatch } = useApp();
  const { selectedFoodItem, shop } = state;
  const location = useLocation();
  const navigate = useNavigate();
  const selectedFoodId = selectedFoodItem?.id;

  useLayoutEffect(() => {
    if (selectedFoodId) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedFoodId]);

  let backView: 'customer-menu' | 'admin-preview' | 'admin-add-food' = 'customer-menu';
  if (state.currentView === 'admin-food-detail') backView = 'admin-preview';
  if (state.currentView === 'admin-add-food-detail') backView = 'admin-add-food';

  // Customers who open a link or QR code for an item that is not listed (removed, or
  // hidden by the Free plan) see a placeholder; owner views return to their list.
  const isCustomerView = state.currentView === 'customer-food-detail';
  const menuLoaded = state.shopDataStatus === 'ready';
  const showUnavailable = isCustomerView && menuLoaded && !selectedFoodItem;

  // Redirect back if no food item is selected and we have finished loading food items
  useEffect(() => {
    if (!isCustomerView && !selectedFoodItem && state.foodItems.length > 0) {
      dispatch({ type: 'SET_VIEW', payload: backView });
    }
  }, [isCustomerView, selectedFoodItem, state.foodItems.length, backView, dispatch]);

  useSEO({
    url: getShopMenuUrl(shop, window.location.origin, selectedFoodItem?.id),
    title: selectedFoodItem ? `${selectedFoodItem.name} | ${shop.name}` : shop.name,
    description: selectedFoodItem?.description || selectedFoodItem?.tagline || shop.description,
    image: selectedFoodItem?.image || shop.logo,
  });

  const visibleFoodItems = useMemo(() => {
    if (isCustomerView && state.planHiddenItemIds.length > 0) {
      return state.foodItems.filter((i) => !state.planHiddenItemIds.includes(i.id));
    }
    return state.foodItems;
  }, [isCustomerView, state.foodItems, state.planHiddenItemIds]);

  const orderedItems = useMemo(() => {
    const list: FoodItem[] = [];
    (state.categories || [])
      .filter((c) => c.id !== 'all')
      .forEach((cat) => {
        const items = visibleFoodItems.filter((item) => item.category === cat.id);
        list.push(...items);
      });
    visibleFoodItems.forEach((item) => {
      if (!list.some((existing) => existing.id === item.id)) {
        list.push(item);
      }
    });
    return list.length > 0 ? list : visibleFoodItems;
  }, [state.categories, visibleFoodItems]);

  const currentIndex = useMemo(() => {
    if (!selectedFoodItem) return -1;
    return orderedItems.findIndex((i) => i.id === selectedFoodItem.id);
  }, [selectedFoodItem, orderedItems]);

  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const isNavigatingRef = useRef(false);

  const goToNext = useCallback(() => {
    if (orderedItems.length <= 1 || currentIndex === -1) return;
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 120);

    setSlideDirection(1);
    const nextIdx = (currentIndex + 1) % orderedItems.length;
    dispatch({ type: 'SELECT_FOOD_ITEM', payload: orderedItems[nextIdx] });
  }, [currentIndex, orderedItems, dispatch]);

  const goToPrev = useCallback(() => {
    if (orderedItems.length <= 1 || currentIndex === -1) return;
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 120);

    setSlideDirection(-1);
    const prevIdx = (currentIndex - 1 + orderedItems.length) % orderedItems.length;
    dispatch({ type: 'SELECT_FOOD_ITEM', payload: orderedItems[prevIdx] });
  }, [currentIndex, orderedItems, dispatch]);

  // Keyboard navigation (desktop arrow keys & Escape)
  useEffect(() => {
    if (!selectedFoodItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (backView === 'customer-menu' && location.state?.menuReturnPath) navigate(-1);
        else dispatch({ type: 'SET_VIEW', payload: backView });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFoodItem, goToNext, goToPrev, backView, location.state, navigate, dispatch]);

  if (showUnavailable) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <EyeOff className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">This item isn't available right now</h1>
          <p className="text-sm text-muted-foreground mt-1">Take a look at the rest of {shop.name ? `${shop.name}'s` : 'the'} menu.</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'customer-menu' })}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          View menu
        </button>
      </div>
    );
  }

  if (!selectedFoodItem) {
    if (state.foodItems.length === 0) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    return null;
  }

  const item = selectedFoodItem;
  const discountPercent = item.discount
    ? Math.round(((item.originalPrice - item.finalPrice) / item.originalPrice) * 100)
    : 0;
  const categoryName = state.categories.find((c) => c.id === item.category)?.name;

  const handleShare = async () => {
    const url = getShopMenuUrl(shop, window.location.origin, item.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.name} from ${shop.name}`,
          text: `Check out ${item.name} at ${shop.name}!`,
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden touch-pan-y">

      {/* Floating Top Controls with Safe Area Support */}
      <div className="fixed top-0 inset-x-0 z-50 pointer-events-none p-4 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => {
              if (backView === 'customer-menu' && location.state?.menuReturnPath) navigate(-1);
              else dispatch({ type: 'SET_VIEW', payload: backView });
            }}
            className="pointer-events-auto w-11 h-11 rounded-full bg-black/45 hover:bg-black/65 active:scale-95 backdrop-blur-md text-white transition-all flex items-center justify-center shadow-lg border border-white/15"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="pointer-events-auto w-11 h-11 rounded-full bg-black/45 hover:bg-black/65 active:scale-95 backdrop-blur-md text-white transition-all flex items-center justify-center shadow-lg border border-white/15"
            aria-label="Share item"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Animated Swipe Content Container */}
      <div className="relative w-full max-w-2xl mx-auto min-h-screen flex flex-col">
        <AnimatePresence custom={slideDirection} initial={false} mode="popLayout">
          <motion.div
            key={item.id}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full min-h-full flex flex-col"
          >
            <SwipeableFoodCard
              item={item}
              categoryName={categoryName}
              shop={shop}
              discountPercent={discountPercent}
              isFreePlan={!hasPaidFeatures(state.user?.subscription)}
              isLocked={!isCustomerView && state.planHiddenItemIds.includes(item.id)}
              onNext={goToNext}
              onPrev={goToPrev}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
