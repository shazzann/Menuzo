import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function load(path,deps={}) {
  const {outputText}=ts.transpileModule(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
  const module={exports:{}};
  vm.runInNewContext(outputText,{module,exports:module.exports,URL,require:name=>{assert.ok(name in deps,name);return deps[name];}});
  return module.exports;
}
const themes=load('src/lib/themeUtils.ts');
const instances=[];
let failure;
class Renderer {
  constructor(options){this.options=options;instances.push(this);}
  async download(options){this.downloadOptions=options;if(failure)throw failure;}
}
const qr=load('src/lib/qrCode.ts',{'qr-code-styling':{default:Renderer},'./themeUtils':themes});
const base={shopUrl:'https://menuzo.test/my-cafe',shopLogo:'https://images.test/logo.png?token=example',size:200,qrStyle:'classic',qrPattern:'square',primary:'#090A0C',accent:'#FB8500'};
for(const size of [64,180,200]) test(`a ${size}px preview downloads a separate 2048px PNG without resizing the preview`,async()=>{
  const options=qr.getQrOptions({...base,size});
  const original=JSON.stringify(options);
  await qr.downloadQrPng(options,'my-cafe-qr');
  const exported=instances.at(-1);
  assert.equal(exported.options.width,2048);assert.equal(exported.options.height,2048);
  assert.ok(exported.options.margin>=280,'Export includes a clear outer border');
  assert.equal(exported.options.imageOptions.margin,Math.round(5*2048/size));
  assert.equal(exported.downloadOptions.name,'my-cafe-qr');assert.equal(exported.downloadOptions.extension,'png');
  assert.equal(JSON.stringify(options),original);assert.equal(options.width,size);
});
test('exports preserve every selected QR pattern, colour, logo and URL',()=>{
  for(const pattern of qr.QR_PATTERNS) for(const qrStyle of ['classic','brand']) {
    const options=qr.getQrOptions({...base,qrStyle,qrPattern:pattern.value});
    const exported=qr.getQrExportOptions(options);
    assert.equal(exported.dotsOptions.type,pattern.value);
    assert.equal(exported.cornersSquareOptions.type,pattern.eyeFrame);
    assert.equal(exported.cornersDotOptions.type,pattern.eyeBall);
    assert.equal(exported.data,'https://menuzo.test/my-cafe?source=qr');
    assert.equal(exported.image,base.shopLogo,'Signed image query strings remain intact');
    assert.equal(exported.imageOptions.crossOrigin,'anonymous');
    assert.equal(exported.qrOptions.errorCorrectionLevel,'H');
    assert.equal(exported.dotsOptions.color,qrStyle==='classic'?'#000000':'#FB8500');
  }
});
test('tracking preserves query parameters and fragments without duplicate source parameters',()=>{
  const options=qr.getQrOptions({...base,shopUrl:'https://menuzo.test/cafe?table=4&source=old#menu'});
  const url=new URL(options.data);
  assert.equal(url.searchParams.get('table'),'4');assert.deepEqual(url.searchParams.getAll('source'),['qr']);assert.equal(url.hash,'#menu');
});
test('the latest menu URL and removal of a logo update the generated options',()=>{
  const options=qr.getQrOptions({...base,shopUrl:'https://menuzo.test/renamed-cafe',shopLogo:undefined});
  assert.equal(options.data,'https://menuzo.test/renamed-cafe?source=qr');assert.equal(options.image,'');
});
test('failed downloads reject so callers cannot report success',async()=>{
  failure=new Error('Export failed');
  try {await assert.rejects(qr.downloadQrPng(qr.getQrOptions(base),'qr'),/Export failed/);} finally {failure=undefined;}
});
test('only square and rounded shapes are offered, and older saved patterns map onto them',()=>{
  assert.equal(qr.QR_PATTERNS.map(p=>p.value).join(),'square,rounded');
  for(const [saved,expected] of [['square','square'],['classy','square'],[undefined,'square'],['rounded','rounded'],['dots','rounded'],['extra-rounded','rounded'],['classy-rounded','rounded']]) {
    assert.equal(qr.getQrOptions({...base,qrPattern:saved}).dotsOptions.type,expected,String(saved));
  }
  assert.equal(qr.getQrOptions({...base,qrStyle:'minimal'}).dotsOptions.color,'#000000','Unknown colour styles fall back to black and white');
});
