import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/authSession.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
const success = id => ({ data: { user: { id, email: `${id}@example.test` } }, error: null });
const failure = error => ({ data: { user: null }, error });
const flush = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setTimeout(resolve, 5)); };
function watch(getUser) {
  let listener; let unsubscribeCount = 0; const users = [], statuses = [], signouts = [];
  const auth = {
    getUser,
    onAuthStateChange(fn) { listener = fn; return { data: { subscription: { unsubscribe() { unsubscribeCount++; } } } }; },
    async signOut(options) { signouts.push(options.scope); listener('SIGNED_OUT', null); return { error: null }; },
  };
  const module = { exports: {} };
  vm.runInNewContext(outputText, { module, exports: module.exports, setTimeout, require: () => ({ supabase: { auth } }) });
  const stop = module.exports.watchAuthSession(user => users.push(user), (loading, error) => statuses.push({ loading, error }));
  return { users, statuses, signouts, stop, emit: (event, id) => listener(event, id ? { user: { id } } : null), get unsubscribed() { return unsubscribeCount; } };
}

test('restored users are not published until server verification succeeds', async () => {
  const request = deferred(); const app = watch(() => request.promise);
  assert.equal(app.users.length, 0); assert.equal(app.statuses[0].loading, true);
  request.resolve(success('owner')); await flush();
  assert.equal(app.users[0].id, 'owner'); assert.equal(app.statuses.at(-1).loading, false); app.stop();
});
test('expired/deleted sessions are cleared locally so login is available again', async () => {
  for (const error of [{ name: 'AuthSessionMissingError' }, { status: 401 }, { code: 'user_not_found' }]) {
    const app = watch(async () => failure(error)); await flush();
    assert.deepEqual(app.signouts, ['local']); assert.deepEqual(app.users, [null]); assert.equal(app.statuses.at(-1).error, ''); app.stop();
  }
});
test('temporary auth failures show retry without discarding the session', async () => {
  const app = watch(async () => failure({ status: 503 })); await flush();
  assert.equal(app.signouts.length, 0); assert.equal(app.users.length, 0); assert.match(app.statuses.at(-1).error, /try again/); app.stop();
});
test('late restoration cannot sign an account back in after logout', async () => {
  const request = deferred(); const app = watch(() => request.promise);
  app.emit('SIGNED_OUT'); request.resolve(success('old-owner')); await flush();
  assert.deepEqual(app.users, [null]); app.stop();
});
test('account switching ignores the previous verification response', async () => {
  const first = deferred(), second = deferred(); let count = 0;
  const app = watch(() => ++count === 1 ? first.promise : second.promise);
  app.emit('SIGNED_IN', 'new-owner'); await flush();
  second.resolve(success('new-owner')); await flush(); first.resolve(success('old-owner')); await flush();
  assert.deepEqual(app.users.map(user => user.id), ['new-owner']); app.stop();
});
test('focus and token refresh for an already verified user do not reload the page', async () => {
  let checks = 0; const app = watch(async () => { checks++; return success('owner'); }); await flush();
  app.emit('SIGNED_IN', 'owner'); app.emit('TOKEN_REFRESHED', 'owner'); await flush();
  assert.equal(checks, 1); assert.equal(app.users.length, 1); assert.equal(app.statuses.filter(status => status.loading).length, 1); app.stop();
});
test('unmount cancels pending checks and unsubscribes the auth listener', async () => {
  const request = deferred(); const app = watch(() => request.promise); app.stop();
  request.resolve(success('owner')); await flush(); assert.equal(app.users.length, 0); assert.equal(app.unsubscribed, 1);
});
