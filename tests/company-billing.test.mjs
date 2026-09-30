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
    subscriptions: async () => ({ rows: [], total: 0 }),
    review: async (...args) => { calls.push(args); if (options.reviewError) throw options.reviewError; },
  };
  const { CompanyBilling } = load('src/components/company-admin/CompanyBilling.tsx', {
    react: {
      useState(initial) { const i = index++; if (!(i in states)) states[i] = initial; return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }]; },
      useEffect(effect) { if (!mounted) effects.push(effect); },
    },
    'react/jsx-runtime': jsx, 'lucide-react': icons, sonner: { toast: { success() {} } },
    '@/components/ui/button': { Button },
    '@/components/ui/dialog': { Dialog: ({ open, children }) => open ? React.createElement('div',null,children) : null, DialogContent: Wrapper, DialogDescription: Wrapper, DialogHeader: Wrapper, DialogTitle: Wrapper },
    '@/services/company-billing.service': { CompanyBillingService: service, companyBillingError: e => e.message },
    '@/lib/billing': { formatPaymentAmount: (amount, currency) => `${currency} ${amount}` },
  }, { window: { setTimeout(fn) { timers.push(fn); return timers.length; }, clearTimeout() {} } });
  const render = () => { index = 0; const tree = CompanyBilling({ section: 'payment-requests' }); mounted = true; return tree; };
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
