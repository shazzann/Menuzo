import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/types';
import { toast } from 'sonner';

interface AdminThemeSettingsProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
  isEditing: boolean;
  shopName: string;
}

const PRESETS = [
  { name: 'Menuzo Brand', description: 'Warm and energetic', colors: { primary: '#090A0C', secondary: '#1C1E22', accent: '#FB8500' } },
  { name: 'Ocean Blue', description: 'Calm and professional', colors: { primary: '#F0F9FF', secondary: '#E0F2FE', accent: '#0EA5E9' } },
  { name: 'Forest Green', description: 'Fresh and natural', colors: { primary: '#16A34A', secondary: '#F0FDF4', accent: '#4ADE80' } },
  { name: 'Luxury Gold', description: 'Premium and exclusive', colors: { primary: '#CA8A04', secondary: '#FEFCE8', accent: '#FACC15' } },
  { name: 'Cherry Red', description: 'Bold and appetizing', colors: { primary: '#E11D48', secondary: '#FFF1F2', accent: '#FB7185' } },
];

export function AdminThemeSettings({ theme, onChange, isEditing, shopName }: AdminThemeSettingsProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [recentColors] = useState<string[]>(['#090A0C', '#1C1E22', '#FB8500', '#F0F9FF', '#E0F2FE', '#0EA5E9']);

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    onChange({ ...theme, [key]: value });
  };


  const copyToClipboard = async (hex: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(hex);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = hex;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedHex(hex);
      toast.success(`Copied ${hex} to clipboard!`);
      setTimeout(() => setCopiedHex(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      toast.error('Failed to copy color');
    }
  };

  const getContrastColor = (hexcolor: string) => {
    // If a short hex is provided, expand it
    let hex = hexcolor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return '#ffffff';
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  const getLuminance = (hex: string) => {
    let hexClean = hex.replace('#', '');
    if (hexClean.length === 3) hexClean = hexClean.split('').map(c => c + c).join('');
    if (hexClean.length !== 6) return 0;
    
    const r = parseInt(hexClean.substring(0, 2), 16) / 255;
    const g = parseInt(hexClean.substring(2, 4), 16) / 255;
    const b = parseInt(hexClean.substring(4, 6), 16) / 255;
    
    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (hex1: string, hex2: string) => {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const calculateOverallContrast = () => {
    // We check contrast between background (primary) and text/highlights (accent)
    const ratioBgToText = getContrastRatio(theme.primary, theme.accent);
    // And contrast between surfaces (secondary) and text/highlights (accent)
    const ratioSurfaceToText = getContrastRatio(theme.secondary, theme.accent);
    
    return {
      ratioBgToText,
      ratioSurfaceToText,
      minRatio: Math.min(ratioBgToText, ratioSurfaceToText)
    };
  };

  const contrastResult = calculateOverallContrast();
  let contrastScore = 'Poor contrast warning';
  let contrastStars = 1;
  let contrastColor = 'text-red-500';

  if (contrastResult.minRatio >= 7) {
    contrastScore = 'Excellent WCAG AAA';
    contrastStars = 5;
    contrastColor = 'text-green-500';
  } else if (contrastResult.minRatio >= 4.5) {
    contrastScore = 'Good WCAG AA readability';
    contrastStars = 4;
    contrastColor = 'text-green-500';
  } else if (contrastResult.minRatio >= 3) {
    contrastScore = 'Acceptable for large text';
    contrastStars = 3;
    contrastColor = 'text-yellow-500';
  } else if (contrastResult.minRatio >= 2) {
    contrastScore = 'Low contrast warning';
    contrastStars = 2;
    contrastColor = 'text-orange-500';
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      {/* 1. Live Theme Preview */}
      <div>
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Live Preview</p>
          <div className="rounded-xl border bg-background overflow-hidden relative" style={{ height: '180px' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80)' }}
            />
            <div className="absolute top-4 left-4 z-20">
              <h3 className="text-white font-bold text-lg">{shopName || 'Restaurant Name'}</h3>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="w-3 h-3" style={{ color: theme.accent }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl z-20 p-4" style={{ backgroundColor: theme.primary }}>
              <div className="flex gap-2 mb-3 overflow-hidden">
                <div className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ backgroundColor: theme.accent, color: getContrastColor(theme.accent) }}>All</div>
                <div className="px-3 py-1 rounded-full text-[10px] font-medium border" style={{ backgroundColor: theme.secondary, color: getContrastColor(theme.secondary) }}>Burgers</div>
                <div className="px-3 py-1 rounded-full text-[10px] font-medium border" style={{ backgroundColor: theme.secondary, color: getContrastColor(theme.secondary) }}>Drinks</div>
              </div>
              
              <div className="rounded-xl p-3 flex gap-3 shadow-sm border border-border/50" style={{ backgroundColor: theme.secondary, color: getContrastColor(theme.secondary) }}>
                <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80)' }} />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm">Classic Burger</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">Juicy beef patty with fresh lettuce</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="font-bold text-sm" style={{ color: theme.accent }}>Rs. 1200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Brand Colors */}
      <div className="bg-card rounded-2xl border p-5 space-y-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Brand Colors
            {!PRESETS.some(p => p.colors.primary === theme.primary && p.colors.secondary === theme.secondary && p.colors.accent === theme.accent) && (
              <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Customized</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the three colors that represent your brand. Menuzo automatically applies the colors using the 60-30-10 design rule.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { id: 'primary', label: 'Primary Color', desc: 'Backgrounds, Main Layout (60%)', value: theme.primary },
            { id: 'secondary', label: 'Secondary Color', desc: 'Cards, Sections, Surfaces (30%)', value: theme.secondary },
            { id: 'accent', label: 'Accent Color', desc: 'Buttons, Highlights, Prices (10%)', value: theme.accent },
          ].map((colorType) => (
            <div key={colorType.id} className="flex items-center gap-4 p-3 rounded-xl border bg-muted/30">
              <div className="relative">
                <input
                  type="color"
                  value={colorType.value}
                  onChange={(e) => handleColorChange(colorType.id as keyof ThemeConfig, e.target.value)}
                  disabled={!isEditing}
                  className="absolute inset-0 opacity-0 w-12 h-12 cursor-pointer"
                />
                <div 
                  className="w-12 h-12 rounded-lg border shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: colorType.value }}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <Label className="font-medium text-sm">{colorType.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{colorType.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-background border rounded-md px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={colorType.value}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('#')) val = '#' + val.replace(/#/g, '');
                        val = val.substring(0, 7);
                        handleColorChange(colorType.id as keyof ThemeConfig, val);
                      }}
                      className="w-[60px] text-xs font-medium bg-transparent border-none outline-none uppercase tracking-wider disabled:opacity-50"
                      spellCheck={false}
                    />
                    <div className="h-3 w-px bg-border mx-0.5" />
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(colorType.value)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
                      title="Copy color code"
                    >
                      {copiedHex === colorType.value ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2">
          <Label className="text-xs text-muted-foreground mb-2 block">Recent Colors</Label>
          <div className="flex items-center gap-2">
            {recentColors.map((color, i) => (
              <button
                key={i}
                type="button"
                className="w-6 h-6 rounded-lg border shadow-sm transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: color }}
                onClick={() => copyToClipboard(color)}
                title={`Copy ${color}`}
              >
                {copiedHex === color && (
                  <Check className="w-4 h-4" style={{ color: getContrastColor(color) }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Color Usage Guide & 6. Accessibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border p-4">
          <h4 className="text-sm font-semibold mb-3">60-30-10 Rule</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px]" style={{ backgroundColor: theme.primary }} />
                Backgrounds (60%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px]" style={{ backgroundColor: theme.secondary }} />
                Main Elements (30%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px]" style={{ backgroundColor: theme.accent }} />
                Highlights (10%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-4 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold">Contrast Checker</h4>
            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-md" title="WCAG Contrast Ratio">{contrastResult.minRatio.toFixed(1)}:1</span>
          </div>
          <div className={`flex items-center gap-1 mb-1 ${contrastColor}`}>
            {[1, 2, 3, 4, 5].map(star => (
              <svg key={star} className={cn("w-4 h-4", star <= contrastStars ? "opacity-100" : "opacity-20")} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{contrastScore}</p>
        </div>
      </div>


      {/* 3. Recommended Color Palettes */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Recommended Palettes</h3>
          <p className="text-sm text-muted-foreground mt-1">Professionally designed color combinations.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              disabled={!isEditing}
              onClick={() => onChange(preset.colors)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                theme.primary === preset.colors.primary && theme.secondary === preset.colors.secondary
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "bg-card hover:bg-muted/50",
                !isEditing && "opacity-80 cursor-default"
              )}
            >
              <div className="flex flex-col items-start overflow-hidden flex-1 pr-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  {preset.name}
                  {theme.primary === preset.colors.primary && theme.secondary === preset.colors.secondary && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </h4>
                <p className="text-xs text-muted-foreground truncate w-full text-left">{preset.description}</p>
              </div>
              
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-6 h-6 rounded-lg shadow-sm border border-border/50" style={{ backgroundColor: preset.colors.primary }} title="Primary" />
                <div className="w-6 h-6 rounded-lg shadow-sm border border-border/50" style={{ backgroundColor: preset.colors.secondary }} title="Secondary" />
                <div className="w-6 h-6 rounded-lg shadow-sm border border-border/50" style={{ backgroundColor: preset.colors.accent }} title="Accent" />
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
