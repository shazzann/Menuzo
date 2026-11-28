import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Settings, ArrowLeft, Image as ImageIcon, Store, ArrowLeft as ArrowLeftDetail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { SearchBar } from '@/components/shared/SearchBar';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { SpecialOffersCarousel } from '@/components/shared/SpecialOffersCarousel';
import { FoodCard } from '@/components/shared/FoodCard';
import { BottomNav } from '@/components/shared/BottomNav';
import { ShopLogoAvatar } from '@/components/shared/ShopLogoAvatar';
import type { AdminTab, FoodItem } from '@/types';
import { PlanStatusBanner } from '@/components/subscription/PlanStatusBanner';
import { motion, AnimatePresence, useMotionValue, useTransform, type Variants } from 'framer-motion';
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

interface SwipeableDetailCardProps {
  item: FoodItem;
  categoryName?: string;
  shop: {
    name?: string;
    logo?: string;
    tagline?: string;
  };
  discountPercent: number;
  isFreePlan?: boolean;
  onNext: () => void;
  onPrev: () => void;
}

function SwipeableDetailCard({
  item,
  categoryName,
  shop,
  discountPercent,
  isFreePlan,
  onNext,
  onPrev,
}: SwipeableDetailCardProps) {
  const dragX = useMotionValue(0);
  // As the card is dragged left or right, it progressively fades into the background color
  const opacity = useTransform(
    dragX,
    [-150, -70, 0, 70, 150],
    [0.05, 0.7, 1, 0.7, 0.05],
    { clamp: true }
  );
  // Gentle scale-down while swiping away for a native, fluid card-dismiss feel
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
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No photo available</span>
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
              {categoryName || 'Uncategorized'}
            </span>
            {item.isSpecialOffer && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                Special Offer
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

export function AdminPreviewPage() {
  const { state, dispatch } = useApp();
  const { shop, categories, searchQuery, selectedCategory, planHiddenItemIds } = state;
  // The preview shows what customers see, so items hidden by the Free plan are left out.
  const foodItems = useMemo(
    () => state.foodItems.filter((item) => !planHiddenItemIds.includes(item.id)),
    [state.foodItems, planHiddenItemIds]
  );
  const [viewMode, setViewMode] = useState<'rows' | 'list'>('rows');
  const [activeTabId, setActiveTabId] = useState('all');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const specialOffers = useMemo(
    () => foodItems.filter((item) => item.isSpecialOffer && item.isAvailable),
    [foodItems]
  );

  const filteredItems = useMemo(() => {
    let items = foodItems;

    if (viewMode === 'list' && selectedCategory !== 'all') {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    return items;
  }, [foodItems, selectedCategory, searchQuery, viewMode]);

  const categoriesWithItems = useMemo(() => {
    return categories.filter(
      (cat) => cat.id === 'all' || foodItems.some((item) => item.category === cat.id)
    );
  }, [categories, foodItems]);

  const orderedItems = useMemo(() => {
    if (searchQuery) {
      return filteredItems;
    }
    if (viewMode === 'list' && selectedCategory !== 'all') {
      return filteredItems.filter((item) => item.category === selectedCategory);
    }
    const list: FoodItem[] = [];
    categoriesWithItems
      .filter((c) => c.id !== 'all')
      .forEach((cat) => {
        const items = foodItems.filter((item) => item.category === cat.id);
        list.push(...items);
      });
    foodItems.forEach((item) => {
      if (!list.some((existing) => existing.id === item.id)) {
        list.push(item);
      }
    });
    return list.length > 0 ? list : foodItems;
  }, [categoriesWithItems, filteredItems, foodItems, searchQuery, selectedCategory, viewMode]);

  const currentIndex = useMemo(() => {
    if (!selectedItem) return -1;
    return orderedItems.findIndex((i) => i.id === selectedItem.id);
  }, [selectedItem, orderedItems]);

  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const detailScrollRef = useRef<HTMLDivElement>(null);
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
    setSelectedItem(orderedItems[nextIdx]);
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentIndex, orderedItems]);

  const goToPrev = useCallback(() => {
    if (orderedItems.length <= 1 || currentIndex === -1) return;
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 120);

    setSlideDirection(-1);
    const prevIdx = (currentIndex - 1 + orderedItems.length) % orderedItems.length;
    setSelectedItem(orderedItems[prevIdx]);
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentIndex, orderedItems]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, goToNext, goToPrev]);

  // Lock body scroll when food detail overlay is open to guarantee full vertical scroll fidelity
  useEffect(() => {
    if (!selectedItem) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedItem]);

  useEffect(() => {
    if (viewMode === 'list') return;

    const handleScroll = () => {
      if (window.scrollY < 100) {
        if (activeTabId !== 'all') setActiveTabId('all');
        return;
      }

      const sections = categoriesWithItems
        .filter(c => c.id !== 'all')
        .map(c => document.getElementById(`category-section-${c.id}`))
        .filter(Boolean) as HTMLElement[];

      let currentSection = sections[0];
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 180) { // Adjust offset for admin header
          currentSection = section;
        }
      }

      if (currentSection) {
        const id = currentSection.id.replace('category-section-', '');
        if (activeTabId !== id) {
          setActiveTabId(id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categoriesWithItems, viewMode, activeTabId]);

  const handleFoodClick = useCallback((item: FoodItem) => {
    setSelectedItem(item);
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
    switch (tab) {
      case 'dashboard':
        dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
        break;
      case 'settings':
        dispatch({ type: 'SET_VIEW', payload: 'admin-settings' });
        break;
      case 'add-food':
        dispatch({ type: 'SET_VIEW', payload: 'admin-add-food' });
        break;
      case 'analytics':
        dispatch({ type: 'SET_VIEW', payload: 'admin-analytics' });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ShopLogoAvatar logo={shop.logo} name={shop.name} />
            <div>
              <h1 className="font-semibold text-sm">Menu Preview</h1>
              <p className="text-xs text-muted-foreground">See what customers see</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <PlanStatusBanner className="mx-4 mt-3" kinds={['hidden']} />

      {/* Banner */}
      <div className="relative h-40 overflow-hidden bg-muted flex items-center justify-center">
        {shop.banner ? (
          <img
            src={shop.banner}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/50">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs font-medium">No Banner</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Shop Info */}
      <div className="relative -mt-12 px-4">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-background bg-muted flex items-center justify-center flex-shrink-0">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-8 h-8 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">{shop.name}</h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full ${
                  shop.isOpen
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {shop.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{shop.tagline}</p>
          </div>
        </div>
      </div>

      {/* Special Offers */}
      <SpecialOffersCarousel
        items={specialOffers}
        onItemClick={handleFoodClick}
      />

      {/* Search */}
      <div className="px-4 mt-4">
        <SearchBar
          value={searchQuery}
          onChange={(value) => dispatch({ type: 'SET_SEARCH_QUERY', payload: value })}
          placeholder="Search your menu..."
        />
      </div>

      {/* Categories */}
      <CategoryTabs
        className="top-[65px]"
        categories={categoriesWithItems}
        selectedCategory={viewMode === 'rows' ? activeTabId : selectedCategory}
        onSelectCategory={(categoryId) => {
          if (viewMode === 'list') {
            if (categoryId === 'all') {
              setViewMode('rows');
            } else {
              dispatch({ type: 'SET_SELECTED_CATEGORY', payload: categoryId });
            }
          } else {
            if (categoryId === 'all') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              const el = document.getElementById(`category-section-${categoryId}`);
              if (el) {
                const headerOffset = 130;
                const elementPosition = el.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
              }
            }
          }
        }}
      />

      {/* Menu Area */}
      <div className="py-4">
        {viewMode === 'rows' ? (
          <div className="space-y-6">
            {categoriesWithItems.filter(c => c.id !== 'all').map(category => {
              const categoryItems = filteredItems.filter(item => item.category === category.id);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} id={`category-section-${category.id}`}>
                  <div className="px-4 flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category.id });
                        setViewMode('list');
                        window.scrollTo({ top: 0 });
                      }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      More
                    </button>
                  </div>
                  <div className="mx-4 flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="w-[176px] flex-shrink-0 snap-start">
                        <FoodCard
                          item={item}
                          onClick={() => handleFoodClick(item)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground text-sm">No items found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('rows')} className="p-1 rounded-full bg-muted text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-semibold text-sm">
                  {categoriesWithItems.find(c => c.id === selectedCategory)?.name}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {filteredItems.length} items
              </span>
            </div>
            
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onClick={() => handleFoodClick(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No items found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="menu-preview"
        onTabChange={handleTabChange}
        isAdmin={true}
      />

      {/* Food Detail Overlay with Smooth Left/Right Swipe Navigation */}
      <AnimatePresence>
        {selectedItem && (() => {
          const item = selectedItem;
          const discountPercent = item.discount
            ? Math.round(((item.originalPrice - item.finalPrice) / item.originalPrice) * 100)
            : 0;
          const categoryName = categories.find((c) => c.id === item.category)?.name;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              ref={detailScrollRef}
              className="fixed inset-0 z-[60] bg-background overflow-y-auto overflow-x-hidden flex flex-col touch-pan-y overscroll-y-contain"
            >
              {/* Floating Top Controls with Safe Area Support */}
              <div className="fixed top-0 inset-x-0 z-50 pointer-events-none p-4 pt-[max(env(safe-area-inset-top),16px)]">
                <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="pointer-events-auto w-11 h-11 rounded-full bg-black/45 hover:bg-black/65 active:scale-95 backdrop-blur-md text-white transition-all flex items-center justify-center shadow-lg border border-white/15"
                    aria-label="Back to menu"
                  >
                    <ArrowLeftDetail className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Animated Swipe Content Container */}
              <div className="relative w-full max-w-2xl mx-auto min-h-full flex flex-col">
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
                    <SwipeableDetailCard
                      item={item}
                      categoryName={categoryName}
                      shop={shop}
                      discountPercent={discountPercent}
                      isFreePlan={true}
                      onNext={goToNext}
                      onPrev={goToPrev}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
