import type { ColorToken } from './types';

export const brandColors: ColorToken[] = [
  { name: 'Primary (Orange)', token: 'primary', hex: '#F97316', rgb: '249, 115, 22', hsl: '31.8, 100%, 49.2%', cssVariable: '--primary', tailwindClass: 'bg-primary text-primary border-primary', figmaVariable: 'brand/primary', usage: 'Primary buttons, links, focus rings, brand accents', contrastInformation: 'White text (WCAG AAA)' },
  { name: 'Background (Light)', token: 'background', hex: '#FFFFFF', rgb: '255, 255, 255', hsl: '0, 0%, 100%', cssVariable: '--background', tailwindClass: 'bg-background text-background border-background', figmaVariable: 'theme/light/background', usage: 'Page background in light mode', contrastInformation: 'Black text (WCAG AAA)' },
  { name: 'Background (Dark)', token: 'background-dark', hex: '#0A0B0D', rgb: '10, 11, 13', hsl: '220, 14%, 4%', cssVariable: '--background', tailwindClass: 'bg-background text-background border-background', figmaVariable: 'theme/dark/background', usage: 'Page background in dark mode', contrastInformation: 'White text (WCAG AAA)' },
  { name: 'Card Surface (Light)', token: 'card', hex: '#FFFFFF', rgb: '255, 255, 255', hsl: '0, 0%, 100%', cssVariable: '--card', tailwindClass: 'bg-card text-card border-card', figmaVariable: 'theme/light/card', usage: 'Card & panel surfaces in light mode', contrastInformation: 'Black text (WCAG AAA)' },
  { name: 'Card Surface (Dark)', token: 'card-dark', hex: '#141618', rgb: '20, 22, 24', hsl: '220, 12%, 8%', cssVariable: '--card', tailwindClass: 'bg-card text-card border-card', figmaVariable: 'theme/dark/card', usage: 'Card & panel surfaces in dark mode', contrastInformation: 'White text (WCAG AAA)' },
  { name: 'Foreground (Light)', token: 'foreground', hex: '#0F172A', rgb: '15, 23, 42', hsl: '222.2, 84%, 4.9%', cssVariable: '--foreground', tailwindClass: 'bg-foreground text-foreground border-foreground', figmaVariable: 'theme/light/foreground', usage: 'Primary text in light mode', contrastInformation: 'White background (WCAG AAA)' },
  { name: 'Foreground (Dark)', token: 'foreground-dark', hex: '#F5F7FA', rgb: '245, 247, 250', hsl: '210, 20%, 97%', cssVariable: '--foreground', tailwindClass: 'bg-foreground text-foreground border-foreground', figmaVariable: 'theme/dark/foreground', usage: 'Primary text in dark mode', contrastInformation: 'Dark background (WCAG AAA)' },
  { name: 'Muted', token: 'muted', hex: '#94A3B8', rgb: '148, 163, 184', hsl: '215.4, 16.3%, 46.9%', cssVariable: '--muted-foreground', tailwindClass: 'text-muted-foreground', figmaVariable: 'theme/muted', usage: 'Secondary text, captions, metadata', contrastInformation: 'White/Dark backgrounds (WCAG AA)' },
  { name: 'Border (Light)', token: 'border', hex: '#E2E8F0', rgb: '226, 232, 240', hsl: '214.3, 31.8%, 91.4%', cssVariable: '--border', tailwindClass: 'border-border', figmaVariable: 'theme/light/border', usage: 'Borders & dividers', contrastInformation: 'N/A' },
  { name: 'Destructive', token: 'destructive', hex: '#EF4444', rgb: '239, 68, 68', hsl: '0, 84.2%, 60.2%', cssVariable: '--destructive', tailwindClass: 'text-destructive bg-destructive', figmaVariable: 'semantic/destructive', usage: 'Errors, destructive actions', contrastInformation: 'White text (WCAG AA)' },
  { name: 'Success', token: 'success', hex: '#22C55E', rgb: '34, 197, 94', hsl: '142, 71%, 45%', cssVariable: '--success', tailwindClass: 'text-success', figmaVariable: 'semantic/success', usage: 'Success states, confirmations', contrastInformation: 'White text (WCAG AA)' },
  { name: 'Warning', token: 'warning', hex: '#F59E0B', rgb: '245, 158, 11', hsl: '38, 92%, 50%', cssVariable: '--warning', tailwindClass: 'text-warning', figmaVariable: 'semantic/warning', usage: 'Warnings, attention states', contrastInformation: 'Black text (WCAG AA)' },
];

export const cssVariablesLight = `:root {
  --menuzo-primary: #F97316;
  --menuzo-background: #FFFFFF;
  --menuzo-foreground: #0F172A;
  --menuzo-card: #FFFFFF;
  --menuzo-muted: #94A3B8;
  --menuzo-border: #E2E8F0;
  --menuzo-destructive: #EF4444;
  --menuzo-success: #22C55E;
  --menuzo-warning: #F59E0B;
  --menuzo-radius: 1.125rem;
}`;

export const cssVariablesDark = `.dark {
  --menuzo-primary: #F97316;
  --menuzo-background: #0A0B0D;
  --menuzo-foreground: #F5F7FA;
  --menuzo-card: #141618;
  --menuzo-muted: #94A3B8;
  --menuzo-border: #1E2124;
  --menuzo-destructive: #EF4444;
  --menuzo-success: #22C55E;
  --menuzo-warning: #F59E0B;
  --menuzo-radius: 1.125rem;
}`;

export const tailwindTokens = `// tailwind.config.js — Menuzo tokens
colors: {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
}`;
