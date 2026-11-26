import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Store, TicketPercent, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PromoCodeService, promoCodeError, promoCodeStatus } from '@/services/promo-code.service';
import { endOfSriLankaDay, sriLankaDateInput, startOfSriLankaDay } from '@/lib/billing';
import { PROMO_PLANS, type AdminPromoCode, type PromoCodeStatus, type PromoCodeUsage, type PromoPlan } from '@/types/promo-codes';

const inputClass = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm';
const planLabel: Record<PromoPlan, string> = { plus: 'Plus', pro: 'Pro', enterprise: 'Enterprise' };
const day = (value: string) => new Date(value).toLocaleDateString('en-US', { timeZone: 'Asia/Colombo', year: 'numeric', month: 'short', day: 'numeric' });
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString() : '—';

const statusStyle: Record<PromoCodeStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600',
  scheduled: 'bg-sky-500/10 text-sky-600',
  exhausted: 'bg-amber-500/10 text-amber-600',
  expired: 'bg-muted text-muted-foreground',
  inactive: 'bg-muted text-muted-foreground',
};
function StatusBadge({ value }: { value: PromoCodeStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[value]}`}>{value}</span>;
}

type FormState = {
  code: string; description: string; discount: string; plans: PromoPlan[];
  maxRedemptions: string; validFrom: string; validUntil: string; isActive: boolean;
};

function emptyForm(now: number): FormState {
  return {
    code: '', description: '', discount: '10', plans: [...PROMO_PLANS], maxRedemptions: '100',
    validFrom: sriLankaDateInput(now), validUntil: sriLankaDateInput(now + 30 * 86_400_000), isActive: true,
  };
}
function formFrom(code: AdminPromoCode): FormState {
  return {
    code: code.code, description: code.description, discount: String(code.discount_percent),
    plans: [...code.applicable_plans], maxRedemptions: String(code.max_redemptions),
    validFrom: sriLankaDateInput(code.valid_from), validUntil: sriLankaDateInput(code.valid_until), isActive: code.is_active,
  };
}
function validate(form: FormState, minRedemptions: number): string {
  if (!/^[A-Z0-9_-]{3,32}$/.test(form.code.trim().toUpperCase())) return 'Code must be 3-32 characters: letters, numbers, - or _.';
  const discount = Number(form.discount);
  if (!Number.isFinite(discount) || discount <= 0 || discount > 100) return 'Discount must be more than 0% and at most 100%.';
  if (!/^\d+(\.\d{1,2})?$/.test(form.discount.trim())) return 'Use at most two decimal places for the discount.';
  if (form.plans.length === 0) return 'Choose at least one plan.';
  const max = Number(form.maxRedemptions);
  if (!Number.isInteger(max) || max < 1) return 'Usage limit must be a whole number of at least 1.';
  if (max < minRedemptions) return `This code is already used by ${minRedemptions} shops. Set the limit to at least ${minRedemptions}.`;
  if (!form.validFrom || !form.validUntil) return 'Choose a start and end date.';
  if (form.validUntil < form.validFrom) return 'The end date must be on or after the start date.';
  return '';
}

export function CompanyPromoCodes() {
  const [codes, setCodes] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | PromoCodeStatus>('all');
  const [now, setNow] = useState(() => Date.now());

  const [editing, setEditing] = useState<AdminPromoCode | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(Date.now()));
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<AdminPromoCode | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const [usageFor, setUsageFor] = useState<AdminPromoCode | null>(null);
  const [usage, setUsage] = useState<PromoCodeUsage[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError('');
      try {
        const data = await PromoCodeService.list();
        if (!cancelled) { setCodes(data); setNow(Date.now()); }
      } catch (err) {
        if (!cancelled) setError(promoCodeError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [version]);

  useEffect(() => {
    if (!usageFor) return;
    let cancelled = false;
    (async () => {
      setUsageLoading(true); setUsageError(''); setUsage([]);
      try {
        const data = await PromoCodeService.usage(usageFor.id);
        if (!cancelled) setUsage(data);
      } catch (err) {
        if (!cancelled) setUsageError(promoCodeError(err));
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [usageFor]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return codes.filter(code =>
      (filter === 'all' || promoCodeStatus(code, now) === filter)
      && (!q || code.code.toLowerCase().includes(q) || code.description.toLowerCase().includes(q)
        || (code.created_by_email || '').toLowerCase().includes(q)));
  }, [codes, query, filter, now]);

  const stats = useMemo(() => ({
    total: codes.length,
    active: codes.filter(c => promoCodeStatus(c, now) === 'active').length,
    shops: codes.reduce((sum, c) => sum + c.redemption_count, 0),
  }), [codes, now]);

  const openCreate = () => { setForm(emptyForm(Date.now())); setFormError(''); setEditing('new'); };
  const openEdit = (code: AdminPromoCode) => { setForm(formFrom(code)); setFormError(''); setEditing(code); };
  const togglePlan = (plan: PromoPlan) => setForm(f => ({
    ...f, plans: f.plans.includes(plan) ? f.plans.filter(p => p !== plan) : PROMO_PLANS.filter(p => p === plan || f.plans.includes(p)),
  }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || busy) return;
    const message = validate(form, editing === 'new' ? 0 : editing.redemption_count);
    if (message) { setFormError(message); return; }
    setBusy(true); setFormError('');
    const input = {
      code: form.code, description: form.description, discount_percent: Number(form.discount),
      applicable_plans: form.plans, max_redemptions: Number(form.maxRedemptions),
      valid_from: startOfSriLankaDay(form.validFrom), valid_until: endOfSriLankaDay(form.validUntil), is_active: form.isActive,
    };
    try {
      if (editing === 'new') await PromoCodeService.create(input);
      else await PromoCodeService.update(editing.id, input);
      toast.success(editing === 'new' ? `Promo code ${input.code.trim().toUpperCase()} created.` : 'Promo code updated.');
      setEditing(null); setVersion(v => v + 1);
    } catch (err) { setFormError(promoCodeError(err)); }
    finally { setBusy(false); }
  };

  const toggleActive = async (code: AdminPromoCode) => {
    if (toggling) return;
    setToggling(code.id);
    try {
      await PromoCodeService.setActive(code.id, !code.is_active);
      setCodes(list => list.map(c => c.id === code.id ? { ...c, is_active: !code.is_active } : c));
      toast.success(`${code.code} ${code.is_active ? 'deactivated' : 'activated'}.`);
    } catch (err) { toast.error(promoCodeError(err)); }
    finally { setToggling(null); }
  };

  const confirmDelete = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await PromoCodeService.remove(deleting.id);
      toast.success(`${deleting.code} deleted.`);
      setDeleting(null); setVersion(v => v + 1);
    } catch (err) { toast.error(promoCodeError(err)); }
    finally { setBusy(false); }
  };

  const editingUsed = editing && editing !== 'new' ? editing.redemption_count : 0;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><TicketPercent className="h-6 w-6" />Promo Codes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create percentage discounts on paid plans for shop owners, and see which shops use each code.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setVersion(v => v + 1)} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New promo code</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[['Promo codes', stats.total], ['Active now', stats.active], ['Shop redemptions', stats.shops]].map(([label, value]) =>
        <div key={label} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div>)}
    </div>

    <div className="flex flex-wrap gap-3">
      <label className="relative flex-1 min-w-52"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input aria-label="Search promo codes" className={`${inputClass} pl-9`} placeholder="Code, description, or creator email" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <select aria-label="Promo code status" className={`${inputClass} w-auto`} value={filter} onChange={e => setFilter(e.target.value as typeof filter)}>
        <option value="all">All statuses</option><option value="active">Active</option><option value="scheduled">Scheduled</option>
        <option value="exhausted">Limit reached</option><option value="expired">Expired</option><option value="inactive">Inactive</option>
      </select>
    </div>

    {error ? <div role="alert" className="rounded-xl border border-destructive/30 p-5 text-destructive">{error} <Button variant="outline" onClick={() => setVersion(v => v + 1)}>Retry</Button></div>
      : loading ? <p role="status" className="p-10 text-center text-muted-foreground">Loading promo codes…</p>
      : visible.length === 0 ? <div className="rounded-2xl border border-dashed p-12 text-center">
        <h2 className="font-semibold">{codes.length ? 'No matching promo codes' : 'No promo codes yet'}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{codes.length ? 'Try another search or status.' : 'Create a code to offer shop owners a discount on Plus, Pro or Enterprise.'}</p>
        {!codes.length && <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New promo code</Button>}
      </div>
      : <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-muted-foreground"><tr>
          <th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Plans</th><th className="p-4">Usage</th>
          <th className="p-4">Valid</th><th className="p-4">Created by</th><th className="p-4">Active</th><th className="p-4">Actions</th>
        </tr></thead>
        <tbody>{visible.map(code => {
          const status = promoCodeStatus(code, now);
          return <tr key={code.id} className="border-t border-border align-top">
            <td className="p-4"><p className="font-mono font-semibold">{code.code}</p>{code.description && <p className="mt-0.5 max-w-56 text-xs text-muted-foreground">{code.description}</p>}<div className="mt-1.5"><StatusBadge value={status} /></div></td>
            <td className="p-4 font-semibold tabular-nums">{Number(code.discount_percent)}%</td>
            <td className="p-4"><div className="flex flex-wrap gap-1">{code.applicable_plans.map(p => <span key={p} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">{planLabel[p]}</span>)}</div></td>
            <td className="p-4 whitespace-nowrap"><p className="tabular-nums">{code.redemption_count} / {code.max_redemptions}</p>
              <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (code.redemption_count / code.max_redemptions) * 100)}%` }} /></div></td>
            <td className="p-4 whitespace-nowrap text-xs"><p>{day(code.valid_from)}</p><p className="text-muted-foreground">to {day(code.valid_until)}</p></td>
            <td className="p-4 text-xs"><p className="break-all">{code.created_by_email || 'Unknown'}</p><p className="text-muted-foreground">{day(code.created_at)}</p></td>
            <td className="p-4"><Switch checked={code.is_active} disabled={toggling === code.id} aria-label={`${code.is_active ? 'Deactivate' : 'Activate'} ${code.code}`} onCheckedChange={() => void toggleActive(code)} /></td>
            <td className="p-4"><div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setUsageFor(code)}><Store className="mr-1.5 h-3.5 w-3.5" />Shops</Button>
              <Button size="sm" variant="outline" aria-label={`Edit ${code.code}`} onClick={() => openEdit(code)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" aria-label={`Delete ${code.code}`}
                disabled={code.redemption_count > 0} title={code.redemption_count > 0 ? 'Shops are using this code. Deactivate it instead.' : undefined}
                onClick={() => setDeleting(code)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div></td>
          </tr>;
        })}</tbody>
      </table></div>}

    <Dialog open={!!editing} onOpenChange={open => { if (!open && !busy) setEditing(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>{editing === 'new' ? 'New promo code' : 'Edit promo code'}</DialogTitle>
        <DialogDescription>{editing && editing !== 'new' ? `Created by ${editing.created_by_email || 'an unknown admin'} · used by ${editing.redemption_count} shops` : 'Shop owners enter this code to get a discount on the selected plans.'}</DialogDescription></DialogHeader>
      {editing && <form className="space-y-4" onSubmit={submit} noValidate>
        <label className="block text-sm font-medium">Code<input className={`${inputClass} mt-1 font-mono uppercase`} value={form.code} disabled={busy} maxLength={32} placeholder="LAUNCH20" required
          onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))} /></label>
        <label className="block text-sm font-medium">Description (optional)<textarea className={`${inputClass} mt-1`} rows={2} maxLength={500} value={form.description} disabled={busy}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Internal note, e.g. launch campaign" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">Discount (%)<input type="number" inputMode="decimal" min={0.01} max={100} step={0.01} className={`${inputClass} mt-1`} value={form.discount} disabled={busy} required
            onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></label>
          <label className="block text-sm font-medium">Usage limit (shops)<input type="number" inputMode="numeric" min={Math.max(1, editingUsed)} step={1} className={`${inputClass} mt-1`} value={form.maxRedemptions} disabled={busy} required
            onChange={e => setForm(f => ({ ...f, maxRedemptions: e.target.value }))} /></label>
        </div>
        <fieldset><legend className="text-sm font-medium">Applies to plans</legend>
          <div className="mt-2 flex flex-wrap gap-2">{PROMO_PLANS.map(plan => <label key={plan} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${form.plans.includes(plan) ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <input type="checkbox" checked={form.plans.includes(plan)} disabled={busy} onChange={() => togglePlan(plan)} />{planLabel[plan]}</label>)}</div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">Starts<input type="date" className={`${inputClass} mt-1`} value={form.validFrom} disabled={busy} required
            onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} /></label>
          <label className="block text-sm font-medium">Ends<input type="date" className={`${inputClass} mt-1`} value={form.validUntil} min={form.validFrom} disabled={busy} required
            onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} /></label>
        </div>
        <p className="text-xs text-muted-foreground">Valid from 12:00 AM on the start date to 11:59 PM on the end date (Sri Lanka time).</p>
        <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"><span><span className="font-medium">Active</span><span className="block text-xs text-muted-foreground">Inactive codes cannot be redeemed. Shops that already used it keep their discount.</span></span>
          <Switch checked={form.isActive} disabled={busy} onCheckedChange={checked => setForm(f => ({ ...f, isActive: checked }))} /></label>
        {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Saving…' : editing === 'new' ? 'Create promo code' : 'Save changes'}</Button>
      </form>}
    </DialogContent></Dialog>

    <Dialog open={!!deleting} onOpenChange={open => { if (!open && !busy) setDeleting(null); }}><DialogContent>
      <DialogHeader><DialogTitle>Delete promo code</DialogTitle><DialogDescription>{deleting?.code}</DialogDescription></DialogHeader>
      <p className="text-sm">This permanently deletes the code. No shop has used it yet. To stop new redemptions but keep the history, deactivate it instead.</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button>
        <Button variant="destructive" disabled={busy} onClick={() => void confirmDelete()}>{busy ? 'Deleting…' : 'Delete'}</Button>
      </div>
    </DialogContent></Dialog>

    <Dialog open={!!usageFor} onOpenChange={open => { if (!open) setUsageFor(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader><DialogTitle>Shops using {usageFor?.code}</DialogTitle>
        <DialogDescription>{usageFor ? `${usageFor.redemption_count} of ${usageFor.max_redemptions} redemptions used` : ''}</DialogDescription></DialogHeader>
      {usageError ? <p role="alert" className="text-sm text-destructive">{usageError}</p>
        : usageLoading ? <p role="status" className="p-6 text-center text-sm text-muted-foreground">Loading shops…</p>
        : usage.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No shop has used this code yet.</p>
        : <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground"><tr><th className="p-3">Shop / owner</th><th className="p-3">Plan</th><th className="p-3">Discount</th><th className="p-3">Redeemed</th><th className="p-3">Current subscription</th></tr></thead>
          <tbody>{usage.map(row => <tr key={row.redemption_id} className="border-t border-border">
            <td className="p-3"><p className="font-medium">{row.shop_name || 'Unnamed shop'}</p><p className="text-xs text-muted-foreground">{row.owner_email || '—'}</p></td>
            <td className="p-3">{planLabel[row.plan]}</td>
            <td className="p-3 tabular-nums">{Number(row.discount_percent)}%</td>
            <td className="p-3 whitespace-nowrap text-xs">{dateTime(row.redeemed_at)}</td>
            <td className="p-3 text-xs"><p className="capitalize">{row.subscription_plan || 'free'} · {row.subscription_status || '—'}</p>{row.subscription_expires_at && <p className="text-muted-foreground">until {dateTime(row.subscription_expires_at)}</p>}</td>
          </tr>)}</tbody>
        </table></div>}
    </DialogContent></Dialog>
  </div>;
}
