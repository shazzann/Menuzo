import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

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

const plain = (val) => JSON.parse(JSON.stringify(val));
const subscription = loadSource('src/lib/subscription.ts');
const pricingService = loadSource('src/services/pricing.service.ts');
const themeUtils = loadSource('src/lib/themeUtils.ts');
const curatedThemes = loadSource('src/components/admin/theme/curatedThemes.ts', {
  '@/lib/themeUtils': themeUtils,
});

test('Plan configuration defines Free (10 items, 2 categories) and Pro (100 items, 20 categories)', () => {
  assert.equal(subscription.FREE_PLAN_LIMITS.items, 10);
  assert.equal(subscription.FREE_PLAN_LIMITS.categories, 2);
  assert.equal(subscription.PRO_PLAN_LIMITS.items, 100);
  assert.equal(subscription.PRO_PLAN_LIMITS.categories, 20);

  const freeUser = subscription.freeSubscription();
  assert.deepEqual(plain(subscription.getPlanLimits(freeUser)), { items: 10, categories: 2 });

  const activePro = { plan: 'pro', status: 'active', expiresAt: new Date(Date.now() + 86400000 * 30) };
  assert.deepEqual(plain(subscription.getPlanLimits(activePro)), { items: 100, categories: 20 });
});

test('PricingService default plans reflect the exact 10-feature matrix for Free and Pro', () => {
  const plans = pricingService.PricingService.getPlans();
  const free = plans.find(p => p.id === 'free');
  const pro = plans.find(p => p.id === 'pro');

  assert.ok(free, 'Free plan must exist');
  assert.ok(pro, 'Pro plan must exist');

  // Free features check
  assert.ok(free.features.includes('10 Food Items'));
  assert.ok(free.features.includes('2 Categories'));
  assert.ok(free.features.includes('QR Menu'));
  assert.ok(free.features.includes('Limited Themes (3–5 preset themes)'));
  assert.ok(free.features.includes('Basic QR Branding'));
  assert.ok(free.features.includes('Restaurant Profile'));
  assert.ok(free.features.includes('Shareable Menu Link'));
  assert.ok(free.features.includes('Standard Support'));

  // Free not included check
  assert.ok(free.notIncluded.includes('Analytics Dashboard'));
  assert.ok(free.notIncluded.includes('Custom Menu URL'));
  assert.ok(free.notIncluded.includes('Full Theme Customization'));
  assert.ok(free.notIncluded.includes('Advanced QR Branding'));

  // Pro features check
  assert.ok(pro.features.includes('100 Food Items'));
  assert.ok(pro.features.includes('20 Categories'));
  assert.ok(pro.features.includes('QR Menu'));
  assert.ok(pro.features.includes('Full Theme Customization'));
  assert.ok(pro.features.includes('Advanced QR Branding'));
  assert.ok(pro.features.includes('Analytics Dashboard'));
  assert.ok(pro.features.includes('Restaurant Profile'));
  assert.ok(pro.features.includes('Shareable Menu Link'));
  assert.ok(pro.features.includes('Custom Menu URL'));
  assert.ok(pro.features.includes('Priority Support'));
});

test('Curated themes provide exactly 5 free preset themes and premium Pro themes', () => {
  const freeThemes = curatedThemes.CURATED_THEMES.filter(t => !t.isPro);
  const proThemes = curatedThemes.CURATED_THEMES.filter(t => t.isPro);

  assert.equal(freeThemes.length, 5, 'Exactly 5 preset themes available for Free');
  assert.ok(proThemes.length >= 5, 'Multiple premium themes available for Pro');

  const freeNames = freeThemes.map(t => t.name);
  assert.ok(freeNames.includes('Menuzo Signature'));
  assert.ok(freeNames.includes('Classic Elegance'));
  assert.ok(freeNames.includes('Ocean Breeze'));
  assert.ok(freeNames.includes('Forest Retreat'));
  assert.ok(freeNames.includes('Urban Minimal'));
});
