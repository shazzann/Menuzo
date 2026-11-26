import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type FoodItemInsert = Database['public']['Tables']['food_items']['Insert'];
type FoodItemUpdate = Database['public']['Tables']['food_items']['Update'];
type FoodItemOptionInsert = Database['public']['Tables']['food_item_options']['Insert'];
type FoodItemOptionRow = Database['public']['Tables']['food_item_options']['Row'];

export const MenuService = {
  async getMenuByShopId(shopId: string) {
    const { data: foodItems, error: itemsError } = await supabase
      .from('food_items')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
      
    if (itemsError) throw itemsError;
    if (!foodItems || foodItems.length === 0) return [];

    try {
      const { data: optionsData, error: optionsError } = await supabase
        .from('food_item_options')
        .select('*')
        .eq('shop_id', shopId)
        .order('display_order', { ascending: true });

      if (!optionsError && optionsData) {
        const optionsByFoodId = new Map<string, FoodItemOptionRow[]>();
        for (const opt of optionsData) {
          const list = optionsByFoodId.get(opt.food_item_id) || [];
          list.push(opt);
          optionsByFoodId.set(opt.food_item_id, list);
        }

        return foodItems.map(item => ({
          ...item,
          food_item_options: optionsByFoodId.get(item.id) || []
        }));
      }
    } catch {
      // Graceful fallback if table is not yet accessible
    }

    return foodItems;
  },

  async getItemOptions(foodItemId: string): Promise<FoodItemOptionRow[]> {
    try {
      const { data, error } = await supabase
        .from('food_item_options')
        .select('*')
        .eq('food_item_id', foodItemId)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Could not fetch options for food item:', error);
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  async saveItemOptions(
    foodItemId: string,
    shopId: string,
    options: Array<{
      name: string;
      description?: string | null;
      price: number;
      is_available?: boolean;
      display_order?: number;
    }>
  ) {
    const { error: deleteError } = await supabase
      .from('food_item_options')
      .delete()
      .eq('food_item_id', foodItemId);

    if (deleteError) {
      console.warn('Failed to clear old options:', deleteError);
    }

    if (!options || options.length === 0) return [];

    const insertRows: FoodItemOptionInsert[] = options.map((opt, idx) => ({
      food_item_id: foodItemId,
      shop_id: shopId,
      name: opt.name.trim(),
      description: opt.description?.trim() || null,
      price: Number(opt.price),
      is_available: opt.is_available ?? true,
      display_order: opt.display_order ?? idx
    }));

    const { data, error: insertError } = await supabase
      .from('food_item_options')
      .insert(insertRows)
      .select();

    if (insertError) throw insertError;
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
