import { useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import type { ThemeConfig } from '@/types';
import { createStyledQr, downloadQrPng, getQrOptions } from '@/lib/qrCode';

interface SmallQrPreviewProps {
  shopUrl: string;
  theme: ThemeConfig;
  shopLogo?: string;
  size?: number;
}

export interface SmallQrPreviewRef {
  download: (filename: string) => Promise<void>;
}

export const SmallQrPreview = forwardRef<SmallQrPreviewRef, SmallQrPreviewProps>(({ shopUrl, theme, shopLogo, size = 64 }, ref) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const { qrStyle = 'classic', qrPattern = 'square' } = theme as ThemeConfig & { qrStyle?: string; qrPattern?: string };
  const options = useMemo(() => getQrOptions({ shopUrl, shopLogo, size, qrStyle, qrPattern,
    primary: theme.primary, accent: theme.accent }), [shopUrl, shopLogo, size, qrStyle, qrPattern, theme.primary, theme.accent]);

  useImperativeHandle(ref, () => ({ download: filename => downloadQrPng(options, filename) }), [options]);

  useEffect(() => {
    if (!qrRef.current) return;
    const host = document.createElement('div');
    host.style.width = '100%';
    host.style.height = '100%';
    qrRef.current.replaceChildren(host);
    createStyledQr(options).append(host);
    return () => host.remove();
  }, [options]);

  return (
    <div className="rounded-lg overflow-hidden flex items-center justify-center transition-colors duration-300 shadow-sm flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: options.backgroundOptions?.color }}>
      <div ref={qrRef} className="w-full h-full [&_svg]:w-full [&_svg]:h-full" />
    </div>
  );
});
