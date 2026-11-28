import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, dependencies = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, Intl, Date,
    require(name) { assert.ok(name in dependencies, name); return dependencies[name]; },
  });
  return module.exports;
}

const time = load('src/lib/timeUtils.ts');
const availability = load('src/lib/foodAvailability.ts');
const shopData = load('src/lib/shopData.ts', { './timeUtils': time });
const at = (value) => new Date(value);
// Open 10:00-22:00 every day except Monday. 2026-11-28 is a Saturday.
const week = [0, 1, 2, 3, 4, 5, 6].map((day) => ({ type: 'regular', dayOfWeek: day, isOpen: day !== 1, openTime: '10:00', closeTime: '22:00' }));

test('sold out for today returns at the next open day opening time', () => {
  assert.equal(time.nextBusinessDayStart(week, at('2026-11-28T21:00:00+05:30')).toISOString(), '2026-11-29T04:30:00.000Z');
  // Late on Saturday in Colombo (still Saturday UTC+5:30) is still Saturday's business day.
  assert.equal(time.nextBusinessDayStart(week, at('2026-11-28T18:20:00Z')).toISOString(), '2026-11-29T04:30:00.000Z');
  // Before opening on Saturday still means today: it comes back on Sunday.
  assert.equal(time.nextBusinessDayStart(week, at('2026-11-28T07:00:00+05:30')).toISOString(), '2026-11-29T04:30:00.000Z');
});

test('closed days and closed special dates are skipped', () => {
  assert.equal(time.nextBusinessDayStart(week, at('2026-11-29T12:00:00+05:30')).toISOString(), '2026-12-01T04:30:00.000Z');
  const poya = [...week, { type: 'special', date: '2026-11-29', isOpen: false, openTime: '00:00', closeTime: '00:00' }];
  assert.equal(time.nextBusinessDayStart(poya, at('2026-11-28T21:00:00+05:30')).toISOString(), '2026-12-01T04:30:00.000Z');
  const lateOpen = [...week, { type: 'special', date: '2026-11-29', isOpen: true, openTime: '14:00', closeTime: '20:00' }];
  assert.equal(time.nextBusinessDayStart(lateOpen, at('2026-11-28T21:00:00+05:30')).toISOString(), '2026-11-29T08:30:00.000Z');
});

test('without opening hours the item returns at midnight', () => {
  assert.equal(time.nextBusinessDayStart([], at('2026-11-28T21:00:00+05:30')).toISOString(), '2026-11-28T18:30:00.000Z');
  const closedAllWeek = week.map((s) => ({ ...s, isOpen: false }));
  assert.equal(time.nextBusinessDayStart(closedAllWeek, at('2026-11-28T21:00:00+05:30')).toISOString(), '2026-11-28T18:30:00.000Z');
});

test('a future hold hides the item; a past hold or permanent switch-off does not show a return time', () => {
  const row = { id: 'a', name: 'Latte', original_price: 700, final_price: 700, discount: 0, is_available: true, is_special_offer: false };
  const future = new Date(Date.now() + 3_600_000).toISOString();
  const past = new Date(Date.now() - 3_600_000).toISOString();
  const [held, expired, off] = shopData.formatFood([
    { ...row, unavailable_until: future },
    { ...row, id: 'b', unavailable_until: past },
    { ...row, id: 'c', is_available: false, unavailable_until: future },
  ]);
  assert.equal(held.isAvailable, false);
  assert.equal(held.unavailableUntil, future);
  assert.equal(availability.foodAvailability(held), 'today');
  assert.equal(expired.isAvailable, true);
  assert.equal(expired.unavailableUntil, undefined);
  assert.equal(availability.foodAvailability(expired), 'available');
  assert.equal(off.isAvailable, false);
  assert.equal(off.unavailableUntil, undefined);
  assert.equal(availability.foodAvailability(off), 'off');
});

test('return time reads naturally', () => {
  const now = at('2026-11-28T21:00:00+05:30');
  assert.equal(availability.formatReturnTime('2026-11-29T04:30:00.000Z', now), 'tomorrow at 10:00 AM');
  assert.equal(availability.formatReturnTime('2026-12-01T04:30:00.000Z', now), 'Tue 1 Dec at 10:00 AM');
  assert.equal(availability.formatReturnTime('2026-11-28T18:30:00.000Z', now), 'at midnight');
});
