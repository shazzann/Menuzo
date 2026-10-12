import { supabase } from '@/lib/supabase';
import type { Database, ShopThemeRow } from '@/types/supabase';

type ThemeInsert = Database['public']['Tables']['shop_themes']['Insert'];
type ThemeUpdate = Database['public']['Tables']['shop_themes']['Update'];

export function themeSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'theme';
  // A short suffix keeps slugs unique when two themes share a name.
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

// The theme directory shared by the company Theme Library and shop owners' theme picker.
export const ThemeService = {
  async listThemes(): Promise<ShopThemeRow[]> {
    const { data, error } = await supabase
      .from('shop_themes')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Company admins only: how many shops use each theme.
  async getThemeUsage(): Promise<Map<string, number>> {
    const { data, error } = await supabase.rpc('admin_shop_theme_usage');
    if (error) throw error;
    return new Map((data || []).map(row => [row.theme_id, Number(row.shop_count)]));
  },

  async createTheme(theme: ThemeInsert): Promise<ShopThemeRow> {
    const { data, error } = await supabase.from('shop_themes').insert(theme).select().single();
    if (error) throw error;
    return data;
  },

  async updateTheme(id: string, updates: ThemeUpdate): Promise<ShopThemeRow> {
    const { data, error } = await supabase.from('shop_themes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteTheme(id: string): Promise<void> {
    const { error } = await supabase.from('shop_themes').delete().eq('id', id);
    if (error) throw error;
  },
};
