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

test('Plan configuration defines Free (10 items, 2 categories), Plus (100 items, 20 categories), and Enterprise (500 items, 50 categories)', () => {
  assert.equal(subscription.FREE_PLAN_LIMITS.items, 10);
  assert.equal(subscription.FREE_PLAN_LIMITS.categories, 2);
  assert.equal(subscription.PLUS_PLAN_LIMITS.items, 100);
  assert.equal(subscription.PLUS_PLAN_LIMITS.categories, 20);
  assert.equal(subscription.PRO_PLAN_LIMITS.items, 100); // Backward compatibility check
  assert.equal(subscription.PRO_PLAN_LIMITS.categories, 20);
  assert.equal(subscription.ENTERPRISE_PLAN_LIMITS.items, 500);
  assert.equal(subscription.ENTERPRISE_PLAN_LIMITS.categories, 50);

  const freeUser = subscription.freeSubscription();
  assert.deepEqual(plain(subscription.getPlanLimits(freeUser)), { items: 10, categories: 2 });

  const activePlus = { plan: 'plus', status: 'active', expiresAt: new Date(Date.now() + 86400000 * 30) };
  assert.deepEqual(plain(subscription.getPlanLimits(activePlus)), { items: 100, categories: 20 });

  const activePro = { plan: 'pro', status: 'active', expiresAt: new Date(Date.now() + 86400000 * 30) };
  assert.deepEqual(plain(subscription.getPlanLimits(activePro)), { items: 100, categories: 20 });

  const activeEnterprise = { plan: 'enterprise', status: 'active', expiresAt: new Date(Date.now() + 86400000 * 30) };
  assert.deepEqual(plain(subscription.getPlanLimits(activeEnterprise)), { items: 500, categories: 50 });
});

test('PricingService default plans reflect 3-tier structure (Free, Plus, Enterprise)', () => {
  const plans = pricingService.PricingService.getPlans();
  const free = plans.find(p => p.id === 'free');
  const plus = plans.find(p => p.id === 'plus');
  const enterprise = plans.find(p => p.id === 'enterprise');

  assert.ok(free, 'Free plan must exist');
  assert.ok(plus, 'Plus plan must exist');
  assert.ok(enterprise, 'Enterprise plan must exist');

  // Free features check
  assert.ok(free.features.includes('10 Food Items'));
  assert.ok(free.features.includes('2 Categories'));
  assert.ok(free.features.includes('Digital Menu'));
  assert.ok(free.features.includes('QR Code Generation'));
  assert.ok(free.features.includes('Restaurant Profile'));
  assert.ok(free.features.includes('Shareable Menu Link'));
  assert.ok(free.features.includes('Standard Support'));

  // Plus features check
  assert.ok(plus.features.includes('100 Food Items'));
  assert.ok(plus.features.includes('20 Categories'));
  assert.ok(plus.features.includes('Custom Themes'));
  assert.ok(plus.features.includes('QR Branding'));
  assert.ok(plus.features.includes('Analytics Dashboard'));
  assert.ok(plus.features.includes('Custom Menu URL'));
  assert.equal(plus.price, 'LKR 1,500');

  // Enterprise features check
  assert.ok(enterprise.features.includes('500 Food Items'));
  assert.ok(enterprise.features.includes('50 Categories'));
  assert.ok(enterprise.features.includes('All Plus Features'));
  assert.ok(enterprise.features.includes('Advanced Customization'));
  assert.ok(enterprise.features.includes('Priority Support'));
  assert.ok(enterprise.features.includes('All Available Menuzo Features'));
  assert.equal(enterprise.price, 'LKR 6,000');
});

test('Item and category limit boundary enforcement helpers', () => {
  const freeUser = subscription.freeSubscription();
  const activePlus = { plan: 'plus', status: 'active', expiresAt: new Date(Date.now() + 86400000) };
  const activeEnterprise = { plan: 'enterprise', status: 'active', expiresAt: new Date(Date.now() + 86400000) };

  // Free items: 10 max
  assert.equal(subscription.canCreateItem(9, freeUser), true);
  assert.equal(subscription.canCreateItem(10, freeUser), false);
  assert.equal(subscription.canCreateItem(11, freeUser), false);

  // Free categories: 2 max
  assert.equal(subscription.canCreateCategory(1, freeUser), true);
  assert.equal(subscription.canCreateCategory(2, freeUser), false);

  // Plus items: 100 max
  assert.equal(subscription.canCreateItem(99, activePlus), true);
  assert.equal(subscription.canCreateItem(100, activePlus), false);
  assert.equal(subscription.canCreateItem(101, activePlus), false);

  // Plus categories: 20 max
  assert.equal(subscription.canCreateCategory(19, activePlus), true);
  assert.equal(subscription.canCreateCategory(20, activePlus), false);

  // Enterprise items: 500 max
  assert.equal(subscription.canCreateItem(499, activeEnterprise), true);
  assert.equal(subscription.canCreateItem(500, activeEnterprise), false);
  assert.equal(subscription.canCreateItem(501, activeEnterprise), false);

  // Enterprise categories: 50 max
  assert.equal(subscription.canCreateCategory(49, activeEnterprise), true);
  assert.equal(subscription.canCreateCategory(50, activeEnterprise), false);
});

test('Feature entitlement inheritance', () => {
  const freeUser = subscription.freeSubscription();
  const activePlus = { plan: 'plus', status: 'active', expiresAt: new Date(Date.now() + 86400000) };
  const activeEnterprise = { plan: 'enterprise', status: 'active', expiresAt: new Date(Date.now() + 86400000) };

  // Free
  assert.equal(subscription.hasFeatureAccess(freeUser, 'digitalMenu'), true);
  assert.equal(subscription.hasFeatureAccess(freeUser, 'customThemes'), false);
  assert.equal(subscription.hasFeatureAccess(freeUser, 'prioritySupport'), false);

  // Plus
  assert.equal(subscription.hasFeatureAccess(activePlus, 'digitalMenu'), true);
  assert.equal(subscription.hasFeatureAccess(activePlus, 'customThemes'), true);
  assert.equal(subscription.hasFeatureAccess(activePlus, 'qrBranding'), true);
  assert.equal(subscription.hasFeatureAccess(activePlus, 'customUrl'), true);
  assert.equal(subscription.hasFeatureAccess(activePlus, 'prioritySupport'), false);
  assert.equal(subscription.hasFeatureAccess(activePlus, 'allFeatures'), false);

  // Enterprise inherits Plus and has enterprise entitlements
  assert.equal(subscription.hasFeatureAccess(activeEnterprise, 'digitalMenu'), true);
  assert.equal(subscription.hasFeatureAccess(activeEnterprise, 'customThemes'), true);
  assert.equal(subscription.hasFeatureAccess(activeEnterprise, 'qrBranding'), true);
  assert.equal(subscription.hasFeatureAccess(activeEnterprise, 'customUrl'), true);
  assert.equal(subscription.hasFeatureAccess(activeEnterprise, 'prioritySupport'), true);
  assert.equal(subscription.hasFeatureAccess(activeEnterprise, 'advancedCustomization'), true);
  assert.equal(subscription.hasFeatureAccess(activeEnterprise, 'allFeatures'), true);
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
