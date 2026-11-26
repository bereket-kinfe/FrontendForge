"use client";
import "./furniture.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FURNITURE_CART_KEY, buildFurnitureEnquiryMessage, buildFurnitureEnquiryUrl,
  getFurnitureCartTotals, setFurnitureCartQuantity, removeFurnitureCartItem
} from "@/lib/furniture-store.mjs";

export default function FurnitureCheckout({ store, cartStorageKey = FURNITURE_CART_KEY, productBasePath = "/templates/furniture" }) {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "Addis Ababa", address: "", delivery: "Delivery", notes: "" });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
      setCart(Array.isArray(saved) ? saved : []);
    } catch { setCart([]); }
    setReady(true);
  }, [cartStorageKey]);
  useEffect(() => { if (ready) localStorage.setItem(cartStorageKey, JSON.stringify(cart)); }, [cart, ready, cartStorageKey]);

  const totals = useMemo(() => getFurnitureCartTotals(cart), [cart]);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const money = (value) => new Intl.NumberFormat(store.locale || "en-ET", { style: "currency", currency: store.currency || "ETB", maximumFractionDigits: 0 }).format(value);
  const message = buildFurnitureEnquiryMessage({ brandName: store.brandName, customer: form, cart, total: totals.subtotal, money });
  const whatsappUrl = buildFurnitureEnquiryUrl(store.whatsappNumber, message);
  const collectionHref = productBasePath ? `${productBasePath}/shop` : "/shop";
  const valid = Boolean(form.name.trim() && form.phone.trim() && cart.length > 0 && ready);

  function submit(event) {
    event.preventDefault();
    if (!valid || !whatsappUrl) return;
    const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!popup) window.location.assign(whatsappUrl);
    setSent(true);
  }

  return <main className="furniture-checkout">
    <div><span className="furniture-kicker">YOUR NEXT STEP</span><h1>Send your<br/><em>furniture enquiry.</em></h1><p>Share your contact and delivery details. {store.brandName} will confirm stock, final pricing and delivery.</p><Link href={collectionHref} className="furniture-text-link">← Continue shopping</Link></div>
    <form onSubmit={submit}>
      <h2>Contact details</h2>
      <div className="furniture-form-grid">
        <label>Full name *<input name="name" value={form.name} onChange={update} required autoComplete="name" maxLength="100"/></label>
        <label>Phone number *<input name="phone" value={form.phone} onChange={update} required autoComplete="tel" maxLength="30"/></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" maxLength="120"/></label>
        <label>City<input name="city" value={form.city} onChange={update} maxLength="80"/></label>
        <label className="wide">Delivery address<textarea name="address" value={form.address} onChange={update} rows="2" maxLength="500"/></label>
        <label>Fulfilment<select name="delivery" value={form.delivery} onChange={update}><option>Delivery</option><option>Showroom pickup</option></select></label>
        <label className="wide">Additional notes<textarea name="notes" value={form.notes} onChange={update} rows="3" placeholder="Preferred delivery time, dimensions, questions…" maxLength="1000"/></label>
      </div>
      <div className="furniture-checkout-summary"><h3>Order summary</h3>
        {cart.length === 0 ? <p>Your enquiry bag is empty. <Link href={collectionHref}>Choose a piece first.</Link></p> : cart.map((item) => <p className="furniture-checkout-line" key={item.key || item.id}><span>{item.name}<small>{[item.material, item.color, item.size].filter(Boolean).join(" · ")} · {money(item.price)} each</small><span className="furniture-checkout-quantity"><button type="button" onClick={() => setCart((current) => setFurnitureCartQuantity(current, item.key || item.id, item.quantity - 1))} aria-label={`Decrease ${item.name}`}>−</button><b>{item.quantity}</b><button type="button" onClick={() => setCart((current) => setFurnitureCartQuantity(current, item.key || item.id, item.quantity + 1))} aria-label={`Increase ${item.name}`}>＋</button><button type="button" onClick={() => setCart((current) => removeFurnitureCartItem(current, item.key || item.id))}>Remove</button></span></span><strong>{money(item.price * item.quantity)}</strong></p>)}
        <div className="sum-total"><span>Estimated subtotal</span><strong>{money(totals.subtotal)}</strong></div>
        <small>{store.deliveryNote || "Delivery fees and lead times are confirmed by the showroom."} This is an enquiry, not a payment.</small>
      </div>
      <button className="furniture-button dark" disabled={!valid || !whatsappUrl}>Send enquiry on WhatsApp ↗</button>
      {!store.whatsappNumber && <p role="alert">Add a verified WhatsApp number in `src/config/furniture-store.js` to enable enquiries.</p>}
      {sent && <p role="status" className="furniture-added-message">Your enquiry was opened in WhatsApp. Please press Send there to submit it.</p>}
    </form>
  </main>;
}
