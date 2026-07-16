import { supabase } from '@/lib/supabase';

export const CategoryService = {
  // Categories are derived from food_items and ordered by shops.category_order
  async updateCategoryOrder(shopId: string, categoryOrder: string[]) {
    const { data, error } = await supabase
      .from('shops')
      .update({ category_order: categoryOrder })
      .eq('id', shopId)
      .select('category_order')
      .single();
      
    if (error) throw error;
    return data.category_order;
  },

  async renameCategoryInFoodItems(shopId: string, oldName: string, newName: string) {
    const { error } = await supabase
      .from('food_items')
      .update({ category: newName })
      .eq('shop_id', shopId)
      .eq('category', oldName);
      
    if (error) throw error;
  }
};
