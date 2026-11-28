export type BillingPeriod = {
  id: string;
  label: string;
  months: number;
  amount: number | null;
  currency: string;
  active: boolean;
};

export type PaidPlanSlug = 'plus' | 'enterprise';

export type PlanPrice = {
  plan_slug: PaidPlanSlug;
  period_id: string;
  amount: number;
  currency: string;
  updated_at: string;
  updated_by: string | null;
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
  plan_slug?: string | null;
  promo_code?: string | null;
  promo_discount_percent?: number | null;
  original_amount?: number | null;
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
  planSlug?: string | null;
  // With a promo code, the request records the discounted amount the owner transfers.
  promoCode?: string | null;
  expectedDiscountedAmount?: number | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: 'free' | 'plus' | 'enterprise' | string;
  monthly_price: number;
  annual_price: number;
  max_items: number;
  max_categories: number;
  features: Record<string, unknown>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
