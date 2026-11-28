import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
function load(path) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  vm.runInNewContext(outputText, { module, exports: module.exports, require(name) { throw new Error(`unexpected ${name}`); } });
  return module.exports;
}
const dash = load('src/lib/admin-dashboard.ts');
const stats = {
  currency: 'LKR', total_shops: '120', total_shops_before_month: '100', open_shops: '110', closed_shops: '10',
  new_shops_month: '20', new_shops_prev_month: '0', pending_payments: '3',
  revenue_month: '48200', revenue_prev_month: '42000', paying_shops_month: '8', paying_shops_prev_month: '7',
  revenue_year: '524000', revenue_prev_year: '0',
};
const byTitle = (cards) => Object.fromEntries(cards.map((c) => [c.title, c]));

test('builds eight real cards without Trial Users or Expired Shops', () => {
  const cards = dash.buildDashboardKpis(stats);
  assert.equal(JSON.stringify(cards.map((c) => c.title)), JSON.stringify(['Total Shops', 'Active Shops', 'Monthly Revenue', 'Annual Revenue', 'New Registrations', 'Pending Verification', 'Avg Revenue/Shop', 'Inactive Shops']));
});

test('formats values and compares against the previous period', () => {
  const c = byTitle(dash.buildDashboardKpis(stats));
  assert.equal(c['Total Shops'].value, '120');
  assert.equal(c['Total Shops'].change, 20);
  assert.equal(c['Total Shops'].trend, 'up');
  assert.equal(c['Monthly Revenue'].value, 'LKR 48.2K');
  assert.equal(c['Monthly Revenue'].change, 14.8);
  assert.equal(c['Avg Revenue/Shop'].value, 'LKR 6,025');
  assert.equal(c['Pending Verification'].value, '3');
  assert.equal(c['Pending Verification'].hideChange, true);
  assert.equal(c['Inactive Shops'].value, '10');
});

test('hides the percent badge when the previous period is zero', () => {
  const c = byTitle(dash.buildDashboardKpis(stats));
  assert.equal(c['New Registrations'].hideChange, true);
  assert.equal(c['Annual Revenue'].hideChange, true);
  assert.equal(c['Annual Revenue'].trend, 'neutral');
});

test('money formatting', () => {
  assert.equal(dash.formatMoney(0, 'LKR'), 'LKR 0');
  assert.equal(dash.formatMoney(6000, 'LKR'), 'LKR 6,000');
  assert.equal(dash.formatMoney(65000, 'LKR'), 'LKR 65K');
  assert.equal(dash.formatMoney(1250000, 'LKR'), 'LKR 1.3M');
  assert.equal(dash.percentChange(5, 0), null);
  assert.equal(dash.percentChange(80, 100), -20);
});

const overview = {
  currency: 'LKR',
  plan_distribution: [
    { slug: 'free', name: 'Free', value: 10 },
    { slug: 'plus', name: 'Plus', value: 4 },
    { slug: 'enterprise', name: 'Enterprise', value: 1 },
    { slug: 'gold', name: 'Gold', value: 2 },
  ],
  growth: [], activity: [], top_shops: [],
  expiring_soon: 2,
  top_city: { city: 'Colombo', shops: 7 },
};

test('insights only describe what the live numbers show', () => {
  const texts = dash.buildInsights(stats, overview).map((i) => i.text);
  assert.equal(JSON.stringify(texts), JSON.stringify([
    'Revenue is up 14.8% compared with the same point last month',
    '3 payments waiting for your review',
    '10 shops have their menu closed to customers',
    '2 paid plans expiring in the next 7 days',
    'Plus is the most used paid plan (4 shops)',
    'Colombo has the most shops (7)',
  ]));
});

test('insights stay quiet when there is nothing to report', () => {
  const quiet = { ...stats, revenue_month: '0', revenue_prev_month: '0', pending_payments: '0', closed_shops: '0' };
  const texts = dash.buildInsights(quiet, { ...overview, plan_distribution: [{ slug: 'free', name: 'Free', value: 3 }], expiring_soon: 0, top_city: null });
  assert.equal(texts.length, 0);
});

test('plan colors are fixed for built-in plans and rotate for custom ones', () => {
  const colored = dash.withPlanColors(overview.plan_distribution);
  assert.equal(JSON.stringify(colored.map((p) => p.fill)), JSON.stringify(['#64748b', '#f97316', '#8b5cf6', '#3b82f6']));
});

test('time ago', () => {
  const now = new Date('2026-11-28T12:00:00Z');
  assert.equal(dash.timeAgo('2026-11-28T11:59:30Z', now), 'just now');
  assert.equal(dash.timeAgo('2026-11-28T11:52:00Z', now), '8 min ago');
  assert.equal(dash.timeAgo('2026-11-28T08:00:00Z', now), '4h ago');
  assert.equal(dash.timeAgo('2026-11-25T12:00:00Z', now), '3d ago');
});

test('top shop maps to the shop detail shape', () => {
  const shop = dash.topShopToManaged({
    id: 's1', name: 'Cafe', owner: 'nimal@example.test', location: null, revenue: '65000', plan: 'enterprise', items: '12',
    phone: null, logo: null, banner: null, theme: null, status: 'active', createdAt: '2026-01-02T00:00:00Z', expiresAt: null,
  });
  assert.equal(shop.owner, 'nimal');
  assert.equal(shop.location, 'No location');
  assert.equal(shop.revenue, 65000);
  assert.equal(shop.menuItems, 12);
  assert.equal(shop.expiresAt, 'Never');
});
