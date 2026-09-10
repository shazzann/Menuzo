import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

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
    // First try exact match on the new username column
    let { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('username', username.toLowerCase())
      .limit(1)
      .maybeSingle();

    // Fallback for existing shops that don't have a username set yet
    if (!data) {
      const slugName = username.replace(/-/g, ' ');
      const fallback = await supabase
        .from('shops')
        .select('*')
        .ilike('name', slugName)
        .limit(1)
        .maybeSingle();
      
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;
    
    if (data && data.user_id) {
      // Fetch plan from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', data.user_id)
        .maybeSingle();
      
      return {
        ...data,
        plan: profile?.subscription_plan || 'free'
      };
    }

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
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('shop_daily_stats')
      .select('*')
      .eq('shop_id', shopId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }
};
