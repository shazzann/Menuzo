import { Palette, Sparkles, Gift, Tag } from 'lucide-react';
import type { AdminTheme } from './types';

interface ThemeStatisticsProps {
  themes: AdminTheme[];
}

export function ThemeStatistics({ themes }: ThemeStatisticsProps) {
  const totalThemes = themes.length;
  const premiumThemes = themes.filter((t) => t.isPremium).length;
  const freeThemes = totalThemes - premiumThemes;

  const uniqueCategories = new Set<string>();
  themes.forEach((t) => {
    t.categories?.forEach((c) => uniqueCategories.add(c));
  });
  const totalCategories = uniqueCategories.size;

  const stats = [
    {
      label: 'Total Themes',
      value: totalThemes,
      icon: Palette,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Free Themes',
      value: freeThemes,
      icon: Gift,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: 'Premium Themes',
      value: premiumThemes,
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Categories',
      value: totalCategories,
      icon: Tag,
      color: 'text-blue-500 bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="p-3.5 sm:p-4 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xs flex items-center gap-3 shadow-xs"
          >
            <div className={`p-2.5 rounded-xl ${stat.color} flex-shrink-0`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">
                {stat.label}
              </p>
              <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
