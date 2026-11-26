import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {furnitureProducts,furnitureMoney} from '../src/config/furniture-products.js';
test('furniture catalog has unique slugs and valid variant data',()=>{assert.equal(new Set(furnitureProducts.map(p=>p.slug)).size,furnitureProducts.length);for(const p of furnitureProducts){assert.ok(p.price>0);assert.ok(p.stock>=0);assert.ok(p.materials.length);assert.ok(p.colors.length);assert.ok(p.sizes.length);assert.ok(p.gallery.length)}});
test('furniture product routes, checkout and demo admin exist',()=>{for(const p of furnitureProducts)assert.ok(fs.existsSync(`src/app/templates/furniture/products/[slug]/page.js`));assert.ok(fs.existsSync('src/app/templates/furniture/checkout/page.js'));assert.ok(fs.existsSync('src/app/templates/furniture/admin/page.js'))});
test('product detail supports material, color, size and quantity selection',()=>{const s=fs.readFileSync('src/components/furniture/FurnitureProductDetail.js','utf8');for(const term of ['material','color','size','qty','Add to enquiry bag'])assert.ok(s.includes(term))});
test('checkout validates customer contact and builds WhatsApp enquiry without payment processing',()=>{const s=fs.readFileSync('src/components/furniture/FurnitureCheckout.js','utf8');assert.ok(s.includes('form.name.trim() && form.phone.trim() && cart.length > 0'));assert.ok(s.includes('buildFurnitureEnquiryUrl(store.whatsappNumber, message)'));assert.ok(!s.toLowerCase().includes('stripe'))});
test('admin clearly identifies local demo persistence',()=>{const s=fs.readFileSync('src/components/furniture/FurnitureAdmin.js','utf8');assert.ok(s.includes('localStorage'));assert.ok(s.includes('FURNITURE_ADMIN_KEY'));assert.ok(s.includes('LOCAL DEMO'))});
test('ETB formatter formats a positive furniture price',()=>{assert.match(furnitureMoney(24900),/24,900/)});

test('furniture collection links to the real product detail route',()=>{
 const page=fs.readFileSync('src/components/furniture/FurnitureExperience.js','utf8');
 assert.ok(page.includes('productBasePath = "/templates/furniture"'));
 assert.ok(page.includes('`${productBasePath}/products/${product.slug || product.id}`'));
 assert.ok(!page.includes('href={`/products/${product.id}`}'));
});
test('furniture collection, product detail and checkout share one persistent cart key',()=>{
 const collection=fs.readFileSync('src/components/furniture/FurnitureExperience.js','utf8');
 const detail=fs.readFileSync('src/components/furniture/FurnitureProductDetail.js','utf8');
 const checkout=fs.readFileSync('src/components/furniture/FurnitureCheckout.js','utf8');
 for(const source of [collection,detail,checkout]) assert.ok(source.includes('FURNITURE_CART_KEY'));
});
test('furniture cart supports variants, persistence and totals',async()=>{
 const {createFurnitureCartLine,addFurnitureCartItem,getFurnitureCartTotals,setFurnitureCartQuantity}=await import('../src/lib/furniture-store.mjs');
 const product={id:'mira-chair',slug:'mira-chair',name:'Mira Chair',price:100,image:'/chair.jpg',materials:['Linen','Velvet'],colors:['Oat','Olive'],sizes:['Standard','Wide']};
 const first=createFurnitureCartLine(product,{material:'Linen',color:'Oat',size:'Standard'});
 const second=createFurnitureCartLine(product,{material:'Velvet',color:'Olive',size:'Wide',quantity:2});
 let cart=addFurnitureCartItem([],first); cart=addFurnitureCartItem(cart,second);
 assert.equal(cart.length,2); assert.deepEqual(getFurnitureCartTotals(cart),{count:3,subtotal:300});
 cart=setFurnitureCartQuantity(cart,first.key,3);
 assert.deepEqual(getFurnitureCartTotals(cart),{count:5,subtotal:500});
});
test('furniture catalog admin overrides affect visible storefront items',async()=>{
 const {applyFurnitureCatalogOverrides}=await import('../src/lib/furniture-store.mjs');
 const result=applyFurnitureCatalogOverrides([{id:'chair',price:100,stock:4},{id:'table',price:200,stock:2}],{chair:{price:125,stock:3},table:{hidden:true}});
 assert.equal(result.length,1); assert.equal(result[0].price,125); assert.equal(result[0].stock,3);
});
test('furniture enquiry URL requires a phone number and encodes the order message',async()=>{
 const {buildFurnitureEnquiryUrl}=await import('../src/lib/furniture-store.mjs');
 assert.equal(buildFurnitureEnquiryUrl('', 'hello'), '');
 assert.match(buildFurnitureEnquiryUrl('+251 911 000 000','hello world'), /^https:\/\/wa\.me\/251911000000\?text=hello%20world$/);
});


test('furniture client component receives serializable currency settings rather than a server formatter',()=>{
 const experience=fs.readFileSync('src/components/furniture/FurnitureExperience.js','utf8');
 const page=fs.readFileSync('src/app/templates/furniture/page.js','utf8');
 const shared=fs.readFileSync('src/components/client/ClientProjectHome.js','utf8');
 const detail=fs.readFileSync('src/components/furniture/FurnitureProductDetail.js','utf8');
 const detailPage=fs.readFileSync('src/app/templates/furniture/products/[slug]/page.js','utf8');
 const copy=fs.readFileSync('src/lib/forge/copy.mjs','utf8');
 assert.ok(experience.includes('currency = "ETB", locale = "en-ET"'));
 assert.ok(experience.includes('formatFurnitureMoney, getFurnitureCartTotals'));
 assert.ok(page.includes('currency={furnitureStore.currency}'));
 assert.ok(page.includes('locale={furnitureStore.locale}'));
 assert.ok(!page.includes('money={furnitureMoney}'));
 assert.ok(shared.includes('currency={business.currency}'));
 assert.ok(!shared.includes('money={(val) => money(val, business.currency)}'));
 assert.ok(detail.includes('currency = "ETB", locale = "en-ET"'));
 assert.ok(fs.readFileSync('src/lib/furniture-store.mjs','utf8').includes('export function formatFurnitureMoney'));
 assert.ok(detailPage.includes('currency={furnitureStore.currency}'));
 assert.ok(!detailPage.includes('money={furnitureMoney}'));
 assert.ok(copy.includes('currency={config.business.currency}'));
 assert.ok(!copy.includes('money={(value) => money(value, config)}'));
});

test("shared furniture currency formatter handles ETB and invalid locale safely",async()=>{
 const {formatFurnitureMoney}=await import("../src/lib/furniture-store.mjs");
 assert.match(formatFurnitureMoney(24900,"ETB","en-ET"),/24,900/);
 assert.match(formatFurnitureMoney(24900,"ETB","invalid_locale"),/ETB/);
});


test("furniture multi-page shop and category routes pass serializable currency props", () => {
 const multiPage = fs.readFileSync("src/components/client/ClientMultiPage.js", "utf8");
 assert.ok(multiPage.includes('import { formatFurnitureMoney, normalizeFurnitureClientProduct }'));
 assert.equal((multiPage.match(/currency={business\.currency} locale={business\.locale}/g) || []).length, 2);
 assert.ok(!multiPage.includes('money={(value) => money(value, config)}'));
 assert.ok(!multiPage.includes('function money(value, config)'));
 assert.ok(multiPage.includes('formatFurnitureMoney(business.deliveryFee || 0, business.currency, business.locale)'));
});
