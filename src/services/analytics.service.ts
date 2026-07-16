import { supabase } from '@/lib/supabase';

// If an analytics_events table exists in the future, we can insert into it.
// For now, it delegates to the existing local/posthog tracker logic gracefully.
export const AnalyticsService = {
  async trackEvent(eventName: string, metadata?: Record<string, any>) {
    try {
      // Opt-in DB tracking if table is created later
      const { error } = await supabase
        .from('analytics_events' as any)
        .insert({
          event_type: eventName,
          metadata: metadata || {}
        });
        
      if (error && error.code !== '42P01') { 
        // 42P01 is relation does not exist
        console.warn('Analytics DB Error:', error.message);
      }
    } catch (e) {
      // Ignore errors so analytics don't break the app
    }
  }
};
