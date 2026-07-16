export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  // Production analytics integration (PostHog/GA) goes here
  console.log(`[Analytics] ${eventName}`, props);
  
  // Example PostHog integration:
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(eventName, props);
  }
};
