import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Copy, Crown, ExternalLink, Landmark, Link2, Loader2, MessageCircle, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/store';
import { BillingService } from '@/services/billing.service';
import { SubscriptionService } from '@/services/subscription.service';
import { isProActive } from '@/lib/subscription';
import { billingErrorMessage, formatPaymentAmount, isCheckoutReady, paymentWhatsAppUrl, placeholderPeriods } from '@/lib/billing';
import { getTodayDateString } from '@/lib/timeUtils';
import type { BankTransferSettings, BillingPeriod, PaymentRequest, ShopCustomUrl } from '@/types/billing';
import { toast } from 'sonner';
import { SubscriptionPlanComparison } from '@/components/subscription/SubscriptionPlanComparison';

const steps = ['Select period', 'Bank transfer', 'Verify payment'];
const panel = 'rounded-2xl border border-border bg-card p-5 sm:p-7';

export function SubscriptionPage() {
  const { state, dispatch } = useApp();
  const { user, shop } = state;
  const [periods, setPeriods] = useState<BillingPeriod[]>(placeholderPeriods);
  const [bank, setBank] = useState<BankTransferSettings | null>(null);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [customUrl, setCustomUrl] = useState<ShopCustomUrl | null>(null);
  const [selectedId, setSelectedId] = useState('monthly');
  const [step, setStep] = useState(0);
  const [checkoutPeriod, setCheckoutPeriod] = useState<BillingPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [transferMade, setTransferMade] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [form, setForm] = useState({ payerName: '', reference: '', date: getTodayDateString(), slug: '', note: '' });
  const generation = useRef(0);
  const submitLock = useRef(false);
  const pageActive = useRef(false);
  const userId = user?.id;
  const proActive = isProActive(user?.subscription);
  const currentPeriod = periods.find(period => period.id === selectedId);
  const selected = step === 0 ? currentPeriod : checkoutPeriod || undefined;
  const pending = requests.find(request => request.status === 'pending');
  const latest = requests[0];
  const showComparison = !proActive && !pending && step === 0;
  const priceUnchanged = step === 0 || (currentPeriod?.id === checkoutPeriod?.id && currentPeriod?.amount === checkoutPeriod?.amount
    && currentPeriod?.currency === checkoutPeriod?.currency && currentPeriod?.months === checkoutPeriod?.months);
  const ready = !loading && !loadError && priceUnchanged && !!currentPeriod?.active && isCheckoutReady(selected, bank);

  const refresh = useCallback(async () => {
    if (!userId || !shop.id) return;
    const requestId = ++generation.current;
    try {
      const [availablePeriods, details, history, alias, subscription] = await Promise.all([
        BillingService.getPeriods(), BillingService.getBankDetails(), BillingService.getRequests(shop.id),
        BillingService.getCustomUrl(shop.id), SubscriptionService.getSubscription(userId),
      ]);
      if (requestId !== generation.current || !pageActive.current) return;
      setPeriods(availablePeriods);
      setBank(details);
      setRequests(history);
      setCustomUrl(alias);
      setSelectedId(current => availablePeriods.some(period => period.id === current) ? current : availablePeriods[0]?.id || '');
      dispatch({ type: 'SET_SUBSCRIPTION', payload: { userId, subscription } });
      setLoadError('');
    } catch {
      if (requestId === generation.current && pageActive.current) setLoadError('Payment details are unavailable right now. Please try refreshing in a moment.');
    } finally {
      if (requestId === generation.current && pageActive.current) setLoading(false);
    }
  }, [userId, shop.id, dispatch]);

  useEffect(() => {
    let cancelled = false;
    pageActive.current = true;
    // Start after the effect is installed so cleanup can cancel the initial load.
    void Promise.resolve().then(() => { if (!cancelled) return refresh(); });
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    return () => {
      cancelled = true;
      pageActive.current = false;
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); toast.success('Copied to clipboard'); }
    catch { toast.error('Could not copy. Please select and copy the text.'); }
  };

  const whatsappUrl = ready && bank && selected ? paymentWhatsAppUrl(bank.whatsapp_number, [
    'Hello Menuzo, I would like to verify my Pro bank transfer.',
    `Shop: ${shop.name} (${shop.username})`, `Account: ${user?.email || ''}`,
    `Period: ${selected.label}`, `Amount: ${formatPaymentAmount(selected.amount, selected.currency)}`,
    `Payer: ${form.payerName.trim()}`, `Reference: ${form.reference.trim()}`, `Transfer date: ${form.date}`,
    form.slug ? `Requested URL: ${form.slug}` : '', 'I will attach my transfer receipt here.',
  ].filter(Boolean).join('\n')) : null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitLock.current || !ready || !selected || !transferMade || !receiptSent || pending || !shop.id) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const request = await BillingService.submitRequest({ shopId: shop.id, periodId: selected.id,
        expectedAmount: selected.amount!, expectedCurrency: selected.currency, expectedMonths: selected.months,
        payerName: form.payerName, transferReference: form.reference, transferredOn: form.date,
        requestedSlug: form.slug, customerNote: form.note });
      if (!pageActive.current) return;
      // Persisted pending requests never grant paid access.
      setRequests(current => [request, ...current.filter(item => item.id !== request.id)]);
      toast.success('Verification request submitted');
      setStep(0);
      setTransferMade(false);
      setReceiptSent(false);
      setForm({ payerName: '', reference: '', date: getTodayDateString(), slug: '', note: '' });
      void refresh();
    } catch (error) { if (pageActive.current) setSubmitError(billingErrorMessage(error)); }
    finally { submitLock.current = false; if (pageActive.current) setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      <header className="border-b border-border bg-background/95 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to dashboard" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' })}><ArrowLeft className="w-5 h-5" /></Button>
          <div><h1 className="font-semibold">Subscription & payments</h1><p className="text-xs text-muted-foreground">{shop.name || 'Your Menuzo account'}</p></div>
          <Button className="ml-auto gap-2" size="sm" variant="outline" disabled={loading || submitting || !shop.id} onClick={() => { setLoading(true); void refresh(); }}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2"><span className="inline-flex items-center gap-2 text-primary text-sm font-semibold"><Crown className="w-4 h-4" /> MENUZO PRO</span><h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{showComparison ? 'Your next chapter starts with Pro.' : 'A little more room to grow.'}</h2><p className="text-muted-foreground max-w-2xl">{showComparison ? 'Your Free plan gets you started. Compare what you have with the extra space and benefits of Pro.' : 'Choose your period, pay by bank transfer, and send your receipt for verification. Pro starts after your payment is approved.'}</p></div>
        {loadError && <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">{loadError}</div>}
        {!shop.id && <p role="status" className="text-sm text-muted-foreground">Loading your shop details…</p>}
        {showComparison && <SubscriptionPlanComparison
          periods={periods} selectedId={selectedId} loading={loading} ready={ready && !!shop.id}
          onSelect={id => { setSelectedId(id); setTransferMade(false); setReceiptSent(false); }}
          onKeepFree={() => dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' })}
          onUpgrade={() => {
            if (!ready || !selected || !shop.id) return;
            setCheckoutPeriod(selected); setTransferMade(false); setReceiptSent(false); setStep(1);
          }}
        />}
        <div className={showComparison ? 'space-y-6' : 'grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start'}>
          <div className="space-y-6 min-w-0">
            {pending ? (
              <section className={`${panel} border-amber-500/30`} aria-live="polite">
                <Clock className="w-10 h-10 text-amber-500 mb-4" /><h3 className="text-xl font-bold mb-2">Payment verification pending</h3>
                <p className="text-sm text-muted-foreground">We received your {pending.period_label.toLowerCase()} Pro request. {proActive ? 'Your current subscription stays active until its expiry date.' : 'Your account stays on Free while we review the transfer.'}</p>
                <dl className="mt-5 grid sm:grid-cols-2 gap-4 text-sm"><div><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold">{formatPaymentAmount(pending.amount, pending.currency)}</dd></div><div><dt className="text-muted-foreground">Transfer reference</dt><dd className="font-mono break-all">{pending.transfer_reference}</dd></div><div className="sm:col-span-2"><dt className="text-muted-foreground">Request ID</dt><dd className="font-mono break-all text-xs mt-1">{pending.id}</dd></div></dl>
                <p className="text-xs text-muted-foreground mt-5">This page checks for updates automatically. You can return here at any time.</p>
              </section>
            ) : (
              <>
                {latest?.status === 'rejected' && <section role="status" className={`${panel} border-destructive/30`}><div className="flex items-center gap-2 font-semibold text-destructive"><XCircle className="w-5 h-5" />Payment request rejected</div><p className="text-sm mt-2">{latest.rejection_reason || 'We could not verify this transfer. Please check your details and send a new request.'}</p><p className="text-sm text-muted-foreground mt-2">{proActive ? 'Your existing subscription is unchanged.' : 'Your plan remains Free.'} You can correct your payment details below.</p></section>}
                {latest?.status === 'approved' && <section role="status" className={`${panel} border-emerald-500/30`}><div className="flex items-center gap-2 font-semibold text-emerald-600"><CheckCircle2 className="w-5 h-5" />Payment verified</div><p className="text-sm mt-2 text-muted-foreground">{proActive ? 'Your Pro subscription is active.' : user?.subscription.status === 'expired' ? 'Your subscription has expired. Choose a period below to renew.' : user?.subscription.status === 'cancelled' ? 'Your previous payment was verified, but your subscription has been cancelled. Your account is on Free.' : 'Your payment has been verified. We are waiting for your subscription to be activated.'}</p></section>}
                {!showComparison && <section className={panel}>
                  <ol className="grid grid-cols-3 gap-2 mb-8" aria-label="Upgrade progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`text-xs sm:text-sm ${step >= index ? 'text-foreground' : 'text-muted-foreground'}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full mb-2 ${step >= index ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{step > index ? <Check className="w-4 h-4" /> : index + 1}</span>{label}</li>)}</ol>
                  {step === 0 && <div className="space-y-6">
                    <div><h3 className="text-xl font-bold">{proActive ? 'Renew Pro' : 'Choose Pro'}</h3><p className="text-sm text-muted-foreground mt-1">Pay once for the selected period. No automatic renewals.</p>{proActive && <p className="text-sm text-primary mt-2">Renew anytime. Once your payment is approved, a monthly purchase adds 1 month and a yearly purchase adds 12 months to your current expiry. Your remaining paid time is kept, even when switching periods.</p>}</div>
                    <fieldset><legend className="sr-only">Subscription period</legend><div className="grid sm:grid-cols-2 gap-3">{periods.map(period => <label key={period.id} className={`relative cursor-pointer rounded-xl border-2 p-5 flex items-start gap-3 transition-colors ${selectedId === period.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}><input className="mt-1 accent-primary" type="radio" name="period" value={period.id} checked={selectedId === period.id} onChange={() => { setSelectedId(period.id); setTransferMade(false); setReceiptSent(false); }} /><span><span className="block font-semibold">{period.label}</span><span className="block text-xl font-bold mt-2">{formatPaymentAmount(period.amount, period.currency)}</span><span className="block text-xs text-muted-foreground mt-1">{period.months} {period.months === 1 ? 'month' : 'months'} of Pro</span></span></label>)}</div></fieldset>
                    {!periods.length && <p className="text-sm text-muted-foreground">No subscription periods are available yet.</p>}
                    <ul className="grid sm:grid-cols-2 gap-3 text-sm">{['Up to 100 menu items', 'Up to 20 categories', 'Custom menu URL', 'Priority support'].map(feature => <li key={feature} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />{feature}</li>)}</ul>
                    {!ready && <p className="text-sm bg-muted rounded-xl p-4 text-muted-foreground">Pro payments are coming soon. Prices and bank transfer details will appear here when available.</p>}
                    <Button className="w-full sm:w-auto gap-2" disabled={!selected || !shop.id} onClick={() => { setCheckoutPeriod(selected || null); setTransferMade(false); setReceiptSent(false); setStep(1); }}>View bank payment details<ArrowRight className="w-4 h-4" /></Button>
                  </div>}
                  {step === 1 && <form className="space-y-6" onSubmit={event => { event.preventDefault(); if (ready && transferMade) { setReceiptSent(false); setStep(2); } }}>
                    <div><h3 className="text-xl font-bold flex items-center gap-2"><Landmark className="w-5 h-5" />Make a bank transfer</h3><p className="text-sm text-muted-foreground mt-2">Transfer the exact amount below, then keep your receipt to send on WhatsApp.</p></div>
                    <div className="bg-muted/50 rounded-xl p-4 space-y-4"><div className="flex justify-between gap-4 border-b border-border pb-4"><span className="text-sm text-muted-foreground">{selected?.label} Pro</span><strong>{selected ? formatPaymentAmount(selected.amount, selected.currency) : 'Price coming soon'}</strong></div>{[['Bank', bank?.bank_name], ['Account name', bank?.account_name], ['Account number', bank?.account_number], ['Branch', bank?.branch]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 items-center"><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-sm break-words ${value ? 'font-medium' : 'text-muted-foreground italic'}`}>{value || 'Details coming soon'}</p></div>{value && <Button type="button" variant="ghost" size="icon" aria-label={`Copy ${label?.toLowerCase()}`} onClick={() => void copy(value)}><Copy className="w-4 h-4" /></Button>}</div>)}</div>
                    {!ready && <p role="status" className="text-sm text-amber-600">{!priceUnchanged ? 'Pricing has changed. Go back to review the latest period and amount before making a transfer.' : 'Bank payments are not available yet. Please wait for confirmed pricing and payment details before making a transfer.'}</p>}
                    <fieldset disabled={!ready} className="space-y-4 disabled:opacity-60"><legend className="font-semibold mb-3">Your transfer details</legend>
                      <div className="space-y-2"><Label htmlFor="payer-name">Account holder / payer name</Label><Input id="payer-name" required minLength={2} maxLength={120} value={form.payerName} onChange={event => setForm({ ...form, payerName: event.target.value })} autoComplete="name" /></div>
                      <div className="grid sm:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="transfer-reference">Transfer reference</Label><Input id="transfer-reference" required minLength={3} maxLength={120} value={form.reference} onChange={event => setForm({ ...form, reference: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="transfer-date">Transfer date</Label><Input id="transfer-date" type="date" required max={getTodayDateString()} value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></div></div>
                      <div className="space-y-2"><Label htmlFor="preferred-url">Preferred custom menu URL (optional)</Label><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">{window.location.host}/</span><Input id="preferred-url" placeholder="your-restaurant" maxLength={50} minLength={3} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Use 3–50 lowercase letters or numbers, separated by single hyphens." value={form.slug} onChange={event => setForm({ ...form, slug: event.target.value.toLowerCase() })} /></div><p className="text-xs text-muted-foreground">Subject to availability. Your custom URL activates after approval and assignment. Your existing menu link keeps working.</p></div>
                      <div className="space-y-2"><Label htmlFor="payment-note">Note (optional)</Label><Textarea id="payment-note" maxLength={1000} value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} /></div>
                      <label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={transferMade} onChange={event => setTransferMade(event.target.checked)} className="mt-1 accent-primary" />I have completed this bank transfer and kept the receipt.</label>
                    </fieldset>
                    <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button><Button type="submit" disabled={!ready || !transferMade} className="gap-2">Continue to WhatsApp<ArrowRight className="w-4 h-4" /></Button></div>
                  </form>}
                  {step === 2 && <form onSubmit={submit} className="space-y-6">
                    <div><h3 className="text-xl font-bold">Send your receipt, then submit</h3><p className="text-sm text-muted-foreground mt-2">Open WhatsApp, attach your bank receipt to the prepared message, and send it. Then return here to submit your verification request.</p></div>
                    <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-2"><p><span className="text-muted-foreground">Period: </span>{selected?.label}</p><p><span className="text-muted-foreground">Amount: </span>{selected && formatPaymentAmount(selected.amount, selected.currency)}</p><p className="break-all"><span className="text-muted-foreground">Reference: </span>{form.reference}</p></div>
                    {!priceUnchanged && <p role="alert" className="text-sm text-amber-600">Pricing has changed. Go back to select a period and review the updated amount before submitting.</p>}
                    {whatsappUrl ? <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2"><a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4" />Open WhatsApp<ExternalLink className="w-4 h-4" /></a></Button> : <p className="text-sm text-muted-foreground">WhatsApp payment support is not available yet.</p>}
                    <p className="text-xs text-muted-foreground">WhatsApp opens a draft. You attach and send the receipt yourself.</p>
                    <label className="flex items-start gap-3 text-sm"><input type="checkbox" required disabled={!ready || submitting} checked={receiptSent} onChange={event => setReceiptSent(event.target.checked)} className="mt-1 accent-primary" />I have sent my receipt and transfer details on WhatsApp.</label>
                    {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
                    <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" disabled={submitting} onClick={() => setStep(1)}>Back</Button><Button type="submit" disabled={!ready || !receiptSent || submitting} className="gap-2">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}Submit verification request</Button></div>
                    <p className="text-xs text-muted-foreground">Submitting a request does not activate Pro. Your payment must be reviewed first.</p>
                  </form>}
                </section>}
              </>
            )}
            {(!showComparison || requests.length > 0) && <section className={panel}><h3 className="font-semibold mb-4">Payment requests</h3>{!requests.length ? <p className="text-sm text-muted-foreground">{loading ? 'Loading payment requests…' : loadError ? 'Payment history could not be loaded.' : 'No payment requests yet. Your submitted requests will appear here.'}</p> : <ul className="divide-y divide-border">{requests.map(request => <li key={request.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-medium text-sm">{request.period_label} Pro · {formatPaymentAmount(request.amount, request.currency)}</p><p className="text-xs text-muted-foreground mt-1">{new Date(request.created_at).toLocaleDateString()} · {request.transfer_reference}</p></div><span className={`self-start rounded-full px-3 py-1 text-xs font-medium ${request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : request.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>{request.status === 'approved' ? 'Payment verified' : request.status === 'pending' ? 'Pending review' : 'Rejected'}</span></div>{request.rejection_reason && <p className="text-xs text-muted-foreground mt-2">{request.rejection_reason}</p>}</li>)}</ul>}</section>}
          </div>
          {!showComparison && <aside className="space-y-5">
            <section className={`${panel} bg-primary/5 border-primary/20`}><Crown className="w-7 h-7 text-primary mb-4" /><p className="text-xs text-muted-foreground uppercase tracking-wide">Current plan</p><h3 className="text-2xl font-bold mt-1">{proActive ? 'Pro active' : 'Free'}</h3><p className="text-sm text-muted-foreground mt-2">{proActive && user?.subscription.expiresAt ? `Active until ${new Date(user.subscription.expiresAt).toLocaleDateString()}` : user?.subscription.status === 'expired' ? 'Your paid subscription has expired. Your standard menu link is still available.' : 'Keep sharing your menu. Upgrade when you are ready.'}</p></section>
            <section className={panel}><Link2 className="w-6 h-6 text-primary mb-3" /><h3 className="font-semibold">Your custom URL</h3>{proActive && customUrl ? <><p className="text-xs text-emerald-600 mt-2 mb-3">Active with your Pro subscription</p><a className="text-sm text-primary break-all hover:underline" href={`/${customUrl.slug}`} target="_blank" rel="noopener noreferrer">{window.location.host}/{customUrl.slug}</a><Button className="w-full mt-4 gap-2" variant="outline" size="sm" onClick={() => void copy(`${window.location.origin}/${customUrl.slug}`)}><Copy className="w-4 h-4" />Copy custom URL</Button></> : <p className="text-sm text-muted-foreground mt-2">{proActive ? 'Your custom URL will appear here once assigned.' : 'Available after your Pro subscription is activated and your requested URL is assigned.'}</p>}<div className="mt-5 pt-4 border-t border-border"><p className="text-xs text-muted-foreground mb-1">Standard menu link</p><a href={`/${shop.username}`} className="text-xs break-all hover:underline" target="_blank" rel="noopener noreferrer">{window.location.host}/{shop.username}</a></div></section>
            <p className="text-xs text-muted-foreground px-2 flex items-start gap-2"><ShieldCheck className="w-4 h-4 shrink-0" />Only a verified, active subscription unlocks Pro and your custom URL.</p>
          </aside>}
        </div>
      </main>
    </div>
  );
}
