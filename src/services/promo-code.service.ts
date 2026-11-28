import { supabase } from '@/lib/supabase';
import type {
  AdminPromoCode, PromoCode, PromoCodeInput, PromoCodeStatus, PromoCodeUsage, PromoPreview,
} from '@/types/promo-codes';

// Company admins manage promo codes through RLS-guarded table writes; listing and
// usage go through admin RPCs that join shops and owners. Owners preview a code at
// checkout; BillingService.submitRequest applies it together with the payment request.
export const PromoCodeService = {
  async list(): Promise<AdminPromoCode[]> {
    const { data, error } = await supabase.rpc('admin_list_promo_codes');
    if (error) throw error;
    return data ?? [];
  },
  async create(input: PromoCodeInput): Promise<PromoCode> {
    const { data, error } = await supabase.from('promo_codes').insert(normalize(input)).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, input: PromoCodeInput): Promise<PromoCode> {
    const { data, error } = await supabase.from('promo_codes').update(normalize(input)).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async setActive(id: string, isActive: boolean): Promise<void> {
    const { data, error } = await supabase.from('promo_codes').update({ is_active: isActive }).eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) throw { code: 'PGRST116' };
  },
  async remove(id: string): Promise<void> {
    const { data, error } = await supabase.from('promo_codes').delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) throw { code: 'PGRST116' };
  },
  async usage(id: string): Promise<PromoCodeUsage[]> {
    const { data, error } = await supabase.rpc('admin_list_promo_code_usage', { p_promo_code_id: id });
    if (error) throw error;
    return data ?? [];
  },
  async preview(code: string, shopId: string, plan: string): Promise<PromoPreview> {
    const { data, error } = await supabase.rpc('preview_promo_code', { p_code: code.trim(), p_shop_id: shopId, p_plan: plan });
    if (error) throw error;
    return data;
  },
};

function normalize(input: PromoCodeInput) {
  return {
    code: input.code.trim().toUpperCase(),
    description: input.description.trim(),
    discount_percent: input.discount_percent,
    applicable_plans: [...new Set(input.applicable_plans)],
    max_redemptions: input.max_redemptions,
    valid_from: input.valid_from,
    valid_until: input.valid_until,
    is_active: input.is_active,
  };
}

export function promoCodeStatus(code: AdminPromoCode, now = Date.now()): PromoCodeStatus {
  if (!code.is_active) return 'inactive';
  if (new Date(code.valid_until).getTime() < now) return 'expired';
  if (new Date(code.valid_from).getTime() > now) return 'scheduled';
  if (code.redemption_count >= code.max_redemptions) return 'exhausted';
  return 'active';
}

export function promoCodeError(error: unknown) {
  const detail = error as { code?: string; message?: string };
  if (detail?.code === '42501') return 'Your account does not have active company admin access.';
  if (detail?.code === '23505') return 'A promo code with this name already exists. Choose a different code.';
  if (detail?.code === '23001' || detail?.code === '23503') return 'Shops are using this code, so it cannot be deleted. Deactivate it instead.';
  if (detail?.code === '23514') return 'Check the code (3-32 letters, numbers, - or _), discount (1-100%), plans, limit and dates.';
  if (detail?.code === 'PGRST116') return 'This promo code no longer exists. Refresh the list.';
  if (detail?.code === 'P0001') return detail.message || 'Please check the details and try again.';
  if (detail?.code === 'PGRST202' || detail?.code === '42P01' || detail?.code === 'PGRST205') return 'The promo code database update is not available yet.';
  return 'Unable to complete this operation. Refresh to check the latest status before trying again.';
}
