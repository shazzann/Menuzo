import { AlertTriangle, Clock, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { FREE_PLAN_LIMITS, subscriptionPhase } from '@/lib/subscription';
import { cn } from '@/lib/utils';

const day = (date: Date) => date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// In-app notice before Pro ends, during the grace period, and while items are hidden.
export function PlanStatusBanner({ className }: { className?: string }) {
  const { state, dispatch } = useApp();
  const plan = subscriptionPhase(state.user?.subscription);
  const hidden = state.planHiddenItemIds.length;
  const openSubscription = () => dispatch({ type: 'SET_VIEW', payload: 'admin-subscription' });

  let tone: 'warning' | 'info';
  let Icon = Clock;
  let title: string;
  let body: string;
  let action: string;

  if (plan.phase === 'ending-soon') {
    tone = 'warning';
    title = `Your Pro plan ends on ${day(plan.endsAt)}`;
    body = `Renew to keep your full menu visible. On the Free plan, customers see up to ${FREE_PLAN_LIMITS.items} items in ${FREE_PLAN_LIMITS.categories} categories.`;
    action = 'Renew';
  } else if (plan.phase === 'grace') {
    tone = 'warning';
    Icon = AlertTriangle;
    title = `Your Pro plan ended on ${day(plan.endedAt)}`;
    body = `All your items stay visible until ${day(plan.graceEndsAt)}. After that, customers see up to ${FREE_PLAN_LIMITS.items} items in ${FREE_PLAN_LIMITS.categories} categories.`;
    action = 'Renew now';
  } else if (plan.phase === 'free' && hidden > 0) {
    tone = 'info';
    Icon = EyeOff;
    title = `${hidden} ${hidden === 1 ? 'item is' : 'items are'} hidden from customers`;
    body = `The Free plan shows your first ${FREE_PLAN_LIMITS.categories} categories and up to ${FREE_PLAN_LIMITS.items} items. Reorder categories to choose what shows, or upgrade to show everything.`;
    action = 'Upgrade to Pro';
  } else {
    return null;
  }

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border',
        tone === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-primary/10 border-primary/25',
        className
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', tone === 'warning' ? 'text-amber-500' : 'text-primary')} />
        <div className="min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
        </div>
      </div>
      <Button size="sm" onClick={openSubscription} className="shrink-0 self-start sm:self-auto">
        {action}
      </Button>
    </div>
  );
}
