import QRCodeStyling from 'qr-code-styling';
import type { CornerDotType, CornerSquareType, DotType, Options } from 'qr-code-styling';
import { getShopQrColors } from './themeUtils';

export const QR_EXPORT_SIZE = 2048;
export const QR_PATTERNS: { label: string; value: DotType; eyeFrame: CornerSquareType; eyeBall: CornerDotType }[] = [
  { label: 'Classic', value: 'square', eyeFrame: 'square', eyeBall: 'square' },
  { label: 'Rounded', value: 'rounded', eyeFrame: 'extra-rounded', eyeBall: 'rounded' },
  { label: 'Dots', value: 'dots', eyeFrame: 'dot', eyeBall: 'dot' },
  { label: 'Smooth', value: 'extra-rounded', eyeFrame: 'extra-rounded', eyeBall: 'dot' },
  { label: 'Pixel', value: 'classy', eyeFrame: 'square', eyeBall: 'square' },
  { label: 'Diamond', value: 'classy-rounded', eyeFrame: 'extra-rounded', eyeBall: 'rounded' },
];

export function getQrOptions(input: {
  shopUrl: string; shopLogo?: string; size: number; imageSize?: number;
  qrStyle: string; qrPattern: string; primary: string; accent: string;
}): Options {
  const colors = input.qrStyle === 'brand' ? getShopQrColors(input.primary, input.accent)
    : { fgColor: '#000000', bgColor: '#ffffff' };
  const pattern = QR_PATTERNS.find(item => item.value === input.qrPattern) || QR_PATTERNS[0];
  const url = new URL(input.shopUrl);
  url.searchParams.set('source', 'qr');
  return {
    width: input.size, height: input.size, type: 'svg', data: url.href,
    image: input.shopLogo || '',
    dotsOptions: { color: colors.fgColor, type: pattern.value },
    cornersSquareOptions: { color: colors.fgColor, type: pattern.eyeFrame },
    cornersDotOptions: { color: colors.fgColor, type: pattern.eyeBall },
    backgroundOptions: { color: colors.bgColor },
    imageOptions: { crossOrigin: 'anonymous', saveAsBlob: true, margin: 5, imageSize: input.imageSize ?? 0.2 },
    qrOptions: { errorCorrectionLevel: 'H' },
  };
}

export function createStyledQr(options: Options) {
  // Handle the package's CJS interop in the production bundle.
  const Constructor = typeof QRCodeStyling === 'function' ? QRCodeStyling
    : (QRCodeStyling as { default: typeof QRCodeStyling }).default;
  return new Constructor(options);
}

export function getQrExportOptions(options: Options): Options {
  const scale = QR_EXPORT_SIZE / (options.width || 200);
  return {
    ...options, width: QR_EXPORT_SIZE, height: QR_EXPORT_SIZE,
    // Keep a clear border around the code, including when printed on a coloured surface.
    margin: Math.max(Math.ceil(QR_EXPORT_SIZE * 0.14), Math.round((options.margin || 0) * scale)),
    imageOptions: { ...options.imageOptions, margin: Math.round((options.imageOptions?.margin || 0) * scale) },
  };
}

export async function downloadQrPng(options: Options, filename: string): Promise<void> {
  // Render the QR's vector modules at export size; never enlarge the preview bitmap.
  const exportedQr = createStyledQr(getQrExportOptions(options));
  await exportedQr.download({ name: filename, extension: 'png' });
}
