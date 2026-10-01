import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as icons from 'lucide-react';

// Execute production TypeScript with only its external dependencies replaced.
function loadSource(path, dependencies = {}, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: path,
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    exports: module.exports,
    module,
    Date,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  }, { filename: path });
  return module.exports;
}

const plain = (value) => JSON.parse(JSON.stringify(value));
const subscription = loadSource('src/lib/subscription.ts');
const billing = loadSource('src/lib/billing.ts');
const comparison = loadSource('src/components/subscription/SubscriptionPlanComparison.tsx', {
  'react/jsx-runtime': jsxRuntime,
  'lucide-react': icons,
  '@/lib/billing': billing,
  '@/components/ui/button': { Button: ({children, variant: _variant, ...props}) => React.createElement('button',props,children) },
});
const now = Date.parse('2026-09-29T12:00:00Z');
const future = new Date(now + 60_000);
const past = new Date(now - 60_000);

test('new and unavailable profiles default to Free without an expiry', () => {
  const expected = { plan: 'free', status: 'active', expiresAt: null };
  assert.deepEqual(plain(subscription.freeSubscription()), expected);
  assert.deepEqual(plain(subscription.subscriptionFromProfile(null)), expected);
  for (const plan of [null, 'free', 'unknown']) {
    assert.deepEqual(plain(subscription.subscriptionFromProfile({
      subscription_plan: plan,
      subscription_status: 'active',
      subscription_expires_at: future.toISOString(),
    })), expected);
  }
});

for (const [name, value, expected] of [
  ['missing subscription', undefined, false],
  ['null subscription', null, false],
  ['Free with a future expiry', { plan: 'free', status: 'active', expiresAt: future }, false],
  ['Pro with no expiry', { plan: 'pro', status: 'active', expiresAt: null }, false],
  ['cancelled Pro', { plan: 'pro', status: 'cancelled', expiresAt: future }, false],
  ['expired status with future date', { plan: 'pro', status: 'expired', expiresAt: future }, false],
  ['elapsed Pro', { plan: 'pro', status: 'active', expiresAt: past }, false],
  ['exact expiry boundary', { plan: 'pro', status: 'active', expiresAt: new Date(now) }, false],
  ['invalid expiry', { plan: 'pro', status: 'active', expiresAt: new Date('invalid') }, false],
  ['active Pro', { plan: 'pro', status: 'active', expiresAt: future }, true],
  ['active enterprise', { plan: 'enterprise', status: 'active', expiresAt: future }, true],
]) {
  test(`paid access: ${name}`, () => {
    assert.equal(subscription.isProActive(value, now), expected);
  });
}

test('profile hydration preserves cancellation and denies absent or invalid expiry', () => {
  for (const expiresAt of [null, 'invalid-date', new Date(Date.now() - 60_000).toISOString()]) {
    const result = subscription.subscriptionFromProfile({
      subscription_plan: 'pro', subscription_status: 'active', subscription_expires_at: expiresAt,
    });
    assert.equal(result.status, 'expired');
    assert.equal(subscription.isProActive(result), false);
  }
  for (const plan of ['pro', 'enterprise']) {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const active = subscription.subscriptionFromProfile({
      subscription_plan: plan, subscription_status: 'active', subscription_expires_at: expiresAt,
    });
    assert.equal(subscription.isProActive(active), true);
    assert.equal(active.expiresAt.toISOString(), expiresAt);
    const cancelled = subscription.subscriptionFromProfile({
      subscription_plan: plan, subscription_status: 'cancelled', subscription_expires_at: expiresAt,
    });
    assert.equal(cancelled.status, 'cancelled');
    assert.equal(subscription.isProActive(cancelled), false);
  }
});

function billingWith(supabase) {
  return loadSource('src/services/billing.service.ts', { '@/lib/supabase': { supabase } }).BillingService;
}

const paymentInput = {
  shopId: 'owned-shop',
  periodId: 'monthly',
  payerName: '  Jane Smith  ',
  transferReference: '  BANK-123  ',
  transferredOn: '2026-09-28',
  requestedSlug: '  My-Cafe  ',
  customerNote: '  Receipt shared on WhatsApp.  ',
  expectedAmount: 19,
  expectedCurrency: 'USD',
  expectedMonths: 1,
};

test('payment submission sends normalized input and the expected quote without client privileges', async () => {
  const saved = { id: 'request-1', status: 'pending' };
  let call;
  const service = billingWith({
    async rpc(name, args) { call = { name, args }; return { data: saved, error: null }; },
  });
  const result = await service.submitRequest({
    ...paymentInput,
    userId: 'other-user', amount: 0, currency: 'USD', status: 'approved', subscriptionPlan: 'pro',
  });
  assert.equal(result, saved);
  assert.deepEqual(plain(call), {
    name: 'submit_payment_request',
    args: {
      p_shop_id: 'owned-shop', p_period_id: 'monthly', p_payer_name: 'Jane Smith',
      p_transfer_reference: 'BANK-123', p_transferred_on: '2026-09-28',
      p_requested_slug: 'my-cafe', p_customer_note: 'Receipt shared on WhatsApp.',
      p_expected_amount: 19, p_expected_currency: 'USD', p_expected_months: 1,
    },
  });
});

test('payment submission converts omitted and blank optional fields to null', async () => {
  const args = [];
  const service = billingWith({
    async rpc(_name, input) { args.push(input); return { data: { id: 'saved' }, error: null }; },
  });
  for (const blank of [undefined, '', '   ']) {
    await service.submitRequest({ ...paymentInput, requestedSlug: blank, customerNote: blank });
  }
  for (const input of args) {
    assert.equal(input.p_requested_slug, null);
    assert.equal(input.p_customer_note, null);
  }
});

test('payment submission surfaces server rejection and missing save results', async () => {
  const rejection = { code: '42501', message: 'You do not own this shop.' };
  await assert.rejects(
    billingWith({ rpc: async () => ({ data: null, error: rejection }) }).submitRequest(paymentInput),
    (error) => error === rejection,
  );
  await assert.rejects(
    billingWith({ rpc: async () => ({ data: null, error: null }) }).submitRequest(paymentInput),
    /could not be saved/i,
  );
});

function queryMock(result) {
  const calls = [];
  const query = {
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
  };
  for (const method of ['select', 'eq', 'order', 'limit', 'maybeSingle']) {
    query[method] = (...args) => { calls.push([method, ...args]); return query; };
  }
  return {
    calls,
    supabase: { from: (table) => { calls.push(['from', table]); return query; } },
  };
}

test('payment history and custom URL reads are scoped to the selected shop', async () => {
  for (const [method, table, data] of [
    ['getRequests', 'billing_payment_requests', [{ id: 'request-1' }]],
    ['getCustomUrl', 'shop_custom_urls', { slug: 'my-cafe' }],
  ]) {
    const mock = queryMock({ data, error: null });
    assert.equal(await billingWith(mock.supabase)[method]('owned-shop'), data);
    assert.deepEqual(mock.calls[0], ['from', table]);
    assert.deepEqual(mock.calls.filter(([name]) => name === 'eq'), [['eq', 'shop_id', 'owned-shop']]);
    if (method === 'getRequests') {
      assert.ok(mock.calls.some(([name, column, options]) => name === 'order' && column === 'created_at' && options.ascending === false));
      assert.ok(mock.calls.some(([name, limit]) => name === 'limit' && limit === 50));
    }
  }
});

test('billing reads propagate errors rather than treating a failed query as an empty result', async () => {
  const rejection = { message: 'Database unavailable' };
  for (const method of ['getPeriods', 'getBankDetails', 'getRequests', 'getCustomUrl']) {
    const mock = queryMock({ data: null, error: rejection });
    await assert.rejects(billingWith(mock.supabase)[method]('owned-shop'), (error) => error === rejection);
  }
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

function loaderHarness() {
  let effect;
  let userId;
  let timerCounter = 0;
  const actions = [];
  const requests = [];
  const listeners = new Map();
  const timers = new Map();
  const document = { hidden: false };
  const dispatch = (action) => actions.push(plain(action));
  const { SubscriptionDataLoader } = loadSource('src/components/shared/SubscriptionDataLoader.tsx', {
    react: { useEffect: (callback) => { effect = callback; } },
    '@/store': { useApp: () => ({ state: { user: userId ? { id: userId } : null }, dispatch }) },
    '@/lib/subscription': subscription,
    '@/services/subscription.service': {
      SubscriptionService: {
        getSubscription(id) {
          const request = { userId: id, ...deferred() };
          requests.push(request);
          return request.promise;
        },
      },
    },
  }, {
    window: {
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name, callback) => {
        if (listeners.get(name) === callback) listeners.delete(name);
      },
      setInterval: (callback) => { timers.set(++timerCounter, callback); return timerCounter; },
      clearInterval: (id) => timers.delete(id),
    },
    document,
  });
  return {
    actions, requests, listeners, timers, document,
    mount(id) { userId = id; SubscriptionDataLoader(); return effect(); },
  };
}

test('subscription loader ignores a former account response after switching accounts', async () => {
  const loader = loaderHarness();
  const unmountFirst = loader.mount('first-user');
  unmountFirst();
  assert.equal(loader.listeners.size, 0);
  assert.equal(loader.timers.size, 0);
  const unmountSecond = loader.mount('second-user');
  loader.requests[0].resolve({ plan: 'pro', status: 'active', expiresAt: future });
  loader.requests[1].resolve(subscription.freeSubscription());
  await flush();
  assert.deepEqual(loader.actions, [{
    type: 'SET_SUBSCRIPTION',
    payload: { userId: 'second-user', subscription: { plan: 'free', status: 'active', expiresAt: null } },
  }]);
  unmountSecond();
});

test('subscription loader rejects stale failures and fails closed for the current account', async () => {
  const loader = loaderHarness();
  const unmount = loader.mount('former-user');
  unmount();
  const cleanup = loader.mount('current-user');
  loader.requests[0].reject(new Error('Old request failed'));
  loader.requests[1].reject(new Error('Profile unavailable'));
  await flush();
  assert.deepEqual(loader.actions, [{
    type: 'SET_SUBSCRIPTION',
    payload: { userId: 'current-user', subscription: { plan: 'free', status: 'active', expiresAt: null } },
  }]);
  cleanup();
});

test('subscription loader refreshes on focus without overlapping requests or polling hidden tabs', async () => {
  const loader = loaderHarness();
  const cleanup = loader.mount('current-user');
  loader.listeners.get('focus')();
  assert.equal(loader.requests.length, 1);
  loader.requests[0].resolve(subscription.freeSubscription());
  await flush();
  loader.document.hidden = true;
  for (const tick of loader.timers.values()) tick();
  assert.equal(loader.requests.length, 1);
  loader.document.hidden = false;
  for (const tick of loader.timers.values()) tick();
  assert.equal(loader.requests.length, 2);
  loader.requests[1].resolve({ plan: 'pro', status: 'active', expiresAt: future });
  await flush();
  assert.equal(loader.actions.at(-1).payload.subscription.plan, 'pro');
  cleanup();
});

test('subscription loader does not query or register refresh events when signed out', () => {
  const loader = loaderHarness();
  loader.mount(null);
  assert.equal(loader.requests.length, 0);
  assert.equal(loader.listeners.size, 0);
  assert.equal(loader.timers.size, 0);
});

const configuredPeriod = { id: 'monthly', label: 'Monthly', months: 1, amount: 19, currency: 'USD', active: true };
const configuredBank = {
  id: true, bank_name: 'Example Bank', account_name: 'Menuzo', account_number: '123456789',
  branch: 'Main Branch', whatsapp_number: '94771234567', enabled: true,
};

test('checkout requires a positive published price and complete enabled bank details', () => {
  assert.equal(billing.isCheckoutReady(configuredPeriod, configuredBank), true);
  assert.equal(billing.isCheckoutReady(undefined, configuredBank), false);
  assert.equal(billing.isCheckoutReady(configuredPeriod, null), false);
  assert.equal(billing.isCheckoutReady({ ...configuredPeriod, active: false }, configuredBank), false);
  assert.equal(billing.isCheckoutReady(configuredPeriod, { ...configuredBank, enabled: false }), false);
  for (const amount of [null, 0, -1, Number.NaN]) {
    assert.equal(billing.isCheckoutReady({ ...configuredPeriod, amount }, configuredBank), false);
  }
  for (const field of ['bank_name', 'account_name', 'account_number', 'branch']) {
    assert.equal(billing.isCheckoutReady(configuredPeriod, { ...configuredBank, [field]: '  ' }), false, `${field} is required`);
  }
});

test('placeholder periods cannot accept payments', () => {
  assert.deepEqual(plain(billing.placeholderPeriods).map(({ label, months }) => ({ label, months })), [
    { label: 'Monthly', months: 1 }, { label: 'Yearly', months: 12 },
  ]);
  for (const period of billing.placeholderPeriods) {
    assert.equal(period.amount, null);
    assert.equal(billing.formatPaymentAmount(period.amount, period.currency), 'Price coming soon');
    assert.equal(billing.isCheckoutReady(period, configuredBank), false);
  }
});

test('checkout and WhatsApp links reject malformed international phone numbers', () => {
  for (const number of ['', '0771234567', '+94771234567', '94 771234567', '1234', '1234567890123456', '94771234567&text=unexpected']) {
    assert.equal(billing.isCheckoutReady(configuredPeriod, { ...configuredBank, whatsapp_number: number }), false);
    assert.equal(billing.paymentWhatsAppUrl(number, 'Receipt'), null);
  }
});

test('WhatsApp drafts preserve special characters and newlines through URL encoding', () => {
  const message = 'Menuzo payment\nCafe & Tea / table #1\nReference: A+B?=123\nThank you ☕';
  const url = new URL(billing.paymentWhatsAppUrl(configuredBank.whatsapp_number, message));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/94771234567');
  assert.equal(url.searchParams.get('text'), message);
  assert.deepEqual([...url.searchParams.keys()], ['text']);
  assert.equal(url.hash, '');
});

function textOf(node) {
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement(node)) return textOf(node.props.children);
  return typeof node === 'string' || typeof node === 'number' ? String(node) : '';
}

function findElement(node, predicate) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, predicate);
      if (match) return match;
    }
  } else if (React.isValidElement(node)) {
    if (predicate(node)) return node;
    if (node.type === comparison.SubscriptionPlanComparison) return findElement(node.type(node.props), predicate);
    return findElement(node.props.children, predicate);
  }
  return undefined;
}

function subscriptionPageHarness(options = {}) {
  const states = [];
  const refs = [];
  const effects = [];
  let stateIndex = 0;
  let refIndex = 0;
  let mounted = false;
  let submits = 0;
  const actions = [];
  const submittedInputs = [];
  const messages = [];
  const Button = ({ children, asChild, variant: _variant, size: _size, ...props }) => asChild
    ? React.cloneElement(children, props) : React.createElement('button', props, children);
  const { SubscriptionPage } = loadSource('src/pages/SubscriptionPage.tsx', {
    react: {
      useState(initial) {
        const index = stateIndex++;
        if (!Object.hasOwn(states, index)) states[index] = typeof initial === 'function' ? initial() : initial;
        return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
      },
      useRef(initial) {
        const index = refIndex++;
        if (!Object.hasOwn(refs, index)) refs[index] = { current: initial };
        return refs[index];
      },
      useCallback: (callback) => callback,
      useEffect: (effect) => { if (!mounted) effects.push(effect); },
    },
    'react/jsx-runtime': jsxRuntime,
    'lucide-react': icons,
    '@/components/ui/button': { Button },
    '@/components/ui/input': { Input: (props) => React.createElement('input', props) },
    '@/components/ui/label': { Label: (props) => React.createElement('label', props) },
    '@/components/ui/textarea': { Textarea: (props) => React.createElement('textarea', props) },
    '@/store': { useApp: () => ({
      state: {
        user: { id: 'owner', email: 'owner@example.test', subscription: options.subscription || subscription.freeSubscription() },
        shop: { id: 'owned-shop', name: 'Example Cafe', username: 'example-cafe' },
      },
      dispatch(action) { actions.push(plain(action)); },
    }) },
    '@/services/billing.service': { BillingService: {
      getPeriods: async () => options.periods || billing.placeholderPeriods,
      getBankDetails: async () => options.bank || null,
      getRequests: async () => options.requests || [],
      getCustomUrl: async () => options.customUrl || null,
      submitRequest: async (input) => {
        submits++;
        submittedInputs.push(plain(input));
        if (!options.submit) throw new Error('Placeholder checkout must not submit');
        const saved = await options.submit(input);
        options.requests = [saved, ...(options.requests || [])];
        return saved;
      },
    } },
    '@/services/subscription.service': { SubscriptionService: { getSubscription: async () => options.subscription || subscription.freeSubscription() } },
    '@/lib/subscription': subscription,
    '@/lib/billing': billing,
    '@/components/subscription/SubscriptionPlanComparison': comparison,
    '@/lib/timeUtils': { getTodayDateString: () => '2026-09-29' },
    sonner: { toast: { success(message) { messages.push(message); }, error(message) { messages.push(message); } } },
  }, {
    window: {
      location: { host: 'menuzo.test', origin: 'https://menuzo.test' },
      addEventListener() {}, removeEventListener() {}, setInterval() { return 1; }, clearInterval() {},
    },
    document: { hidden: false },
  });
  return {
    render() {
      stateIndex = 0;
      refIndex = 0;
      const tree = SubscriptionPage();
      mounted = true;
      return { tree, html: renderToStaticMarkup(tree) };
    },
    runEffects: () => effects.map((effect) => effect()),
    submitCount: () => submits,
    actions, submittedInputs, messages,
  };
}

test('Free plan comparison shows benefits and blocks checkout when pricing is unavailable', async () => {
  const page = subscriptionPageHarness();
  page.render();
  const cleanup = page.runEffects();
  await flush();
  const rendered = page.render();
  assert.match(rendered.html, /Compare Free and Pro plans/);
  assert.match(rendered.html, /Monthly/);
  assert.match(rendered.html, /Yearly/);
  assert.match(rendered.html, /Coming soon/);
  assert.match(rendered.html, /Menu items: Up to 10/);
  assert.match(rendered.html, /Menu items: Up to 100/);
  const upgrade = findElement(rendered.tree, element => typeof element.props.onClick === 'function' && textOf(element) === 'Upgrade to Pro');
  assert.equal(upgrade.props.disabled,true);
  upgrade.props.onClick();
  assert.doesNotMatch(page.render().html, /Make a bank transfer/);
  assert.equal(page.submitCount(),0);
  for (const dispose of cleanup) dispose?.();
});

const yearlyPeriod = { ...configuredPeriod, id: 'yearly', label: 'Yearly', months: 12, amount: 190 };
const savedPayment = {
  id: 'saved-request', user_id: 'owner', shop_id: 'owned-shop', period_id: 'yearly', period_label: 'Yearly',
  months: 12, amount: 190, currency: 'USD', payer_name: 'Jane Smith', transfer_reference: 'BANK-123',
  transferred_on: '2026-09-28', requested_slug: 'my-cafe', customer_note: 'Receipt sent.', status: 'pending',
  rejection_reason: null, created_at: '2026-09-29T12:00:00Z', reviewed_at: null,
};

function buttonByText(page, label) {
  const element = findElement(page.render().tree, (node) => typeof node.props.onClick === 'function' && textOf(node) === label);
  assert.ok(element, `Expected button: ${label}`);
  return element;
}

function formOnPage(page) {
  const form = findElement(page.render().tree, (node) => node.type === 'form');
  assert.ok(form, 'Expected the current checkout form');
  return form;
}

function checkboxOnPage(page) {
  const checkbox = findElement(page.render().tree, (node) => node.type === 'input' && node.props.type === 'checkbox');
  assert.ok(checkbox, 'Expected the current confirmation checkbox');
  return checkbox;
}

async function mountPage(page) {
  page.render();
  const cleanup = page.runEffects();
  await flush();
  return () => { for (const dispose of cleanup) dispose?.(); };
}

function goToVerification(page) {
  const yearly = findElement(page.render().tree, (node) => node.type === 'input' && node.props.value === 'yearly');
  assert.ok(yearly, 'Yearly option is available');
  yearly.props.onChange();
  buttonByText(page, 'Upgrade to Pro').props.onClick();
  for (const [id, value] of [
    ['payer-name', 'Jane Smith'], ['transfer-reference', 'BANK-123'], ['transfer-date', '2026-09-28'],
    ['preferred-url', 'my-cafe'], ['payment-note', 'Receipt sent.'],
  ]) {
    const input = findElement(page.render().tree, (node) => node.props.id === id);
    assert.ok(input, `Expected transfer field: ${id}`);
    input.props.onChange({ target: { value } });
  }
  checkboxOnPage(page).props.onChange({ target: { checked: true } });
  formOnPage(page).props.onSubmit({ preventDefault() {} });
  assert.match(page.render().html, /Send your receipt, then submit/);
}

test('configured checkout creates one pending request and keeps the customer on Free', async () => {
  const save = deferred();
  const page = subscriptionPageHarness({
    periods: [configuredPeriod, yearlyPeriod], bank: configuredBank, submit: () => save.promise,
  });
  const cleanup = await mountPage(page);
  goToVerification(page);
  const whatsapp = findElement(page.render().tree, (node) => node.type === 'a' && textOf(node) === 'Open WhatsApp');
  assert.ok(whatsapp);
  const draft = new URL(whatsapp.props.href).searchParams.get('text');
  assert.match(draft, /Period: Yearly/);
  assert.match(draft, /Amount: \$190\.00/);
  assert.match(draft, /Payer: Jane Smith/);
  assert.match(draft, /Reference: BANK-123/);
  await formOnPage(page).props.onSubmit({ preventDefault() {} });
  assert.equal(page.submitCount(), 0, 'Receipt confirmation is required');
  checkboxOnPage(page).props.onChange({ target: { checked: true } });
  const submit = formOnPage(page).props.onSubmit;
  const first = submit({ preventDefault() {} });
  const duplicate = submit({ preventDefault() {} });
  assert.equal(page.submitCount(), 1, 'Rapid duplicate submission is ignored');
  save.resolve(savedPayment);
  await Promise.all([first, duplicate]);
  await flush();
  assert.deepEqual(page.submittedInputs, [{
    shopId: 'owned-shop', periodId: 'yearly', expectedAmount: 190, expectedCurrency: 'USD', expectedMonths: 12,
    payerName: 'Jane Smith', transferReference: 'BANK-123', transferredOn: '2026-09-28',
    requestedSlug: 'my-cafe', customerNote: 'Receipt sent.',
  }]);
  assert.match(page.render().html, /Payment verification pending/);
  assert.match(page.render().html, /Your account stays on Free/);
  assert.ok(page.actions.length > 0);
  assert.ok(page.actions.every((action) => action.type !== 'SET_SUBSCRIPTION' || action.payload.subscription.plan === 'free'));
  assert.deepEqual(page.messages, ['Verification request submitted']);
  cleanup();
});

test('server rejection retains transfer details for correction and does not activate Pro', async () => {
  const page = subscriptionPageHarness({
    periods: [configuredPeriod, yearlyPeriod], bank: configuredBank,
    submit: async () => { throw { code: 'P0001', message: 'That transfer reference is already in use.' }; },
  });
  const cleanup = await mountPage(page);
  goToVerification(page);
  checkboxOnPage(page).props.onChange({ target: { checked: true } });
  await formOnPage(page).props.onSubmit({ preventDefault() {} });
  assert.equal(page.submitCount(), 1);
  assert.match(page.render().html, /That transfer reference is already in use/);
  assert.doesNotMatch(page.render().html, /Payment verification pending/);
  buttonByText(page, 'Back').props.onClick();
  for (const [id, expected] of [['payer-name', 'Jane Smith'], ['transfer-reference', 'BANK-123'], ['preferred-url', 'my-cafe']]) {
    assert.equal(findElement(page.render().tree, (node) => node.props.id === id).props.value, expected);
  }
  assert.ok(page.actions.every((action) => action.type !== 'SET_SUBSCRIPTION' || action.payload.subscription.plan === 'free'));
  assert.equal(page.messages.length, 0);
  cleanup();
});

test('changed pricing during checkout preserves the quoted amount and blocks submission', async () => {
  const options = { periods: [configuredPeriod, yearlyPeriod], bank: configuredBank, submit: async () => savedPayment };
  const page = subscriptionPageHarness(options);
  const cleanup = await mountPage(page);
  goToVerification(page);
  checkboxOnPage(page).props.onChange({ target: { checked: true } });
  options.periods = [configuredPeriod, { ...yearlyPeriod, amount: 240 }];
  buttonByText(page, 'Refresh').props.onClick();
  await flush();
  assert.match(page.render().html, /\$190\.00/);
  const submitButton = findElement(page.render().tree, (node) => node.props.type === 'submit');
  assert.equal(submitButton.props.disabled, true);
  await formOnPage(page).props.onSubmit({ preventDefault() {} });
  assert.equal(page.submitCount(), 0);
  buttonByText(page, 'Back').props.onClick();
  assert.match(page.render().html, /Pricing has changed/);
  cleanup();
});

test('Free comparison uses live LKR prices and preserves the yearly choice into checkout', async () => {
  const page = subscriptionPageHarness({ periods: [
    { ...configuredPeriod, amount: 1500, currency: 'LKR' },
    { ...yearlyPeriod, amount: 15000, currency: 'LKR' },
  ], bank: configuredBank });
  const cleanup = await mountPage(page);
  assert.match(page.render().html, /LKR.*1,500/);
  assert.match(page.render().html, /Save LKR.*3,000/);
  findElement(page.render().tree, node => node.type === 'input' && node.props.value === 'yearly').props.onChange();
  assert.match(page.render().html, /LKR.*15,000/);
  assert.match(page.render().html, /One payment for 12 months/);
  buttonByText(page,'Upgrade to Pro').props.onClick();
  assert.match(page.render().html, /Yearly Pro/);
  assert.match(page.render().html, /LKR.*15,000/);
  buttonByText(page,'Back').props.onClick();
  assert.match(page.render().html, /Compare Free and Pro plans/);
  assert.equal(findElement(page.render().tree,node => node.type === 'input' && node.props.value === 'yearly').props.checked,true);
  buttonByText(page,'Continue with Free').props.onClick();
  assert.deepEqual(page.actions.at(-1),{type:'SET_VIEW',payload:'user-dashboard'});
  cleanup();
});

test('active Pro and pending payments retain their existing management screens', async () => {
  const pro = subscriptionPageHarness({ periods: [configuredPeriod,yearlyPeriod],bank:configuredBank,
    subscription: {plan:'pro',status:'active',expiresAt:new Date(Date.now()+86400000)} });
  const disposePro = await mountPage(pro);
  assert.match(pro.render().html,/Renew Pro/);
  assert.doesNotMatch(pro.render().html,/Compare Free and Pro plans/);
  disposePro();
  const pending = subscriptionPageHarness({ requests:[savedPayment] });
  const disposePending = await mountPage(pending);
  assert.match(pending.render().html,/Payment verification pending/);
  assert.doesNotMatch(pending.render().html,/Compare Free and Pro plans/);
  disposePending();
});
