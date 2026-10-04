import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';

const now = new Date('2026-10-04T20:00:00Z'); // October 5 in Sri Lanka.
class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [now])); } }
function load(path, deps = {}, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } });
  const module = { exports: {} };
  vm.runInNewContext(outputText, { module, exports: module.exports, Date: FixedDate, Intl, ...globals, require(name) { assert.ok(name in deps, name); return deps[name]; } });
  return module.exports;
}
const analytics = load('src/lib/shopAnalytics.ts');
const stats = [
  { date: '2026-10-05', views: 3, qr_scans: 1 },
  { date: '2026-09-29', views: 10, qr_scans: 2 },
  { date: '2026-09-28', views: 20, qr_scans: 5 },
  { date: '2026-09-06', views: 30, qr_scans: 6 },
  { date: '2026-09-05', views: 100, qr_scans: 50 },
  { date: '2026-10-06', views: 1000, qr_scans: 500 },
];

test('reporting date switches at Sri Lanka midnight, independent of browser timezone', () => {
  assert.equal(analytics.analyticsDate(new Date('2026-10-04T18:29:59Z')), '2026-10-04');
  assert.equal(analytics.analyticsDate(new Date('2026-10-04T18:30:00Z')), '2026-10-05');
});
test('rolling windows include today and handle year and leap-month boundaries', () => {
  const dates = analytics.analyticsDates('week', new Date('2026-01-02T00:00:00Z'));
  assert.equal(dates[0], '2025-12-27'); assert.equal(dates.at(-1), '2026-01-02');
  const leap = analytics.analyticsDates('month', new Date('2024-03-01T00:00:00Z'));
  assert.equal(leap.length, 30); assert.equal(leap[0], '2024-02-01'); assert.ok(leap.includes('2024-02-29'));
});
test('each range sums only its dates and fills unrecorded days with zero', () => {
  for (const [range, count, views, qrScans] of [['today', 1, 3, 1], ['week', 7, 13, 3], ['month', 30, 63, 14]]) {
    const result = analytics.summarizeShopViews(stats, range);
    assert.equal(result.data.length, count); assert.equal(result.views, views); assert.equal(result.qrScans, qrScans);
    assert.equal(result.data.at(-1).date, '2026-10-05');
  }
  assert.equal(analytics.summarizeShopViews(stats, 'week').data[1].views, 0);
  assert.equal(analytics.summarizeShopViews([], 'month').views, 0);
});
test('daily stats query fetches the complete 30-day window for only the selected shop', async () => {
  const calls = [];
  const query = Object.fromEntries(['select', 'eq', 'gte', 'lte'].map(method => [method, (...args) => { calls.push([method, ...args]); return query; }]));
  query.order = async () => ({ data: stats, error: null });
  const { RestaurantService } = load('src/services/restaurant.service.ts', {
    '@/lib/shopAnalytics': analytics,
    '@/lib/supabase': { supabase: { from: table => { assert.equal(table, 'shop_daily_stats'); return query; } } },
  });
  assert.equal(await RestaurantService.getShopDailyStats('shop-a'), stats);
  assert.deepEqual(calls, [['select', '*'], ['eq', 'shop_id', 'shop-a'], ['gte', 'date', '2026-09-06'], ['lte', 'date', '2026-10-05']]);
});

function nodes(tree) {
  if (tree == null || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function page(dailyStats) {
  let range; const actions = [];
  const Chart = () => null;
  const { AdminAnalyticsPage } = load('src/pages/AdminAnalyticsPage.tsx', {
    react: { useState: initial => { range ??= initial; return [range, value => { range = value; }]; } }, 'react/jsx-runtime': jsx,
    'lucide-react': new Proxy({}, { get: () => () => null }),
    '@/components/ui/button': { Button: 'button' }, '@/components/shared/BottomNav': { BottomNav: () => null },
    '@/components/admin/MenuViewsChart': { MenuViewsChart: Chart }, '@/lib/shopAnalytics': analytics,
    '@/lib/utils': { cn: (...args) => args.join(' ') }, '@/lib/subscription': { isProActive: () => false },
    '@/store': { useApp: () => ({ state: { user: null, foodItems: [], categories: [], shop: { view_count: 9999, qr_scan_count: 999, daily_stats: dailyStats } }, dispatch: action => actions.push(action) }) },
  });
  return { render: () => nodes(AdminAnalyticsPage()), Chart, actions };
}
test('clicking analytics filters updates the visible counts and graph together, never lifetime counters', () => {
  const app = page(stats);
  for (const [label, count, views, qr] of [['Today', 1, '3', '1'], ['Last 7 days', 7, '13', '3'], ['Last 30 days', 30, '63', '14']]) {
    app.render().find(node => node.type === 'button' && node.props.children === label).props.onClick();
    const rendered = app.render();
    assert.equal(rendered.find(node => node.type === app.Chart).props.data.length, count);
    const counters = rendered.filter(node => node.props.className === 'text-2xl font-bold').map(node => node.props.children);
    assert.ok(counters.includes(views)); assert.ok(counters.includes(qr)); assert.ok(!counters.includes('9,999'));
    assert.equal(rendered.find(node => node.type === 'button' && node.props.children === label).props['aria-pressed'], true);
  }
});
test('failed daily stats show an error and retry instead of a zero graph', () => {
  const app = page(undefined); const rendered = app.render();
  assert.ok(rendered.some(node => node.props.role === 'alert'));
  assert.ok(!rendered.some(node => node.type === app.Chart));
  rendered.find(node => node.type === 'button' && node.props.children === 'Retry').props.onClick();
  assert.equal(app.actions[0].type, 'RETRY_SHOP_LOAD');
});


test('dashboard and Analytics default show identical seven-day counts and graph data, even with an empty menu', () => {
  const report = page(stats); const analyticsTree = report.render();
  assert.equal(analyticsTree.find(node => node.type === 'button' && node.props['aria-pressed']).props.children, 'Last 7 days');
  const source = readFileSync(new URL('../src/pages/UserDashboardPage.tsx',import.meta.url),'utf8');
  const deps = {};
  for (const match of source.matchAll(/import \{([^}]+)\} from '([^']+)'/g)) {
    deps[match[2]] = Object.fromEntries(match[1].split(',').map(name => [name.trim(), () => null]));
  }
  Object.assign(deps, {
    react: { useState: initial => [initial, () => {}], useRef: () => ({current:null}), useEffect() {} },
    'react/jsx-runtime': jsx, '@/lib/shopAnalytics': analytics,
    '@/lib/shopUrls': {getShopMenuUrl:()=> 'https://menuzo.test/cafe'},
    '@/components/admin/MenuViewsChart': { MenuViewsChart: report.Chart },
    '@/lib/subscription':{isProActive:()=>false},
    '@/store': {useApp:()=>({state:{shop:{id:'shop',name:'Cafe',username:'cafe',view_count:9999,qr_scan_count:999,daily_stats:stats},foodItems:[],user:null},dispatch(){}})},
  });
  const {UserDashboardPage} = load('src/pages/UserDashboardPage.tsx', deps);
  const dashboard = nodes(UserDashboardPage());
  assert.deepEqual(JSON.parse(JSON.stringify(dashboard.find(node => node.type===report.Chart).props.data)), JSON.parse(JSON.stringify(analyticsTree.find(node=>node.type===report.Chart).props.data)));
  const counters = dashboard.filter(node=>node.props.className==='text-2xl font-bold').map(node=>node.props.children);
  assert.ok(counters.includes('13')); assert.ok(!counters.includes('9,999'));
});
