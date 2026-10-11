import { useState } from 'react';
import { X, Smartphone, Monitor, LayoutGrid, Edit3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminTheme, PreviewMode } from './types';
import { SharedThemePreview } from './SharedThemePreview';

interface ThemeFullPreviewModalProps {
  theme: AdminTheme | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (theme: AdminTheme) => void;
}

export function ThemeFullPreviewModal({
  theme,
  isOpen,
  onClose,
  onEdit,
}: ThemeFullPreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('mobile');

  if (!isOpen || !theme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-5xl rounded-3xl shadow-2xl border border-border/70 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">{theme.name}</h2>
              {theme.isPremium ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" /> PRO
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                  Free
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Categories: {theme.categories.join(', ')}
            </p>
          </div>

          {/* Mode Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border/60">
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  previewMode === 'mobile'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  previewMode === 'desktop'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('components')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  previewMode === 'components'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Components
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-muted/15 flex items-start justify-center min-h-[460px]">
          <SharedThemePreview theme={theme} mode={previewMode} />
        </div>

        {/* Footer with Swatches & Edit Button */}
        <div className="p-4 px-6 border-t border-border/60 flex items-center justify-between bg-card">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-muted-foreground">Primary:</span>
              <span className="text-foreground uppercase">{theme.primary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                style={{ backgroundColor: theme.secondary }}
              />
              <span className="text-muted-foreground">Secondary:</span>
              <span className="text-foreground uppercase">{theme.secondary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                style={{ backgroundColor: theme.accent }}
              />
              <span className="text-muted-foreground">Accent:</span>
              <span className="text-foreground uppercase">{theme.accent}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => {
                onClose();
                onEdit(theme);
              }}
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground font-semibold border-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Theme
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
