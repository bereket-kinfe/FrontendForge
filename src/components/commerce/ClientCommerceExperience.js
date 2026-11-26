"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./client-commerce.css";
import { addCommerceItem, changeCommerceQuantity, commerceCartTotals, filterCommerceProducts } from "@/lib/commerce-cart.mjs";

function money(value, currency, locale = "en") {
  try { return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${Number(value || 0).toLocaleString()}`; }
}

export default function ClientCommerceExperience({ products = [], brand, contact, currency = "ETB", locale = "en-ET", template = "ecommerce", orderUrl = "", orderProviderUrl = "" }) {
  const storageKey = `${brand?.slug || "client"}-commerce-cart`;
  const wishlistKey = `${brand?.slug || "client"}-wishlist`;
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(storageKey) || "[]"));
      setWishlist(JSON.parse(localStorage.getItem(wishlistKey) || "[]"));
    } catch { setCart([]); setWishlist([]); }
  }, [storageKey, wishlistKey]);
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(cart)); }, [cart, storageKey]);
  useEffect(() => { localStorage.setItem(wishlistKey, JSON.stringify(wishlist)); }, [wishlist, wishlistKey]);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category || "Featured"))], [products]);
  const filtered = useMemo(() => filterCommerceProducts(products, category, query), [products, category, query]);
  const { count, subtotal: total } = commerceCartTotals(cart);
  const phone = String(contact?.whatsapp || contact?.phone || "").replace(/\D/g, "");

  function add(product) {
    setCart((current) => addCommerceItem(current, product));
    setNotice(`${product.name} added to your bag`);
  }
  function change(id, amount) { setCart((current) => changeCommerceQuantity(current, id, amount)); }
  function toggleWish(id) { setWishlist((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]); }

  const orderText = [`Hello ${brand?.name || ""}, I would like to place an order:`, ...cart.map((item) => `${item.quantity} × ${item.name} — ${money(item.price * item.quantity, currency, locale)}`), `Estimated subtotal: ${money(total, currency, locale)}`, "Please confirm availability and delivery details."].join("\n");
  const checkoutHref = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(orderText)}` : `mailto:${contact?.email || ""}?subject=${encodeURIComponent(`Order enquiry — ${brand?.name || "Store"}`)}&body=${encodeURIComponent(orderText)}`;

  return <div className="ff-commerce">
    <div className="ff-commerce-toolbar">
      <label className="ff-commerce-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${template === "grocery" ? "groceries" : "products"}`} aria-label="Search products" /></label>
      <div className="ff-commerce-bag-actions"><button className="ff-commerce-bag" type="button" onClick={() => document.getElementById("ff-cart")?.scrollIntoView({ behavior: "smooth" })}>Bag <span>{count}</span></button><Link className="ff-commerce-full-cart" href="/cart">Full cart ↗</Link></div>
    </div>
    <div className="ff-commerce-categories" aria-label="Product categories">{categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {notice && <p className="ff-commerce-notice" role="status">{notice}</p>}
    <div className="ff-commerce-grid">{filtered.map((product) => <article className="ff-commerce-card" key={product.id}>
      <Link href={`/products/${product.id}`} className="ff-commerce-image" aria-label={`View ${product.name}`}>{product.image ? <img src={product.image} alt={product.alt || product.name} loading="lazy"/> : <span>{product.emoji || "✦"}</span>}{product.label && <small>{product.label}</small>}</Link>
      <button className={`ff-commerce-wish ${wishlist.includes(product.id) ? "saved" : ""}`} type="button" onClick={() => toggleWish(product.id)} aria-label={`${wishlist.includes(product.id) ? "Remove" : "Add"} ${product.name} ${wishlist.includes(product.id) ? "from" : "to"} wishlist`}>{wishlist.includes(product.id) ? "♥" : "♡"}</button>
      <div className="ff-commerce-card-copy"><small>{product.category || "Featured"}</small><h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><p>{product.description}</p><div><strong>{money(product.price, currency, locale)}</strong><button type="button" onClick={() => add(product)}>Add to bag +</button></div></div>
    </article>)}</div>
    {!filtered.length && <p className="ff-commerce-empty">No products match your search. Try another category or keyword.</p>}
    <section className="ff-commerce-cart" id="ff-cart"><div><small>YOUR SELECTION</small><h2>Your shopping bag</h2><p>Review your items before sending an order enquiry.</p></div>
      {cart.length ? <div className="ff-commerce-cart-items">{cart.map((item) => <div className="ff-commerce-cart-row" key={item.id}><span>{item.name}</span><div><button type="button" onClick={() => change(item.id, -1)} aria-label={`Decrease ${item.name}`}>−</button><b>{item.quantity}</b><button type="button" onClick={() => change(item.id, 1)} aria-label={`Increase ${item.name}`}>+</button></div><strong>{money(item.price * item.quantity, currency, locale)}</strong></div>)}<div className="ff-commerce-total"><span>Estimated subtotal</span><strong>{money(total, currency, locale)}</strong></div><Link className="ff-commerce-checkout" href="/checkout">Review checkout ↗</Link><a className="ff-commerce-checkout ff-commerce-external-checkout" href={orderProviderUrl || checkoutHref} target="_blank" rel="noreferrer">Send order enquiry ↗</a><small className="ff-commerce-disclaimer">Final stock, delivery charges and payment arrangements are confirmed by the business.</small></div> : <p className="ff-commerce-empty">Your bag is empty. Add something you love.</p>}
    </section>
  </div>;
}
