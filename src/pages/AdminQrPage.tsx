import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useApp } from '@/store';
import { AdminQrSettings } from '@/components/admin/AdminQrSettings';
import type { DotType } from 'qr-code-styling';

export function AdminQrPage() {
  const { state, dispatch } = useApp();
  const { shop } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [qrStyle, setQrStyle] = useState<'classic' | 'brand'>((shop.theme as any)?.qrStyle || 'classic');
  const [qrPattern, setQrPattern] = useState<DotType>((shop.theme as any)?.qrPattern || 'square');

  useEffect(() => {
    setQrStyle((shop.theme as any)?.qrStyle || 'classic');
    setQrPattern((shop.theme as any)?.qrPattern || 'square');
  }, [shop.theme]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedTheme = { ...(shop.theme as any), qrStyle, qrPattern };

      if (shop.id && shop.id !== 'shop-1') {
        const { RestaurantService } = await import('@/services');
        await RestaurantService.updateRestaurant(shop.id, { theme: updatedTheme as any });
      }

      dispatch({ type: 'UPDATE_SHOP', payload: { theme: updatedTheme } });
      toast.success('QR settings saved!');
    } catch (err: any) {
      console.error('Error saving QR settings:', err);
      toast.error(err.message || 'Failed to save QR settings.');
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
            <h1 className="font-semibold text-lg">QR Customization</h1>
          </div>
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
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <AdminQrSettings
          shopUrl={`${window.location.origin}/${shop.username || 'menuzo'}`}
          themePrimary={shop.theme?.primary || '#090A0C'}
          themeAccent={shop.theme?.accent || '#FB8500'}
          shopLogo={shop.logo}
          shopName={shop.name}
          isSaving={isSaving}
          qrStyle={qrStyle}
          qrPattern={qrPattern}
          onChangeStyle={setQrStyle}
          onChangePattern={setQrPattern}
        />
      </div>
    </div>
  );
}
