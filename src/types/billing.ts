export type BillingPeriod = {
  id: string;
  label: string;
  months: number;
  amount: number | null;
  currency: string;
  active: boolean;
};

export type BankTransferSettings = {
  id: boolean;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
  whatsapp_number: string;
  enabled: boolean;
};

export type PaymentRequest = {
  id: string;
  user_id: string;
  shop_id: string;
  period_id: string;
  period_label: string;
  months: number;
  amount: number;
  currency: string;
  payer_name: string;
  transfer_reference: string;
  transferred_on: string;
  requested_slug: string | null;
  customer_note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type ShopCustomUrl = {
  shop_id: string;
  slug: string;
  created_at: string;
};

export interface SubmitPaymentRequestInput {
  shopId: string;
  periodId: string;
  payerName: string;
  transferReference: string;
  transferredOn: string;
  expectedAmount: number;
  expectedCurrency: string;
  expectedMonths: number;
  requestedSlug?: string | null;
  customerNote?: string;
}
