import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import type { ThemeConfig } from '@/types';

interface SmallQrPreviewProps {
  shopUrl: string;
  theme: ThemeConfig;
  shopLogo?: string;
  size?: number;
}

const PATTERNS: { label: string, value: DotType, eyeFrame: CornerSquareType, eyeBall: CornerDotType }[] = [
  { label: 'Classic', value: 'square', eyeFrame: 'square', eyeBall: 'square' },
  { label: 'Rounded', value: 'rounded', eyeFrame: 'extra-rounded', eyeBall: 'rounded' },
  { label: 'Dots', value: 'dots', eyeFrame: 'dot', eyeBall: 'dot' },
  { label: 'Smooth', value: 'extra-rounded', eyeFrame: 'extra-rounded', eyeBall: 'dot' },
  { label: 'Pixel', value: 'classy', eyeFrame: 'square', eyeBall: 'square' },
  { label: 'Diamond', value: 'classy-rounded', eyeFrame: 'extra-rounded', eyeBall: 'rounded' },
];

export interface SmallQrPreviewRef {
  download: (filename: string) => void;
}

export const SmallQrPreview = forwardRef<SmallQrPreviewRef, SmallQrPreviewProps>(({ 
  shopUrl, 
  theme, 
  shopLogo,
  size = 64
}, ref) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useImperativeHandle(ref, () => ({
    download: (filename: string) => {
      if (qrCode.current) {
        qrCode.current.download({ name: filename, extension: 'png' });
      }
    }
  }));

  const qrStyle = (theme as any)?.qrStyle || 'classic';
  const qrPattern = (theme as any)?.qrPattern || 'square';
  const themePrimary = theme.primary || '#090A0C';
  const themeAccent = theme.accent || '#FB8500';

  const getColors = () => {
    if (qrStyle === 'brand') {
      return {
        fgColor: themeAccent,
        bgColor: themePrimary
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
    
    const QRCodeConstructor = typeof QRCodeStyling === 'function' ? QRCodeStyling : (QRCodeStyling as any).default;

    qrCode.current = new QRCodeConstructor({
      width: size,
      height: size,
      type: 'svg',
      data: shopUrl,
      image: shopLogo ? `${shopLogo}?qr=1` : undefined,
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
        margin: 5,
        imageSize: 0.2 // Reduced from 0.4 so it doesn't erase all data modules!
      },
      qrOptions: {
        errorCorrectionLevel: 'H'
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current?.append(qrRef.current);
      
      // Make the internal canvas/svg scale to our wrapper
      const element = qrRef.current.querySelector('canvas') || qrRef.current.querySelector('svg');
      if (element) {
        element.style.width = '100%';
        element.style.height = '100%';
      }
    }
  }, []);

  useEffect(() => {
    if (!qrCode.current) return;
    const { fgColor, bgColor } = getColors();
    const config = getPatternConfig(qrPattern);

    qrCode.current.update({
      data: shopUrl,
      image: shopLogo ? `${shopLogo}?qr=1` : undefined,
      dotsOptions: { color: fgColor, type: config.value },
      cornersSquareOptions: { color: fgColor, type: config.eyeFrame },
      cornersDotOptions: { color: fgColor, type: config.eyeBall },
      backgroundOptions: { color: bgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.2 },
      qrOptions: { errorCorrectionLevel: 'H' }
    });
    
    // Ensure styles persist after update
    setTimeout(() => {
      if (qrRef.current) {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
      }
    }, 50);
  }, [qrStyle, qrPattern, themePrimary, themeAccent, shopLogo, shopUrl]);

  return (
    <div 
      className="rounded-lg overflow-hidden flex items-center justify-center transition-colors duration-300 shadow-sm flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: getColors().bgColor }}
    >
      <div ref={qrRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
});