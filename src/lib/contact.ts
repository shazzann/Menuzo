const WHATSAPP_NUMBER_RE = /^[1-9]\d{7,14}$/;

/**
 * Reads the dedicated public sales WhatsApp number from environment config.
 * Never falls back to internal bank-transfer verification numbers.
 */
export function getPublicWhatsAppNumber(): string | null {
  const raw = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim();
  return WHATSAPP_NUMBER_RE.test(raw) ? raw : null;
}

export const PUBLIC_CONTACT_EMAIL = 'menuzoapp@gmail.com';

export function getPublicWhatsAppUrl(message?: string): string | null {
  const number = getPublicWhatsAppNumber();
  if (!number) return null;
  if (!message || !message.trim()) return `https://wa.me/${number}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message.trim())}`;
}

export function getPublicEmailUrl(subject: string, body?: string): string {
  const params = new URLSearchParams({ subject });
  if (body && body.trim()) {
    params.set('body', body.trim());
  }
  return `mailto:${PUBLIC_CONTACT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}
