import type { ThemeConfig } from '@/types';
import { 
  ThemeLivePreview, 
  ThemeCollection, 
  type CuratedTheme 
} from './theme';
import { useCuratedThemes } from './theme/useCuratedThemes';

interface AdminThemeSettingsProps {
  theme: ThemeConfig;
  appliedTheme?: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
  shopName: string;
  /** Without an active paid plan, Pro themes show as locked (preview only). */
  proActive?: boolean;
}

export function AdminThemeSettings({ 
  theme, 
  appliedTheme = theme,
  onChange, 
  shopName,
  proActive = true,
}: AdminThemeSettingsProps) {
  const themes = useCuratedThemes();
  const isMatchingTheme = (themeColors: ThemeConfig) => {
    return (
      themeColors.primary.toLowerCase() === theme.primary.toLowerCase() &&
      themeColors.secondary.toLowerCase() === theme.secondary.toLowerCase() &&
      themeColors.accent.toLowerCase() === theme.accent.toLowerCase()
    );
  };

  const activeTheme = themes.find((t) => isMatchingTheme(t.colors));

  const handleSelectCuratedTheme = (selected: CuratedTheme) => {
    onChange(selected.colors);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* 1. Preserved Live Theme Preview with Show/Hide toggle */}
      <ThemeLivePreview 
        theme={theme} 
        shopName={shopName} 
        activeThemeName={activeTheme?.name} 
      />

      {/* 2. Curated Theme Collection with Search & Category Filters */}
      <ThemeCollection
        currentTheme={theme}
        appliedTheme={appliedTheme}
        onSelectTheme={handleSelectCuratedTheme}
        proActive={proActive}
      />
    </div>
  );
}
