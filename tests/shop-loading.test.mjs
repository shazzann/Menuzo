import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import React from 'react';
import * as jsx from 'react/jsx-runtime';

function load(path,deps={},globals={},extra='') {
  const source=readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
  const module={exports:{}};
  vm.runInNewContext(outputText+extra,{module,exports:module.exports,console,require(name){assert.ok(name in deps,name);return deps[name];},...globals});
  return module.exports;
}
const routes=load('src/lib/shopRoutes.ts');
const formatting=load('src/lib/shopData.ts',{'./timeUtils':{filterExpiredSpecialDates:value=>value}});
const user={id:'owner',email:'owner@example.test',subscription:{plan:'free',status:'active',expiresAt:null}};
const row=(id,username)=>({id,username,name:`${username} name`,logo:`${username}.png`,banner:'banner.jpg',description:'Saved description',is_open:true,opening_hours:[]});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};

function hooks() {
  const refs=[],effects=[];let refIndex=0,effectIndex=0;
  return {
    api:{useRef(initial){const i=refIndex++;return refs[i] ||= {current:initial};},useEffect(fn,deps){const i=effectIndex++;const prev=effects[i];if(!prev||deps.some((value,n)=>!Object.is(value,prev.deps[n]))) effects[i]={fn,deps,cleanup:prev?.cleanup,pending:true};}},
    render(fn){refIndex=0;effectIndex=0;fn();},
    effects(){for(const effect of effects)if(effect.pending){effect.cleanup?.();effect.pending=false;effect.cleanup=effect.fn();}},
    dispose(){for(const effect of effects)effect.cleanup?.();},
  };
}
function app(path,options={}) {
  let state,reducer;const actions=[],publicQueries=[],ownerQueries=[],navigations=[];
  const store=load('src/store/index.tsx',{
    react:{...React,useReducer(fn,initial){reducer=fn;state=initial;return[state,()=>{}];}},
    'react/jsx-runtime':jsx,'@/lib/shopRoutes':routes,
  },{window:{location:{pathname:path}}});
  store.AppProvider({children:null});
  const dispatch=action=>{actions.push(action);state=reducer(state,action);};
  const router={useLocation:()=>({pathname:path}),useNavigate:()=>navigate};
  const navigate=next=>{navigations.push(next);path=next;};
  const deps={
    '@/store':{useApp:()=>({state,dispatch})},'react-router-dom':router,'@/lib/shopRoutes':routes,'@/lib/shopData':formatting,
    '@/services':{
      RestaurantService:{
        getRestaurantByUsername:async slug=>{publicQueries.push(slug);return options.publicShop ? options.publicShop(slug) : row('public-'+slug,slug);},
        getRestaurantByUserId:async id=>{ownerQueries.push(id);return options.ownerShop ? options.ownerShop(id) : row('owned-shop','my-cafe');},
        getShopDailyStats:async()=>{if(options.statsError)throw Error('stats offline');return[];},
      },
      MenuService:{getMenuByShopId:async id=>options.food ? options.food(id) : [{id:'food-'+id,name:'Meal',final_price:100,original_price:100,is_available:true}]},
    },
  };
  const mounted=['RouterSync','PublicDataLoader','AdminDataLoader'].map(name=>{const h=hooks();const module=load(`src/components/shared/${name}.tsx`,{...deps,react:h.api});return{h,fn:module[name]};});
  return {
    get state(){return state;},get path(){return path;},dispatch,actions,publicQueries,ownerQueries,navigations,
    go(next){path=next;},
    async pump(times=5){for(let n=0;n<times;n++){for(const m of mounted)m.h.render(m.fn);for(const m of mounted)m.h.effects();await new Promise(resolve=>setImmediate(resolve));}},
    dispose(){mounted.forEach(m=>m.h.dispose());},
  };
}

test('refresh resolves the exact nested settings page instead of generic settings',()=>{
  for(const [path,view] of [['/my-cafe/settings/shop','admin-shop-details'],['/my-cafe/settings/theme','admin-theme'],['/my-cafe/food/123','customer-food-detail'],['/signup','signup'],['/admin-login','company-admin-login']]) assert.equal(routes.parseShopRoute(path).view,view);
});
test('owner shop details refresh waits for saved data and tolerates unavailable analytics',async()=>{
  const response=deferred();const page=app('/my-cafe/settings/shop',{ownerShop:()=>response.promise,statsError:true});
  page.dispatch({type:'LOGIN',payload:user});await page.pump();
  assert.equal(page.state.currentView,'admin-shop-details');assert.equal(page.state.shopDataStatus,'loading');
  assert.equal(page.path,'/my-cafe/settings/shop');
  response.resolve(row('owned-shop','my-cafe'));await page.pump();
  assert.equal(page.state.shopDataStatus,'ready');assert.equal(page.state.shop.name,'my-cafe name');
  assert.equal(page.state.shop.banner,'banner.jpg');assert.equal(page.state.shopDataContext,'owner:owner');
  assert.equal(page.publicQueries.length,0);page.dispose();
});
test('a signed-in owner can visit another shop without owner data overwriting the URL',async()=>{
  const page=app('/cafe14');page.dispatch({type:'LOGIN',payload:user});await page.pump();
  assert.equal(page.state.shop.username,'cafe14');assert.equal(page.state.shopDataContext,'public:cafe14');
  assert.equal(page.path,'/cafe14');assert.equal(page.ownerQueries.length,0);assert.equal(page.state.shopNotFound,false);
  page.go('/my-cafe');await page.pump();assert.equal(page.state.shop.username,'my-cafe');assert.equal(page.path,'/my-cafe');page.dispose();
});
test('session hydration preserves a public load already in flight',async()=>{
  const response=deferred();const page=app('/cafe14',{publicShop:()=>response.promise});await page.pump();
  page.dispatch({type:'LOGIN',payload:user});response.resolve(row('cafe14-id','cafe14'));await page.pump();
  assert.equal(page.state.shopDataStatus,'ready');assert.equal(page.state.shop.id,'cafe14-id');assert.equal(page.path,'/cafe14');page.dispose();
});
test('returning to the owner dashboard reloads owner data after visiting another shop',async()=>{
  const page=app('/my-cafe/dashboard');page.dispatch({type:'LOGIN',payload:user});await page.pump();
  page.go('/cafe14');await page.pump();assert.equal(page.state.shop.id,'public-cafe14');
  page.dispatch({type:'SET_VIEW',payload:'user-dashboard'});await page.pump();
  assert.equal(page.path,'/my-cafe/dashboard');assert.equal(page.state.shop.id,'owned-shop');assert.equal(page.ownerQueries.length,2);page.dispose();
});
test('late owner responses cannot replace a public menu or redirect it to onboarding',async()=>{
  const response=deferred();const page=app('/my-cafe/settings/shop',{ownerShop:()=>response.promise});
  page.dispatch({type:'LOGIN',payload:user});await page.pump();page.go('/cafe14');await page.pump();
  response.resolve(null);await page.pump();assert.equal(page.state.currentView,'customer-menu');assert.equal(page.state.shop.id,'public-cafe14');assert.equal(page.path,'/cafe14');page.dispose();
});
test('late public food responses cannot overwrite the next shop',async()=>{
  const response=deferred();const page=app('/slow-shop',{food:id=>id==='public-slow-shop'?response.promise:[]});
  await page.pump();page.go('/fast-shop');await page.pump();response.resolve([{id:'stale',name:'Old meal'}]);await page.pump();
  assert.equal(page.state.shop.username,'fast-shop');assert.equal(page.state.foodItems.length,0);page.dispose();
});
test('missing shops stay at their URL and a later valid shop clears not-found state',async()=>{
  const page=app('/missing',{publicShop:slug=>slug==='missing'?null:row('valid',slug)});await page.pump();
  assert.equal(page.state.shopDataStatus,'not-found');assert.equal(page.path,'/missing');
  page.go('/cafe14');await page.pump();assert.equal(page.state.shopDataStatus,'ready');assert.equal(page.state.shopNotFound,false);page.dispose();
});
test('network failures have a retry state instead of a false shop-not-found result',async()=>{
  let fail=true;const page=app('/cafe14',{publicShop:()=>{if(fail)throw Error('offline');return row('cafe','cafe14');}});await page.pump();
  assert.equal(page.state.shopDataStatus,'error');assert.equal(page.state.shopNotFound,false);
  fail=false;page.dispatch({type:'RETRY_SHOP_LOAD'});await page.pump();assert.equal(page.state.shopDataStatus,'ready');page.dispose();
});
test('food deep links hydrate the selected food atomically with shop data',async()=>{
  const page=app('/cafe14/food/food-public-cafe14');page.dispatch({type:'LOGIN',payload:user});await page.pump();
  assert.equal(page.state.shopDataStatus,'ready');assert.equal(page.state.selectedFoodItem.id,'food-public-cafe14');
  assert.equal(page.path,'/cafe14/food/food-public-cafe14');page.dispose();
});

test('the details form only mounts after owner data is ready, preventing empty initial form values',async()=>{
  const response=deferred();const page=app('/my-cafe/settings/shop',{ownerShop:()=>response.promise});
  page.dispatch({type:'LOGIN',payload:user});await page.pump();
  const dependencies={},components={};
  const source=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  for(const match of source.matchAll(/import \{([^}]+)\} from '([^']+)'/g)) {
    dependencies[match[2]]={};
    for(const name of match[1].split(',').map(name=>name.trim())) {
      const component=()=>null;components[name]=component;dependencies[match[2]][name]=component;
    }
  }
  Object.assign(dependencies,{
    react:{useEffect(){},useState:()=>[false,()=>{}]},'react/jsx-runtime':jsx,
    '@/store':{useApp:()=>({state:page.state,dispatch:page.dispatch})},
    'react-router-dom':{useLocation:()=>({pathname:page.path})},'@/lib/shopRoutes':routes,
  });
  const {AppContent}=load('src/App.tsx',dependencies,{},';module.exports.AppContent=AppContent;');
  assert.notEqual(AppContent().type,components.AdminShopDetailsPage);
  response.resolve(row('owned-shop','my-cafe'));await page.pump();
  const rendered=AppContent();assert.equal(rendered.type,components.AdminShopDetailsPage);
  assert.equal(page.state.shop.name,'my-cafe name');assert.equal(rendered.key,'owned-shop');page.dispose();
});
