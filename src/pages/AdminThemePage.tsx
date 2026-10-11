import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useApp } from '@/store';
import type { ThemeConfig } from '@/types';
import type { Json } from '@/types/database.types';
import { isValidThemeColor, normalizeShopTheme } from '@/lib/themeUtils';
import { AdminThemeSettings } from '@/components/admin/AdminThemeSettings';
import { ThemeActionBar } from '@/components/admin/theme';

export function AdminThemePage() {
  const { state, dispatch } = useApp();
  const { shop } = state;
  const [isSaving, setIsSaving] = useState(false);

  // The applied theme is what's saved in the shop store/database
  const appliedTheme = normalizeShopTheme(shop.theme);

  // Draft theme is set when user chooses a theme to preview; null means using applied theme
  const [draftTheme, setDraftTheme] = useState<ThemeConfig | null>(null);
  const selectedTheme = draftTheme ?? appliedTheme;

  const handleSave = async () => {
    if (![selectedTheme.primary, selectedTheme.secondary, selectedTheme.accent].every(isValidThemeColor)) {
      toast.error('Enter a valid hex colour for all three colours before saving.');
      return;
    }
    setIsSaving(true);
    try {
      if (shop.id && shop.id !== 'shop-1') {
        const { RestaurantService } = await import('@/services');
        await RestaurantService.updateRestaurant(shop.id, { theme: selectedTheme as unknown as Json });
      }

      dispatch({ type: 'UPDATE_SHOP', payload: { theme: selectedTheme } });
      setDraftTheme(null);
      toast.success('Theme applied successfully!');
    } catch (err: unknown) {
      console.error('Error saving theme:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save theme.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDraftTheme(null);
    toast.info('Restored active theme');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
              className="text-muted-foreground hover:text-foreground -ml-2"
              aria-label="Back to settings"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-lg leading-tight">Theme Customization</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Personalize your restaurant's digital menu appearance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 py-3.5 sm:py-5">
        <AdminThemeSettings
          theme={selectedTheme}
          appliedTheme={appliedTheme}
          onChange={(t) => setDraftTheme(t)}
          shopName={shop.name}
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <ThemeActionBar
        selectedTheme={selectedTheme}
        appliedTheme={appliedTheme}
        isSaving={isSaving}
        onApply={handleSave}
        onReset={handleReset}
      />
    </div>
  );
}
