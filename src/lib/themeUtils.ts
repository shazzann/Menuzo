import type { ThemeConfig } from '@/types';

export function hexToHsl(hex: string): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return '0 0% 100%';

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
  const t = theme || {
    primary: '#090A0C',
    secondary: '#1C1E22',
    accent: '#FB8500',
  };

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

  return {
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
  } as React.CSSProperties;
}
