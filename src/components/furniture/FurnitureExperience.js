"use client";
import "./furniture.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FURNITURE_ADMIN_KEY, FURNITURE_CART_KEY, FURNITURE_WISHLIST_KEY,
  addFurnitureCartItem, applyFurnitureCatalogOverrides, buildFurnitureEnquiryUrl,
  createFurnitureCartLine, formatFurnitureMoney, getFurnitureCartTotals, removeFurnitureCartItem,
  setFurnitureCartQuantity
} from "@/lib/furniture-store.mjs";

export default function FurnitureExperience({ products, currency = "ETB", locale = "en-ET", whatsappNumber = "", brandName = "the store", productBasePath = "/templates/furniture", checkoutPath = "/templates/furniture/checkout", cartStorageKey = FURNITURE_CART_KEY, wishlistStorageKey = FURNITURE_WISHLIST_KEY, adminStorageKey = FURNITURE_ADMIN_KEY }) {
  const [category, setCategory] = useState("All pieces");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [catalog, setCatalog] = useState(products);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
      const savedWishlist = JSON.parse(localStorage.getItem(wishlistStorageKey) || "[]");
      const overrides = JSON.parse(localStorage.getItem(adminStorageKey) || "{}");
      setCart(Array.isArray(savedCart) ? savedCart : []);
      setWishlist(Array.isArray(savedWishlist) ? savedWishlist : []);
      setCatalog(applyFurnitureCatalogOverrides(products, overrides));
    } catch {
      setCart([]);
      setWishlist([]);
      setCatalog(products);
    }
    setReady(true);
  }, [products, cartStorageKey, wishlistStorageKey, adminStorageKey]);

  useEffect(() => {
    if (ready) localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, ready, cartStorageKey]);
  useEffect(() => {
    if (ready) localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
  }, [wishlist, ready, wishlistStorageKey]);

  const categories = useMemo(() => ["All pieces", ...new Set(catalog.map((product) => product.category))], [catalog]);
  const visible = useMemo(() => catalog.filter((product) => {
    const categoryMatch = category === "All pieces" || product.category === category;
    const term = query.trim().toLowerCase();
    const textMatch = !term || `${product.name} ${product.category} ${product.description || ""}`.toLowerCase().includes(term);
    return categoryMatch && textMatch;
  }), [catalog, category, query]);
  const totals = getFurnitureCartTotals(cart);
  const money = (value) => formatFurnitureMoney(value, currency, locale);

  function add(product) {
    const item = createFurnitureCartLine(product);
    setCart((current) => addFurnitureCartItem(current, item));
    setNotice(`${product.name} added to your enquiry bag.`);
  }
  function change(key, quantity) { setCart((current) => setFurnitureCartQuantity(current, key, quantity)); }
  function remove(key) { setCart((current) => removeFurnitureCartItem(current, key)); }
  function toggleWishlist(id) {
    setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  const message = [
    `Hello ${brandName}, I'd like to enquire about these furniture items:`,
    ...cart.map((item) => `${item.quantity} × ${item.name} (${[item.material, item.color, item.size].filter(Boolean).join(", ")}) — ${money(item.price * item.quantity)}`),
    `Estimated subtotal: ${money(totals.subtotal)}`,
    "Please confirm availability and delivery."
  ].join("\n");
  const enquiryUrl = buildFurnitureEnquiryUrl(whatsappNumber, message);

  return <div className="furniture-commerce">
    <div className="furniture-filter-row">
      <div className="furniture-filters" aria-label="Filter products">
        {categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <label className="furniture-search"><span className="sr-only">Search furniture</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces…" /></label>
      <span className="furniture-result-count">{visible.length} pieces · {wishlist.length} saved</span>
    </div>
    {notice && <p className="furniture-live-notice" role="status">{notice}</p>}
    <div className="furniture-product-grid">
      {visible.map((product) => {
        const productHref = `${productBasePath}/products/${product.slug || product.id}`;
        const saved = wishlist.includes(product.id);
        return <article className="furniture-product-card" key={product.id}>
          <div className={`furniture-product-photo tone-${product.tone || "sand"}`}>
            <Link href={productHref} aria-label={`View ${product.name}`}><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 90vw, 25vw"/></Link>
            <span>{product.label}</span>
            <button type="button" className={`furniture-wishlist-button ${saved ? "saved" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={saved}>{saved ? "♥" : "♡"}</button>
          </div>
          <div className="furniture-product-meta"><div><small>{product.category}</small><h3><Link href={productHref}>{product.name}</Link></h3></div><strong>{money(product.price)}</strong></div>
          {product.stock === 0 ? <button className="furniture-add-button" type="button" disabled>Currently unavailable</button> : <button className="furniture-add-button" type="button" onClick={() => add(product)}>Add to enquiry bag <span>↗</span></button>}
        </article>;
      })}
    </div>
    {visible.length === 0 && <p className="furniture-empty-results">No furniture matched your search. Try another name or category.</p>}
    <div className="furniture-cart-panel" id="shortlist">
      <div><span className="furniture-kicker">YOUR SHORTLIST</span><h3>Pieces you love <small>({totals.count})</small></h3>
        {cart.length === 0 ? <p>Your enquiry bag is empty. Add a piece to start a conversation with our team.</p> : <ul>{cart.map((item) => <li key={item.key || item.id}>
          <span>{item.name}<small>{[item.material, item.color, item.size].filter(Boolean).join(" · ")}</small></span>
          <div><button type="button" onClick={() => change(item.key || item.id, item.quantity - 1)} aria-label={`Remove one ${item.name}`}>−</button><b>{item.quantity}</b><button type="button" onClick={() => change(item.key || item.id, item.quantity + 1)} aria-label={`Add one ${item.name}`}>＋</button></div>
          <strong>{money(item.price * item.quantity)}</strong><button className="furniture-remove-line" type="button" onClick={() => remove(item.key || item.id)} aria-label={`Remove ${item.name} line`}>Remove</button>
        </li>)}</ul>}
      </div>
      <div className="furniture-cart-total"><span>Estimated total</span><strong>{money(totals.subtotal)}</strong><small>Final pricing, stock and delivery will be confirmed by the store.</small>
        <Link className={`furniture-button dark ${cart.length ? "" : "disabled"}`} href={cart.length ? checkoutPath : "#shop"} aria-disabled={!cart.length}>Review enquiry ↗</Link>
        {cart.length > 0 && enquiryUrl && <a className="furniture-underlink" href={enquiryUrl} target="_blank" rel="noreferrer">Send list directly on WhatsApp ↗</a>}
      </div>
    </div>
  </div>;
}
