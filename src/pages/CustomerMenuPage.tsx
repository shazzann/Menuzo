import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Phone } from 'lucide-react';
import { useApp } from '@/store';
import { SearchBar } from '@/components/shared/SearchBar';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { SpecialOffersCarousel } from '@/components/shared/SpecialOffersCarousel';
import { FoodCard } from '@/components/shared/FoodCard';
import { BottomNav } from '@/components/shared/BottomNav';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
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

  useEffect(() => {
    if (viewMode === 'list') return;

    const handleScroll = () => {
      if (window.scrollY < 100) {
        if (activeTabId !== 'all') setActiveTabId('all');
        return;
      }

      const sections = categories
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
  }, [categories, viewMode, activeTabId]);

  const handleFoodClick = (item: FoodItem) => {
    dispatch({ type: 'SELECT_FOOD_ITEM', payload: item });
    dispatch({ type: 'SET_VIEW', payload: 'customer-food-detail' });
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'shop-details') {
      dispatch({ type: 'SET_VIEW', payload: 'customer-shop-detail' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={shop.banner}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute top-4 right-4 p-1 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors text-foreground">
          <ThemeToggle />
        </div>
      </div>

      {/* Shop Info */}
      <div className="relative -mt-16 px-4">
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-background bg-muted flex-shrink-0">
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl">{shop.name}</h1>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full ${
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
            <Clock className="w-3.5 h-3.5" />
            <span>{shop.openingHours[0].hours}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <SearchBar
          value={searchQuery}
          onChange={(value) => dispatch({ type: 'SET_SEARCH_QUERY', payload: value })}
          placeholder="Search dishes..."
        />
      </div>

      {/* Special Offers */}
      <SpecialOffersCarousel
        items={specialOffers}
        onItemClick={handleFoodClick}
      />

      {/* Categories */}
      <CategoryTabs
        categories={categories}
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
            {categories.filter(c => c.id !== 'all').map(category => {
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
                  {categories.find(c => c.id === selectedCategory)?.name}
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
