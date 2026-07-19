import type { TypographyScale } from './types';

export const typographyScale: TypographyScale[] = [
  { level: 'Display', family: 'Space Grotesk', size: '48px / 3rem', weight: 700, lineHeight: '1.1', letterSpacing: '-0.02em', usage: 'Hero headlines, brand moments' },
  { level: 'H1', family: 'Space Grotesk', size: '36px / 2.25rem', weight: 700, lineHeight: '1.2', letterSpacing: '-0.015em', usage: 'Page titles' },
  { level: 'H2', family: 'Space Grotesk', size: '28px / 1.75rem', weight: 600, lineHeight: '1.3', letterSpacing: '-0.01em', usage: 'Section headers' },
  { level: 'H3', family: 'Space Grotesk', size: '22px / 1.375rem', weight: 600, lineHeight: '1.4', letterSpacing: '-0.01em', usage: 'Subsection headers' },
  { level: 'H4', family: 'Space Grotesk', size: '18px / 1.125rem', weight: 600, lineHeight: '1.4', letterSpacing: 'normal', usage: 'Card titles' },
  { level: 'Body', family: 'Inter', size: '16px / 1rem', weight: 400, lineHeight: '1.6', letterSpacing: 'normal', usage: 'Default body text' },
  { level: 'Body SM', family: 'Inter', size: '14px / 0.875rem', weight: 400, lineHeight: '1.5', letterSpacing: 'normal', usage: 'Secondary text, descriptions' },
  { level: 'Caption', family: 'Inter', size: '12px / 0.75rem', weight: 500, lineHeight: '1.5', letterSpacing: '0.02em', usage: 'Captions, labels, metadata' },
  { level: 'Code', family: 'IBM Plex Mono', size: '14px / 0.875rem', weight: 400, lineHeight: '1.6', letterSpacing: 'normal', usage: 'Code snippets, tokens' },
];
