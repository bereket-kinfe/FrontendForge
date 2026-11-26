import test from "node:test";
import assert from "node:assert/strict";
import { addCommerceItem, changeCommerceQuantity, commerceCartTotals, filterCommerceProducts } from "../src/lib/commerce-cart.mjs";

const chair = { id: "mira-chair", name: "Mira Chair", price: 12000, category: "Seating" };

test("retail cart adds products and increments an existing line", () => {
  const once = addCommerceItem([], chair);
  const twice = addCommerceItem(once, chair);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].quantity, 2);
});

test("retail cart quantity changes remove zero-quantity lines", () => {
  const cart = addCommerceItem([], chair);
  assert.deepEqual(changeCommerceQuantity(cart, chair.id, -1), []);
});

test("retail cart totals count units and calculate subtotal", () => {
  const cart = addCommerceItem(addCommerceItem([], chair), { ...chair, id: "lamp", price: 5000, name: "Lamp" });
  assert.deepEqual(commerceCartTotals(cart), { count: 2, subtotal: 17000 });
});

test("retail filters apply category and case-insensitive search", () => {
  const products = [chair, { id: "lamp", name: "Table Lamp", price: 5000, category: "Lighting" }];
  assert.deepEqual(filterCommerceProducts(products, "Seating", "MIRA").map((p) => p.id), ["mira-chair"]);
});
