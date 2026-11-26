"use client";
import { useState } from "react";
import { addOrIncrementCartItem } from "@/lib/cart.mjs";

export default function AddToCartButton({ item, cartKey = "demo-cart", label = "Add to cart", className = "" }) {
  const [added, setAdded] = useState(false);

  function addItem() {
    try {
      const storageKey = `frontendforge-${cartKey}`;
      const current = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      const next = addOrIncrementCartItem(current, item);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(`frontendforge-cart-updated:${cartKey}`));
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } catch {
      setAdded(false);
      window.alert("This browser could not save the demo cart. Please enable local storage.");
    }
  }

  return <button type="button" className={`button button-small button-primary ${className}`.trim()} onClick={addItem} aria-live="polite">
    {added ? "Added ✓" : label}
  </button>;
}