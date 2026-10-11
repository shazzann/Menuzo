import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/types';
import type { SwatchInfo } from './curatedThemes';

interface ThemeColorSwatchesProps {
  colors: ThemeConfig;
  swatches?: [SwatchInfo, SwatchInfo, SwatchInfo];
  className?: string;
}

export function ThemeColorSwatches({ colors, swatches, className }: ThemeColorSwatchesProps) {
  const displaySwatches: [SwatchInfo, SwatchInfo, SwatchInfo] = swatches ?? [
    { label: 'Primary', hex: colors.primary },
    { label: 'Surface', hex: colors.secondary },
    { label: 'Accent', hex: colors.accent },
  ];

  return (
    <div className={cn('grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full', className)}>
      {displaySwatches.map((swatch, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-md border border-neutral-800/90 overflow-hidden bg-[#181a1f] shadow-2xs group-hover:border-neutral-700/80 transition-colors"
        >
          {/* Upper Color Block (~32-40px high) */}
          <div
            className="h-8 sm:h-10 w-full relative border-b border-black/15 shadow-inner"
            style={{ backgroundColor: swatch.hex }}
            title={`${swatch.label}: ${swatch.hex}`}
          />

          {/* Lower Text Info (~22-26px high) */}
          <div className="py-1 sm:py-1.5 px-1 sm:px-2 bg-[#181a1f] flex flex-col items-center justify-center text-center min-w-0">
            <span className="text-[9.5px] sm:text-[11px] font-medium text-neutral-200 truncate w-full text-center leading-tight">
              {swatch.label}
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] font-mono text-neutral-400 uppercase tracking-tight truncate w-full text-center mt-0.5 leading-none">
              {swatch.hex}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
