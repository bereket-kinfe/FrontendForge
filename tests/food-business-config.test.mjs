import test from "node:test";
import assert from "node:assert/strict";
import { foodBusinesses } from "../src/config/food-businesses.js";

test("includes four uniquely named demo storefronts", () => {
  assert.equal(foodBusinesses.length, 4);
  assert.equal(new Set(foodBusinesses.map((business) => business.slug)).size, 4);
});

test("each storefront has the required branding and contact configuration", () => {
  for (const business of foodBusinesses) {
    assert.ok(business.name);
    assert.ok(business.descriptor);
    assert.ok(business.theme.primary);
    assert.ok(business.theme.background);
    assert.ok(business.currency);
    assert.ok(business.whatsapp);
    assert.ok(business.products.length > 0);
  }
});

test("each product has a unique ID and a non-negative numeric base price", () => {
  for (const business of foodBusinesses) {
    const ids = business.products.map((product) => product.id);
    assert.equal(new Set(ids).size, ids.length, `${business.slug} product IDs must be unique`);
    for (const product of business.products) {
      assert.equal(typeof product.price, "number");
      assert.ok(product.price >= 0);
      for (const size of product.sizes || []) assert.ok(size.price >= 0);
      for (const addon of product.addons || []) assert.ok(addon.price >= 0);
    }
  }
});

test("every product category is available in its storefront filter list", () => {
  for (const business of foodBusinesses) {
    for (const product of business.products) {
      assert.ok(business.categories.includes(product.category), `${product.name} category missing in ${business.slug}`);
    }
  }
});
