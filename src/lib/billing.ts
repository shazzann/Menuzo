import type { BankTransferSettings, BillingPeriod } from '@/types/billing';

export const placeholderPeriods: BillingPeriod[] = [
  { id: 'monthly', label: 'Monthly', months: 1, amount: null, currency: 'USD', active: true },
  { id: 'yearly', label: 'Yearly', months: 12, amount: null, currency: 'USD', active: true },
];

export function formatPaymentAmount(amount: number | null, currency: string) {
  if (amount === null) return 'Price coming soon';
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
}

export function isCheckoutReady(period: BillingPeriod | undefined, bank: BankTransferSettings | null) {
  return !!period?.active && period.amount !== null && period.amount > 0 && !!bank?.enabled
    && !!bank.bank_name.trim() && !!bank.account_name.trim() && !!bank.account_number.trim()
    && !!bank.branch.trim()
    && /^[1-9]\d{7,14}$/.test(bank.whatsapp_number);
}

export function paymentWhatsAppUrl(number: string, message: string) {
  return /^[1-9]\d{7,14}$/.test(number) ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

export function billingErrorMessage(error: unknown) {
  const detail = error as { code?: string; message?: string };
  if (detail?.code === '23505') return 'A verification request already exists for this payment or shop. Refresh your requests before trying again.';
  if (detail?.code === 'P0001') return detail.message || 'Please check your transfer details.';
  return 'We could not save your request. Your plan has not changed. Please refresh and try again.';
}
