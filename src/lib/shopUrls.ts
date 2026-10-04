import type { Shop } from '@/types';

export function getShopMenuSlug(shop: Pick<Shop, 'username' | 'menuSlug'>): string {
  return shop.menuSlug || shop.username;
}

export function getShopMenuPath(shop: Pick<Shop, 'username' | 'menuSlug'>, foodId?: string): string {
  return `/${encodeURIComponent(getShopMenuSlug(shop))}${foodId ? `/food/${encodeURIComponent(foodId)}` : ''}`;
}

export function getShopMenuUrl(shop: Pick<Shop, 'username' | 'menuSlug'>, origin: string, foodId?: string): string {
  return new URL(getShopMenuPath(shop, foodId), origin).href;
}

// Replace only the shop segment so food IDs, QR source, query and hash survive.
export function replaceMenuSlug(path: string, slug: string): string {
  return path.replace(/^\/[^/?#]+/, `/${encodeURIComponent(slug)}`);
}
