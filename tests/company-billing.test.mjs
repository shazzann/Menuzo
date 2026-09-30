import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as jsx from 'react/jsx-runtime';
import * as icons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

function load(path, dependencies, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } });
  const module = { exports: {} };
  vm.runInNewContext(outputText, { module, exports: module.exports, require(name) { assert.ok(name in dependencies, name); return dependencies[name]; }, ...globals });
  return module.exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
test('admin service uses guarded RPCs and never writes entitlement tables directly', async () => {
  const calls = [];
  const { CompanyBillingService: service } = load('src/services/company-billing.service.ts', {
    '@/lib/supabase': { supabase: { rpc: async (name, args) => { calls.push([name, plain(args || {})]); return { data: true }; } } },
  });
  assert.equal(await service.isAdmin(), true);
  await service.review('request','approved','  ',' MY-CAFE ',true);
  assert.deepEqual(calls.at(-1), ['admin_review_billing_payment', { p_request_id: 'request', p_decision: 'approved', p_reason: null, p_custom_slug: 'my-cafe', p_receipt_verified: true }]);
  await service.review('request','rejected',' Missing credit ','',false);
  assert.equal(calls.at(-1)[1].p_reason, 'Missing credit');
  await service.changeStatus('shop','cancelled',' Owner requested ');
  assert.deepEqual(calls.at(-1), ['admin_change_subscription_status', { p_shop_id: 'shop', p_status: 'cancelled', p_reason: 'Owner requested' }]);
  await service.assignUrl('shop','');
  assert.equal(calls.at(-1)[1].p_slug, '');
});
test('admin service fails closed and propagates server errors', async () => {
  const error = { code: '42501' };
  const { CompanyBillingService: service, companyBillingError } = load('src/services/company-billing.service.ts', { '@/lib/supabase': { supabase: { rpc: async () => ({ data: null, error }) } } });
  for (const call of [() => service.isAdmin(), () => service.requests('all','',0), () => service.subscriptions('',0), () => service.review('id','approved','','',true), () => service.changeStatus('id','active','reason'), () => service.assignUrl('id','slug')]) {
    await assert.rejects(call, e => e === error);
  }
  assert.match(companyBillingError(error), /active company admin access/);
});

const request = { id: 'request-1', shop_name: 'Test Cafe', owner_email: 'owner@example.test', amount: 15000, currency: 'LKR', period_label: 'Yearly', months: 12, transfer_reference: 'BANK-111', transferred_on: '2026-09-29', created_at: '2026-09-29T10:00:00Z', payer_name: 'Test Payer', status: 'pending', requested_slug: 'test-cafe' };
function textOf(node) {
  if (Array.isArray(node)) return node.map(textOf).join('');
  return React.isValidElement(node) ? textOf(node.props.children) : typeof node === 'string' ? node : '';
}
function find(node, predicate) {
  if (Array.isArray(node)) { for (const child of node) { const found = find(child,predicate); if (found) return found; } }
  else if (React.isValidElement(node)) { if (predicate(node)) return node; return find(node.props.children,predicate); }
}
function harness(options = {}) {
  const states = [], effects = [], timers = [], calls = [];
  let index = 0, mounted = false;
  const Wrapper = ({ children }) => React.createElement('div',null,children);
  const Button = ({ children, variant: _variant, size: _size, ...props }) => React.createElement('button',props,children);
  const service = {
    requests: async () => { if (options.loadError) throw options.loadError; return { rows: options.rows || [request], total: (options.rows || [request]).length }; },
    subscriptions: async () => ({ rows: options.shops || [], total: (options.shops || []).length }),
    review: async (...args) => { calls.push(args); if (options.reviewError) throw options.reviewError; },
  };
  const { CompanyBilling } = load('src/components/company-admin/CompanyBilling.tsx', {
    react: {
      useState(initial) { const i = index++; if (!(i in states)) states[i] = initial; return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }]; },
      useEffect(effect) { if (!mounted) effects.push(effect); },
    },
    'react/jsx-runtime': jsx, 'lucide-react': icons, sonner: { toast: { success() {} } },
    '@/components/ui/button': { Button },
    './CompanyShopBillingDetail': { CompanyShopBillingDetail: ({ shopId }) => React.createElement('p',null,`History for ${shopId}`) },
    '@/components/ui/dialog': { Dialog: ({ open, children }) => open ? React.createElement('div',null,children) : null, DialogContent: Wrapper, DialogDescription: Wrapper, DialogHeader: Wrapper, DialogTitle: Wrapper },
    '@/services/company-billing.service': { CompanyBillingService: service, companyBillingError: e => e.message },
    '@/lib/billing': { formatPaymentAmount: (amount, currency) => `${currency} ${amount}` },
  }, { window: { setTimeout(fn) { timers.push(fn); return timers.length; }, clearTimeout() {} } });
  const render = () => { index = 0; const tree = CompanyBilling({ section: options.section || 'payment-requests' }); mounted = true; return tree; };
  return { render, html: () => renderToStaticMarkup(render()), calls, async ready() { render(); effects.forEach(fn => fn()); for (const fn of timers) await fn(); } };
}
test('review UI requires receipt confirmation and sends the chosen request decision', async () => {
  const page = harness(); await page.ready();
  assert.match(page.html(), /Test Cafe/);
  find(page.render(), n => textOf(n) === 'Review payment' && n.props.onClick)?.props.onClick();
  let tree = page.render();
  assert.equal(find(tree,n => n.props.type === 'submit').props.disabled,true);
  find(tree,n => n.props.type === 'checkbox').props.onChange({ target: { checked: true } });
  tree = page.render();
  assert.equal(find(tree,n => n.props.type === 'submit').props.disabled,false);
  await find(tree,n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.deepEqual(page.calls,[['request-1','approved','','test-cafe',true]]);
});
test('failed approval keeps the review open and shows the server error', async () => {
  const page = harness({ reviewError: { message: 'This request has already been reviewed.' } }); await page.ready();
  find(page.render(),n => textOf(n) === 'Review payment' && n.props.onClick).props.onClick();
  find(page.render(),n => n.props.type === 'checkbox').props.onChange({ target: { checked: true } });
  await find(page.render(),n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.match(page.html(), /This request has already been reviewed/);
  assert.match(page.html(), /Confirm approval/);
});
test('reviewed requests expose history without approval controls', async () => {
  const page = harness({ rows: [{ ...request, status: 'rejected', rejection_reason: 'Transfer not received' }] }); await page.ready();
  find(page.render(),n => textOf(n) === 'View details' && n.props.onClick).props.onClick();
  assert.match(page.html(), /Transfer not received/);
  assert.doesNotMatch(page.html(), /Confirm approval/);
});
test('failed list request renders an error instead of an empty payment queue', async () => {
  const page = harness({ loadError: { message: 'Admin access denied' } }); await page.ready();
  assert.match(page.html(), /Admin access denied/);
  assert.doesNotMatch(page.html(), /No matching records/);
});

test('subscription list can open history for a Free shop', async () => {
  const page = harness({ section: 'subscriptions', shops: [{ shop_id: 'free-shop-id', shop_name: 'Free Shop', owner_email: 'owner@example.test', subscription_plan: 'free', pro_active: false }] });
  await page.ready();
  const button = find(page.render(), n => textOf(n) === 'View shop' && n.props.onClick);
  assert.ok(button); assert.ok(!button.props.disabled);
  button.props.onClick();
  assert.match(page.html(), /History for free-shop-id/);
});

test('shop history service sends an exact shop ID, status, and page offset', async () => {
  const calls = [];
  const { CompanyBillingService } = load('src/services/company-billing.service.ts', { '@/lib/supabase': { supabase: { rpc: async (...args) => { calls.push(plain(args)); return { data: { payments: { rows: [], total: 0 } } }; } } } });
  await CompanyBillingService.shopBilling('shop-id','approved',50);
  assert.deepEqual(calls,[['admin_get_shop_billing',{ p_shop_id: 'shop-id',p_status: 'approved',p_offset: 50 }]]);
});

function historyHarness(fetch) {
  const states = [], effects = [], calls = [];
  let stateIndex = 0, effectIndex = 0;
  const Button = ({ children, variant: _variant, size: _size, ...props }) => React.createElement('button',props,children);
  const { CompanyShopBillingDetail } = load('src/components/company-admin/CompanyShopBillingDetail.tsx', {
    react: {
      useState(initial) { const i = stateIndex++; if (!(i in states)) states[i]=initial; return [states[i],value => { states[i]=typeof value==='function' ? value(states[i]) : value; }]; },
      useEffect(fn,deps) { const i=effectIndex++; const previous=effects[i]; if (!previous || deps.some((value,n) => !Object.is(value,previous.deps[n]))) { previous?.cleanup?.(); effects[i]={ fn,deps,pending:true }; } },
    },
    'react/jsx-runtime': jsx, 'lucide-react': icons, '@/components/ui/button': { Button },
    '@/lib/billing': { formatPaymentAmount: (amount,currency) => `${currency} ${amount}` },
    '@/services/company-billing.service': { CompanyBillingService: { shopBilling: async (...args) => { calls.push(args); return fetch(...args); } }, companyBillingError: error => error.message },
  });
  function render() { stateIndex=0; effectIndex=0; return CompanyShopBillingDetail({shopId:'shop-id'}); }
  return {
    render, calls, html: () => renderToStaticMarkup(render()),
    async settle() { render(); for (const effect of effects) if (effect.pending) { effect.pending=false; effect.cleanup=effect.fn(); } await new Promise(resolve => setImmediate(resolve)); },
    cleanup() { for (const effect of effects) effect.cleanup?.(); },
  };
}
const historyData = { shop: { shop_name:'History Cafe',owner_email:'owner@example.test',username:'history-cafe',subscription_plan:'pro',pro_active:true,subscription_expires_at:'2027-01-01T00:00:00Z' }, payments:{ rows:[{...request,status:'approved',activated_until:'2027-01-01T00:00:00Z'}],total:51 } };
test('shop history displays payment details and paginates before resetting filters', async () => {
  const page=historyHarness(async () => historyData); await page.settle();
  assert.match(page.html(),/History Cafe/); assert.match(page.html(),/BANK-111/); assert.match(page.html(),/Expiry granted by this payment/);
  find(page.render(),n => textOf(n)==='Next payments' && n.props.onClick).props.onClick(); await page.settle();
  assert.deepEqual(page.calls.at(-1),['shop-id','all',50]);
  find(page.render(),n => n.type==='select').props.onChange({target:{value:'rejected'}}); await page.settle();
  assert.deepEqual(page.calls.at(-1),['shop-id','rejected',0]); page.cleanup();
});
test('shop history distinguishes no payments from loading failure', async () => {
  const empty=historyHarness(async () => ({...historyData,payments:{rows:[],total:0}})); await empty.settle();
  assert.match(empty.html(),/No payment requests have been submitted/); empty.cleanup();
  const failure=historyHarness(async () => { throw {message:'History unavailable'}; }); await failure.settle();
  assert.match(failure.html(),/History unavailable/); assert.doesNotMatch(failure.html(),/No payment requests/); failure.cleanup();
});
