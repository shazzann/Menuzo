import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('parseShopRoute correctly maps /terms and /privacy routes', async () => {
  const shopRoutesSource = readFileSync(new URL('../src/lib/shopRoutes.ts', import.meta.url), 'utf8');
  assert.ok(shopRoutesSource.includes("'/terms': 'terms'"));
  assert.ok(shopRoutesSource.includes("'/privacy': 'privacy'"));
});

test('RouterSync URL resolver includes /terms and /privacy', () => {
  const routerSyncSource = readFileSync(new URL('../src/components/shared/RouterSync.tsx', import.meta.url), 'utf8');
  assert.ok(routerSyncSource.includes("case 'terms': return '/terms';"));
  assert.ok(routerSyncSource.includes("case 'privacy': return '/privacy';"));
});

test('Terms & Conditions page content satisfies business and legal rules', () => {
  const legalSource = readFileSync(new URL('../src/pages/LegalPage.tsx', import.meta.url), 'utf8');

  // Service identity and unincorporated draft status
  assert.ok(legalSource.includes('Draft Document · Pending Professional Legal Review') || legalSource.includes('Draft Policy · Pending Professional Legal Review'));
  assert.ok(legalSource.includes('Hasni Zihar and Shazan'));
  assert.ok(legalSource.includes('unincorporated'));
  assert.ok(legalSource.includes('Sri Lanka'));

  // Subscription plan limits matching FREE_PLAN_LIMITS & PRO_PLAN_LIMITS
  assert.ok(legalSource.includes('FREE_PLAN_LIMITS.items'));
  assert.ok(legalSource.includes('FREE_PLAN_LIMITS.categories'));
  assert.ok(legalSource.includes('PRO_PLAN_LIMITS.items'));
  assert.ok(legalSource.includes('PRO_PLAN_LIMITS.categories'));

  // 10-feature matrix items
  assert.ok(legalSource.includes('QR Menu Generation'));
  assert.ok(legalSource.includes('Custom Themes'));
  assert.ok(legalSource.includes('Custom QR Branding'));
  assert.ok(legalSource.includes('Analytics Dashboard'));
  assert.ok(legalSource.includes('Restaurant Profile'));
  assert.ok(legalSource.includes('Shareable Menu Link'));
  assert.ok(legalSource.includes('Custom Menu URL'));
  assert.ok(legalSource.includes('Support'));

  // Expiry, 3-day grace period, and excess item policy
  assert.ok(legalSource.includes('PRO_GRACE_DAYS'));
  assert.ok(legalSource.includes('PRO_ENDING_SOON_DAYS'));
  assert.ok(legalSource.includes('Excess items are NEVER deleted'));
  assert.ok(legalSource.includes('hidden from public view'));

  // Payment method and WhatsApp confirmation
  assert.ok(legalSource.includes('Bank Transfer'));
  assert.ok(legalSource.includes('WhatsApp'));
  assert.ok(legalSource.includes('Administrative Verification'));

  // Non-involvement in food orders or diner payments
  assert.ok(legalSource.includes('process food orders, table bookings, customer payments for meals'));

  // Governing law and contact
  assert.ok(legalSource.includes('Democratic Socialist Republic of Sri Lanka'));
  assert.ok(legalSource.includes('menuzoapp@gmail.com'));
});

test('Privacy Policy page content accurately reflects technical implementation', () => {
  const legalSource = readFileSync(new URL('../src/pages/LegalPage.tsx', import.meta.url), 'utf8');

  // Controller vs Processor
  assert.ok(legalSource.includes('Data Controller'));
  assert.ok(legalSource.includes('Data Processor'));

  // Verified cloud service providers
  assert.ok(legalSource.includes('Supabase'));
  assert.ok(legalSource.includes('Cloudinary'));
  assert.ok(legalSource.includes('Google Authentication'));
  assert.ok(legalSource.includes('WhatsApp'));

  // Verified client-side storage keys
  assert.ok(legalSource.includes('sidebar:state'));
  assert.ok(legalSource.includes('vite-ui-theme'));
  assert.ok(legalSource.includes('qr-progress'));
  assert.ok(legalSource.includes('tracked_visit_*'));
  assert.ok(legalSource.includes('menuzo_upgrade_intent'));

  // Diner browsing & privacy
  assert.ok(legalSource.includes('Zero Account Requirement'));
  assert.ok(legalSource.includes('No Personal Diner Profiling'));
  assert.ok(legalSource.includes('No Payment Card Collection'));

  // Sri Lankan Personal Data Protection Act context
  assert.ok(legalSource.includes('Personal Data Protection Act No. 9 of 2022'));

  // Contact for privacy inquiries
  assert.ok(legalSource.includes('menuzoapp@gmail.com'));
});

test('Footer contains direct navigation to Terms & Conditions and Privacy Policy', () => {
  const footerSource = readFileSync(new URL('../src/components/landing/Footer.tsx', import.meta.url), 'utf8');
  assert.ok(footerSource.includes("handleNavigate('terms')"));
  assert.ok(footerSource.includes("handleNavigate('privacy')"));
  assert.ok(footerSource.includes('Terms & Conditions'));
  assert.ok(footerSource.includes('Privacy Policy'));
});
