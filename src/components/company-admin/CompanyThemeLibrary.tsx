import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { 
  type AdminTheme, 
  ThemeStatistics, 
  ThemeToolbar, 
  ThemeCard, 
  ThemeEditorModal, 
  ThemeFullPreviewModal 
} from './theme-library';

const initialAdminThemes: AdminTheme[] = [
  {
    id: 't-ocean-breeze',
    name: 'Ocean Breeze',
    categories: ['Seafood', 'Cafe', 'Restaurant'],
    primary: '#0ea5e9',
    secondary: '#f0f9ff',
    accent: '#0284c7',
    isPremium: true,
    downloads: 1245,
    createdAt: '2026-08-10',
  },
  {
    id: 't-midnight-spices',
    name: 'Midnight Spices',
    categories: ['Fine Dining', 'Bar', 'Steakhouse'],
    primary: '#1e1b4b',
    secondary: '#312e81',
    accent: '#f59e0b',
    isPremium: true,
    downloads: 856,
    createdAt: '2026-08-14',
  },
  {
    id: 't-fresh-greens',
    name: 'Fresh Greens',
    categories: ['Vegan', 'Salad Bar', 'Healthy'],
    primary: '#22c55e',
    secondary: '#f0fdf4',
    accent: '#16a34a',
    isPremium: false,
    downloads: 3420,
    createdAt: '2026-07-20',
  },
  {
    id: 't-menuzo-signature',
    name: 'Menuzo Signature',
    categories: ['Burger', 'Grill', 'Modern'],
    primary: '#090a0c',
    secondary: '#1c1e22',
    accent: '#fb8500',
    isPremium: false,
    downloads: 5120,
    createdAt: '2026-07-01',
  },
  {
    id: 't-classic-elegance',
    name: 'Classic Elegance',
    categories: ['Bistro', 'Restaurant', 'Fine Dining'],
    primary: '#1f2937',
    secondary: '#f9fafb',
    accent: '#d4af37',
    isPremium: false,
    downloads: 2890,
    createdAt: '2026-07-15',
  },
  {
    id: 't-warm-terracotta',
    name: 'Warm Terracotta',
    categories: ['Italian', 'Bakery', 'Pizzeria'],
    primary: '#a44a3f',
    secondary: '#fff3e6',
    accent: '#dda15e',
    isPremium: true,
    downloads: 940,
    createdAt: '2026-08-25',
  },
  {
    id: 't-golden-harvest',
    name: 'Golden Harvest',
    categories: ['Cafe', 'Breakfast', 'Brunch'],
    primary: '#7c4a21',
    secondary: '#fff8e7',
    accent: '#d9a441',
    isPremium: true,
    downloads: 1180,
    createdAt: '2026-09-02',
  },
  {
    id: 't-royal-plum',
    name: 'Royal Plum',
    categories: ['Lounge', 'Wine Bar', 'Cocktails'],
    primary: '#4a2545',
    secondary: '#fcf7fa',
    accent: '#b784a7',
    isPremium: true,
    downloads: 620,
    createdAt: '2026-09-10',
  },
];

export function CompanyThemeLibrary() {
  const [themes, setThemes] = useState<AdminTheme[]>(initialAdminThemes);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState<'all' | 'free' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'popular' | 'newest'>('popular');

  // Modals state
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    theme: AdminTheme | null;
  }>({
    isOpen: false,
    mode: 'create',
    theme: null,
  });

  const [previewTheme, setPreviewTheme] = useState<AdminTheme | null>(null);

  // Available categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    themes.forEach((t) => t.categories?.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [themes]);

  // Filtering & Sorting
  const filteredThemes = useMemo(() => {
    return themes
      .filter((theme) => {
        // Search query
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          theme.name.toLowerCase().includes(query) ||
          theme.categories.some((c) => c.toLowerCase().includes(query));

        // Category
        const matchesCategory =
          selectedCategory === 'all' || theme.categories.includes(selectedCategory);

        // Tier
        const matchesTier =
          selectedTier === 'all' ||
          (selectedTier === 'premium' && theme.isPremium) ||
          (selectedTier === 'free' && !theme.isPremium);

        return matchesSearch && matchesCategory && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
        return b.downloads - a.downloads;
      });
  }, [themes, search, selectedCategory, selectedTier, sortBy]);

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedTier !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedTier('all');
  };

  // Actions
  const handleOpenCreate = () => {
    setEditorState({
      isOpen: true,
      mode: 'create',
      theme: null,
    });
  };

  const handleOpenEdit = (theme: AdminTheme) => {
    setEditorState({
      isOpen: true,
      mode: 'edit',
      theme,
    });
  };

  const handleSaveTheme = (savedTheme: AdminTheme) => {
    if (editorState.mode === 'create') {
      setThemes([savedTheme, ...themes]);
      toast.success(`Theme "${savedTheme.name}" created successfully!`);
    } else {
      setThemes(themes.map((t) => (t.id === savedTheme.id ? savedTheme : t)));
      toast.success(`Theme "${savedTheme.name}" updated successfully!`);
    }
  };

  const handleDeleteTheme = (id: string) => {
    const theme = themes.find((t) => t.id === id);
    setThemes(themes.filter((t) => t.id !== id));
    toast.success(`Theme "${theme?.name || id}" deleted`);
  };

  const handleDuplicateTheme = (theme: AdminTheme) => {
    const duplicated: AdminTheme = {
      ...theme,
      id: Math.random().toString(36).substr(2, 9),
      name: `${theme.name} (Copy)`,
      downloads: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setThemes([duplicated, ...themes]);
    toast.success(`Theme duplicated as "${duplicated.name}"`);
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Theme Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, preview, and manage themes available to Menuzo restaurants
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Theme
        </button>
      </div>

      {/* Statistics Section */}
      <ThemeStatistics themes={themes} />

      {/* Toolbar: Search, Categories, Tier & Sorting */}
      <ThemeToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        availableCategories={availableCategories}
        selectedTier={selectedTier}
        onTierChange={setSelectedTier}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Theme Cards Gallery */}
      {filteredThemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onPreview={(t) => setPreviewTheme(t)}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTheme}
              onDuplicate={handleDuplicateTheme}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/70 bg-card/40 space-y-3">
          <p className="font-semibold text-base text-foreground">No themes match your criteria</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query, category filter, or tier selection to find available themes.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Create & Edit Modal */}
      <ThemeEditorModal
        isOpen={editorState.isOpen}
        onClose={() => setEditorState({ ...editorState, isOpen: false })}
        onSave={handleSaveTheme}
        initialTheme={editorState.theme}
        mode={editorState.mode}
      />

      {/* Full Preview Modal */}
      <ThemeFullPreviewModal
        theme={previewTheme}
        isOpen={!!previewTheme}
        onClose={() => setPreviewTheme(null)}
        onEdit={(t) => {
          setPreviewTheme(null);
          handleOpenEdit(t);
        }}
      />
    </div>
  );
}
