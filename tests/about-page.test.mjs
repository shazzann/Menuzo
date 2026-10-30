import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('parseShopRoute correctly maps /about and /about-us routes to about view', () => {
  const shopRoutesSource = readFileSync(new URL('../src/lib/shopRoutes.ts', import.meta.url), 'utf8');
  assert.ok(shopRoutesSource.includes("'/about': 'about'"));
  assert.ok(shopRoutesSource.includes("'/about-us': 'about'"));
});

test('RouterSync URL resolver includes /about', () => {
  const routerSyncSource = readFileSync(new URL('../src/components/shared/RouterSync.tsx', import.meta.url), 'utf8');
  assert.ok(routerSyncSource.includes("case 'about': return '/about';"));
});

test('AboutPage contains minimal About Menuzo and Co-Founders sections', () => {
  const aboutSource = readFileSync(new URL('../src/pages/AboutPage.tsx', import.meta.url), 'utf8');

  // Heading & description
  assert.ok(aboutSource.includes('About Menuzo'));
  assert.ok(aboutSource.includes('Menuzo is a digital menu platform that helps restaurants create, customize, and share their menus through QR codes and simple web links. Built with simplicity and accessibility in mind, Menuzo makes digital menu management easier for restaurants of all sizes.'));

  // Co-Founders section
  assert.ok(aboutSource.includes('Meet the Co-Founders'));
  assert.ok(aboutSource.includes('Hasni Zihar'));
  assert.ok(aboutSource.includes('Shazan'));
  assert.ok(aboutSource.includes('Co-Founder'));
});

test('Footer includes direct navigation to About Us while Navbar does not contain About', () => {
  const navbarSource = readFileSync(new URL('../src/components/landing/Navbar.tsx', import.meta.url), 'utf8');
  // Navbar navLinks should not contain About
  assert.ok(!navbarSource.includes("{ name: 'About'"));

  const footerSource = readFileSync(new URL('../src/components/landing/Footer.tsx', import.meta.url), 'utf8');
  assert.ok(footerSource.includes("handleNavigate('about')"));
  assert.ok(footerSource.includes('About Us'));
});
