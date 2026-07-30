import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Phone, Store, Image as ImageIcon, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store';
import { SearchBar } from '@/components/shared/SearchBar';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { SpecialOffersCarousel } from '@/components/shared/SpecialOffersCarousel';
import { FoodCard } from '@/components/shared/FoodCard';
import { BottomNav } from '@/components/shared/BottomNav';
import { useSEO } from '@/hooks/useSEO';
import { checkShopStatus } from '@/lib/timeUtils';
import { supabase } from '@/lib/supabase';
import type { FoodItem } from '@/types';

export function CustomerMenuPage() {
  const { state, dispatch } = useApp();
  const { shop, foodItems, categories, searchQuery, selectedCategory } = state;
  const [viewMode, setViewMode] = useState<'rows' | 'list'>('rows');
  const [activeTabId, setActiveTabId] = useState('all');

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

    return items.filter((item) => item.isAvailable);
  }, [foodItems, selectedCategory, searchQuery, viewMode]);

  const categoriesWithItems = useMemo(() => {
    return categories.filter(
      (cat) => cat.id === 'all' || foodItems.some((item) => item.category === cat.id && item.isAvailable)
    );
  }, [categories, foodItems]);

  useSEO({
    title: shop.name || 'Menu',
    description: shop.tagline || shop.description,
    image: shop.banner || shop.logo,
  });

  useEffect(() => {
    if (shop?.id && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isQr = searchParams.get('source') === 'qr';
      
      const trackVisit = async () => {
        try {
          await supabase.rpc('increment_shop_visits', {
            p_shop_id: shop.id,
            p_is_qr: isQr
          });
        } catch (e) {
          console.error('Analytics tracking failed:', e);
        }
      };

      // Ensure we only track once per session to avoid double counting from React Strict Mode
      const trackedKey = `tracked_visit_${shop.id}_${isQr}`;
      if (!sessionStorage.getItem(trackedKey)) {
        sessionStorage.setItem(trackedKey, 'true');
        trackVisit();
      }
    }
  }, [shop?.id]);

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
        if (rect.top <= 150) {
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
  }, [foodItems, activeTabId]);

  const timeStatus = checkShopStatus(shop.openingHours);
  const isCurrentlyOpen = shop.isOpen && timeStatus.isOpen;

  useSEO({
    title: `${shop.name} - Menu`,
    description: shop.description || shop.tagline || `View the menu for ${shop.name}`,
    image: shop.banner || shop.logo || undefined
  });

  const handleFoodClick = (food: FoodItem) => {
    dispatch({ type: 'SELECT_FOOD_ITEM', payload: food });
    dispatch({ type: 'SET_VIEW', payload: 'customer-food-detail' });
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'shop-details') {
      dispatch({ type: 'SET_VIEW', payload: 'customer-shop-detail' });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shop.name,
          text: `Check out the menu for ${shop.name}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Banner */}
      <div className="h-40 sm:h-48 md:h-64 bg-muted relative">
        {shop.banner ? (
          <img
            src={shop.banner}
            alt="Shop banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">No Banner</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        
        {/* Navigation / Share */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => {
              if (shop.id === 'shop-1') {
                dispatch({ type: 'SET_VIEW', payload: 'landing' });
              } else {
                dispatch({ type: 'SET_VIEW', payload: 'customer-shop-detail' });
              }
            }}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Shop Info Card */}
      <div className="mx-4 -mt-12 relative z-10 bg-card rounded-2xl p-4 shadow-sm border">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-background bg-muted flex-shrink-0 flex items-center justify-center">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-8 h-8 text-muted-foreground/30" />
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl">{shop.name}</h1>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full flex-shrink-0 ${
                  isCurrentlyOpen
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCurrentlyOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{shop.tagline}</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 mt-3">
          <a href={`https://maps.google.com/?q=${encodeURIComponent(shop.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">{shop.location}</span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>{shop.contactNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {isCurrentlyOpen 
                ? (timeStatus.nextActionTime ? `Open until ${timeStatus.nextActionTime}` : 'Open Now') 
                : 'Closed Now'}
              {timeStatus.reason && ` (${timeStatus.reason})`}
            </span>
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
          placeholder="Search dishes..."
        />
      </div>

      {/* Categories */}
      <CategoryTabs
        className="top-0"
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
                const headerOffset = 100;
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
                  <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x hide-scrollbar">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="w-[200px] flex-shrink-0 snap-start first:ml-2">
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
        isAdmin={false}
      />
    </div>
  );
}
