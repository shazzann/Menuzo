import type { LogoVariant } from './types';

export const logos: LogoVariant[] = [
  { name: 'Primary Logo', placeholderType: 'logo', imagePath: '/logo/Logo main4tight.png', description: 'Used on light backgrounds.' },
  { name: 'Dark Version', placeholderType: 'logo', imagePath: '/logo/Logo main4dark.png', description: 'Used on dark backgrounds.' },
  { name: 'Secondary Logo', placeholderType: 'logo', description: 'Horizontal layout without tagline.' },
  { name: 'Icon', placeholderType: 'logo', description: 'Just the brand mark.' },
  { name: 'Favicon', placeholderType: 'logo', imagePath: '/logo/Logo favicon.png', description: 'For browser tabs.' },
  { name: 'Monochrome', placeholderType: 'logo', description: 'For single-color printing.' },
  { name: 'Light Version', placeholderType: 'logo', description: 'All white for dark image overlays.' },
];

export const logoGuidelines = [
  { title: 'Minimum Size', placeholderType: 'logo', description: 'No smaller than 24px tall.' },
  { title: 'Clear Space', placeholderType: 'logo', description: 'Keep at least the height of the icon clear around the logo.' },
  { title: 'Incorrect Usage', placeholderType: 'logo', description: 'Do not stretch, rotate, or recolor.' },
];
