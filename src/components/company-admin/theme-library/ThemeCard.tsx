import { useState } from 'react';
import { Eye, Edit3, Trash2, Copy, MoreVertical, Sparkles, Store } from 'lucide-react';
import type { AdminTheme } from './types';
import { SharedThemePreview } from './SharedThemePreview';

interface ThemeCardProps {
  theme: AdminTheme;
  onPreview: (theme: AdminTheme) => void;
  onEdit: (theme: AdminTheme) => void;
  onDelete: (id: string) => void;
  onDuplicate: (theme: AdminTheme) => void;
}

export function ThemeCard({
  theme,
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
}: ThemeCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="group bg-card border border-border/70 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 flex flex-col h-full relative">
      {/* Miniature Theme Preview (Header) */}
      <div className="relative">
        <SharedThemePreview theme={theme} mode="mini" />

        {/* Floating Badges */}
        <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5">
          {theme.isPremium ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-bold border border-amber-500/30 shadow-xs uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" /> PRO
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-semibold border border-white/10 shadow-xs">
              Free
            </span>
          )}

          {/* Quick options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 rounded-lg bg-black/50 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/70 transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-7 w-32 rounded-xl bg-card border border-border shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      onDuplicate(theme);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      onDelete(theme.id);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        {/* Title & Category Tags */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight truncate">
              {theme.name}
            </h3>
            {theme.downloads > 0 && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-shrink-0" title="Shops using this theme">
                <Store className="w-2.5 h-2.5" />
                {theme.downloads.toLocaleString()} {theme.downloads === 1 ? 'shop' : 'shops'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {theme.categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-medium text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* 3 Color Swatches */}
        <div className="pt-2 border-t border-border/40 grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="flex flex-col items-center p-1.5 rounded-lg bg-muted/30 border border-border/30">
            <div
              className="w-4 h-4 rounded-full border border-black/20 shadow-2xs mb-1"
              style={{ backgroundColor: theme.primary }}
            />
            <span className="font-mono text-[9px] uppercase text-muted-foreground truncate w-full text-center">
              {theme.primary}
            </span>
          </div>

          <div className="flex flex-col items-center p-1.5 rounded-lg bg-muted/30 border border-border/30">
            <div
              className="w-4 h-4 rounded-full border border-black/20 shadow-2xs mb-1"
              style={{ backgroundColor: theme.secondary }}
            />
            <span className="font-mono text-[9px] uppercase text-muted-foreground truncate w-full text-center">
              {theme.secondary}
            </span>
          </div>

          <div className="flex flex-col items-center p-1.5 rounded-lg bg-muted/30 border border-border/30">
            <div
              className="w-4 h-4 rounded-full border border-black/20 shadow-2xs mb-1"
              style={{ backgroundColor: theme.accent }}
            />
            <span className="font-mono text-[9px] uppercase text-muted-foreground truncate w-full text-center">
              {theme.accent}
            </span>
          </div>
        </div>

        {/* Actions (Preview & Edit) */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={() => onPreview(theme)}
            className="flex-1 py-1.5 px-2.5 rounded-xl border border-border/70 hover:bg-muted/50 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onEdit(theme)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-xs font-semibold text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
