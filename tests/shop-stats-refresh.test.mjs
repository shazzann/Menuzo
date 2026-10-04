import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import React from 'react';
import * as jsx from 'react/jsx-runtime';
function load(path,deps={},globals={}) {
 const {outputText}=ts.transpileModule(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 const module={exports:{}};vm.runInNewContext(outputText,{module,exports:module.exports,Promise,require(name){assert.ok(name in deps,name);return deps[name];},...globals});return module.exports;
}
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const oldStats=[{date:'2026-10-04',views:3,qr_scans:1}];
function harness() {
 let state,reducer,effect,timer;const requests=[],windowEvents=new Map(),documentEvents=new Map();
 const routes=load('src/lib/shopRoutes.ts');
 const store=load('src/store/index.tsx',{'react/jsx-runtime':jsx,'@/lib/shopRoutes':routes,react:{...React,useReducer(fn,initial){state=initial;reducer=fn;return[state,()=>{}];}}},{window:{location:{pathname:'/'}}});
 store.AppProvider({children:null});const dispatch=action=>{state=reducer(state,action);};
 function owner(userId='owner',shopId='shop'){
  dispatch({type:'LOGIN',payload:{id:userId,subscription:{plan:'free'}}});
  dispatch({type:'SHOP_LOAD_START',payload:`owner:${userId}`});
  dispatch({type:'SHOP_LOAD_SUCCESS',payload:{context:`owner:${userId}`,shop:{id:shopId,username:'cafe',daily_stats:oldStats},food:[]}});
  dispatch({type:'SET_VIEW',payload:'user-dashboard'});
 }
 owner();
 const document={hidden:false,addEventListener:(name,fn)=>documentEvents.set(name,fn),removeEventListener:name=>documentEvents.delete(name)};
 const window={addEventListener:(name,fn)=>windowEvents.set(name,fn),removeEventListener:name=>windowEvents.delete(name),setInterval(fn,ms){assert.equal(ms,30000);timer=fn;return 1;},clearInterval(){timer=null;}};
 const {ShopAnalyticsDataLoader}=load('src/components/shared/ShopAnalyticsDataLoader.tsx',{
  react:{useEffect:fn=>{effect=fn;}},'@/store':{useApp:()=>({state,dispatch})},
  '@/services/restaurant.service':{RestaurantService:{getShopDailyStats(id){const request={id,...deferred()};requests.push(request);return request.promise;}}},
 },{window,document});
 return{get state(){return state;},dispatch,owner,requests,document,windowEvents,documentEvents,
  mount(){ShopAnalyticsDataLoader();return effect();},tick(){timer?.();}};
}

test('refresh updates the shared snapshot without resetting the active page; focus and visibility also refresh',async()=>{
 const app=harness(),cleanup=app.mount();await flush();assert.equal(app.requests.length,1);
 const fresh=[{date:'2026-10-04',views:8,qr_scans:2}];app.requests[0].resolve(fresh);await flush();
 assert.equal(app.state.shop.daily_stats,fresh);assert.equal(app.state.currentView,'user-dashboard');
 app.windowEvents.get('focus')();assert.equal(app.requests.length,2);app.tick();assert.equal(app.requests.length,2,'overlapping refresh is suppressed');
 app.requests[1].resolve(fresh);await flush();app.document.hidden=true;app.tick();assert.equal(app.requests.length,2);
 app.document.hidden=false;app.documentEvents.get('visibilitychange')();assert.equal(app.requests.length,3);
 cleanup();app.requests[2].resolve([]);await flush();assert.equal(app.state.shop.daily_stats,fresh);assert.equal(app.windowEvents.size,0);assert.equal(app.documentEvents.size,0);
});
test('refresh failure preserves the last valid graph and recovers on the next timer',async()=>{
 const app=harness(),cleanup=app.mount();await flush();app.requests[0].reject(Error('offline'));await flush();
 assert.equal(app.state.shop.daily_stats,oldStats);assert.match(app.state.shop.dailyStatsError,/Could not refresh/);
 app.tick();app.requests[1].resolve([]);await flush();assert.equal(app.state.shop.daily_stats.length,0);assert.equal(app.state.shop.dailyStatsError,'');cleanup();
});
test('old responses and guarded actions cannot replace another account or a public menu',async()=>{
 const app=harness(),cleanup=app.mount();await flush();cleanup();app.owner('second','second-shop');
 app.requests[0].resolve([{date:'2026-10-04',views:999,qr_scans:999}]);await flush();assert.equal(app.state.shop.id,'second-shop');assert.equal(app.state.shop.daily_stats,oldStats);
 app.dispatch({type:'SET_SHOP_STATS',payload:{userId:'owner',shopId:'shop',stats:[]}});assert.equal(app.state.shop.daily_stats,oldStats);
 app.dispatch({type:'SHOP_LOAD_START',payload:'public:cafe'});app.dispatch({type:'SHOP_LOAD_SUCCESS',payload:{context:'public:cafe',shop:{id:'second-shop',username:'cafe'},food:[]}});
 app.dispatch({type:'SET_SHOP_STATS',payload:{userId:'second',shopId:'second-shop',stats:oldStats}});assert.equal(app.state.shop.daily_stats,undefined);
});
test('statistics loader never fetches on customer or settings pages',async()=>{
 const app=harness();for(const view of ['customer-menu','admin-settings','landing']) {app.dispatch({type:'SET_VIEW',payload:view});assert.equal(app.mount(),undefined);}
 await flush();assert.equal(app.requests.length,0);
});

test('public visit errors remain retryable and successful visits are counted once per tab entry method',async()=>{
 const storage=new Map(),calls=[];let failed=true;const request=deferred();
 const {trackMenuVisit}=load('src/lib/menuVisits.ts',{'@/lib/supabase':{supabase:{rpc(name,args){calls.push([name,args]);return failed?Promise.resolve({error:Error('offline')}):request.promise;}}}},
  {sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}});
 await assert.rejects(trackMenuVisit('shop',false));assert.equal(storage.size,0);
 failed=false;const first=trackMenuVisit('shop',false);const strictModeDuplicate=trackMenuVisit('shop',false);assert.equal(first,strictModeDuplicate);
 request.resolve({error:null});await first;assert.equal(calls.length,2);assert.equal(storage.size,1);
 await trackMenuVisit('shop',false);assert.equal(calls.length,2);
 await trackMenuVisit('shop',true);assert.equal(calls.length,3);assert.equal(calls[2][1].p_is_qr,true);
});
