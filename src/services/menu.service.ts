import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type FoodItemInsert = Database['public']['Tables']['food_items']['Insert'];
type FoodItemUpdate = Database['public']['Tables']['food_items']['Update'];

export const MenuService = {
  async getMenuByShopId(shopId: string) {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  // Items customers cannot see because the shop is over the Free plan limits.
  async getPlanHiddenItemIds(shopId: string): Promise<string[]> {
    const { data, error } = await supabase.rpc('plan_hidden_food_item_ids', { p_shop_id: shopId });
    if (error) throw error;
    return (data || []) as string[];
  },

  async addMenuItem(item: FoodItemInsert) {
    const { data, error } = await supabase
      .from('food_items')
      .insert(item)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateMenuItem(itemId: string, updates: FoodItemUpdate) {
    const { data, error } = await supabase
      .from('food_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteMenuItem(itemId: string) {
    const { error } = await supabase
      .from('food_items')
      .delete()
      .eq('id', itemId);
      
    if (error) throw error;
  },
  
  async toggleAvailability(itemId: string, currentStatus: boolean) {
    return this.updateMenuItem(itemId, { is_available: !currentStatus });
  }
};
