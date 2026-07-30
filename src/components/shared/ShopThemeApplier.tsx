import { useEffect } from 'react';
import { useApp } from '@/store';
import type { ThemeConfig } from '@/types';

const SHOP_VIEWS: string[] = [
  'user-dashboard',
  'customer-menu',
  'customer-food-detail',
  'customer-shop-detail',
  'admin-preview',
  'admin-add-food',
  'admin-add-food-detail',
  'admin-analytics',
  'admin-settings',
  'admin-shop-details',
  'admin-theme',
  'admin-qr',
  'admin-security',
  'admin-food-detail',
];

const CUSTOM_PROPS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--border',
  '--input',
  '--ring',
];

function hexToHsl(hex: string): string {
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

function isDarkColor(hex: string): boolean {
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

export function ShopThemeApplier() {
  const { state } = useApp();
  const { currentView, shop } = state;

  useEffect(() => {
    const root = document.documentElement;

    if (!SHOP_VIEWS.includes(currentView)) {
      // Clean up custom theme overrides so landing page light/dark mode applies
      CUSTOM_PROPS.forEach((prop) => root.style.removeProperty(prop));

      // Restore saved platform theme from localStorage if present
      const savedTheme = localStorage.getItem('vite-ui-theme') || 'dark';
      root.classList.remove('light', 'dark');
      if (savedTheme === 'system') {
        const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(sys);
      } else {
        root.classList.add(savedTheme);
      }
      return;
    }

    // We are in a shop / admin view: apply shop.theme (60-30-10 rule)
    const theme: ThemeConfig = shop?.theme || {
      primary: '#090A0C',
      secondary: '#1C1E22',
      accent: '#FB8500',
    };

    const bgHsl = hexToHsl(theme.primary || '#090A0C');
    const cardHsl = hexToHsl(theme.secondary || '#1C1E22');
    const accentHsl = hexToHsl(theme.accent || '#FB8500');

    const isDarkBg = isDarkColor(theme.primary || '#090A0C');
    const isDarkCard = isDarkColor(theme.secondary || '#1C1E22');
    const isDarkAccent = isDarkColor(theme.accent || '#FB8500');

    const lightText = '210 20% 98%';
    const darkText = '222.2 84% 4.9%';

    const fgHsl = isDarkBg ? lightText : darkText;
    const cardFgHsl = isDarkCard ? lightText : darkText;
    const mutedFgHsl = isDarkCard ? '215 14% 68%' : '215.4 16.3% 46.9%';
    const borderHsl = isDarkCard ? '220 10% 20%' : '214.3 31.8% 88%';
    const accentFgHsl = isDarkAccent ? lightText : darkText;

    // Apply dark/light class matching the shop primary background for Tailwind dark: modifiers
    root.classList.remove('light', 'dark');
    root.classList.add(isDarkBg ? 'dark' : 'light');

    // Override CSS variables
    root.style.setProperty('--background', bgHsl);
    root.style.setProperty('--foreground', fgHsl);
    root.style.setProperty('--popover', bgHsl);
    root.style.setProperty('--popover-foreground', fgHsl);
    root.style.setProperty('--card', cardHsl);
    root.style.setProperty('--card-foreground', cardFgHsl);
    root.style.setProperty('--secondary', cardHsl);
    root.style.setProperty('--secondary-foreground', cardFgHsl);
    root.style.setProperty('--muted', cardHsl);
    root.style.setProperty('--muted-foreground', mutedFgHsl);
    root.style.setProperty('--primary', accentHsl);
    root.style.setProperty('--primary-foreground', accentFgHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--accent-foreground', accentFgHsl);
    root.style.setProperty('--ring', accentHsl);
    root.style.setProperty('--border', borderHsl);
    root.style.setProperty('--input', borderHsl);
  }, [currentView, shop?.theme]);

  return null;
}
