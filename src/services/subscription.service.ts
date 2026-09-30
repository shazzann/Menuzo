import { supabase } from '@/lib/supabase';
import { subscriptionFromProfile } from '@/lib/subscription';

export const SubscriptionService = {
  async getSubscription(userId: string) {
    const { data, error } = await supabase.from('profiles')
      .select('subscription_plan, subscription_status, subscription_expires_at')
      .eq('id', userId).maybeSingle();
    if (error) throw error;
    return subscriptionFromProfile(data);
  },
};
