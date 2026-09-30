import { useEffect, useState } from 'react';
import { RefreshCw, Search, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompanyBillingService, companyBillingError } from '@/services/company-billing.service';
import { formatPaymentAmount } from '@/lib/billing';
import type { AdminPaymentRequest, AdminShopSubscription, CompanyBillingSection } from '@/types/company-billing';

const titles = { 'payment-requests': 'Payment Requests', payments: 'Payments', subscriptions: 'Subscriptions', 'shop-urls': 'Shop URLs' };
const inputClass = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm';
const date = (value: string | null) => value ? new Date(value).toLocaleString() : '—';
function Status({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${['approved', 'active'].includes(value) ? 'bg-emerald-500/10 text-emerald-600' : value === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{value}</span>;
}

export function CompanyBilling({ section }: { section: CompanyBillingSection }) {
  const isPayments = section === 'payment-requests' || section === 'payments';
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(section === 'payments' ? 'approved' : 'pending');
  const [offset, setOffset] = useState(0);
  const [version, setVersion] = useState(0);
  const [requests, setRequests] = useState<AdminPaymentRequest[]>([]);
  const [shops, setShops] = useState<AdminShopSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AdminPaymentRequest | null>(null);
  const [editing, setEditing] = useState<AdminShopSubscription | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [reason, setReason] = useState('');
  const [slug, setSlug] = useState('');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true); setError('');
      try {
        if (isPayments) {
          const data = await CompanyBillingService.requests(status, query, offset);
          if (!cancelled) { setRequests(data.rows); setTotal(data.total); }
        } else {
          const data = await CompanyBillingService.subscriptions(query, offset);
          if (!cancelled) { setShops(data.rows); setTotal(data.total); }
        }
      } catch (err) {
        if (!cancelled) setError(companyBillingError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [isPayments, status, query, offset, version]);

  const openRequest = (request: AdminPaymentRequest) => {
    setSelected(request); setDecision('approved'); setReason('');
    setSlug(request.requested_slug || ''); setVerified(false); setActionError('');
  };
  const openShop = (shop: AdminShopSubscription) => {
    setEditing(shop); setReason(''); setSlug(shop.slug || ''); setActionError('');
  };
  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || busy) return;
    setBusy(true); setActionError('');
    try {
      await CompanyBillingService.review(selected.id, decision, reason, slug, verified);
      toast.success(decision === 'approved' ? 'Payment approved. Subscription updated.' : 'Payment rejected. The customer can see your reason.');
      setSelected(null); setVersion(v => v + 1);
    } catch (err) { setActionError(companyBillingError(err)); }
    finally { setBusy(false); }
  };
  const submitShop = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true); setActionError('');
    try {
      if (section === 'shop-urls') await CompanyBillingService.assignUrl(editing.shop_id, slug);
      else await CompanyBillingService.changeStatus(editing.shop_id, editing.subscription_status === 'cancelled' ? 'active' : 'cancelled', reason);
      toast.success(section === 'shop-urls' ? 'Shop URL updated.' : 'Subscription status updated.');
      setEditing(null); setVersion(v => v + 1);
    } catch (err) { setActionError(companyBillingError(err)); }
    finally { setBusy(false); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6" />{titles[section]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{isPayments ? 'Review bank transfers and track customer payment decisions.' : 'Manage paid access, expiry dates, and custom menu URLs.'}</p></div>
      <Button variant="outline" onClick={() => { setLoading(true); setVersion(v => v + 1); }} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
    </div>
    {!isPayments && <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm">Subscriptions belong to the owner account. Suspending or restoring access affects all shops owned by that account. Approval extends an active subscription from its existing expiry.</p>}
    <div className="flex flex-wrap gap-3">
      <label className="relative flex-1 min-w-52"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input aria-label="Search billing records" className={`${inputClass} pl-9`} placeholder={isPayments ? 'Shop, owner, transfer reference, or request ID' : 'Shop, owner, or custom URL'} value={query} onChange={e => { setLoading(true); setQuery(e.target.value); setOffset(0); }} /></label>
      {isPayments && <select aria-label="Payment status" className={`${inputClass} w-auto`} value={status} onChange={e => { setLoading(true); setStatus(e.target.value); setOffset(0); }}>
        <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All payments</option>
      </select>}
    </div>
    {error ? <div role="alert" className="rounded-xl border border-destructive/30 p-5 text-destructive">{error} <Button variant="outline" onClick={() => setVersion(v => v + 1)}>Retry</Button></div>
      : loading ? <p role="status" className="p-10 text-center text-muted-foreground">Loading billing records…</p>
      : total === 0 ? <div className="rounded-2xl border border-dashed p-12 text-center"><h2 className="font-semibold">No matching records</h2><p className="mt-2 text-sm text-muted-foreground">{isPayments ? 'Customer verification requests will appear here after submission.' : 'Try another search or add a shop first.'}</p></div>
      : <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-muted-foreground"><tr><th className="p-4">Shop / owner</th>{isPayments ? <><th className="p-4">Payment</th><th className="p-4">Transfer reference</th><th className="p-4">Status</th></> : <><th className="p-4">Subscription</th><th className="p-4">Expires</th><th className="p-4">Custom URL</th></>}<th className="p-4">Actions</th></tr></thead>
        <tbody>{isPayments ? requests.map(request => <tr key={request.id} className="border-t border-border">
          <td className="p-4"><p className="font-medium">{request.shop_name}</p><p className="text-xs text-muted-foreground">{request.owner_email}</p></td>
          <td className="p-4"><p>{formatPaymentAmount(request.amount, request.currency)}</p><p className="text-xs text-muted-foreground">{request.period_label} · {request.months} months</p></td>
          <td className="p-4 break-all">{request.transfer_reference}<p className="text-xs text-muted-foreground">{request.transferred_on}</p></td>
          <td className="p-4"><Status value={request.status} /></td><td className="p-4"><Button size="sm" variant="outline" onClick={() => openRequest(request)}>{request.status === 'pending' ? 'Review payment' : 'View details'}</Button></td>
        </tr>) : shops.map(shop => <tr key={shop.shop_id} className="border-t border-border">
          <td className="p-4"><p className="font-medium">{shop.shop_name}</p><p className="text-xs text-muted-foreground">{shop.owner_email}</p></td>
          <td className="p-4"><p className="mb-1 capitalize">{shop.subscription_plan || 'free'}</p><Status value={shop.pro_active ? 'active' : shop.subscription_status === 'cancelled' ? 'suspended' : shop.subscription_plan === 'free' || !shop.subscription_plan ? 'free' : 'expired'} /></td>
          <td className="p-4 whitespace-nowrap">{date(shop.subscription_expires_at)}</td>
          <td className="p-4">{shop.slug ? <><p className="break-all">/{shop.slug}</p>{shop.pro_active ? <a className="inline-flex items-center gap-1 text-primary" href={`/${shop.slug}`} target="_blank" rel="noreferrer">Open menu <ExternalLink className="h-3 w-3" /></a> : <p className="text-xs text-muted-foreground">Inactive until paid access is restored</p>}</> : 'Not assigned'}</td>
          <td className="p-4">{section === 'shop-urls' ? <Button size="sm" variant="outline" disabled={!shop.pro_active && !shop.slug} onClick={() => openShop(shop)}>Manage URL</Button>
            : <Button size="sm" variant="outline" disabled={!['pro','enterprise'].includes(shop.subscription_plan || '') || (!shop.pro_active && shop.subscription_status !== 'cancelled')} onClick={() => openShop(shop)}>{shop.subscription_status === 'cancelled' ? 'Restore access' : 'Suspend access'}</Button>}</td>
        </tr>)}</tbody>
      </table></div>}
    {!error && !loading && total > 0 && <div className="flex items-center justify-between text-sm"><span>{offset + 1}–{Math.min(offset + 50, total)} of {total}</span><div className="flex gap-2"><Button variant="outline" disabled={offset === 0} onClick={() => { setLoading(true); setOffset(v => Math.max(0,v - 50)); }}>Previous</Button><Button variant="outline" disabled={offset + 50 >= total} onClick={() => { setLoading(true); setOffset(v => v + 50); }}>Next</Button></div></div>}

    <Dialog open={!!selected} onOpenChange={open => { if (!open && !busy) setSelected(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>{selected?.status === 'pending' ? 'Review payment' : 'Payment details'}</DialogTitle><DialogDescription>{selected?.shop_name} · {selected?.owner_email}</DialogDescription></DialogHeader>
      {selected && <form className="space-y-4" onSubmit={submitReview}>
        <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 text-sm">
          <div><dt className="text-muted-foreground">Amount</dt><dd>{formatPaymentAmount(selected.amount, selected.currency)}</dd></div>
          <div><dt className="text-muted-foreground">Purchased period</dt><dd>{selected.period_label} ({selected.months} months)</dd></div>
          <div><dt className="text-muted-foreground">Payer</dt><dd>{selected.payer_name}</dd></div>
          <div><dt className="text-muted-foreground">Transfer date</dt><dd>{selected.transferred_on}</dd></div>
          <div className="col-span-2"><dt className="text-muted-foreground">Transfer reference</dt><dd className="break-all">{selected.transfer_reference}</dd></div>
          <div className="col-span-2"><dt className="text-muted-foreground">Request ID</dt><dd className="break-all">{selected.id}</dd></div>
          <div><dt className="text-muted-foreground">Submitted</dt><dd>{date(selected.created_at)}</dd></div>
          <div><dt className="text-muted-foreground">Status</dt><dd><Status value={selected.status} /></dd></div>
          {selected.customer_note && <div className="col-span-2"><dt className="text-muted-foreground">Customer note</dt><dd className="whitespace-pre-wrap break-words">{selected.customer_note}</dd></div>}
        </dl>
        {selected.status === 'pending' ? <>
          <p className="text-sm text-muted-foreground">Check the receipt in your WhatsApp conversation and confirm the credit in your bank account. Match the shop, payer, amount, transfer date, and reference before approving.</p>
          <label className="block text-sm font-medium">Decision<select className={`${inputClass} mt-1`} value={decision} disabled={busy} onChange={e => setDecision(e.target.value as typeof decision)}><option value="approved">Approve payment</option><option value="rejected">Reject payment</option></select></label>
          {decision === 'approved' ? <>
            <label className="block text-sm font-medium">Custom URL (optional)<input className={`${inputClass} mt-1`} value={slug} disabled={busy} maxLength={50} pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} onChange={e => setSlug(e.target.value.toLowerCase())} placeholder="your-shop" /></label>
            <p className="text-xs text-muted-foreground">Requested: {selected.requested_slug || 'None'}. Leave blank to keep the current URL. If the requested URL is taken, choose another or assign it later.</p>
            <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={verified} disabled={busy} required onChange={e => setVerified(e.target.checked)} />I verified the receipt and confirmed that this bank transfer was received.</label>
            <p className="text-xs text-muted-foreground">Approval adds {selected.months} months from the active expiry, or from today if expired. Paid access applies to this owner's shops.</p>
          </> : <label className="block text-sm font-medium">Reason shown to the customer<textarea className={`${inputClass} mt-1`} required minLength={3} maxLength={1000} value={reason} disabled={busy} onChange={e => setReason(e.target.value)} /></label>}
          {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
          <Button className="w-full" variant={decision === 'rejected' ? 'destructive' : 'default'} disabled={busy || (decision === 'approved' && !verified)} type="submit">{busy ? 'Saving…' : decision === 'approved' ? 'Confirm approval & activate subscription' : 'Confirm rejection'}</Button>
        </> : <div className="space-y-2 text-sm"><p>Reviewed: {date(selected.reviewed_at)}</p>{selected.reviewed_by && <p className="break-all">Reviewer: {selected.reviewed_by}</p>}{selected.activated_until && <p>Activated until: {date(selected.activated_until)}</p>}{selected.rejection_reason && <p className="whitespace-pre-wrap">Rejection reason: {selected.rejection_reason}</p>}</div>}
      </form>}
    </DialogContent></Dialog>

    <Dialog open={!!editing} onOpenChange={open => { if (!open && !busy) setEditing(null); }}><DialogContent>
      <DialogHeader><DialogTitle>{section === 'shop-urls' ? 'Manage custom URL' : editing?.subscription_status === 'cancelled' ? 'Restore paid access' : 'Suspend paid access'}</DialogTitle><DialogDescription>{editing?.shop_name} · {editing?.owner_email}</DialogDescription></DialogHeader>
      {editing && <form onSubmit={submitShop} className="space-y-4">
        {section === 'shop-urls' ? <><label className="block text-sm">Custom URL<input className={`${inputClass} mt-1`} value={slug} disabled={busy} minLength={3} maxLength={50} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={e => setSlug(e.target.value.toLowerCase())} /></label><p className="text-sm text-muted-foreground">Leave blank to remove the custom URL. The permanent menu link remains available. Assigning a URL requires active paid access.</p></>
          : <><p className="text-sm">This affects all shops owned by {editing.owner_email}. {editing.subscription_status === 'cancelled' ? 'Restoring access keeps the existing expiry; expired subscriptions need a new payment.' : 'Paid features and custom URLs stop working immediately. The expiry date is retained.'}</p><label className="block text-sm">Reason<textarea className={`${inputClass} mt-1`} required minLength={3} maxLength={1000} value={reason} disabled={busy} onChange={e => setReason(e.target.value)} /></label></>}
        {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Confirm change'}</Button>
      </form>}
    </DialogContent></Dialog>
  </div>;
}
