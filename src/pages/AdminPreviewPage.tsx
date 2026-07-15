import { useMemo, useState, useEffect, useCallback } from 'react';
import { Settings, ArrowLeft, Image as ImageIcon, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { SearchBar } from '@/components/shared/SearchBar';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { SpecialOffersCarousel } from '@/components/shared/SpecialOffersCarousel';
import { FoodCard } from '@/components/shared/FoodCard';
import { BottomNav } from '@/components/shared/BottomNav';
import type { AdminTab, FoodItem } from '@/types';
import { ArrowLeft as ArrowLeftDetail, ChefHat, Sparkles } from 'lucide-react';

export function AdminPreviewPage() {
  const { state, dispatch } = useApp();
  const { shop, foodItems, categories, searchQuery, selectedCategory } = state;
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
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
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
        isAdmin={true}
      />

      {/* Food Detail Overlay */}
      {selectedItem && (() => {
        const item = selectedItem;
        const discountPercent = item.discount
          ? Math.round(((item.originalPrice - item.finalPrice) / item.originalPrice) * 100)
          : 0;
        const categoryName = categories.find(c => c.id === item.category)?.name;

        return (
          <div className="fixed inset-0 z-[60] bg-background overflow-y-auto">
            {/* Image Header */}
            <div className="relative h-72">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No image available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              
              {/* Back Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
              >
                <ArrowLeftDetail className="w-5 h-5" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {item.isSpecialOffer && (
                  <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-primary text-primary-foreground rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Our Special
                  </span>
                )}
                {!item.isAvailable && (
                  <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-muted text-muted-foreground rounded-full">
                    Unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="relative -mt-6 px-4 pb-8">
              <div className="bg-card rounded-3xl card-border card-shadow p-5">
                {/* Title & Price */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-2xl font-bold">{item.name}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{item.tagline}</p>
                  </div>
                  <div className="text-right">
                    {item.discount ? (
                      <>
                        <p className="text-sm text-muted-foreground line-through">
                          Rs. {item.originalPrice.toFixed(2)}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          Rs. {item.finalPrice.toFixed(2)}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-destructive/20 text-destructive rounded-full">
                          Save {discountPercent}%
                        </span>
                      </>
                    ) : (
                      <p className="text-2xl font-bold">
                        Rs. {item.finalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
                    <ChefHat className="w-4 h-4" />
                    {categoryName || 'Uncategorized'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Shop Info */}
                <div className="p-4 rounded-xl bg-muted/50 mb-6">
                  <div className="flex items-center gap-3">
                    {shop.logo ? (
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {shop.name ? shop.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.tagline}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
