import { Check, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CuratedTheme } from './curatedThemes';
import { ThemeColorSwatches } from './ThemeColorSwatches';

interface ThemeCardProps {
  theme: CuratedTheme;
  isSelected: boolean;
  isApplied?: boolean;
  onSelect: (theme: CuratedTheme) => void;
  disabled?: boolean;
  /** Pro theme on a shop without an active paid plan: can be previewed, not applied. */
  locked?: boolean;
}

export function ThemeCard({ 
  theme, 
  isSelected, 
  isApplied = false, 
  onSelect, 
  disabled = false,
  locked = false,
}: ThemeCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`${theme.name} theme: ${theme.tagline}${isApplied ? ' (Currently Applied)' : ''}${locked ? ' (Pro, preview only)' : ''}`}
      disabled={disabled}
      onClick={() => onSelect(theme)}
      className={cn(
        'group relative flex flex-col justify-between w-full min-h-[225px] sm:min-h-[245px] text-left rounded-[18px] border p-3.5 sm:p-4 transition-all duration-200 cursor-pointer outline-hidden',
        'bg-[#121316] text-card-foreground shadow-xs',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isSelected
          ? 'border-primary ring-1 ring-primary/40 shadow-xs'
          : 'border-neutral-800/80 hover:border-neutral-700 hover:bg-[#16171b]',
        disabled && 'opacity-60 cursor-not-allowed pointer-events-none'
      )}
    >
      {/* Top Header: Title, Tagline & Top-right Indicator */}
      <div className="flex items-start justify-between gap-2 w-full mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-semibold text-sm sm:text-[15px] text-white tracking-tight leading-snug truncate group-hover:text-primary transition-colors">
              {theme.name}
            </h4>
            {theme.isPro ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 tracking-wide uppercase">
                {locked ? <Lock className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />} PRO
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-neutral-800/90 text-neutral-400 border border-neutral-700/60">
                Free
              </span>
            )}
            {isApplied && !isSelected && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9.5px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Applied
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 line-clamp-1 leading-normal">
            {theme.tagline}
          </p>
        </div>

        {/* Subtle Selection Indicator: Small orange checkmark */}
        <div className="flex-shrink-0 pt-0.5 ml-1">
          {isSelected ? (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground shadow-xs animate-in zoom-in-90 duration-150">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          ) : (
            <span 
              className="w-4 h-4 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-neutral-600 transition-colors"
              aria-hidden="true"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-neutral-600/50 transition-colors" />
            </span>
          )}
        </div>
      </div>

      {/* Middle: COLOR PALETTE Header + Three Swatches */}
      <div className="w-full my-auto py-1">
        <span className="text-[9.5px] sm:text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
          Color Palette
        </span>
        <ThemeColorSwatches colors={theme.colors} swatches={theme.swatches} />
      </div>

      {/* Bottom Footer: Tier & Active status */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-500 pt-2.5 border-t border-neutral-800/60 w-full mt-2">
        <span className={cn(locked && 'text-amber-400/90')}>
          {locked ? 'Preview only · Upgrade to apply' : theme.isPro ? 'Pro Edition' : 'Free Theme'}
        </span>
        {isApplied && isSelected && (
          <span className="text-emerald-400 font-medium text-[10px]">Applied</span>
        )}
      </div>
    </button>
  );
}
