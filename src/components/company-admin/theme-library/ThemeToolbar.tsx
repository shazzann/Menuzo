import { Search, X, ArrowUpDown } from 'lucide-react';

interface ThemeToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  availableCategories: string[];
  selectedTier: 'all' | 'free' | 'premium';
  onTierChange: (tier: 'all' | 'free' | 'premium') => void;
  sortBy: 'name-asc' | 'name-desc' | 'popular' | 'newest';
  onSortChange: (sort: 'name-asc' | 'name-desc' | 'popular' | 'newest') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function ThemeToolbar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  availableCategories,
  selectedTier,
  onTierChange,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}: ThemeToolbarProps) {
  return (
    <div className="space-y-3">
      {/* Search, Tier & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search themes or categories..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card border border-border/60 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tier & Sort Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Free / Premium Tier Filter */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/50 text-xs">
            {(['all', 'free', 'premium'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => onTierChange(tier)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${
                  selectedTier === tier
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tier === 'premium' ? 'PRO' : tier}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-border/60 text-xs text-muted-foreground">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as ThemeToolbarProps['sortBy'])}
              className="bg-transparent text-foreground text-xs outline-hidden cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-primary hover:underline px-1 py-1 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          All Categories
        </button>
        {availableCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
