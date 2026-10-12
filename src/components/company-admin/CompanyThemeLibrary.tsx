import { useState, useMemo, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeService, themeSlug } from '@/services/theme.service';
import type { ShopThemeRow } from '@/types/supabase';
import { 
  type AdminTheme, 
  ThemeStatistics, 
  ThemeToolbar, 
  ThemeCard, 
  ThemeEditorModal, 
  ThemeFullPreviewModal 
} from './theme-library';

const isHexColor = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);

function adminThemeFromRow(row: ShopThemeRow, usage: Map<string, number>): AdminTheme {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    categories: row.categories,
    primary: row.primary_color,
    secondary: row.secondary_color,
    accent: row.accent_color,
    isPremium: row.is_premium,
    downloads: usage.get(row.id) || 0,
    createdAt: row.created_at.slice(0, 10),
  };
}

function rowFields(theme: AdminTheme) {
  return {
    name: theme.name,
    tagline: theme.tagline || '',
    categories: theme.categories,
    primary_color: theme.primary.toUpperCase(),
    secondary_color: theme.secondary.toUpperCase(),
    accent_color: theme.accent.toUpperCase(),
    is_premium: theme.isPremium,
  };
}

export function CompanyThemeLibrary() {
  const [themes, setThemes] = useState<AdminTheme[]>([]);
  const [usage, setUsage] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [version, setVersion] = useState(0);
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

  // Themes live in the shop_themes table, so shop owners see every change here.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      ThemeService.listThemes(),
      // Usage counts are a nice-to-have; the library still works without them.
      ThemeService.getThemeUsage().catch(() => new Map<string, number>()),
    ])
      .then(([rows, counts]) => {
        if (cancelled) return;
        setUsage(counts);
        setThemes(rows.map((row) => adminThemeFromRow(row, counts)));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load themes.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError('');
    setVersion((v) => v + 1);
  };

  const handleSaveTheme = async (savedTheme: AdminTheme): Promise<boolean> => {
    if (![savedTheme.primary, savedTheme.secondary, savedTheme.accent].every(isHexColor)) {
      toast.error('Use full 6-digit hex colours (for example #FB8500).');
      return false;
    }
    try {
      if (editorState.mode === 'create') {
        const row = await ThemeService.createTheme({ ...rowFields(savedTheme), slug: themeSlug(savedTheme.name) });
        setThemes((current) => [adminThemeFromRow(row, usage), ...current]);
        toast.success(`Theme "${row.name}" created. Shop owners can now choose it.`);
      } else {
        const row = await ThemeService.updateTheme(savedTheme.id, rowFields(savedTheme));
        setThemes((current) => current.map((t) => (t.id === row.id ? adminThemeFromRow(row, usage) : t)));
        toast.success(`Theme "${row.name}" updated`);
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the theme.');
      return false;
    }
  };

  const handleDeleteTheme = async (id: string) => {
    const theme = themes.find((t) => t.id === id);
    const inUse = theme?.downloads ? ` ${theme.downloads} shop(s) using it keep their colours.` : '';
    if (!window.confirm(`Delete "${theme?.name || 'this theme'}"? Shop owners will no longer see it.${inUse}`)) return;
    try {
      await ThemeService.deleteTheme(id);
      setThemes((current) => current.filter((t) => t.id !== id));
      toast.success(`Theme "${theme?.name || id}" deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete the theme.');
    }
  };

  const handleDuplicateTheme = async (theme: AdminTheme) => {
    const name = `${theme.name} (Copy)`.slice(0, 60);
    try {
      const row = await ThemeService.createTheme({ ...rowFields({ ...theme, name }), slug: themeSlug(name) });
      setThemes((current) => [adminThemeFromRow(row, usage), ...current]);
      toast.success(`Theme duplicated as "${row.name}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not duplicate the theme.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Theme Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, preview, and manage the themes shop owners can choose from
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
      {loading ? (
        <div className="p-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading themes…
        </div>
      ) : loadError ? (
        <div role="alert" className="p-8 text-center rounded-3xl border border-destructive/30 space-y-3">
          <p className="text-sm text-destructive">{loadError}</p>
          <button type="button" onClick={retryLoad} className="text-xs font-semibold text-primary hover:underline">
            Retry
          </button>
        </div>
      ) : filteredThemes.length > 0 ? (
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
