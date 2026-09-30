import { useEffect } from 'react';
import { useApp } from '@/store';
import { freeSubscription } from '@/lib/subscription';
import { SubscriptionService } from '@/services/subscription.service';

export function SubscriptionDataLoader() {
  const { state, dispatch } = useApp();
  const userId = state.user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let loading = false;
    const refresh = async () => {
      if (loading) return;
      loading = true;
      try {
        const subscription = await SubscriptionService.getSubscription(userId);
        if (!cancelled) dispatch({ type: 'SET_SUBSCRIPTION', payload: { userId, subscription } });
      } catch {
        // An unavailable profile never grants paid access.
        if (!cancelled) dispatch({ type: 'SET_SUBSCRIPTION', payload: { userId, subscription: freeSubscription() } });
      } finally {
        loading = false;
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
      window.clearInterval(timer);
    };
  }, [userId, dispatch]);
  return null;
}
