"use client";
import { useEffect, useState } from "react";
import { getCartCount, getCartTotal } from "@/lib/cart.mjs";

export default function CartSummary({ cartKey = "demo-cart" }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storageKey = `frontendforge-${cartKey}`;
    const update = () => {
      try { setItems(JSON.parse(window.localStorage.getItem(storageKey) || "[]")); }
      catch { setItems([]); }
    };
    update();
    window.addEventListener(`frontendforge-cart-updated:${cartKey}`, update);
    return () => window.removeEventListener(`frontendforge-cart-updated:${cartKey}`, update);
  }, [cartKey]);

  const count = getCartCount(items);
  const total = getCartTotal(items);
  const currency = String(items[0]?.price || "ETB").match(/[A-Z]{3}/)?.[0] || "ETB";

  return <div className="cart-summary">
    <button type="button" className="cart-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={`cart-panel-${cartKey}`}>Bag <span>{count}</span></button>
    {open && <section className="cart-panel" id={`cart-panel-${cartKey}`} aria-label="Demo shopping cart">
      <div className="cart-panel-heading"><h3>Your bag</h3><button type="button" onClick={() => setOpen(false)} aria-label="Close cart">×</button></div>
      {items.length === 0 ? <p className="cart-empty">Your bag is empty. Add an item to try the demo cart.</p> : <>
        <ul>{items.map((item) => <li key={item.id}><div><strong>{item.name}</strong><span>Qty {item.quantity || 1}</span></div><b>{item.price}</b></li>)}</ul>
        <div className="cart-subtotal"><span>Demo subtotal</span><strong>{currency} {total.toLocaleString()}</strong></div>
        <p className="cart-disclaimer">Demo only: no order is sent and no payment is collected.</p>
      </>}
    </section>}
  </div>;
}
