import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
function load(path,deps={},globals={}) {
  const source=readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
  const module={exports:{}};
  vm.runInNewContext(outputText,{module,exports:module.exports,URL,console,require(name){assert.ok(name in deps,name);return deps[name];},...globals});
  return module.exports;
}
const urls=load('src/lib/shopUrls.ts');
const shop={id:'shop',name:'Cafe',username:'original-shop',menuSlug:'purchased-custom',theme:{primary:'#090A0C',secondary:'#1C1E22',accent:'#FB8500'},openingHours:[],isOpen:true,logo:'',banner:''};
const food={id:'meal',name:'Lunch',category:'Meals',isAvailable:true,originalPrice:100,finalPrice:100};
function nodes(tree){if(!tree||typeof tree!=='object')return[];if(Array.isArray(tree))return tree.flatMap(nodes);return[tree,...nodes(tree.props?.children)];}
function page(name,share) {
  const path=`src/pages/${name}.tsx`,deps={},calls=[];
  const source=readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
  for(const match of source.matchAll(/import \{([^}]+)\} from '([^']+)'/g)) {
    deps[match[2]]=Object.fromEntries(match[1].split(',').map(value=>{const key=value.trim();return[key,key];}));
  }
  Object.assign(deps,{
    react:{useState:initial=>[typeof initial==='function'?initial():initial,()=>{}],useEffect(){},useLayoutEffect(){},useRef:()=>({current:null}),useMemo:fn=>fn()},
    'react/jsx-runtime':jsx,'react-router-dom':{useLocation:()=>({}),useNavigate:()=>()=>{}},
    '@/store':{useApp:()=>({state:{shop,foodItems:[food],categories:[{id:'all',name:'All'}],selectedFoodItem:food,user:{subscription:{plan:'free'}},currentView:name==='FoodDetailPage'?'customer-food-detail':'customer-menu',searchQuery:'',selectedCategory:'all'},dispatch(){}})},
    '@/lib/shopUrls':urls,'@/lib/shopAnalytics':load('src/lib/shopAnalytics.ts'),'@/lib/subscription':{isProActive:()=>false},'@/lib/themeUtils':{isBrandTheme:()=>true},
    '@/lib/timeUtils':{checkShopStatus:()=>({isOpen:true})},
    '@/lib/qrCode':{normalizeQrColorStyle:()=>'classic',normalizeQrPattern:()=>'square',QR_PATTERNS:[],QR_COLOR_STYLES:[]},
    '@/hooks/useOnboardingStatus':{useOnboardingStatus:()=>({isComplete:false})},'@/hooks/useSEO':{useSEO(){}},
    sonner:{toast:{success(){},error(){}}},
  });
  const navigator={clipboard:{writeText:async url=>calls.push(url)},...(share?{share:async data=>calls.push(data.url)}:{})};
  const component=load(path,deps,{navigator,window:{location:{origin:'https://menuzo.test',href:'https://menuzo.test/original-shop?source=qr'}}})[name];
  return{tree:nodes(component()),calls};
}

test('preferred URL builders use purchased slug and encode food IDs without QR tracking',()=>{
  assert.equal(urls.getShopMenuUrl(shop,'https://menuzo.test'),'https://menuzo.test/purchased-custom');
  assert.equal(urls.getShopMenuUrl(shop,'https://menuzo.test','a/b'),'https://menuzo.test/purchased-custom/food/a%2Fb');
  assert.equal(urls.getShopMenuPath({username:'standard'}),'/standard');
  assert.equal(urls.replaceMenuSlug('/old/food/meal?source=qr#details','new'),'/new/food/meal?source=qr#details');
});
for(const native of [true,false]) for(const name of ['CustomerMenuPage','FoodDetailPage']) test(`${name} ${native?'native sharing':'clipboard fallback'} uses the purchased URL`,async()=>{
  const app=page(name,native);
  const button=app.tree.find(node=>node.type==='button'&&nodes(node.props.children).some(child=>child.type==='Share2'));
  assert.ok(button);await button.props.onClick();
  assert.deepEqual(app.calls,[`https://menuzo.test/purchased-custom${name==='FoodDetailPage'?'/food/meal':''}`]);
});
for(const [name,component] of [['AdminQrPage','AdminQrSettings'],['UserDashboardPage','SmallQrPreview']]) test(`${name} passes the purchased URL to its QR generator`,()=>{
  const app=page(name,false);const qr=app.tree.find(node=>node.type===component);
  assert.ok(qr);assert.equal(qr.props.shopUrl,'https://menuzo.test/purchased-custom');
});

test('server canonical resolution errors cannot silently fall back to another URL',async()=>{
  const calls=[];
  const {RestaurantService}=load('src/services/restaurant.service.ts',{
    '@/lib/shopAnalytics':{},'@/lib/supabase':{supabase:{rpc:async name=>{calls.push(name);return{error:{code:'network'}};}}},
  });
  await assert.rejects(RestaurantService.getRestaurantByUsername('old'));
  assert.deepEqual(calls,['resolve_menu_shop_url']);
});
