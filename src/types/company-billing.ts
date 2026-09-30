import type { PaymentRequest } from './billing';

export type CompanyBillingSection = 'payment-requests' | 'payments' | 'subscriptions' | 'shop-urls';
export type AdminPaymentRequest = PaymentRequest & {
  shop_name: string;
  username: string | null;
  owner_email: string;
  reviewed_by: string | null;
  activated_until: string | null;
};
export type AdminShopSubscription = {
  shop_id: string;
  shop_name: string;
  username: string | null;
  user_id: string;
  owner_email: string;
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
  slug: string | null;
  pro_active: boolean;
};
export type BillingPage<T> = { rows: T[]; total: number };
export type ShopBillingDetails = { shop: AdminShopSubscription; payments: BillingPage<AdminPaymentRequest> };
