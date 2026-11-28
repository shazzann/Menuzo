import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadSource(path, dependencies = {}) {
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
  vm.runInNewContext(
    outputText,
    {
      exports: module.exports,
      module,
      Date,
      require(name) {
        assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
        return dependencies[name];
      },
    },
    { filename: path }
  );
  return module.exports;
}

const plain = (val) => JSON.parse(JSON.stringify(val));

const subscription = loadSource('src/lib/subscription.ts');
const landingPricing = loadSource('src/lib/landingPricing.ts', {
  '@/lib/subscription': subscription,
});

const livePeriods = [
  { id: 'monthly', label: 'Monthly', months: 1, amount: 1500, currency: 'LKR', active: true },
  { id: 'yearly', label: 'Yearly', months: 12, amount: 15000, currency: 'LKR', active: true },
];

test('landing pricing adapter produces unified Free, Plus, and Business plans from verified limits', () => {
  const monthlyModel = landingPricing.buildLandingPricingModel(livePeriods, 'monthly', 'ready');
  assert.equal(monthlyModel.plans.length, 3);
  assert.deepEqual(
    plain(monthlyModel.plans.map((p) => p.id)),
    ['free', 'plus', 'business']
  );

  const free = monthlyModel.plans[0];
  const plus = monthlyModel.plans[1];
  const business = monthlyModel.plans[2];

  assert.equal(free.priceText, 'LKR 0');
  assert.match(free.limitsSummary, /10 dishes · 2 categories/);
  assert.equal(plus.priceText, 'LKR 1,500');
  assert.match(plus.limitsSummary, /100 dishes · 20 categories/);
  assert.equal(business.priceText, 'Custom');
  assert.equal(business.ctaLabel, 'Talk to us');

  // Comparison table uses the exact same verified limits
  const itemRow = monthlyModel.comparisonRows.find((r) => r.feature === 'Food items');
  const categoryRow = monthlyModel.comparisonRows.find((r) => r.feature === 'Categories');
  assert.equal(itemRow?.free, '10');
  assert.equal(itemRow?.plus, '100');
  assert.equal(categoryRow?.free, '2');
  assert.equal(categoryRow?.plus, '20');
});

test('landing pricing adapter computes annual monthly equivalent and savings only when billing data confirms them', () => {
  const yearlyModel = landingPricing.buildLandingPricingModel(livePeriods, 'yearly', 'ready');
  const plus = yearlyModel.plans.find((p) => p.id === 'plus');
  assert.equal(plus?.priceText, 'LKR 1,250');
  assert.match(plus?.billingNote || '', /Billed LKR 15,000 per year/);
  assert.match(plus?.billingNote || '', /Save LKR 3,000 \(16\.7%\)/);
  assert.equal(yearlyModel.hasConfirmedAnnualSavings, true);

  const failedModel = landingPricing.buildLandingPricingModel([], 'yearly', 'error');
  const failedPlus = failedModel.plans.find((p) => p.id === 'plus');
  assert.equal(failedPlus?.priceText, 'Unavailable');
  assert.equal(failedModel.hasConfirmedAnnualSavings, false);
  assert.equal(failedModel.pricingUnavailable, true);
});

test('landing page keeps 7-section structure, zero framer-motion, zero iframes, and no fake proof', () => {
  const landingPageSource = readFileSync(new URL('../src/pages/LandingPage.tsx', import.meta.url), 'utf8');
  const expectedOrder = [
    '<HeroSection />',
    '<ProblemSolutionSection />',
    '<HowItWorksSection />',
    '<FeaturesSection />',
    '<ProofSection />',
    '<PricingSection />',
    '<FAQSection />',
  ];
  let lastIndex = -1;
  for (const tag of expectedOrder) {
    const idx = landingPageSource.indexOf(tag);
    assert.ok(idx > lastIndex, `Expected ${tag} in order`);
    lastIndex = idx;
  }

  for (const file of [
    'src/pages/LandingPage.tsx',
    'src/components/landing/Navbar.tsx',
    'src/components/landing/HeroSection.tsx',
    'src/components/landing/ProblemSolutionSection.tsx',
    'src/components/landing/HowItWorksSection.tsx',
    'src/components/landing/FeaturesSection.tsx',
    'src/components/landing/ProofSection.tsx',
    'src/components/landing/PricingSection.tsx',
    'src/components/landing/FAQSection.tsx',
    'src/components/landing/FinalCTASection.tsx',
    'src/components/landing/Footer.tsx',
  ]) {
    const content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.ok(!content.includes('framer-motion'), `${file} must not import framer-motion`);
    assert.ok(!content.includes('<iframe'), `${file} must not render an iframe`);
  }

  const proofSource = readFileSync(new URL('../src/data/landingProof.ts', import.meta.url), 'utf8');
  assert.ok(proofSource.includes('LANDING_PROOF_ITEMS: LandingProofItem[] = []'));

  const contactSource = readFileSync(new URL('../src/lib/contact.ts', import.meta.url), 'utf8');
  assert.ok(contactSource.includes('VITE_WHATSAPP_NUMBER'));
  assert.ok(!contactSource.includes('bank_transfer_settings'));

  const heroSource = readFileSync(new URL('../src/components/landing/HeroSection.tsx', import.meta.url), 'utf8');
  assert.ok(heroSource.includes('https://menuzo.lk/spicegardenkitchen'));
  assert.ok(heroSource.includes('Explore a live menu'));
  assert.ok(heroSource.includes('Contact us'));
  assert.ok(heroSource.includes('FoodCard'));
  assert.ok(heroSource.includes('CategoryTabs'));
  assert.ok(heroSource.includes('/Landing/spice-garden-qr.svg'));

  const finalCtaSource = readFileSync(new URL('../src/components/landing/FinalCTASection.tsx', import.meta.url), 'utf8');
  assert.ok(finalCtaSource.includes('Contact us'));
});
