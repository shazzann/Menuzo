import { useRef, useEffect } from 'react';
import { Check, CircleDot, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCodeStyling from 'qr-code-styling';
import type { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { cn } from '@/lib/utils';

interface AdminQrSettingsProps {
  shopUrl: string;
  themePrimary: string;
  themeAccent: string;
  shopLogo?: string;
  qrStyle: 'classic' | 'brand';
  qrPattern: DotType;
  onChangeStyle: (style: 'classic' | 'brand') => void;
  onChangePattern: (pattern: DotType) => void;
  shopName: string;
  isSaving?: boolean;
}

const PATTERNS: { label: string, value: DotType, eyeFrame: CornerSquareType, eyeBall: CornerDotType }[] = [
  { label: 'Classic', value: 'square', eyeFrame: 'square', eyeBall: 'square' },
  { label: 'Rounded', value: 'rounded', eyeFrame: 'extra-rounded', eyeBall: 'rounded' },
  { label: 'Dots', value: 'dots', eyeFrame: 'dot', eyeBall: 'dot' },
  { label: 'Smooth', value: 'extra-rounded', eyeFrame: 'extra-rounded', eyeBall: 'dot' },
  { label: 'Pixel', value: 'classy', eyeFrame: 'square', eyeBall: 'square' },
  { label: 'Diamond', value: 'classy-rounded', eyeFrame: 'extra-rounded', eyeBall: 'rounded' },
];

export function AdminQrSettings({ 
  shopUrl, 
  themePrimary, 
  themeAccent, 
  shopLogo, 
  qrStyle, 
  qrPattern,
  onChangeStyle,
  onChangePattern,
  shopName,
  isSaving
}: AdminQrSettingsProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const getColors = () => {
    if (qrStyle === 'brand') {
      return {
        fgColor: themeAccent || '#FB8500',
        bgColor: themePrimary || '#090A0C'
      };
    }
    return {
      fgColor: '#000000',
      bgColor: '#ffffff'
    };
  };

  const getPatternConfig = (pattern: DotType) => {
    return PATTERNS.find(p => p.value === pattern) || PATTERNS[0];
  };

  useEffect(() => {
    const { fgColor, bgColor } = getColors();
    const config = getPatternConfig(qrPattern);
    
    qrCode.current = new QRCodeStyling({
      width: 180,
      height: 180,
      data: shopUrl,
      image: shopLogo || undefined,
      dotsOptions: {
        color: fgColor,
        type: config.value
      },
      cornersSquareOptions: {
        color: fgColor,
        type: config.eyeFrame
      },
      cornersDotOptions: {
        color: fgColor,
        type: config.eyeBall
      },
      backgroundOptions: {
        color: bgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSize: 0.25
      },
      qrOptions: {
        errorCorrectionLevel: 'H'
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    if (!qrCode.current) return;
    const { fgColor, bgColor } = getColors();
    const config = getPatternConfig(qrPattern);

    qrCode.current.update({
      image: shopLogo || undefined,
      dotsOptions: { color: fgColor, type: config.value },
      cornersSquareOptions: { color: fgColor, type: config.eyeFrame },
      cornersDotOptions: { color: fgColor, type: config.eyeBall },
      backgroundOptions: { color: bgColor },
      qrOptions: { errorCorrectionLevel: 'H' }
    });
  }, [qrStyle, qrPattern, themePrimary, themeAccent, shopLogo]);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="text-center space-y-1 mt-2">
        <h2 className="text-xl font-bold">QR Customization</h2>
        <p className="text-sm text-muted-foreground">Customize your QR code appearance</p>
      </div>

      {/* Live Preview Card */}
      <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center gap-4 card-shadow mx-4 mt-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold mb-2">Live Preview</span>
        
        <div className="p-4 rounded-xl shadow-sm border transition-colors duration-300" style={{ backgroundColor: getColors().bgColor }}>
          <div ref={qrRef} />
        </div>
        
        <div className="text-center mt-2">
          <p className="font-semibold text-sm">Scan to View Menu</p>
          <p className="text-xs text-muted-foreground">{shopName}</p>
        </div>
      </div>

      {/* QR Color Theme */}
      <div className="px-4 space-y-4 mt-8">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Color Theme</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Classic Card */}
          <div 
            onClick={() => onChangeStyle('classic')}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
              qrStyle === 'classic' 
                ? "border-primary bg-primary/5" 
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {qrStyle === 'classic' && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center shadow-sm">
              <div className="w-6 h-6 bg-black rounded-sm" />
            </div>
            <span className="font-medium text-sm mt-2">Classic</span>
          </div>

          {/* Brand Theme Card */}
          <div 
            onClick={() => onChangeStyle('brand')}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
              qrStyle === 'brand' 
                ? "border-primary bg-primary/5" 
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {qrStyle === 'brand' && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div 
              className="w-12 h-12 rounded-lg border flex items-center justify-center shadow-sm transition-colors duration-300"
              style={{ backgroundColor: themePrimary || '#090A0C' }}
            >
              <div 
                className="w-6 h-6 rounded-sm transition-colors duration-300" 
                style={{ backgroundColor: themeAccent || '#FB8500' }}
              />
            </div>
            <span className="font-medium text-sm mt-2">Brand Theme</span>
          </div>
        </div>
      </div>

      {/* QR Pattern Selection */}
      <div className="px-4 space-y-4 mt-8">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pattern Style</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {PATTERNS.map((pattern) => {
            const isSelected = qrPattern === pattern.value;
            return (
              <div
                key={pattern.value}
                onClick={() => onChangePattern(pattern.value)}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {pattern.value === 'dots' || pattern.value === 'rounded' ? (
                    <CircleDot className="w-5 h-5" />
                  ) : (
                    <Grid3x3 className="w-5 h-5" />
                  )}
                </div>
                <span className="font-medium text-sm">{pattern.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 max-w-md mx-auto mt-4">
        <Button 
          type="submit" 
          form="settings-form" 
          disabled={isSaving}
          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSaving ? 'Saving...' : 'Save QR Design'}
        </Button>
      </div>
    </div>
  );
}
