import { useState } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, X, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ThemeCard {
  id: string;
  name: string;
  categories: string[];
  primary: string;
  secondary: string;
  accent: string;
  isPremium: boolean;
  downloads: number;
}

const initialThemes: ThemeCard[] = [
  {
    id: 't1',
    name: 'Ocean Breeze',
    categories: ['Seafood', 'Cafe', 'Restaurant'],
    primary: '#0ea5e9',
    secondary: '#f0f9ff',
    accent: '#0284c7',
    isPremium: true,
    downloads: 1245,
  },
  {
    id: 't2',
    name: 'Midnight Spices',
    categories: ['Fine Dining', 'Bar'],
    primary: '#1e1b4b',
    secondary: '#312e81',
    accent: '#f59e0b',
    isPremium: true,
    downloads: 856,
  },
  {
    id: 't3',
    name: 'Fresh Greens',
    categories: ['Vegan', 'Salad Bar'],
    primary: '#22c55e',
    secondary: '#f0fdf4',
    accent: '#16a34a',
    isPremium: false,
    downloads: 3420,
  },
];

export function CompanyThemeLibrary() {
  const [themes, setThemes] = useState<ThemeCard[]>(initialThemes);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTheme, setNewTheme] = useState<Partial<ThemeCard>>({
    name: '',
    categories: [],
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#000000',
    isPremium: false,
  });
  const [catInput, setCatInput] = useState('');

  const filteredThemes = themes.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.categories.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCategory = () => {
    if (catInput.trim() && !newTheme.categories?.includes(catInput.trim())) {
      setNewTheme({
        ...newTheme,
        categories: [...(newTheme.categories || []), catInput.trim()]
      });
      setCatInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setNewTheme({
      ...newTheme,
      categories: newTheme.categories?.filter(c => c !== cat)
    });
  };

  const handleSaveTheme = () => {
    if (!newTheme.name) return;
    const themeToSave: ThemeCard = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTheme.name,
      categories: newTheme.categories || [],
      primary: newTheme.primary || '#000000',
      secondary: newTheme.secondary || '#ffffff',
      accent: newTheme.accent || '#000000',
      isPremium: newTheme.isPremium || false,
      downloads: 0,
    };
    
    setThemes([themeToSave, ...themes]);
    setIsModalOpen(false);
    setNewTheme({
      name: '',
      categories: [],
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#000000',
      isPremium: false,
    });
  };

  const handleDelete = (id: string) => {
    setThemes(themes.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theme Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage custom themes for your merchants</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search themes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="p-2 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Theme
          </button>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredThemes.map(theme => (
          <div key={theme.id} className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 flex flex-col h-full">
            
            {/* Color Preview Header */}
            <div className="h-28 relative flex" style={{ backgroundColor: theme.primary }}>
              <div className="flex-1" style={{ backgroundColor: theme.primary }} />
              <div className="flex-1" style={{ backgroundColor: theme.secondary }} />
              <div className="flex-1" style={{ backgroundColor: theme.accent }} />
              
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {theme.isPremium && (
                  <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    Premium
                  </span>
                )}
                <button className="p-1.5 rounded-lg bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight">{theme.name}</h3>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {theme.categories.map(cat => (
                  <span key={cat} className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground">
                    {cat}
                  </span>
                ))}
              </div>

              {/* Color Hex Codes */}
              <div className="space-y-2 mt-auto pt-4 border-t border-border/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Primary</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <div className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: theme.primary }} />
                    {theme.primary.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Secondary</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <div className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: theme.secondary }} />
                    {theme.secondary.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Accent</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <div className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: theme.accent }} />
                    {theme.accent.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                <button className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  Edit Theme
                </button>
                <button onClick={() => handleDelete(theme.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Theme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="text-lg font-bold">Create New Theme</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Theme Name</label>
                <Input 
                  placeholder="e.g. Tropical Vibe" 
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({...newTheme, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Recommended Categories</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. Cafe, Bakery" 
                    value={catInput}
                    onChange={(e) => setCatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button type="button" onClick={handleAddCategory} variant="secondary">Add</Button>
                </div>
                {newTheme.categories && newTheme.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTheme.categories.map(cat => (
                      <span key={cat} className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-md bg-muted text-xs font-medium">
                        {cat}
                        <button onClick={() => handleRemoveCategory(cat)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={newTheme.primary}
                      onChange={(e) => setNewTheme({...newTheme, primary: e.target.value})}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono">{newTheme.primary}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={newTheme.secondary}
                      onChange={(e) => setNewTheme({...newTheme, secondary: e.target.value})}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono">{newTheme.secondary}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={newTheme.accent}
                      onChange={(e) => setNewTheme({...newTheme, accent: e.target.value})}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono">{newTheme.accent}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Premium Theme</p>
                  <p className="text-xs text-muted-foreground">Only available for Pro plans</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={newTheme.isPremium}
                    onChange={(e) => setNewTheme({...newTheme, isPremium: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-border/50 flex gap-3 bg-muted/20">
              <Button onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveTheme} className="flex-1" disabled={!newTheme.name}>
                Save Theme
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
