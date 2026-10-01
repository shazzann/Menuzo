import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function load(path, deps = {}, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  vm.runInNewContext(outputText, { module, exports: module.exports, require: name => { assert.ok(name in deps, name); return deps[name]; }, ...globals });
  return module.exports;
}
const themes = load('src/lib/themeUtils.ts');
function hexFromHsl(value) {
  let [h,s,l] = value.replaceAll('%','').split(' ').map(Number);
  h /= 360; s /= 100; l /= 100;
  const hue = n => { const k = (n + h * 12) % 12; return l - s * Math.min(l, 1-l) * Math.max(-1, Math.min(k-3, 9-k, 1)); };
  return '#' + [0,8,4].map(n => Math.round(hue(n) * 255).toString(16).padStart(2,'0')).join('');
}
const extraPalettes = [
  { name:'Midnight Spices', colors:{primary:'#1e1b4b',secondary:'#312e81',accent:'#f59e0b'} },
  { name:'Ocean Breeze', colors:{primary:'#0ea5e9',secondary:'#f0f9ff',accent:'#0284c7'} },
  { name:'Fresh Greens', colors:{primary:'#22c55e',secondary:'#f0fdf4',accent:'#16a34a'} },
  { name:'Light page with dark cards', colors:{primary:'#fff',secondary:'#111',accent:'#ff0'} },
];
for (const {name,colors} of [...themes.SHOP_THEME_PRESETS.slice(1), ...extraPalettes]) {
  test(`${name}: readable page, cards, prices, descriptions and buttons`, () => {
    const styles = themes.getShopThemeStyles(colors);
    for (const [surface,key] of [['page','--background'],['surface','--card']]) {
      const bg = hexFromHsl(styles[key]);
      for (const token of ['foreground','muted','primary-text']) {
        const ratio = themes.contrastRatio(hexFromHsl(styles[`--shop-${surface}-${token}`]), bg);
        assert.ok(ratio >= 4.5, `${surface} ${token}: ${ratio}`);
      }
    }
    assert.ok(themes.contrastRatio(hexFromHsl(styles['--primary']), hexFromHsl(styles['--primary-foreground'])) >= 4.5);
    const qr = themes.getShopQrColors(colors.primary,colors.accent);
    assert.ok(themes.contrastRatio(qr.bgColor,qr.fgColor) >= 7);
  });
}
test('Brand retains its original palette and every existing CSS token', () => {
  const expected = {
    '--background':'220 14% 4%', '--foreground':'210 20% 98%',
    '--popover':'220 14% 4%', '--popover-foreground':'210 20% 98%',
    '--card':'220 10% 12%', '--card-foreground':'210 20% 98%',
    '--secondary':'220 10% 12%', '--secondary-foreground':'210 20% 98%',
    '--muted':'220 10% 12%', '--muted-foreground':'215 14% 68%',
    '--primary':'32 100% 49%', '--primary-foreground':'222.2 84% 4.9%',
    '--accent':'32 100% 49%', '--accent-foreground':'222.2 84% 4.9%',
    '--ring':'32 100% 49%', '--border':'220 10% 20%', '--input':'220 10% 20%',
  };
  const styles=themes.getShopThemeStyles();
  for(const [key,value] of Object.entries(expected)) assert.equal(styles[key],value,key);
  assert.equal(styles['--shop-card-shadow'],'0 18px 50px rgba(0, 0, 0, 0.45)');
  assert.equal(styles['--shop-card-border'],'rgba(245, 247, 250, 0.08)');
  assert.equal(styles['--shop-map-pin'],'#F97316');
  assert.deepEqual(JSON.parse(JSON.stringify(themes.getShopQrColors('#090A0C','#FB8500'))),{bgColor:'#090A0C',fgColor:'#FB8500'});
});
test('malformed saved colours and partial editor input never emit NaN CSS', () => {
  for(const value of ['', '#', '#1234', '#zzzzzz', 'transparent']) {
    assert.equal(themes.isValidThemeColor(value),false);
    const result=themes.getShopThemeStyles({primary:value,secondary:value,accent:value});
    assert.equal(JSON.stringify(result).includes('NaN'),false);
    assert.equal(result['--background'],themes.getShopThemeStyles()['--background']);
  }
  assert.equal(themes.isValidThemeColor('#abc'),true);
});
test('runtime uses preview tokens and cleans every override on navigation and unmount', () => {
  let effect, state={currentView:'customer-menu',shop:{theme:themes.SHOP_THEME_PRESETS[2].colors}};
  const values=new Map(), attributes=new Map(), classes=new Set();
  const root={style:{setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)},setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k),classList:{add:k=>classes.add(k),remove:(...keys)=>keys.forEach(k=>classes.delete(k))}};
  const {ShopThemeApplier}=load('src/components/shared/ShopThemeApplier.tsx',{'react':{useEffect:fn=>{effect=fn;}},'@/store':{useApp:()=>({state})},'@/lib/themeUtils':themes},{document:{documentElement:root},localStorage:{getItem:()=>null}});
  ShopThemeApplier();const cleanup=effect();
  for(const [key,value] of Object.entries(themes.getShopThemeStyles(state.shop.theme))) assert.equal(values.get(key),value);
  assert.equal(attributes.get('data-shop-theme'),'custom');
  cleanup();assert.equal(values.size,0);assert.equal(attributes.size,0);assert.ok(classes.has('light'));
  state={...state,currentView:'landing'};ShopThemeApplier();effect();assert.equal(values.size,0);
});
