import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function load(path, deps) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  vm.runInNewContext(outputText, { module, exports: module.exports, Date, Math, crypto: globalThis.crypto, require(name) { assert.ok(name in deps, name); return deps[name]; } });
  return module.exports;
}

function fakeSupabase() {
  const calls = [];
  let presenceHandler, statusHandler, state = {};
  const channel = {
    on(type, filter, fn) { presenceHandler = fn; return channel; },
    subscribe(fn) { statusHandler = fn; return channel; },
    presenceState: () => state,
    track: async (payload) => { calls.push(['track', payload]); },
    untrack: async () => { calls.push(['untrack']); },
  };
  return {
    calls,
    client: { channel(name, opts) { calls.push(['channel', name, Boolean(opts?.config?.presence?.key)]); return channel; } },
    connect() { statusHandler('SUBSCRIBED'); },
    setState(next) { state = next; presenceHandler(); },
  };
}

function loadPresence(fake) {
  let effect;
  const presence = load('src/lib/online-presence.ts', {
    react: { useEffect: (fn) => { effect = fn; }, useSyncExternalStore: (sub, get) => { sub(() => {}); return get(); } },
    'react-router-dom': { useLocation: () => ({ pathname: presence.__path }) },
    '@/lib/supabase': { supabase: fake.client },
  });
  presence.render = (path) => { presence.__path = path; presence.OnlinePresenceTracker(); effect(); };
  return presence;
}

test('admin portal paths are recognised', () => {
  const p = loadPresence(fakeSupabase());
  assert.equal(p.isAdminPortalPath('/admin-portal'), true);
  assert.equal(p.isAdminPortalPath('/admin-portal/x'), true);
  assert.equal(p.isAdminPortalPath('/admin-portal-shop'), false);
  assert.equal(p.isAdminPortalPath('/admin-login'), true);
  assert.equal(p.isAdminPortalPath('/cafe'), false);
});

test('counts each tab once and ignores empty keys', () => {
  const p = loadPresence(fakeSupabase());
  assert.equal(p.countPresence({}), 0);
  assert.equal(p.countPresence({ a: [{}], b: [{}, {}], c: [] }), 2);
});

test('site tabs track themselves once connected; admin portal tabs untrack', () => {
  const fake = fakeSupabase();
  const p = loadPresence(fake);
  p.render('/cafe');
  assert.equal(fake.calls.filter((c) => c[0] === 'track').length, 0, 'waits for the connection');
  fake.connect();
  assert.equal(fake.calls.filter((c) => c[0] === 'track').length, 1);
  p.render('/admin-portal');
  assert.equal(fake.calls.filter((c) => c[0] === 'untrack').length, 1);
  assert.equal(fake.calls.filter((c) => c[0] === 'channel').length, 1, 'one shared channel per tab');
  assert.equal(fake.calls[0][1], 'menuzo-online');
  assert.equal(fake.calls[0][2], true, 'tracks under a random key');
});

test('admin count follows presence sync', () => {
  const fake = fakeSupabase();
  const p = loadPresence(fake);
  assert.equal(p.useOnlineCount(), null);
  fake.setState({ a: [{}], b: [{}], c: [{}] });
  assert.equal(p.useOnlineCount(), 3);
});
