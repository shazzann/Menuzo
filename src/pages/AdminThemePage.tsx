import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useApp } from '@/store';
import { AdminThemeSettings } from '@/components/admin/AdminThemeSettings';
import type { Database } from '@/types/supabase';

export function AdminThemePage() {
  const { state, dispatch } = useApp();
  const { shop } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState(shop.theme || {
    primary: '#090A0C',
    secondary: '#1C1E22',
    accent: '#FB8500',
  });

  useEffect(() => {
    setTheme(shop.theme || { primary: '#090A0C', secondary: '#1C1E22', accent: '#FB8500' });
  }, [shop.theme]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      type ShopUpdate = Database['public']['Tables']['shops']['Update'];
      const updatePayload: ShopUpdate = { theme: theme as any };

      if (shop.id && shop.id !== 'shop-1') {
        const { error } = await supabase
          .from('shops')
          .update(updatePayload)
          .eq('id', shop.id);
        if (error) throw error;
      }

      dispatch({ type: 'UPDATE_SHOP', payload: { theme } });
      setIsEditing(false);
      toast.success('Theme saved successfully!');
    } catch (err: any) {
      console.error('Error saving theme:', err);
      toast.error(err.message || 'Failed to save theme.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-lg">Theme Customization</h1>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={() => {
                setTheme(shop.theme || { primary: '#090A0C', secondary: '#1C1E22', accent: '#FB8500' });
                setIsEditing(false);
              }} className="px-2">
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isSaving}
                onClick={handleSave}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <AdminThemeSettings
          theme={theme as any}
          onChange={(t) => setTheme(t)}
          isEditing={isEditing}
          shopName={shop.name}
        />
      </div>
    </div>
  );
}
