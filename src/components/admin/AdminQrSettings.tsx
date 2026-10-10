import { useRef, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createStyledQr, downloadQrPng, getQrOptions, QR_COLOR_STYLES, QR_PATTERNS,
  type QrColorStyle, type QrPattern } from '@/lib/qrCode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminQrSettingsProps {
  shopUrl: string;
  themePrimary: string;
  themeAccent: string;
  shopLogo?: string;
  qrStyle: QrColorStyle;
  qrPattern: QrPattern;
  onChangeStyle: (style: QrColorStyle) => void;
  onChangePattern: (pattern: QrPattern) => void;
  shopName: string;
  isSaving?: boolean;
  onDownload?: () => void;
}

function useStyledQr(options: ReturnType<typeof getQrOptions>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const host = document.createElement('div');
    ref.current.replaceChildren(host);
    createStyledQr(options).append(host);
    return () => host.remove();
  }, [options]);
  return ref;
}

function QrThumb({ shopUrl, qrStyle, qrPattern, primary, accent }: {
  shopUrl: string; qrStyle: QrColorStyle; qrPattern: QrPattern; primary: string; accent: string;
}) {
  const options = useMemo(() => getQrOptions({ shopUrl, size: 64, qrStyle, qrPattern, primary, accent }),
    [shopUrl, qrStyle, qrPattern, primary, accent]);
  const ref = useStyledQr(options);
  return (
    <div className="p-1.5 rounded-lg border shadow-sm transition-colors duration-300" style={{ backgroundColor: options.backgroundOptions?.color }}>
      <div ref={ref} className="w-16 h-16 [&_svg]:w-full [&_svg]:h-full" aria-hidden />
    </div>
  );
}

function QrOptionCard({ label, selected, onSelect, children }: {
  label: string; selected: boolean; onSelect: () => void; children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3",
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      {children}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

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
  isSaving,
  onDownload
}: AdminQrSettingsProps) {
  const [downloading, setDownloading] = useState(false);
  const options = useMemo(() => getQrOptions({ shopUrl, shopLogo, size: 180, imageSize: 0.25,
    qrStyle, qrPattern, primary: themePrimary, accent: themeAccent }),
    [shopUrl, shopLogo, qrStyle, qrPattern, themePrimary, themeAccent]);
  const qrRef = useStyledQr(options);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="text-center space-y-1 mt-2">
        <h2 className="text-xl font-bold">QR Customization</h2>
        <p className="text-sm text-muted-foreground">Customize your QR code appearance</p>
      </div>

      {/* Live Preview Card */}
      <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center gap-4 card-shadow mx-4 mt-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold mb-2">Live Preview</span>
        
        <div className="p-4 rounded-xl shadow-sm border transition-colors duration-300" style={{ backgroundColor: options.backgroundOptions?.color }}>
          <div ref={qrRef} />
        </div>
        
        <div className="text-center mt-2 mb-4">
          <p className="font-semibold text-sm">Scan to View Menu</p>
          <p className="text-xs text-muted-foreground">{shopName}</p>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full max-w-[200px]"
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            try {
              await downloadQrPng(options, `${shopName.replace(/\s+/g, '-').toLowerCase()}-qr-code`);
              onDownload?.();
            } catch {
              toast.error('Could not download the QR code. Please try again.');
            } finally {
              setDownloading(false);
            }
          }}
        >
          {downloading ? 'Preparing download…' : 'Download QR Code'}
        </Button>
        <p className="text-xs text-muted-foreground">High-resolution PNG · 2048 × 2048 pixels</p>
      </div>

      {/* QR Colour */}
      <div className="px-4 space-y-4 mt-8">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Colour</h3>
        <div className="grid grid-cols-2 gap-4">
          {QR_COLOR_STYLES.map(color => (
            <QrOptionCard key={color.value} label={color.label} selected={qrStyle === color.value}
              onSelect={() => onChangeStyle(color.value)}>
              <QrThumb shopUrl={shopUrl} qrStyle={color.value} qrPattern={qrPattern} primary={themePrimary} accent={themeAccent} />
            </QrOptionCard>
          ))}
        </div>
      </div>

      {/* QR Shape */}
      <div className="px-4 space-y-4 mt-8">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Shape</h3>
        <div className="grid grid-cols-2 gap-4">
          {QR_PATTERNS.map(pattern => (
            <QrOptionCard key={pattern.value} label={pattern.label} selected={qrPattern === pattern.value}
              onSelect={() => onChangePattern(pattern.value)}>
              <QrThumb shopUrl={shopUrl} qrStyle={qrStyle} qrPattern={pattern.value} primary={themePrimary} accent={themeAccent} />
            </QrOptionCard>
          ))}
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
