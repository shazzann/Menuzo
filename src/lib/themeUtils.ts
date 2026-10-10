import type { ThemeConfig } from '@/types';

export const BRAND_THEME: ThemeConfig = { primary: '#090A0C', secondary: '#1C1E22', accent: '#FB8500' };
export const SHOP_THEME_PRESETS = [
  { name: 'Menuzo Brand', description: 'Warm and energetic', colors: BRAND_THEME },
  { name: 'Ocean Blue', description: 'Calm and professional', colors: { primary: '#F0F9FF', secondary: '#E0F2FE', accent: '#0EA5E9' } },
  { name: 'Forest Green', description: 'Fresh and natural', colors: { primary: '#16A34A', secondary: '#F0FDF4', accent: '#4ADE80' } },
  { name: 'Luxury Gold', description: 'Premium and exclusive', colors: { primary: '#CA8A04', secondary: '#FEFCE8', accent: '#FACC15' } },
  { name: 'Cherry Red', description: 'Bold and appetizing', colors: { primary: '#E11D48', secondary: '#FFF1F2', accent: '#FB7185' } },
];

export function isValidThemeColor(value: string): boolean {
  return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value);
}

// Shops created before the signup default was fixed got orange as the page
// background and the accent, which leaves text and buttons unreadable.
const LEGACY_SIGNUP_THEME: ThemeConfig = { primary: '#F97316', secondary: '#1C1917', accent: '#F97316' };

function isLegacySignupTheme(theme?: ThemeConfig): boolean {
  return !!theme && Object.entries(LEGACY_SIGNUP_THEME).every(([key, value]) =>
    String(theme[key as keyof ThemeConfig]).toUpperCase() === value);
}

export function normalizeShopTheme(theme?: ThemeConfig): ThemeConfig {
  if (isLegacySignupTheme(theme)) return { ...BRAND_THEME };
  return Object.fromEntries(Object.entries(BRAND_THEME).map(([key, fallback]) => {
    const value = theme?.[key as keyof ThemeConfig];
    return [key, typeof value === 'string' && isValidThemeColor(value) ? value : fallback];
  })) as unknown as ThemeConfig;
}

export function isBrandTheme(theme?: ThemeConfig): boolean {
  const t = normalizeShopTheme(theme);
  return Object.entries(BRAND_THEME).every(([key, value]) => t[key as keyof ThemeConfig].toUpperCase() === value);
}

function rgb(hex: string): number[] {
  let value = hex.replace('#', '');
  if (value.length === 3) value = [...value].map(c => c + c).join('');
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16));
}

export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = rgb(hex).map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return r * 0.2126 + g * 0.7152 + b * 0.0722;
  };
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function readableForeground(background: string): string {
  return contrastRatio('#000000', background) >= contrastRatio('#ffffff', background) ? '#000000' : '#ffffff';
}

function blend(from: string, to: string, amount: number): string {
  const end = rgb(to);
  return '#' + rgb(from).map((v, i) => Math.round(v + (end[i] - v) * amount).toString(16).padStart(2, '0')).join('');
}

// Preserve the chosen hue, adjusting only colours used as text on a surface.
export function readableColor(color: string, background: string, minimum = 5.5): string {
  const target = readableForeground(background);
  for (let step = 0; step <= 100; step++) {
    const candidate = blend(color, target, step / 100);
    if (contrastRatio(candidate, background) >= minimum) return candidate;
  }
  return target;
}

export function getShopQrColors(primary: string, accent: string) {
  const theme = normalizeShopTheme({ primary, secondary: BRAND_THEME.secondary, accent });
  if (isBrandTheme(theme)) return { bgColor: theme.primary, fgColor: theme.accent };
  // Coloured QR codes need dark modules on a sufficiently light background.
  const bgColor = contrastRatio('#000000', theme.primary) >= 7 ? theme.primary : '#ffffff';
  return { bgColor, fgColor: readableColor(theme.accent, bgColor, 7) };
}

export function hexToHsl(hex: string): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (!/^[\da-f]{6}$/i.test(cleanHex)) return '0 0% 100%';

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function isDarkColor(hex: string): boolean {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return false;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
}

export function getShopThemeStyles(theme?: ThemeConfig): React.CSSProperties {
  const t = normalizeShopTheme(theme);

  const bgHsl = hexToHsl(t.primary);
  const cardHsl = hexToHsl(t.secondary);
  const accentHsl = hexToHsl(t.accent);

  const isDarkBg = isDarkColor(t.primary);
  const isDarkCard = isDarkColor(t.secondary);
  const isDarkAccent = isDarkColor(t.accent);

  const lightText = '210 20% 98%';
  const darkText = '222.2 84% 4.9%';

  const fgHsl = isDarkBg ? lightText : darkText;
  const cardFgHsl = isDarkCard ? lightText : darkText;
  const mutedFgHsl = isDarkCard ? '215 14% 68%' : '215.4 16.3% 46.9%';
  const borderHsl = isDarkCard ? '220 10% 20%' : '214.3 31.8% 88%';
  const accentFgHsl = isDarkAccent ? lightText : darkText;

  const styles: Record<string, string> = {
    '--background': bgHsl,
    '--foreground': fgHsl,
    '--popover': bgHsl,
    '--popover-foreground': fgHsl,
    '--card': cardHsl,
    '--card-foreground': cardFgHsl,
    '--secondary': cardHsl,
    '--secondary-foreground': cardFgHsl,
    '--muted': cardHsl,
    '--muted-foreground': mutedFgHsl,
    '--primary': accentHsl,
    '--primary-foreground': accentFgHsl,
    '--accent': accentHsl,
    '--accent-foreground': accentFgHsl,
    '--ring': accentHsl,
    '--border': borderHsl,
    '--input': borderHsl,
  };

  // Keep every original Brand token intact. Other palettes may mix dark page
  // backgrounds and light cards, so each surface needs its own text colours.
  const brand = isBrandTheme(t);
  for (const [surface, background] of [['page', t.primary], ['surface', t.secondary]]) {
    const fg = readableForeground(background);
    styles[`--shop-${surface}-foreground`] = brand ? fgHsl : hexToHsl(fg);
    styles[`--shop-${surface}-muted`] = brand ? mutedFgHsl : hexToHsl(readableColor(blend(background, fg, 0.55), background));
    styles[`--shop-${surface}-primary-text`] = brand ? accentHsl : hexToHsl(readableColor(t.accent, background));
    styles[`--shop-${surface}-border`] = brand ? borderHsl : hexToHsl(blend(background, fg, 0.22));
  }
  if (!brand) {
    styles['--shop-map-pin'] = `hsl(${styles['--shop-page-primary-text']})`;
    styles['--foreground'] = styles['--shop-page-foreground'];
    styles['--popover-foreground'] = styles['--foreground'];
    styles['--card-foreground'] = styles['--shop-surface-foreground'];
    styles['--secondary-foreground'] = styles['--card-foreground'];
    styles['--muted-foreground'] = styles['--shop-page-muted'];
    styles['--border'] = styles['--shop-page-border'];
    styles['--input'] = styles['--border'];
    styles['--primary-foreground'] = hexToHsl(readableForeground(t.accent));
    styles['--accent-foreground'] = styles['--primary-foreground'];
  }
  styles['--shop-map-pin'] ??= '#F97316';
  styles['--shop-primary-text'] = styles['--shop-page-primary-text'];
  styles['--shop-card-shadow'] = brand ? '0 18px 50px rgba(0, 0, 0, 0.45)' : '0 8px 24px rgba(0, 0, 0, 0.10)';
  styles['--shop-card-border'] = brand ? 'rgba(245, 247, 250, 0.08)' : `hsl(${styles['--shop-surface-border']})`;
  return styles as React.CSSProperties;
}
