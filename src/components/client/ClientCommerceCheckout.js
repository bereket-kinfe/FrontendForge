"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { changeCommerceQuantity, commerceCartTotals } from "@/lib/commerce-cart.mjs";
import "./ClientMultiPage.css";

export default function ClientCommerceCheckout({ config, mode = "checkout" }) {
  const key = `${config.slug}-commerce-cart`;
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", fulfillment: config.business.fulfillment?.includes("delivery") ? "Delivery" : "Pickup", notes: "" });
  const [notice, setNotice] = useState("");
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(key) || "[]"); setCart(Array.isArray(saved) ? saved : []); } catch { setCart([]); } setReady(true); }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(cart)); }, [cart, key, ready]);
  const totals = useMemo(() => commerceCartTotals(cart), [cart]);
  const money = (value) => { try { return new Intl.NumberFormat(config.business.locale || "en", { style: "currency", currency: config.business.currency || "ETB", maximumFractionDigits: 0 }).format(value); } catch { return `${config.business.currency || "ETB"} ${Number(value || 0).toLocaleString()}`; } };
  const deliveryFee = form.fulfillment === "Delivery" ? Number(config.business.deliveryFee || 0) : 0;
  const total = totals.subtotal + deliveryFee;
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event) {
    event.preventDefault(); setNotice("");
    if (!cart.length) { setNotice("Your cart is empty. Add products before checkout."); return; }
    if (form.fulfillment === "Delivery" && !form.address.trim()) { setNotice("Enter a delivery address or choose pickup."); return; }
    const lines = [
      `Hello ${config.brand.name}, I'd like to place an order:`,
      ...cart.map((item) => `${item.quantity} × ${item.name} — ${money(item.price * item.quantity)}`),
      `Subtotal: ${money(totals.subtotal)}`, `Fulfilment: ${form.fulfillment}`,
      ...(form.fulfillment === "Delivery" ? [`Delivery fee: ${money(deliveryFee)}`, `Address: ${form.address}`] : []),
      `Estimated total: ${money(total)}`, `Name: ${form.name}`, `Phone: ${form.phone}`,
      ...(form.email ? [`Email: ${form.email}`] : []), ...(form.notes ? [`Notes: ${form.notes}`] : []),
      "Please confirm availability and final charges."
    ].join("\n");
    const text = encodeURIComponent(lines);
    const phone = String(config.contact.whatsapp || config.contact.phone || "").replace(/\D/g, "");
    const url = phone ? `https://wa.me/${phone}?text=${text}` : config.contact.email ? `mailto:${config.contact.email}?subject=${encodeURIComponent(`Order — ${config.brand.name}`)}&body=${text}` : "";
    if (!url) { setNotice("Add a verified WhatsApp number or email address to enable order enquiries."); return; }
    window.open(url, "_blank", "noopener,noreferrer");
    setNotice("Your order message is ready. Complete the send action in WhatsApp or your email app.");
  }
  return <div className="ff-checkout-layout">
    <section className="ff-checkout-items"><div className="ff-page-eyebrow">{mode === "cart" ? "YOUR SELECTION" : "REVIEW YOUR ORDER"}</div><h2>{mode === "cart" ? "Your shopping bag" : "Order summary"}</h2>
      {!cart.length ? <div className="ff-empty-cart"><p>Your bag is empty.</p><Link className="ff-page-button" href="/shop">Continue shopping ↗</Link></div> : <>
        {cart.map((item) => <article className="ff-checkout-line" key={item.id}>{item.image ? <img src={item.image} alt={item.name}/> : <span className="ff-checkout-placeholder">✦</span>}<div><strong>{item.name}</strong><small>{money(item.price)} each</small><div className="ff-qty"><button type="button" onClick={() => setCart((current) => changeCommerceQuantity(current,item.id,-1))} aria-label={`Decrease ${item.name}`}>−</button><b>{item.quantity}</b><button type="button" onClick={() => setCart((current) => changeCommerceQuantity(current,item.id,1))} aria-label={`Increase ${item.name}`}>＋</button></div></div><strong>{money(item.price * item.quantity)}</strong></article>)}
        <div className="ff-checkout-total"><span>Subtotal</span><strong>{money(totals.subtotal)}</strong></div>
      </>}
    </section>
    <section className="ff-checkout-form-wrap"><div className="ff-page-eyebrow">CUSTOMER DETAILS</div><h2>Delivery or pickup</h2><form className="ff-lead-form" onSubmit={submit}>
      <div className="ff-lead-grid">
        <label>Full name *<input name="name" value={form.name} onChange={update} required autoComplete="name"/></label>
        <label>Phone *<input name="phone" type="tel" value={form.phone} onChange={update} required autoComplete="tel"/></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={update}/></label>
        {config.business.fulfillment?.includes("delivery") && <label>Fulfilment<select name="fulfillment" value={form.fulfillment} onChange={update}><option>Delivery</option><option>Pickup</option></select></label>}
        {form.fulfillment === "Delivery" && <label className="ff-lead-wide">Delivery address *<textarea name="address" rows={2} value={form.address} onChange={update} required autoComplete="street-address"/></label>}
        <label className="ff-lead-wide">Order notes<textarea name="notes" rows={3} value={form.notes} onChange={update}/></label>
      </div>
      <div className="ff-checkout-total"><span>Delivery fee</span><strong>{money(deliveryFee)}</strong></div><div className="ff-checkout-total ff-checkout-grand"><span>Estimated total</span><strong>{money(total)}</strong></div>
      <button className="ff-page-button" disabled={!ready || !cart.length}>Continue order enquiry ↗</button>
      {notice && <p role="status" className="ff-lead-feedback">{notice}</p>}
      <small>This enquiry does not process payment or confirm stock. The business confirms final availability and charges.</small>
    </form></section>
  </div>;
}
