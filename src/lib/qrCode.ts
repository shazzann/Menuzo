import QRCodeStyling from 'qr-code-styling';
import type { CornerDotType, CornerSquareType, Options } from 'qr-code-styling';
import { getShopQrColors } from './themeUtils';

export const QR_EXPORT_SIZE = 2048;
export type QrPattern = 'square' | 'rounded';
export type QrColorStyle = 'classic' | 'brand';

export const QR_PATTERNS: { label: string; value: QrPattern; eyeFrame: CornerSquareType; eyeBall: CornerDotType }[] = [
  { label: 'Square', value: 'square', eyeFrame: 'square', eyeBall: 'square' },
  { label: 'Rounded', value: 'rounded', eyeFrame: 'extra-rounded', eyeBall: 'dot' },
];

export const QR_COLOR_STYLES: { label: string; value: QrColorStyle }[] = [
  { label: 'Black & white', value: 'classic' },
  { label: 'Brand colour', value: 'brand' },
];

// Shops saved before the two-shape picker may still store the older pattern names.
const ROUNDED_LEGACY_PATTERNS = new Set(['rounded', 'dots', 'extra-rounded', 'classy-rounded']);

export function normalizeQrPattern(value: unknown): QrPattern {
  return typeof value === 'string' && ROUNDED_LEGACY_PATTERNS.has(value) ? 'rounded' : 'square';
}

export function normalizeQrColorStyle(value: unknown): QrColorStyle {
  return value === 'brand' ? 'brand' : 'classic';
}

// An https page may not fetch http:// files, and qr-code-styling fetches the logo
// before drawing, so an http:// logo (older uploads stored Cloudinary's plain url)
// left the QR blank on the deployed site while it worked on http://localhost.
export function secureLogoUrl(url?: string): string {
  return url ? url.replace(/^http:\/\//i, 'https://') : '';
}

export function getQrOptions(input: {
  shopUrl: string; shopLogo?: string; size: number; imageSize?: number;
  qrStyle: string; qrPattern: string; primary: string; accent: string;
}): Options {
  const colors = normalizeQrColorStyle(input.qrStyle) === 'brand' ? getShopQrColors(input.primary, input.accent)
    : { fgColor: '#000000', bgColor: '#ffffff' };
  const patternValue = normalizeQrPattern(input.qrPattern);
  const pattern = QR_PATTERNS.find(item => item.value === patternValue)!;
  const url = new URL(input.shopUrl);
  url.searchParams.set('source', 'qr');
  return {
    width: input.size, height: input.size, type: 'svg', data: url.href,
    image: secureLogoUrl(input.shopLogo),
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

const LOGO_TIMEOUT_MS = 8000;

// qr-code-styling never finishes drawing if the logo cannot be downloaded (blocked,
// missing, or no CORS), so check it first and fall back to a QR without the logo.
export async function withReachableLogo(options: Options): Promise<Options> {
  if (!options.image) return options;
  const controller = typeof AbortController === 'function' ? new AbortController() : undefined;
  const timer = setTimeout(() => controller?.abort(), LOGO_TIMEOUT_MS);
  try {
    const response = await fetch(options.image, { mode: 'cors', signal: controller?.signal });
    if (!response.ok) throw new Error(`Logo request failed: ${response.status}`);
    return options;
  } catch (err) {
    console.warn('QR logo could not be loaded; showing the QR without it.', err);
    return { ...options, image: '' };
  } finally {
    clearTimeout(timer);
  }
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
  const exportedQr = createStyledQr(getQrExportOptions(await withReachableLogo(options)));
  await exportedQr.download({ name: filename, extension: 'png' });
}
