import { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyBillingService, companyBillingError } from '@/services/company-billing.service';
import { formatPaymentAmount } from '@/lib/billing';
import type { ShopBillingDetails } from '@/types/company-billing';

const date = (value: string | null) => value ? new Date(value).toLocaleString() : '—';

export function CompanyShopBillingDetail({ shopId }: { shopId: string }) {
  const [status, setStatus] = useState('all');
  const [offset, setOffset] = useState(0);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<ShopBillingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void CompanyBillingService.shopBilling(shopId, status, offset).then(data => {
      if (!cancelled) { setResult(data); setError(''); }
    }).catch(err => {
      if (!cancelled) setError(companyBillingError(err));
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [shopId, status, offset, version]);

  const refresh = () => { setLoading(true); setVersion(v => v + 1); };
  const shop = result?.shop;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm">Payment status
        <select className="rounded-lg border border-border bg-background px-3 py-2" value={status} onChange={event => { setLoading(true); setStatus(event.target.value); setOffset(0); }}>
          <option value="all">All payments</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
        </select>
      </label>
      <Button size="sm" variant="outline" disabled={loading} onClick={refresh}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh history</Button>
    </div>
    {loading ? <p role="status" className="py-8 text-center text-muted-foreground">Loading shop and payment history…</p>
      : error ? <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 p-4"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={refresh}>Retry</Button></div>
      : shop && result && <>
        <section className="rounded-xl border border-border bg-muted/20 p-4">
          <h3 className="font-semibold">{shop.shop_name}</h3>
          <p className="break-all text-sm text-muted-foreground">{shop.owner_email}</p>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Current plan</dt><dd className="capitalize">{shop.subscription_plan || 'free'}</dd></div>
            <div><dt className="text-muted-foreground">Paid access</dt><dd>{shop.pro_active ? 'Active' : shop.subscription_status === 'cancelled' ? 'Suspended' : 'Inactive'}</dd></div>
            <div className="col-span-2"><dt className="text-muted-foreground">Subscription expiry</dt><dd>{date(shop.subscription_expires_at)}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {shop.username && <a className="inline-flex items-center gap-1 text-primary" href={`/${encodeURIComponent(shop.slug || shop.username)}`} target="_blank" rel="noreferrer">View shop menu<ExternalLink className="h-3 w-3" /></a>}
            {shop.slug && (shop.pro_active ? <a className="inline-flex items-center gap-1 text-primary" href={`/${encodeURIComponent(shop.slug)}`} target="_blank" rel="noreferrer">/{shop.slug}<ExternalLink className="h-3 w-3" /></a> : <span className="text-muted-foreground">/{shop.slug} · inactive</span>)}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Subscription access is shared by this owner's shops. The payment history below contains only requests submitted for this shop.</p>
        </section>
        <section aria-label="Shop payment history" className="space-y-3">
          <h3 className="font-semibold">Payment history <span className="font-normal text-muted-foreground">({result.payments.total})</span></h3>
          {result.payments.rows.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{status === 'all' ? 'No payment requests have been submitted for this shop yet.' : `No ${status} payments for this shop.`}</p>
            : result.payments.rows.map(payment => <details key={payment.id} className="rounded-xl border border-border p-4">
              <summary className="cursor-pointer text-sm">
                <span className="font-semibold">{formatPaymentAmount(payment.amount, payment.currency)} · {payment.period_label}</span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs capitalize ${payment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : payment.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'}`}>{payment.status}</span>
                <span className="mt-1 block break-all text-xs text-muted-foreground">{date(payment.created_at)} · {payment.transfer_reference}</span>
                <span className="mt-1 block text-xs text-primary">View payment details</span>
              </summary>
              <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Payer</dt><dd>{payment.payer_name}</dd></div>
                <div><dt className="text-muted-foreground">Transfer date</dt><dd>{payment.transferred_on}</dd></div>
                <div><dt className="text-muted-foreground">Purchased duration</dt><dd>{payment.months} months</dd></div>
                <div><dt className="text-muted-foreground">Reviewed</dt><dd>{date(payment.reviewed_at)}</dd></div>
                {payment.activated_until && <div className="sm:col-span-2"><dt className="text-muted-foreground">Expiry granted by this payment</dt><dd>{date(payment.activated_until)}</dd></div>}
                {payment.rejection_reason && <div className="sm:col-span-2"><dt className="text-muted-foreground">Rejection reason</dt><dd className="whitespace-pre-wrap break-words">{payment.rejection_reason}</dd></div>}
                {payment.customer_note && <div className="sm:col-span-2"><dt className="text-muted-foreground">Customer note</dt><dd className="whitespace-pre-wrap break-words">{payment.customer_note}</dd></div>}
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Request ID</dt><dd className="break-all text-xs">{payment.id}</dd></div>
              </dl>
            </details>)}
          {result.payments.total > 0 && <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>{offset + 1}–{Math.min(offset + 50,result.payments.total)} of {result.payments.total}</span>
            <div className="flex gap-2"><Button size="sm" variant="outline" disabled={offset === 0} onClick={() => { setLoading(true); setOffset(v => Math.max(0,v - 50)); }}>Previous payments</Button><Button size="sm" variant="outline" disabled={offset + 50 >= result.payments.total} onClick={() => { setLoading(true); setOffset(v => v + 50); }}>Next payments</Button></div>
          </div>}
        </section>
      </>}
  </div>;
}
