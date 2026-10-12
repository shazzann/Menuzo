import type { ThemeConfig } from '@/types';
import type { ShopThemeRow } from '@/types/supabase';
import { isDarkColor } from '@/lib/themeUtils';

export interface ThemeDesignTokens {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  primary: string;
  onPrimary: string;
  border: string;
  success: string;
  error: string;
}

export interface SwatchInfo {
  label: string;
  hex: string;
}

export interface CuratedTheme {
  id: string;
  name: string;
  tagline: string;
  category: 'dark' | 'light';
  isPro: boolean;
  colors: ThemeConfig;
  tokens: ThemeDesignTokens;
  swatches: [SwatchInfo, SwatchInfo, SwatchInfo];
}

export function createThemeTokens(colors: ThemeConfig, isDark: boolean): ThemeDesignTokens {
  return {
    background: colors.primary,
    surface: colors.secondary,
    primary: colors.accent,
    onPrimary: isDark ? '#FFFFFF' : '#111827',
    text: isDark ? '#F9FAFB' : '#111827',
    mutedText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    success: '#10B981',
    error: '#EF4444',
  };
}

export const CURATED_THEMES: CuratedTheme[] = [
  {
    id: 'menuzo-signature',
    name: 'Menuzo Signature',
    tagline: 'Warm, bold, and energetic.',
    category: 'dark',
    isPro: false,
    colors: {
      primary: '#090A0C',
      secondary: '#1C1E22',
      accent: '#FB8500',
    },
    tokens: createThemeTokens({ primary: '#090A0C', secondary: '#1C1E22', accent: '#FB8500' }, true),
    swatches: [
      { label: 'Midnight', hex: '#090A0C' },
      { label: 'Charcoal', hex: '#1C1E22' },
      { label: 'Orange', hex: '#FB8500' },
    ],
  },
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    tagline: 'Timeless sophistication for every table.',
    category: 'dark',
    isPro: false,
    colors: {
      primary: '#1F2937',
      secondary: '#F9FAFB',
      accent: '#D4AF37',
    },
    tokens: createThemeTokens({ primary: '#1F2937', secondary: '#F9FAFB', accent: '#D4AF37' }, true),
    swatches: [
      { label: 'Slate', hex: '#1F2937' },
      { label: 'Pearl', hex: '#F9FAFB' },
      { label: 'Gold', hex: '#D4AF37' },
    ],
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    tagline: 'Fresh, calm, and inviting coastal tones.',
    category: 'light',
    isPro: false,
    colors: {
      primary: '#0F4C5C',
      secondary: '#E8F4F8',
      accent: '#3A9D9B',
    },
    tokens: createThemeTokens({ primary: '#0F4C5C', secondary: '#E8F4F8', accent: '#3A9D9B' }, false),
    swatches: [
      { label: 'Deep Cyan', hex: '#0F4C5C' },
      { label: 'Ice Blue', hex: '#E8F4F8' },
      { label: 'Teal', hex: '#3A9D9B' },
    ],
  },
  {
    id: 'forest-retreat',
    name: 'Forest Retreat',
    tagline: "Natural shades with a refined organic touch.",
    category: 'dark',
    isPro: false,
    colors: {
      primary: '#234E3F',
      secondary: '#F3F1E7',
      accent: '#A3B18A',
    },
    tokens: createThemeTokens({ primary: '#234E3F', secondary: '#F3F1E7', accent: '#A3B18A' }, true),
    swatches: [
      { label: 'Forest', hex: '#234E3F' },
      { label: 'Oatmeal', hex: '#F3F1E7' },
      { label: 'Sage', hex: '#A3B18A' },
    ],
  },
  {
    id: 'urban-minimal',
    name: 'Urban Minimal',
    tagline: 'Clean modern design with crisp contrast.',
    category: 'light',
    isPro: false,
    colors: {
      primary: '#374151',
      secondary: '#FFFFFF',
      accent: '#9CA3AF',
    },
    tokens: createThemeTokens({ primary: '#374151', secondary: '#FFFFFF', accent: '#9CA3AF' }, false),
    swatches: [
      { label: 'Graphite', hex: '#374151' },
      { label: 'White', hex: '#FFFFFF' },
      { label: 'Silver', hex: '#9CA3AF' },
    ],
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    tagline: 'Earthy warmth for welcoming dining.',
    category: 'light',
    isPro: true,
    colors: {
      primary: '#A44A3F',
      secondary: '#FFF3E6',
      accent: '#DDA15E',
    },
    tokens: createThemeTokens({ primary: '#A44A3F', secondary: '#FFF3E6', accent: '#DDA15E' }, false),
    swatches: [
      { label: 'Terracotta', hex: '#A44A3F' },
      { label: 'Cream', hex: '#FFF3E6' },
      { label: 'Amber', hex: '#DDA15E' },
    ],
  },
  {
    id: 'midnight-luxe',
    name: 'Midnight Luxe',
    tagline: 'Bold contrast with premium character.',
    category: 'dark',
    isPro: true,
    colors: {
      primary: '#111827',
      secondary: '#F3F4F6',
      accent: '#C6A667',
    },
    tokens: createThemeTokens({ primary: '#111827', secondary: '#F3F4F6', accent: '#C6A667' }, true),
    swatches: [
      { label: 'Obsidian', hex: '#111827' },
      { label: 'Platinum', hex: '#F3F4F6' },
      { label: 'Warm Gold', hex: '#C6A667' },
    ],
  },
  {
    id: 'golden-harvest',
    name: 'Golden Harvest',
    tagline: 'Warm, welcoming, and full of character.',
    category: 'light',
    isPro: true,
    colors: {
      primary: '#7C4A21',
      secondary: '#FFF8E7',
      accent: '#D9A441',
    },
    tokens: createThemeTokens({ primary: '#7C4A21', secondary: '#FFF8E7', accent: '#D9A441' }, false),
    swatches: [
      { label: 'Roast', hex: '#7C4A21' },
      { label: 'Vanilla', hex: '#FFF8E7' },
      { label: 'Mustard', hex: '#D9A441' },
    ],
  },
  {
    id: 'rosewood-charm',
    name: 'Rosewood Charm',
    tagline: 'Rich tones with a gentle romantic touch.',
    category: 'light',
    isPro: true,
    colors: {
      primary: '#722F37',
      secondary: '#FFF5F2',
      accent: '#C98C8C',
    },
    tokens: createThemeTokens({ primary: '#722F37', secondary: '#FFF5F2', accent: '#C98C8C' }, false),
    swatches: [
      { label: 'Wine', hex: '#722F37' },
      { label: 'Blush', hex: '#FFF5F2' },
      { label: 'Rosewood', hex: '#C98C8C' },
    ],
  },
  {
    id: 'coastal-sand',
    name: 'Coastal Sand',
    tagline: 'Relaxed golden tones inspired by the shore.',
    category: 'light',
    isPro: true,
    colors: {
      primary: '#2D6A73',
      secondary: '#FAF3E8',
      accent: '#D9A441',
    },
    tokens: createThemeTokens({ primary: '#2D6A73', secondary: '#FAF3E8', accent: '#D9A441' }, false),
    swatches: [
      { label: 'Ocean Pine', hex: '#2D6A73' },
      { label: 'Sand', hex: '#FAF3E8' },
      { label: 'Warm Ochre', hex: '#D9A441' },
    ],
  },
  {
    id: 'royal-plum',
    name: 'Royal Plum',
    tagline: 'Distinctive elegance and deep wine contrast.',
    category: 'dark',
    isPro: true,
    colors: {
      primary: '#4A2545',
      secondary: '#FCF7FA',
      accent: '#B784A7',
    },
    tokens: createThemeTokens({ primary: '#4A2545', secondary: '#FCF7FA', accent: '#B784A7' }, true),
    swatches: [
      { label: 'Plum', hex: '#4A2545' },
      { label: 'Silk', hex: '#FCF7FA' },
      { label: 'Lilac', hex: '#B784A7' },
    ],
  },
  {
    id: 'olive-garden',
    name: 'Olive Garden',
    tagline: 'Organic simplicity and culinary natural warmth.',
    category: 'light',
    isPro: true,
    colors: {
      primary: '#556B2F',
      secondary: '#F8F5EB',
      accent: '#C2A878',
    },
    tokens: createThemeTokens({ primary: '#556B2F', secondary: '#F8F5EB', accent: '#C2A878' }, false),
    swatches: [
      { label: 'Olive', hex: '#556B2F' },
      { label: 'Parchment', hex: '#F8F5EB' },
      { label: 'Khaki', hex: '#C2A878' },
    ],
  },
  {
    id: 'crimson-table',
    name: 'Crimson Table',
    tagline: 'Rich, expressive, and appetite-enticing.',
    category: 'light',
    isPro: true,
    colors: {
      primary: '#8B2635',
      secondary: '#FFF8F0',
      accent: '#D9A05B',
    },
    tokens: createThemeTokens({ primary: '#8B2635', secondary: '#FFF8F0', accent: '#D9A05B' }, false),
    swatches: [
      { label: 'Crimson', hex: '#8B2635' },
      { label: 'Linen', hex: '#FFF8F0' },
      { label: 'Saffron', hex: '#D9A05B' },
    ],
  },
];

// Themes come from the shop_themes table managed in the company Theme Library;
// CURATED_THEMES above is the built-in fallback when it cannot be loaded.
export function curatedThemeFromRow(row: ShopThemeRow): CuratedTheme {
  const colors = { primary: row.primary_color, secondary: row.secondary_color, accent: row.accent_color };
  const isDark = isDarkColor(colors.primary);
  return {
    id: row.slug,
    name: row.name,
    tagline: row.tagline,
    category: isDark ? 'dark' : 'light',
    isPro: row.is_premium,
    colors,
    tokens: createThemeTokens(colors, isDark),
    swatches: [
      { label: 'Background', hex: colors.primary },
      { label: 'Cards', hex: colors.secondary },
      { label: 'Accent', hex: colors.accent },
    ],
  };
}
