import { useState, useMemo } from 'react';
import { Sparkles, Palette, Search, X } from 'lucide-react';
import type { ThemeConfig } from '@/types';
import { CURATED_THEMES, type CuratedTheme } from './curatedThemes';
import { ThemeCard } from './ThemeCard';

interface ThemeCollectionProps {
  currentTheme: ThemeConfig;
  appliedTheme: ThemeConfig;
  onSelectTheme: (theme: CuratedTheme) => void;
  disabled?: boolean;
}

export function ThemeCollection({
  currentTheme,
  appliedTheme,
  onSelectTheme,
  disabled = false,
}: ThemeCollectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'free' | 'pro'>('all');

  // Check matching theme by primary/secondary/accent (case-insensitive)
  const isMatchingTheme = (a: ThemeConfig, b: ThemeConfig) => {
    return (
      a.primary.toLowerCase() === b.primary.toLowerCase() &&
      a.secondary.toLowerCase() === b.secondary.toLowerCase() &&
      a.accent.toLowerCase() === b.accent.toLowerCase()
    );
  };

  const activeCuratedTheme = CURATED_THEMES.find((t) => isMatchingTheme(t.colors, currentTheme));
  const isCustomTheme = !activeCuratedTheme;

  // Filtered themes based on search & plan tier (All / Free / Pro)
  const filteredThemes = useMemo(() => {
    return CURATED_THEMES.filter((theme) => {
      let matchesCategory = true;
      if (activeCategory === 'free') matchesCategory = !theme.isPro;
      else if (activeCategory === 'pro') matchesCategory = theme.isPro;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        theme.name.toLowerCase().includes(query) ||
        theme.tagline.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-lg text-foreground tracking-tight">Explore Themes</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Choose a professionally crafted palette that matches your restaurant's style.
          </p>
        </div>

        {/* Custom active palette indicator if current theme is not in curated list */}
        {isCustomTheme && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground self-start sm:self-auto">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Custom Active Palette</span>
            <div className="flex items-center gap-1 pl-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.secondary }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.accent }} />
            </div>
          </div>
        )}
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Category & Plan Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50 self-start sm:self-auto overflow-x-auto max-w-full">
          {(['all', 'free', 'pro'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat === 'all' ? 'All' : cat === 'free' ? 'Free' : 'Pro'}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-muted/30 border border-border/60 rounded-xl pl-8 pr-7 py-1.5 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Theme Cards Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      {filteredThemes.length > 0 ? (
        <div 
          role="radiogroup" 
          aria-label="Curated color themes"
          className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
        >
          {filteredThemes.map((theme) => {
            const isSelected = isMatchingTheme(theme.colors, currentTheme);
            const isApplied = isMatchingTheme(theme.colors, appliedTheme);

            return (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={isSelected}
                isApplied={isApplied}
                onSelect={onSelectTheme}
                disabled={disabled}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <p className="text-sm font-medium text-foreground">No themes found</p>
          <p className="text-xs text-muted-foreground mt-1">
            No palettes match "{searchQuery}" in {activeCategory} category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
