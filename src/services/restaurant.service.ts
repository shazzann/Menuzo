import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { analyticsDates } from '@/lib/shopAnalytics';

type ShopInsert = Database['public']['Tables']['shops']['Insert'];
type ShopUpdate = Database['public']['Tables']['shops']['Update'];

export const RestaurantService = {
  async createRestaurant(userId: string, name: string, email: string, username: string) {
    const payload: ShopInsert = {
      user_id: userId,
      name,
      email,
      username,
      is_open: true,
      category_order: [],
      theme: { primary: '#f97316', secondary: '#1c1917', accent: '#f97316', qrStyle: 'brand' }
    };
    
    const { data, error } = await supabase
      .from('shops')
      .insert(payload)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async getRestaurantByUserId(userId: string) {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // maybeSingle instead of single so it doesn't throw if not found
      
    if (error) throw error;
    return data;
  },

  async getRestaurantByUsername(username: string) {
    // The resolver checks paid URL entitlement on the server for every visit.
    const resolved = await supabase.rpc('resolve_menu_shop', { p_slug: username.toLowerCase() });
    if (!resolved.error) return resolved.data?.[0] || null;
    // Keep permanent links working while the new migration is being deployed.
    // Never fall back to name matching, which could revive an expired paid URL.
    if (resolved.error.code !== 'PGRST202' && resolved.error.code !== '42883') throw resolved.error;
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('username', username.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateRestaurant(shopId: string, updates: ShopUpdate) {
    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async getShopDailyStats(shopId: string) {
    const dates = analyticsDates('month');

    const { data, error } = await supabase
      .from('shop_daily_stats')
      .select('*')
      .eq('shop_id', shopId)
      .gte('date', dates[0])
      .lte('date', dates[dates.length - 1])
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }
};
