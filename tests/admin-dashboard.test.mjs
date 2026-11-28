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
