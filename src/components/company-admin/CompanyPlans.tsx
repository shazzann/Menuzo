import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2, XCircle, Star, CreditCard, Pencil, Loader2, RefreshCw, Plus, Store, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlansService } from '@/services/plans.service';
import { companyBillingError } from '@/services/company-billing.service';
import { loadPlanCatalog } from '@/lib/plan-catalog';
import { PLAN_FEATURE_LABELS, type PlanFeatureKey } from '@/lib/subscription';
import type { AdminPlan, AdminPlanInput } from '@/types/plans';

const inputClass = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm disabled:opacity-60';
const FEATURE_KEYS = Object.keys(PLAN_FEATURE_LABELS) as PlanFeatureKey[];

const formatPrice = (amount: number, currency: string) =>
  `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

// Plan IDs are permanent: shops and payments refer to them.
const slugFromName = (name: string) => name.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/^[^a-z]+/, '').slice(0, 32).replace(/-+$/, '');

type PlanForm = {
  slug: string;
  name: string;
  description: string;
  badge: string;
  monthly: string;
  yearly: string;
  maxItems: string;
  maxCategories: string;
  sortOrder: string;
  highlights: string;
  excluded: string;
  isPopular: boolean;
  isPublic: boolean;
  isActive: boolean;
  features: Record<PlanFeatureKey, boolean>;
};

const emptyForm = (sortOrder: number): PlanForm => ({
  slug: '', name: '', description: '', badge: '', monthly: '', yearly: '',
  maxItems: '100', maxCategories: '20', sortOrder: String(sortOrder), highlights: '', excluded: '',
  isPopular: false, isPublic: true, isActive: true,
  features: Object.fromEntries(FEATURE_KEYS.map(key => [key, false])) as Record<PlanFeatureKey, boolean>,
});

const formFromPlan = (plan: AdminPlan): PlanForm => ({
  slug: plan.slug,
  name: plan.name,
  description: plan.description,
  badge: plan.badge ?? '',
  monthly: plan.prices.monthly ? String(plan.prices.monthly.amount) : '',
  yearly: plan.prices.yearly ? String(plan.prices.yearly.amount) : '',
  maxItems: String(plan.max_items),
  maxCategories: String(plan.max_categories),
  sortOrder: String(plan.sort_order),
  highlights: plan.highlights.join('\n'),
  excluded: plan.excluded.join('\n'),
  isPopular: plan.is_popular,
  isPublic: plan.is_public,
  isActive: plan.is_active,
  features: { ...plan.features },
});

const lines = (text: string) => text.split('\n').map(line => line.trim()).filter(Boolean);
const wholeNumber = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : NaN);
const money = (text: string) => {
  const value = text.replace(/,/g, '').trim();
  return /^\d+(\.\d{1,2})?$/.test(value) ? Number(value) : NaN;
};

/** Checks the form the same way admin_save_plan does, so most mistakes show before saving. */
function toInput(form: PlanForm, creating: boolean): AdminPlanInput | string {
  const isFree = form.slug === 'free';
  if (creating && !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(form.slug)) return 'Use a plan ID of lowercase letters, numbers and single hyphens, starting with a letter.';
  if (creating && (form.slug.length < 2 || form.slug.length > 32)) return 'The plan ID must be 2-32 characters.';
  if (!form.name.trim() || form.name.trim().length > 60) return 'Enter a plan name of 1-60 characters.';
  const maxItems = wholeNumber(form.maxItems);
  const maxCategories = wholeNumber(form.maxCategories);
  const sortOrder = wholeNumber(form.sortOrder);
  if (!(maxItems >= 1 && maxItems <= 100000)) return 'Set a food item limit between 1 and 100,000.';
  if (!(maxCategories >= 1 && maxCategories <= 1000)) return 'Set a category limit between 1 and 1,000.';
  if (!(sortOrder >= 0 && sortOrder <= 10000)) return 'Set a display order between 0 and 10,000.';
  const highlights = lines(form.highlights);
  const excluded = lines(form.excluded);
  if (highlights.length > 30 || excluded.length > 30 || [...highlights, ...excluded].some(line => line.length > 120)) {
    return 'Keep each feature list to 30 lines of up to 120 characters.';
  }
  const input: AdminPlanInput = {
    slug: form.slug,
    name: form.name.trim(),
    description: form.description.trim(),
    highlights,
    excluded,
    badge: form.badge.trim() || null,
    is_popular: form.isPopular,
    is_public: form.isPublic,
    is_active: isFree || form.isActive,
    sort_order: sortOrder,
    max_items: maxItems,
    max_categories: maxCategories,
    features: form.features,
  };
  if (!isFree) {
    const monthly = money(form.monthly);
    const yearly = money(form.yearly);
    if (!(monthly > 0) || !(yearly > 0)) return 'Enter a monthly and a yearly price above zero, with at most two decimals.';
    input.prices = { monthly, yearly };
  }
  return input;
}

export function CompanyPlans() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<AdminPlan | 'new' | null>(null);
  const [form, setForm] = useState<PlanForm>(() => emptyForm(30));
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await PlansService.adminList());
      setLoadError('');
    } catch (error) {
      setLoadError(companyBillingError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) return loadPlans(); });
    return () => { cancelled = true; };
  }, [loadPlans]);

  const creating = editing === 'new';
  const editingPlan = editing && editing !== 'new' ? editing : null;
  const isFreeForm = form.slug === 'free';

  const openCreate = () => {
    const nextOrder = plans.reduce((max, plan) => Math.max(max, plan.sort_order), 0) + 10;
    setForm(emptyForm(nextOrder));
    setSlugTouched(false);
    setFormError('');
    setEditing('new');
  };

  const openEdit = (plan: AdminPlan) => {
    setForm(formFromPlan(plan));
    setSlugTouched(true);
    setFormError('');
    setEditing(plan);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = toInput(form, creating);
    if (typeof input === 'string') { setFormError(input); return; }
    setBusy(true);
    setFormError('');
    try {
      const saved = await PlansService.adminSave(input, creating);
      setPlans(current => {
        const rest = current.filter(plan => plan.slug !== saved.slug);
        return [...rest, saved].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      });
      void loadPlanCatalog();
      toast.success(creating ? `${saved.name} plan created.` : `${saved.name} plan updated.`);
      setEditing(null);
    } catch (error) {
      setFormError(companyBillingError(error));
    } finally {
      setBusy(false);
    }
  };

  const setFeature = (key: PlanFeatureKey, value: boolean) =>
    setForm(f => ({ ...f, features: { ...f.features, [key]: value } }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Limits, features and prices here are what shops get and what checkout charges.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadPlans()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreate}
            disabled={loading || !!loadError}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{loadError}</p>
      )}

      {loading && !plans.length ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading plans…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isFree = plan.slug === 'free';
            return (
              <div
                key={plan.slug}
                className={`relative flex flex-col h-full bg-card/80 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl ${
                  plan.is_popular ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/30'
                } ${plan.is_active ? '' : 'opacity-75'}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    {plan.badge}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.is_popular ? 'from-primary to-orange-600' : 'from-slate-500 to-slate-700'} flex items-center justify-center text-white shadow-lg`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {!plan.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Retired</span>}
                    {!plan.is_public && <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"><EyeOff className="w-3 h-3" /> Hidden</span>}
                    {!isFree && <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600"><Store className="w-3 h-3" /> {plan.active_shops} active</span>}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <button onClick={() => openEdit(plan)} aria-label={`Edit ${plan.name}`} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="mb-3 font-mono text-[11px] text-muted-foreground">{plan.slug}</p>

                <div className="space-y-1.5 mb-4">
                  {isFree ? (
                    <span className="text-2xl font-bold tracking-tight">LKR 0</span>
                  ) : (['monthly', 'yearly'] as const).map(period => (
                    <div key={period} className="flex items-baseline justify-between gap-3">
                      <span className="text-xs font-medium text-muted-foreground capitalize">{period}</span>
                      <span className="text-lg font-bold tracking-tight">
                        {plan.prices[period] ? formatPrice(Number(plan.prices[period].amount), plan.prices[period].currency) : 'Not set'}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">{plan.max_items} food items · {plan.max_categories} categories</p>
                </div>

                {plan.description && <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>}

                <div className="space-y-1.5 mb-5 flex-grow">
                  {FEATURE_KEYS.map(key => (
                    <div key={key} className={`flex items-center gap-2 text-sm ${plan.features[key] ? '' : 'text-muted-foreground/50'}`}>
                      {plan.features[key]
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <XCircle className="w-4 h-4 shrink-0" />}
                      <span>{PLAN_FEATURE_LABELS[key]}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border/50">
                  <button
                    onClick={() => openEdit(plan)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit Plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={open => { if (!open && !busy) setEditing(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{creating ? 'Create plan' : `Edit ${editingPlan?.name ?? 'plan'}`}</DialogTitle>
            <DialogDescription>
              {creating
                ? 'New plans appear on the pricing pages and at checkout as soon as they are saved, if they are shown and available to buy.'
                : isFreeForm
                  ? 'Free is what every unpaid shop gets. Changing its limits affects every Free shop.'
                  : `${editingPlan?.active_shops ?? 0} shops are on this plan now. Changes to limits and features apply to them immediately.`}
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <form className="space-y-5" onSubmit={submit} noValidate>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">Plan name
                  <input className={`${inputClass} mt-1`} value={form.name} maxLength={60} disabled={busy} required placeholder="e.g. Business"
                    onChange={e => {
                      const name = e.target.value;
                      setForm(f => ({ ...f, name, slug: creating && !slugTouched ? slugFromName(name) : f.slug }));
                    }} />
                </label>
                <label className="block text-sm font-medium">Plan ID
                  <input className={`${inputClass} mt-1 font-mono`} value={form.slug} maxLength={32} disabled={busy || !creating} required placeholder="business"
                    onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })); }} />
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">{creating ? 'Permanent. Lowercase letters, numbers and hyphens.' : 'A plan ID cannot be changed.'}</span>
                </label>
              </div>

              <label className="block text-sm font-medium">Description
                <textarea className={`${inputClass} mt-1`} rows={2} maxLength={500} value={form.description} disabled={busy}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Who this plan is for" />
              </label>

              {!isFreeForm && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">Monthly price (LKR)
                    <input inputMode="decimal" className={`${inputClass} mt-1`} value={form.monthly} disabled={busy} required placeholder="3500"
                      onChange={e => setForm(f => ({ ...f, monthly: e.target.value }))} />
                  </label>
                  <label className="block text-sm font-medium">Yearly price (LKR)
                    <input inputMode="decimal" className={`${inputClass} mt-1`} value={form.yearly} disabled={busy} required placeholder="33600"
                      onChange={e => setForm(f => ({ ...f, yearly: e.target.value }))} />
                  </label>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-sm font-medium">Food item limit
                  <input inputMode="numeric" className={`${inputClass} mt-1`} value={form.maxItems} disabled={busy} required
                    onChange={e => setForm(f => ({ ...f, maxItems: e.target.value }))} />
                </label>
                <label className="block text-sm font-medium">Category limit
                  <input inputMode="numeric" className={`${inputClass} mt-1`} value={form.maxCategories} disabled={busy} required
                    onChange={e => setForm(f => ({ ...f, maxCategories: e.target.value }))} />
                </label>
                <label className="block text-sm font-medium">Display order
                  <input inputMode="numeric" className={`${inputClass} mt-1`} value={form.sortOrder} disabled={busy} required
                    onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">Lower shows first.</span>
                </label>
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Features this plan unlocks</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {FEATURE_KEYS.map(key => (
                    <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${form.features[key] ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <input type="checkbox" checked={form.features[key]} disabled={busy} onChange={e => setFeature(key, e.target.checked)} />
                      {PLAN_FEATURE_LABELS[key]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">Listed features (one per line)
                  <textarea className={`${inputClass} mt-1`} rows={6} value={form.highlights} disabled={busy}
                    onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} placeholder={'250 Food Items\nCustom Themes'} />
                </label>
                <label className="block text-sm font-medium">Not included (one per line)
                  <textarea className={`${inputClass} mt-1`} rows={6} value={form.excluded} disabled={busy}
                    onChange={e => setForm(f => ({ ...f, excluded: e.target.value }))} placeholder="Priority Support" />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">Badge (optional)
                  <input className={`${inputClass} mt-1`} value={form.badge} maxLength={30} disabled={busy} placeholder="e.g. Best value"
                    onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
                  <span><span className="font-medium">Highlight as popular</span><span className="block text-xs text-muted-foreground">Emphasised on the pricing page.</span></span>
                  <Switch checked={form.isPopular} disabled={busy} onCheckedChange={checked => setForm(f => ({ ...f, isPopular: checked }))} />
                </label>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
                <span><span className="font-medium">Shown on pricing pages</span><span className="block text-xs text-muted-foreground">Hidden plans can still be bought from checkout if they are available.</span></span>
                <Switch checked={form.isPublic} disabled={busy} onCheckedChange={checked => setForm(f => ({ ...f, isPublic: checked }))} />
              </label>
              {!isFreeForm && (
                <label className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
                  <span><span className="font-medium">Available to buy</span><span className="block text-xs text-muted-foreground">Turn off to retire the plan. Shops already on it keep its limits and features until they expire.</span></span>
                  <Switch checked={form.isActive} disabled={busy} onCheckedChange={checked => setForm(f => ({ ...f, isActive: checked }))} />
                </label>
              )}
              {!creating && editingPlan && editingPlan.is_active && !form.isActive && editingPlan.active_shops > 0 && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  {editingPlan.active_shops} shops are on this plan. They keep it until it expires, but cannot renew it.
                </p>
              )}

              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Saving…' : creating ? 'Create plan' : 'Save changes'}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
