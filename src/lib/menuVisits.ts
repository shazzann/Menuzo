import { supabase } from '@/lib/supabase';

const pending = new Map<string, Promise<void>>();

export function trackMenuVisit(shopId: string, isQr: boolean): Promise<void> {
  const key = `tracked_visit_${shopId}_${isQr}`;
  if (sessionStorage.getItem(key)) return Promise.resolve();
  const existing = pending.get(key);
  if (existing) return existing;
  const request = Promise.resolve().then(async () => {
    const { error } = await supabase.rpc('increment_shop_visits', { p_shop_id: shopId, p_is_qr: isQr });
    if (error) throw error;
    // Failed requests must remain retryable. Mark only successful visits.
    sessionStorage.setItem(key, 'true');
  }).finally(() => { pending.delete(key); });
  pending.set(key, request);
  return request;
}
