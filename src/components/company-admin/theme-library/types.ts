export interface AdminTheme {
  id: string;
  name: string;
  categories: string[];
  primary: string;
  secondary: string;
  accent: string;
  isPremium: boolean;
  downloads: number;
  createdAt?: string;
}

export type PreviewMode = 'mobile' | 'desktop' | 'components';
