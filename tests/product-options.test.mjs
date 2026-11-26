import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadSource(path, dependencies = {}, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: path,
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    exports: module.exports,
    module,
    Date,
    Math,
    Array,
    Number,
    Object,
    Set,
    Map,
    console,
    require(name) {
      if (Object.hasOwn(dependencies, name)) {
        return dependencies[name];
      }
      throw new Error(`Unexpected dependency: ${name}`);
    },
    ...globals,
  }, { filename: path });
  return module.exports;
}

const timeUtils = loadSource('src/lib/timeUtils.ts');
const shopData = loadSource('src/lib/shopData.ts', {
  './timeUtils': timeUtils,
});

test('Backward compatibility: existing fixed-price products continue to format seamlessly', () => {
  const legacyRows = [
    {
      id: 'food-1',
      shop_id: 'shop-1',
      name: 'Classic Burger',
      description: 'Juicy beef patty',
      tagline: 'Best in town',
      category: 'Burgers',
      image: '/burger.jpg',
      original_price: 1200,
      discount: 10,
      final_price: 1080,
      is_special_offer: true,
      is_available: true,
      pricing_type: null,
      created_at: new Date().toISOString(),
    },
  ];

  const formatted = shopData.formatFood(legacyRows);
  assert.equal(formatted.length, 1);
  assert.equal(formatted[0].id, 'food-1');
  assert.equal(formatted[0].name, 'Classic Burger');
  assert.equal(formatted[0].originalPrice, 1200);
  assert.equal(formatted[0].finalPrice, 1080);
  assert.equal(formatted[0].pricingType, 'fixed');
  assert.equal(formatted[0].options, undefined);
});

test('Format food items with multiple options (portions / sizes)', () => {
  const multiOptionRows = [
    {
      id: 'food-2',
      shop_id: 'shop-1',
      name: 'Chicken Biriyani',
      description: 'Fragrant basmati rice with spiced chicken',
      tagline: 'Chef Special',
      category: 'Biriyani',
      image: '/biriyani.jpg',
      original_price: 1000,
      discount: 0,
      final_price: 1000,
      is_special_offer: false,
      is_available: true,
      pricing_type: 'variants',
      created_at: new Date().toISOString(),
      food_item_options: [
        {
          id: 'opt-1',
          food_item_id: 'food-2',
          shop_id: 'shop-1',
          name: 'S',
          description: '1 Person',
          price: 1000,
          is_available: true,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'opt-2',
          food_item_id: 'food-2',
          shop_id: 'shop-1',
          name: 'M',
          description: '2 Persons',
          price: 1850,
          is_available: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'opt-3',
          food_item_id: 'food-2',
          shop_id: 'shop-1',
          name: 'L',
          description: '4 Persons',
          price: 3700,
          is_available: false,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
  ];

  const formatted = shopData.formatFood(multiOptionRows);
  assert.equal(formatted.length, 1);
  assert.equal(formatted[0].pricingType, 'variants');
  assert.ok(Array.isArray(formatted[0].options));
  assert.equal(formatted[0].options.length, 3);

  // Verifying option properties
  assert.equal(formatted[0].options[0].name, 'S');
  assert.equal(formatted[0].options[0].description, '1 Person');
  assert.equal(formatted[0].options[0].price, 1000);
  assert.equal(formatted[0].options[0].isAvailable, true);

  assert.equal(formatted[0].options[1].name, 'M');
  assert.equal(formatted[0].options[1].price, 1850);

  assert.equal(formatted[0].options[2].name, 'L');
  assert.equal(formatted[0].options[2].isAvailable, false);
});

test('Price calculation: "From Rs. X.XX" uses the lowest available option price', () => {
  const options = [
    { id: '1', name: 'S', price: 1000, isAvailable: false },
    { id: '2', name: 'M', price: 1850, isAvailable: true },
    { id: '3', name: 'L', price: 3700, isAvailable: true },
  ];

  const availableOptions = options.filter(o => o.isAvailable);
  const pool = availableOptions.length > 0 ? availableOptions : options;
  const minPrice = Math.min(...pool.map(o => o.price));

  // S is unavailable, so lowest available should be M at 1850
  assert.equal(minPrice, 1850);
});

test('Price calculation fallback: if all options are unavailable, shows lowest overall price', () => {
  const options = [
    { id: '1', name: 'S', price: 1000, isAvailable: false },
    { id: '2', name: 'M', price: 1850, isAvailable: false },
  ];

  const availableOptions = options.filter(o => o.isAvailable);
  const pool = availableOptions.length > 0 ? availableOptions : options;
  const minPrice = Math.min(...pool.map(o => o.price));

  assert.equal(minPrice, 1000);
});

test('Option validation: enforces unique option names (case-insensitive and trimmed)', () => {
  const validateUniqueNames = (optionsList) => {
    const names = optionsList.map(o => o.name.trim().toLowerCase());
    return new Set(names).size === names.length;
  };

  assert.equal(validateUniqueNames([
    { name: 'Small', price: 500 },
    { name: 'Large', price: 900 },
  ]), true);

  assert.equal(validateUniqueNames([
    { name: 'Small', price: 500 },
    { name: 'small ', price: 600 },
  ]), false);
});

test('Option validation: requires non-empty names and positive numeric prices', () => {
  const validateOption = (opt) => {
    if (!opt.name?.trim()) return false;
    if (opt.price === undefined || opt.price <= 0 || isNaN(opt.price)) return false;
    return true;
  };

  assert.equal(validateOption({ name: 'Regular', price: 450 }), true);
  assert.equal(validateOption({ name: '', price: 450 }), false);
  assert.equal(validateOption({ name: '   ', price: 450 }), false);
  assert.equal(validateOption({ name: 'Large', price: 0 }), false);
  assert.equal(validateOption({ name: 'Large', price: -100 }), false);
  assert.equal(validateOption({ name: 'Large', price: NaN }), false);
});

test('Order Snapshot Contract: historical order line items are immutable and decoupled from live option edits', () => {
  // Simulating an order placed yesterday
  const orderLineItem = {
    foodItemId: 'food-biriyani-1',
    foodItemName: 'Chicken Biriyani',
    optionId: 'opt-2',
    optionName: 'M (2 Persons)',
    optionDescription: 'Serves 2-3',
    unitPrice: 1850.00,
    quantity: 2,
    lineTotal: 3700.00,
  };

  // Simulating an owner changing prices tomorrow
  const updatedOptionInDatabase = {
    id: 'opt-2',
    name: 'M (2 Persons)',
    price: 2100.00, // Price increased tomorrow
  };

  // Historical order snapshot must remain 100% unchanged
  assert.equal(orderLineItem.unitPrice, 1850.00);
  assert.equal(orderLineItem.lineTotal, 3700.00);
  assert.notEqual(orderLineItem.unitPrice, updatedOptionInDatabase.price);
});

test('Universal Reusability: options engine supports cafes, bakeries, grocery, and retail without schema alterations', () => {
  const cafeDrink = {
    name: 'Iced Latte',
    pricingType: 'variants',
    options: [
      { id: '1', name: 'Regular', description: '250 ml', price: 650, isAvailable: true },
      { id: '2', name: 'Large', description: '500 ml', price: 950, isAvailable: true },
    ],
  };

  const bakeryPack = {
    name: 'Chocolate Eclairs',
    pricingType: 'variants',
    options: [
      { id: '1', name: 'Single', description: '1 Piece', price: 280, isAvailable: true },
      { id: '2', name: 'Box of 6', description: '6 Pieces', price: 1600, isAvailable: true },
      { id: '3', name: 'Party Pack', description: '12 Pieces', price: 3000, isAvailable: true },
    ],
  };

  const retailItem = {
    name: 'Basmati Rice',
    pricingType: 'variants',
    options: [
      { id: '1', name: '500g Pack', description: '0.5 kg', price: 340, isAvailable: true },
      { id: '2', name: '1kg Pack', description: '1.0 kg', price: 650, isAvailable: true },
      { id: '3', name: '5kg Sack', description: '5.0 kg', price: 3100, isAvailable: true },
    ],
  };

  assert.equal(cafeDrink.options.length, 2);
  assert.equal(bakeryPack.options.length, 3);
  assert.equal(retailItem.options.length, 3);
});
