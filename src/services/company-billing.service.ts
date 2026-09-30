import { supabase } from '@/lib/supabase';

export const CompanyBillingService = {
  async isAdmin() {
    const { data, error } = await supabase.rpc('is_company_billing_admin');
    if (error) throw error;
    return data === true;
  },
  async requests(status: string, query: string, offset: number) {
    const { data, error } = await supabase.rpc('admin_list_billing_requests', {
      p_status: status, p_query: query.trim(), p_offset: offset,
    });
    if (error) throw error;
    return data;
  },
  async subscriptions(query: string, offset: number) {
    const { data, error } = await supabase.rpc('admin_list_shop_subscriptions', {
      p_query: query.trim(), p_offset: offset,
    });
    if (error) throw error;
    return data;
  },
  async review(id: string, decision: 'approved' | 'rejected', reason: string, slug: string, receiptVerified: boolean) {
    const { data, error } = await supabase.rpc('admin_review_billing_payment', {
      p_request_id: id, p_decision: decision, p_reason: reason.trim() || null,
      p_custom_slug: slug.trim().toLowerCase() || null, p_receipt_verified: receiptVerified,
    });
    if (error) throw error;
    return data;
  },
  async shopBilling(shopId: string, status: string, offset: number) {
    const { data, error } = await supabase.rpc('admin_get_shop_billing', {
      p_shop_id: shopId, p_status: status, p_offset: offset,
    });
    if (error) throw error;
    return data;
  },
  async changeStatus(shopId: string, status: 'active' | 'cancelled', reason: string) {
    const { error } = await supabase.rpc('admin_change_subscription_status', {
      p_shop_id: shopId, p_status: status, p_reason: reason.trim(),
    });
    if (error) throw error;
  },
  async assignUrl(shopId: string, slug: string) {
    const { error } = await supabase.rpc('admin_assign_shop_url', {
      p_shop_id: shopId, p_slug: slug.trim().toLowerCase(),
    });
    if (error) throw error;
  },
};

export function companyBillingError(error: unknown) {
  const detail = error as { code?: string; message?: string };
  if (detail?.code === '42501') return 'Your account does not have active company admin access.';
  if (detail?.code === '23505') return 'This URL or transfer reference is already in use. Refresh and check before trying again.';
  if (detail?.code === 'P0001') return detail.message || 'Please check the details and try again.';
  if (detail?.code === 'PGRST202') return 'The company billing database update is not available yet.';
  return 'Unable to complete this operation. Refresh to check the latest status before trying again.';
}
