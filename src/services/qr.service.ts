import { supabase } from '@/lib/supabase';
import type { ThemeConfig } from '@/types';

export const QRService = {
  // QR settings are part of the theme config in the shops table
  async updateQRSettings(shopId: string, currentTheme: ThemeConfig, newQRStyle: 'classic' | 'brand' | 'minimal') {
    const updatedTheme = {
      ...currentTheme,
      qrStyle: newQRStyle
    };

    const { data, error } = await supabase
      .from('shops')
      .update({ theme: updatedTheme as any })
      .eq('id', shopId)
      .select('theme')
      .single();
      
    if (error) throw error;
    return data.theme;
  }
};
