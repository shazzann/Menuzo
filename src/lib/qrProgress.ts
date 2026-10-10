import type { Shop } from '@/types';

type QrTheme = NonNullable<Shop['theme']> & { qrGeneratedAt?: string; qrPattern?: string };
type UpdateShop = (action: { type: 'UPDATE_SHOP'; payload: Partial<Shop> }) => void;

const legacyKey = (shopId?: string) => `qr_generated_${shopId}`;

// Saved on the shop so the onboarding step stays done on every device and browser.
// A saved QR design (qrPattern is only written by QR Customization) also counts,
// and the browser flag is kept for QR codes downloaded before this was stored.
export function hasGeneratedQr(shop?: Pick<Shop, 'id' | 'theme'>): boolean {
  const theme = shop?.theme as QrTheme | undefined;
  if (theme?.qrGeneratedAt || theme?.qrPattern) return true;
  try {
    return localStorage.getItem(legacyKey(shop?.id)) === 'true';
  } catch {
    return false;
  }
}

export function withQrGenerated(theme: Shop['theme']): QrTheme {
  const current = theme as QrTheme | undefined;
  return { ...(current as QrTheme), qrGeneratedAt: current?.qrGeneratedAt || new Date().toISOString() };
}

export async function markQrGenerated(shop: Pick<Shop, 'id' | 'theme'>, dispatch: UpdateShop): Promise<void> {
  try {
    localStorage.setItem(legacyKey(shop.id), 'true');
  } catch {
    // Storage can be unavailable (private mode); the saved shop value still counts.
  }
  if ((shop.theme as QrTheme | undefined)?.qrGeneratedAt) {
    dispatch({ type: 'UPDATE_SHOP', payload: {} });
    return;
  }
  const theme = withQrGenerated(shop.theme);
  dispatch({ type: 'UPDATE_SHOP', payload: { theme } });
  if (shop.id && shop.id !== 'shop-1') {
    try {
      const { RestaurantService } = await import('@/services');
      await RestaurantService.updateRestaurant(shop.id, { theme: theme as never });
    } catch (err) {
      // The download itself succeeded; the checklist falls back to this browser's flag.
      console.error('Could not save QR progress:', err);
    }
  }
}
