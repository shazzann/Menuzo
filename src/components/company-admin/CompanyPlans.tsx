import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Star, CreditCard, Pencil, Loader2, RefreshCw, Plus,
  Tag, Megaphone, Percent, Calendar, Gift, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { PricingService, type PricingPlan } from '@/services/pricing.service';
import { BillingService } from '@/services/billing.service';
import { companyBillingError } from '@/services/company-billing.service';
import type { PaidPlanSlug, PlanPrice } from '@/types/billing';

const PRICE_PERIODS = [
  { id: 'monthly', label: 'Monthly', suffix: '/month' },
  { id: 'yearly', label: 'Yearly', suffix: '/year' },
] as const;
type PeriodId = typeof PRICE_PERIODS[number]['id'];

const isPaidPlan = (id: string): id is PaidPlanSlug => id === 'plus' || id === 'enterprise';
const formatPrice = (amount: number, currency: string) =>
  `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export function CompanyPlans() {
  // Plan copy (description, features) stays in code; prices live in the plan_prices table.
  const [plans] = useState<PricingPlan[]>(() =>
    PricingService.getPlans().map(plan => (plan.id === 'pro' ? { ...plan, id: 'plus' } : plan)));
  const [prices, setPrices] = useState<PlanPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<PaidPlanSlug | null>(null);
  const [draft, setDraft] = useState<Record<PeriodId, string>>({ monthly: '', yearly: '' });
  const [saving, setSaving] = useState(false);

  const loadPrices = useCallback(async () => {
    setLoading(true);
    try {
      setPrices(await BillingService.getPlanPrices());
      setLoadError('');
    } catch (error) {
      setLoadError(companyBillingError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) return loadPrices(); });
    return () => { cancelled = true; };
  }, [loadPrices]);

  const priceOf = (plan: PaidPlanSlug, period: PeriodId) =>
    prices.find(p => p.plan_slug === plan && p.period_id === period);

  const handleEdit = (plan: PaidPlanSlug) => {
    setEditingPlanId(plan);
    setDraft({
      monthly: String(priceOf(plan, 'monthly')?.amount ?? ''),
      yearly: String(priceOf(plan, 'yearly')?.amount ?? ''),
    });
  };

  const handleSave = async (plan: PaidPlanSlug) => {
    const changes: { period: PeriodId; amount: number }[] = [];
    for (const { id, label } of PRICE_PERIODS) {
      const amount = Number(draft[id].replace(/,/g, '').trim());
      if (!Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== amount * 100) {
        toast.error(`Enter a ${label.toLowerCase()} price above zero with at most two decimals.`);
        return;
      }
      if (amount !== Number(priceOf(plan, id)?.amount)) changes.push({ period: id, amount });
    }
    if (!changes.length) { setEditingPlanId(null); return; }
    setSaving(true);
    try {
      const saved = await Promise.all(changes.map(c => BillingService.setPlanPrice(plan, c.period, c.amount)));
      setPrices(current => current.map(p =>
        saved.find(s => s.plan_slug === p.plan_slug && s.period_id === p.period_id) ?? p));
      setEditingPlanId(null);
      toast.success(`${plan === 'plus' ? 'Plus' : 'Enterprise'} prices updated. New checkouts use them right away.`);
    } catch (error) {
      toast.error(companyBillingError(error));
      void loadPrices();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingPlanId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">These prices are what the landing page shows and checkout charges.</p>
        </div>
        <button
          onClick={() => void loadPrices()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{loadError}</p>
      )}

      {/* Plan Cards - Admin Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col h-full bg-card/80 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              plan.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/30'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                {plan.badge}
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.popular ? 'from-primary to-orange-600' : 'from-slate-500 to-slate-700'} flex items-center justify-center text-white shadow-lg`}>
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              {isPaidPlan(plan.id) && (editingPlanId === plan.id ? (
                <div className="flex gap-1">
                  <button onClick={() => void handleSave(plan.id as PaidPlanSlug)} disabled={saving} aria-label={`Save ${plan.name} prices`} className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-50">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={handleCancel} disabled={saving} aria-label="Cancel editing" className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEdit(plan.id as PaidPlanSlug)} disabled={loading || !!loadError} aria-label={`Edit ${plan.name} prices`} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground transition-colors disabled:opacity-40">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              {!isPaidPlan(plan.id) ? (
                <>
                  <span className="text-3xl font-bold tracking-tight">LKR 0</span>
                  <p className="text-xs text-muted-foreground">Always free, so there is no price to set.</p>
                </>
              ) : loading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading prices…</p>
              ) : (
                PRICE_PERIODS.map(period => {
                  const price = priceOf(plan.id as PaidPlanSlug, period.id);
                  return (
                    <div key={period.id} className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-16">{period.label}</span>
                      {editingPlanId === plan.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">{price?.currency ?? 'LKR'}</span>
                          <Input
                            inputMode="decimal"
                            aria-label={`${plan.name} ${period.label.toLowerCase()} price`}
                            value={draft[period.id]}
                            onChange={(e) => setDraft(d => ({ ...d, [period.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void handleSave(plan.id as PaidPlanSlug);
                              if (e.key === 'Escape') handleCancel();
                            }}
                            className="h-9 w-32 px-2 text-right font-semibold"
                            autoFocus={period.id === 'monthly'}
                            disabled={saving}
                          />
                        </div>
                      ) : (
                        <span className="text-xl font-bold tracking-tight">
                          {price ? formatPrice(Number(price.amount), price.currency) : 'Not set'}
                          <span className="ml-1 text-xs font-medium text-muted-foreground">{period.suffix}</span>
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              {plan.description}
            </p>

            <div className="space-y-2 mb-5">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
              {plan.notIncluded?.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground/50">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-border/50">
              {isPaidPlan(plan.id) ? (
                <button
                  onClick={() => (editingPlanId === plan.id ? void handleSave(plan.id as PaidPlanSlug) : handleEdit(plan.id as PaidPlanSlug))}
                  disabled={loading || !!loadError || saving}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {editingPlanId === plan.id
                    ? <><Save className="w-3.5 h-3.5" /> Save Prices</>
                    : <><Pencil className="w-3.5 h-3.5" /> Edit Prices</>}
                </button>
              ) : (
                <p className="text-center text-xs text-muted-foreground py-2">Free plan has no price to edit.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Coupons & Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Coupons */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold">Active Coupons</h3>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {[
              { code: 'WELCOME20', discount: '20%', type: 'Percentage', uses: 145, maxUses: 500, expires: '2026-08-01' },
              { code: 'PROMONTH', discount: '$5', type: 'Fixed', uses: 89, maxUses: 200, expires: '2026-07-31' },
              { code: 'ANNUAL50', discount: '50%', type: 'Percentage', uses: 34, maxUses: 100, expires: '2026-12-31' },
            ].map((coupon) => (
              <div key={coupon.code} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-mono font-bold">{coupon.code}</p>
                    <p className="text-xs text-muted-foreground">{coupon.discount} off • {coupon.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{coupon.uses}/{coupon.maxUses}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {coupon.expires}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotions */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-violet-500" />
              <h3 className="text-lg font-semibold">Active Promotions</h3>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Summer Sale', status: 'Active', reach: '2,450 shops', startDate: '2026-06-01', endDate: '2026-08-31' },
              { name: 'Referral Program', status: 'Active', reach: '1,890 shops', startDate: '2026-01-01', endDate: '2026-12-31' },
              { name: 'New Year Offer', status: 'Scheduled', reach: 'All shops', startDate: '2026-12-25', endDate: '2027-01-05' },
            ].map((promo) => (
              <div key={promo.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{promo.name}</p>
                    <p className="text-xs text-muted-foreground">{promo.reach}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    promo.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {promo.status}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">{promo.startDate} → {promo.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
