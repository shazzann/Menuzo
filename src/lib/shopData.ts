import type { Shop, FoodItem } from '@/types';
import type { Database } from '@/types/supabase';
import { filterExpiredSpecialDates } from './timeUtils';

export function formatShop(row: Database['public']['Tables']['shops']['Row'], slug?: string): Shop {
  const details = row as typeof row & { contacts?: Shop['contacts']; theme?: Shop['theme']; category_order?: string[]; menu_slug?: string | null };
  return {
    id:row.id,username:row.username || slug || '',name:row.name,tagline:row.tagline || '',
    menuSlug:details.menu_slug || slug || row.username || '',
    description:row.description || '',location:row.location || '',contactNumber:row.contact_number || '',
    contacts:details.contacts || [],theme:details.theme,email:row.email || '',isOpen:!!row.is_open,
    logo:row.logo || '',banner:row.banner || '',
    openingHours:filterExpiredSpecialDates((Array.isArray(row.opening_hours) ? row.opening_hours : []) as unknown as Shop['openingHours']),
    socialLinks:{instagram:row.instagram || '',facebook:row.facebook || '',website:row.website || ''},
    categoryOrder:details.category_order,view_count:row.view_count || 0,qr_scan_count:row.qr_scan_count || 0,
  };
}
export function formatFood(rows: Database['public']['Tables']['food_items']['Row'][]): FoodItem[] {
  return rows.map(item => ({id:item.id,name:item.name,description:item.description || '',tagline:item.tagline || '',
    category:item.category || 'unassigned',image:item.image || '/food-burger.jpg',originalPrice:Number(item.original_price),
    discount:Number(item.discount),finalPrice:Number(item.final_price),isSpecialOffer:!!item.is_special_offer,isAvailable:!!item.is_available}));
}
