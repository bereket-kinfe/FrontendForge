import test from "node:test";
import assert from "node:assert/strict";
import { addOrIncrementCartItem, getCartCount, getCartTotal, getPriceAmount, setCartItemQuantity, removeCartItem } from "../src/lib/cart.mjs";

test("parses a formatted ETB price", () => {
  assert.equal(getPriceAmount("ETB 1,450"), 1450);
});

test("returns zero for a price without a number", () => {
  assert.equal(getPriceAmount("Price on request"), 0);
});

test("adds a new item with quantity one", () => {
  const result = addOrIncrementCartItem([], { id: "coffee", name: "Coffee", price: "ETB 150" });
  assert.deepEqual(result, [{ id: "coffee", name: "Coffee", price: "ETB 150", quantity: 1 }]);
});

test("increments an existing item instead of duplicating it", () => {
  const current = [{ id: "coffee", name: "Coffee", price: "ETB 150", quantity: 1 }];
  const result = addOrIncrementCartItem(current, { id: "coffee", name: "Coffee", price: "ETB 150" });
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 2);
});

test("counts quantities and calculates cart subtotal", () => {
  const items = [
    { id: "a", price: "ETB 100", quantity: 2 },
    { id: "b", price: "ETB 250", quantity: 1 }
  ];
  assert.equal(getCartCount(items), 3);
  assert.equal(getCartTotal(items), 450);
});


test("calculates numeric variant prices and add-ons", () => {
  const items = [{ id: "latte-large-oat", unitPrice: 255, quantity: 2 }];
  assert.equal(getCartTotal(items), 510);
});

test("updates a cart item quantity", () => {
  const items = [{ id: "tea", unitPrice: 90, quantity: 1 }];
  assert.deepEqual(setCartItemQuantity(items, "tea", 3), [{ id: "tea", unitPrice: 90, quantity: 3 }]);
});

test("removes an item when its quantity reaches zero", () => {
  const items = [{ id: "tea", quantity: 1 }, { id: "cake", quantity: 1 }];
  assert.deepEqual(setCartItemQuantity(items, "tea", 0), [{ id: "cake", quantity: 1 }]);
});

test("removes a selected cart line", () => {
  const items = [{ id: "tea" }, { id: "cake" }];
  assert.deepEqual(removeCartItem(items, "tea"), [{ id: "cake" }]);
});
