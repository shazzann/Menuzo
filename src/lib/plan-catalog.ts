import { useEffect, useSyncExternalStore } from 'react';
import { PlansService } from '@/services/plans.service';
import {
  getPlanCatalog, getPlanCatalogVersion, setPlanCatalog, subscribePlanCatalog,
} from '@/lib/subscription';

let inFlight: Promise<void> | null = null;

/** Loads the plan catalog from the database; concurrent callers share one request. */
export function loadPlanCatalog(): Promise<void> {
  inFlight ??= PlansService.getCatalog()
    .then(plans => { if (plans.length) setPlanCatalog(plans); })
    .catch(() => {
      // Keep the built-in plans; the database still enforces the real limits.
    })
    .finally(() => { inFlight = null; });
  return inFlight;
}

/** Re-renders when the catalog changes and returns the current plans. */
export function usePlanCatalog() {
  useSyncExternalStore(subscribePlanCatalog, getPlanCatalogVersion, getPlanCatalogVersion);
  return getPlanCatalog();
}

/** Mounted once in App: loads the catalog and refreshes it when the window regains focus. */
export function PlanCatalogLoader() {
  useEffect(() => {
    void loadPlanCatalog();
    const onFocus = () => { void loadPlanCatalog(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);
  return null;
}
