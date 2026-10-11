import { Check, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ThemeConfig } from '@/types';
import { CURATED_THEMES } from './curatedThemes';

interface ThemeActionBarProps {
  selectedTheme: ThemeConfig;
  appliedTheme: ThemeConfig;
  isSaving: boolean;
  onApply: () => void;
  onReset: () => void;
}

export function ThemeActionBar({
  selectedTheme,
  appliedTheme,
  isSaving,
  onApply,
  onReset,
}: ThemeActionBarProps) {
  const isMatchingTheme = (a: ThemeConfig, b: ThemeConfig) => {
    return (
      a.primary.toLowerCase() === b.primary.toLowerCase() &&
      a.secondary.toLowerCase() === b.secondary.toLowerCase() &&
      a.accent.toLowerCase() === b.accent.toLowerCase()
    );
  };

  const hasUnsavedChanges = !isMatchingTheme(selectedTheme, appliedTheme);
  const activeCuratedTheme = CURATED_THEMES.find((t) => isMatchingTheme(t.colors, selectedTheme));
  const selectedThemeName = activeCuratedTheme?.name || 'Custom Theme';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: Selected theme name, color accent & status indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-4 h-4 rounded-full border border-black/20 shadow-xs flex-shrink-0"
            style={{ backgroundColor: selectedTheme.accent }}
            title={`Accent: ${selectedTheme.accent}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[130px] sm:max-w-[200px]">
                {selectedThemeName}
              </span>
              {activeCuratedTheme && (
                activeCuratedTheme.isPro ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                    PRO
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-neutral-800/90 text-neutral-400 border border-neutral-700/60">
                    Free
                  </span>
                )
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.2">
              {hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  Active theme
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Reset and Apply buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isSaving}
              className="h-8 sm:h-9 text-xs px-2.5 sm:px-3 text-muted-foreground hover:text-foreground border-border/80"
              title="Reset to currently saved theme"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={onApply}
            disabled={!hasUnsavedChanges || isSaving}
            className="h-8 sm:h-9 text-xs px-3 sm:px-4 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs disabled:opacity-50 border-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Applying...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Theme</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Applied</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
