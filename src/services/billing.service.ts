import { supabase } from '@/lib/supabase';
import type {
  BankTransferSettings,
  BillingPeriod,
  PaymentRequest,
  ShopCustomUrl,
  SubmitPaymentRequestInput,
} from '@/types/billing';

export const BillingService = {
  async getPeriods(): Promise<BillingPeriod[]> {
    const { data, error } = await supabase
      .from('billing_periods')
      .select('*')
      .eq('active', true)
      .order('months');

    if (error) throw error;
    return data || [];
  },

  async getBankDetails(): Promise<BankTransferSettings | null> {
    const { data, error } = await supabase
      .from('bank_transfer_settings')
      .select('*')
      .eq('id', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getRequests(shopId: string): Promise<PaymentRequest[]> {
    const { data, error } = await supabase
      .from('billing_payment_requests')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async getCustomUrl(shopId: string): Promise<ShopCustomUrl | null> {
    const { data, error } = await supabase
      .from('shop_custom_urls')
      .select('*')
      .eq('shop_id', shopId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async submitRequest(input: SubmitPaymentRequestInput): Promise<PaymentRequest> {
    const { data, error } = await supabase.rpc('submit_payment_request', {
      p_shop_id: input.shopId,
      p_period_id: input.periodId,
      p_payer_name: input.payerName.trim(),
      p_transfer_reference: input.transferReference.trim(),
      p_transferred_on: input.transferredOn,
      p_expected_amount: input.expectedAmount,
      p_expected_currency: input.expectedCurrency,
      p_expected_months: input.expectedMonths,
      p_requested_slug: input.requestedSlug?.trim().toLowerCase() || null,
      p_customer_note: input.customerNote?.trim() || null,
    });

    if (error) throw error;
    if (!data) throw new Error('Your payment request could not be saved. Please try again.');
    return data;
  },
};
