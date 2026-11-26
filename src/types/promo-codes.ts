// Menuzo plans a promo code can discount. 'pro' is the legacy name of Plus: the database
// stores it as 'plus', and a 'pro' subscriber redeems Plus codes.
export type PromoPlan = 'plus' | 'enterprise';

export const PROMO_PLANS: readonly PromoPlan[] = ['plus', 'enterprise'];

export type PromoCode = {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  applicable_plans: PromoPlan[];
  max_redemptions: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_by: string | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminPromoCode = PromoCode & { redemption_count: number };

export type PromoCodeInput = {
  code: string;
  description: string;
  discount_percent: number;
  applicable_plans: PromoPlan[];
  max_redemptions: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
};

export type PromoCodeUsage = {
  redemption_id: string;
  shop_id: string;
  shop_name: string;
  username: string | null;
  owner_email: string | null;
  plan: PromoPlan;
  discount_percent: number;
  redeemed_at: string;
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
};

export type PromoRedemption = {
  redemption_id: string;
  code: string;
  plan: PromoPlan;
  discount_percent: number;
  redeemed_at: string;
};

export type PromoCodeStatus = 'active' | 'inactive' | 'scheduled' | 'expired' | 'exhausted';
