export interface AdminTheme {
  id: string;
  name: string;
  tagline?: string;
  categories: string[];
  primary: string;
  secondary: string;
  accent: string;
  isPremium: boolean;
  /** Shops currently using this theme's colours. */
  downloads: number;
  createdAt?: string;
}

export type PreviewMode = 'mobile' | 'desktop' | 'components';
