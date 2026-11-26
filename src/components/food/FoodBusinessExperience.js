"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FoodProductCard from "@/components/food/FoodProductCard";
import { addOrIncrementCartItem, getCartCount, getCartTotal, removeCartItem, setCartItemQuantity } from "@/lib/cart.mjs";

function money(value, currency, locale) {
  try { return new Intl.NumberFormat(locale || "en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${Number(value || 0).toLocaleString()}`; }
}

export default function FoodBusinessExperience({ business }) {
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [fulfillment, setFulfillment] = useState("delivery");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", note: "", payment: "Cash on delivery / pickup" });
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [message, setMessage] = useState("");

  const storageKey = `food-order-${business.slug}-cart`;
  useEffect(() => {
    try { setCart(JSON.parse(window.localStorage.getItem(storageKey) || "[]")); }
    catch { setCart([]); }
    setHydrated(true);
  }, [storageKey]);
  useEffect(() => {
    if (hydrated) {
      try { window.localStorage.setItem(storageKey, JSON.stringify(cart)); }
      catch { setMessage("Your browser could not save this cart. Keep this tab open while ordering."); }
    }
  }, [cart, hydrated, storageKey]);

  const filteredProducts = useMemo(() => category === "All" ? business.products : business.products.filter((product) => product.category === category), [business.products, category]);
  const count = getCartCount(cart);
  const subtotal = getCartTotal(cart);
  const deliveryFee = fulfillment === "delivery" ? business.deliveryFee || 0 : 0;
  const total = subtotal + deliveryFee;
  const availableFulfillment = business.fulfillment || ["pickup", "delivery"];
  const currency = business.currency || "ETB";

  function openCartPanel() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches) {
      setCartOpen(true);
    } else {
      document.querySelector(".food-order-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function addItem(item) {
    setCart((current) => addOrIncrementCartItem(current, item));
    setMessage(`${item.name} added to your order.`);
    setCartOpen(true);
  }

  function updateQuantity(id, quantity) {
    setCart((current) => setCartItemQuantity(current, id, quantity));
  }

  function sendOrder(event) {
    event.preventDefault();
    setMessage("");
    setWhatsappUrl("");
    if (!cart.length) { setMessage("Add at least one item before checking out."); return; }
    if (fulfillment === "delivery" && !customer.address.trim()) { setMessage("Please add your delivery address."); return; }
    const phone = String(business.whatsapp || business.phone || "").replace(/\D/g, "");
    if (!phone) { setMessage("The business owner needs to add a WhatsApp number in the food business configuration."); return; }

    const lines = cart.map((item) => {
      const details = [item.sizeLabel, ...(item.addonLabels || [])].filter(Boolean).join(", ");
      return `• ${item.quantity} × ${item.name}${details ? ` (${details})` : ""} — ${money(item.unitPrice * item.quantity, currency, business.locale)}`;
    });
    const orderText = [
      `Hello ${business.name}! I'd like to place an order:`, "", ...lines, "",
      `Subtotal: ${money(subtotal, currency, business.locale)}`,
      `Fulfillment: ${fulfillment === "delivery" ? "Delivery" : "Pickup"}`,
      ...(fulfillment === "delivery" ? [`Delivery fee: ${money(deliveryFee, currency, business.locale)}`, `Address: ${customer.address}`] : []),
      `Total: ${money(total, currency, business.locale)}`, `Payment preference: ${customer.payment}`,
      `Name: ${customer.name}`, `Phone: ${customer.phone}`,
      ...(customer.note.trim() ? [`Order note: ${customer.note.trim()}`] : []),
      "", "Please confirm availability and the final amount. Thank you!"
    ].join("\n");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(orderText)}`;
    setWhatsappUrl(url);
    setMessage("Your order summary is ready. Open WhatsApp and press Send to submit it to the business.");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const themeStyle = {
    "--food-bg": business.theme.background, "--food-surface": business.theme.surface,
    "--food-text": business.theme.text, "--food-muted": business.theme.muted,
    "--food-primary": business.theme.primary, "--food-primary-text": business.theme.primaryText,
    "--food-accent": business.theme.accent, "--food-soft": business.theme.soft,
    "--food-line": business.theme.line, "--food-hero": business.theme.hero
  };

  return <main className="food-ordering" style={themeStyle}>
    <header className="food-header"><div className="food-shell food-header-inner">
      <Link href={`/order/${business.slug}`} className="food-brand"><span className="food-brand-mark">✳</span><span>{business.name}</span></Link>
      <nav className="food-nav" aria-label="Food business navigation"><Link href="/">Home</Link>{(business.siteLinks?.length ? business.siteLinks : [{ label: "Menu", href: "#menu" }, { label: "Contact", href: "#contact" }]).map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</nav>
      <button type="button" className="food-cart-top" onClick={openCartPanel}>Your order <span>{count}</span></button>
    </div></header>

    <section className="food-hero"><div className="food-shell food-hero-grid">
      <div className="food-hero-copy"><span className="food-kicker">{business.descriptor}</span><h1>{business.tagline}</h1><p>{business.intro}</p><div className="food-hero-actions"><a href="#menu" className="food-primary-link">Explore the menu <span>↗</span></a><span className="food-hero-note">Freshly made · Easy ordering · Good food</span></div></div>
      <div className="food-hero-art"><span className="food-hero-emoji" aria-hidden="true">{business.slug === "machi" ? "🧋" : business.slug === "buna-bowl" ? "🍲" : business.slug === "urban-bites" ? "🍔" : "🧁"}</span><div className="food-hero-orbit orbit-a"/><div className="food-hero-orbit orbit-b"/><span className="food-hero-stamp">MADE<br/>WITH<br/>CARE</span></div>
    </div></section>

    <section className="food-menu-section" id="menu"><div className="food-shell">
      <div className="food-menu-heading"><div><span className="food-kicker">MADE FRESH FOR YOU</span><h2>Good things are<br/><em>on the menu.</em></h2><p>Choose your favorites, customize them, and add them to your order.</p></div><div className="food-menu-meta"><strong>{business.products.length} favorites</strong><span>Made to order</span></div></div>
      <div className="food-category-tabs" role="group" aria-label="Filter menu by category">{(business.categories || ["All", ...new Set(business.products.map((product) => product.category))]).map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div>
      <div className="food-main-layout"><div className="food-product-grid">{filteredProducts.map((product) => <FoodProductCard key={product.id} product={product} currency={currency} onAdd={addItem} primary={business.theme.primary}/>)}</div>
        <aside className={`food-order-panel ${cartOpen ? "is-open" : ""}`} aria-label="Your order">
          <div className="food-order-panel-head"><div><span className="food-kicker">YOUR SELECTION</span><h3>Your order <span>{count}</span></h3></div><button type="button" className="food-close-cart" onClick={() => setCartOpen(false)} aria-label="Close order panel">×</button></div>
          {cart.length === 0 ? <div className="food-empty-cart"><span>🛍️</span><strong>Your order is waiting</strong><p>Add something delicious from the menu to get started.</p></div> : <>
            <div className="food-cart-items">{cart.map((item) => <div className="food-cart-item" key={item.id}><div className="food-cart-item-icon">{item.emoji || "🍽️"}</div><div className="food-cart-item-info"><strong>{item.name}</strong><small>{[item.sizeLabel, ...(item.addonLabels || [])].filter(Boolean).join(" · ")}</small><b>{money(item.unitPrice * item.quantity, currency, business.locale)}</b><div className="food-quantity-control"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>＋</button><button type="button" className="food-remove-item" onClick={() => setCart((current) => removeCartItem(current, item.id))}>Remove</button></div></div></div>)}</div>
            <div className="food-totals"><div><span>Subtotal</span><strong>{money(subtotal, currency, business.locale)}</strong></div><div><span>{business.deliveryLabel || "Delivery"}</span><strong>{fulfillment === "delivery" ? money(deliveryFee, currency, business.locale) : "Free / pickup"}</strong></div><div className="food-grand-total"><span>Total</span><strong>{money(total, currency, business.locale)}</strong></div></div>
            <form className="food-checkout-form" onSubmit={sendOrder}>
              <h4>Where should we send it?</h4>
              <div className="food-fulfillment-toggle">{availableFulfillment.includes("delivery") && <button type="button" className={fulfillment === "delivery" ? "active" : ""} onClick={() => setFulfillment("delivery")}>Delivery</button>}{availableFulfillment.includes("pickup") && <button type="button" className={fulfillment === "pickup" ? "active" : ""} onClick={() => setFulfillment("pickup")}>Pickup</button>}</div>
              <label>Your name<input required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Full name" autoComplete="name"/></label>
              <label>Phone number<input required type="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Your phone number" autoComplete="tel"/></label>
              {fulfillment === "delivery" && <label>Delivery address<input required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Area, street, building" autoComplete="street-address"/></label>}
              <label>Payment preference<select value={customer.payment} onChange={(event) => setCustomer({ ...customer, payment: event.target.value })}><option>Cash on delivery / pickup</option><option>Bank transfer (confirm with business)</option><option>Pay at counter</option></select></label>
              <label>Order note (optional)<textarea value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })} placeholder="Delivery instructions or preferences" rows={2}/></label>
              <button type="submit" className="food-submit-order" style={{ background: business.theme.primary }}>Continue with WhatsApp <span>↗</span></button>
              {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="food-fallback-link">WhatsApp did not open? Tap here to continue.</a>}
              <p className="food-checkout-disclaimer">This demo prepares an order message in WhatsApp. The business must confirm availability, delivery, and payment directly with you.</p>
            </form>
          </>}
          {message && <p className="food-feedback" role="status">{message}</p>}
        </aside>
      </div>
    </div></section>

    <section className="food-how-section" id="how-to-order"><div className="food-shell"><span className="food-kicker">SIMPLE AS ONE, TWO, THREE</span><h2>From our kitchen<br/><em>to your table.</em></h2><div className="food-how-grid"><article><span>01</span><h3>Pick your favorites</h3><p>Browse the menu, choose your size and add the extras you like.</p></article><article><span>02</span><h3>Choose delivery or pickup</h3><p>Share your contact details and where you'd like your order.</p></article><article><span>03</span><h3>Confirm on WhatsApp</h3><p>Your order summary opens in WhatsApp. Send it to the business to confirm.</p></article></div></div></section>

    <footer className="food-footer" id="contact"><div className="food-shell food-footer-grid"><div><Link href="/order" className="food-brand"><span className="food-brand-mark">✳</span><span>{business.name}</span></Link><p>{business.tagline}</p></div><div><span className="food-footer-label">FIND US</span><p>{business.address}</p><p>{business.hours}</p></div><div><span className="food-footer-label">GET IN TOUCH</span><p><a href={`tel:${business.phone}`}>{business.phone}</a></p><p><a href={`mailto:${business.email}`}>{business.email}</a></p></div><div><span className="food-footer-label">ORDER ONLINE</span><button type="button" className="food-footer-order" onClick={() => { document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }); }}>Browse the menu ↑</button><Link href="/order" className="food-other-demo-link">Explore other demo brands</Link></div></div><div className="food-shell food-footer-bottom"><span>© {new Date().getFullYear()} {business.name}. All rights reserved.</span><span>Demo ordering experience · Customize before client launch</span></div></footer>

    {cart.length > 0 && <button type="button" className="food-mobile-cart" onClick={() => { setCartOpen(true); document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }); }}>View order · {count} items · {money(total, currency, business.locale)}</button>}
  </main>;
}
