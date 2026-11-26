"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addOrIncrementCartItem } from "@/lib/cart.mjs";
import "@/components/client/ClientMultiPage.css";

function money(value, config) {
  try {
    return new Intl.NumberFormat(config.business.locale || "en", {
      style: "currency",
      currency: config.business.currency || "ETB",
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${config.business.currency || "ETB"} ${Number(value || 0).toLocaleString()}`;
  }
}

export default function ClientFoodProductDetail({ product, config, navigation = [] }) {
  const sizes = product.sizes?.length ? product.sizes : [{ id: "regular", label: "Regular", price: 0 }];
  const addons = Array.isArray(product.addons) ? product.addons : [];
  const [sizeId, setSizeId] = useState(sizes[0]?.id || "regular");
  const [addonIds, setAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");
  const selectedSize = sizes.find((item) => item.id === sizeId) || sizes[0];
  const selectedAddons = addons.filter((item) => addonIds.includes(item.id));
  const unitPrice = useMemo(
    () => Number(product.price || 0) + Number(selectedSize?.price || 0) + selectedAddons.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [product.price, selectedSize, selectedAddons]
  );
  const cartKey = `food-order-${config.slug}-cart`;
  const orderHref = config.orderEnabled ? `/order/${config.slug}` : "/menu#menu";

  function addToOrder() {
    let current = [];
    try {
      const stored = JSON.parse(localStorage.getItem(cartKey) || "[]");
      current = Array.isArray(stored) ? stored : [];
    } catch {
      current = [];
    }
    const lineId = [product.id, sizeId, ...[...addonIds].sort()].join("__");
    const item = {
      id: lineId,
      productId: product.id,
      name: product.name,
      unitPrice,
      currency: config.business.currency || "ETB",
      sizeLabel: selectedSize?.label || "Regular",
      addonLabels: selectedAddons.map((addon) => addon.label),
      quantity,
      emoji: product.emoji || "🍽️"
    };
    const next = addOrIncrementCartItem(current, item);
    localStorage.setItem(cartKey, JSON.stringify(next));
    setCartCount(next.reduce((sum, entry) => sum + Number(entry.quantity || 1), 0));
    setNotice(`${product.name} added to your order.`);
  }

  return <main className="ff-food-detail" style={{
    "--mp-primary": config.theme.primary,
    "--mp-secondary": config.theme.secondary,
    "--mp-bg": config.theme.background,
    "--mp-surface": config.theme.surface,
    "--mp-text": config.theme.text,
    "--mp-muted": config.theme.muted,
    "--mp-accent": config.theme.accent
  }}>
    <header className="ff-food-detail-header">
      <Link href="/" className="ff-food-detail-brand">{config.brand.name}</Link>
      <nav aria-label="Food store navigation">
        <Link href="/">Home</Link>
        {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
      <Link className="ff-food-detail-bag" href={orderHref}>Your order {cartCount ? `(${cartCount})` : "↗"}</Link>
    </header>
    <div className="ff-food-detail-grid">
      <div className="ff-food-detail-image">
        {product.image ? <img src={product.image} alt={product.alt || product.name}/> : <span>{product.emoji || "🍽️"}</span>}
      </div>
      <section className="ff-food-detail-info">
        <Link className="ff-food-detail-back" href="/menu">← Back to menu</Link>
        <span className="ff-page-eyebrow">{product.category || config.templateLabel}</span>
        <h1>{product.name}</h1>
        <strong className="ff-food-detail-price">{money(unitPrice, config)}</strong>
        <p>{product.description}</p>
        <label className="ff-food-detail-field">Size / serving
          <select value={sizeId} onChange={(event) => setSizeId(event.target.value)}>
            {sizes.map((item) => <option key={item.id} value={item.id}>{item.label}{item.price ? ` (+${money(item.price, config)})` : ""}</option>)}
          </select>
        </label>
        {addons.length > 0 && <fieldset className="ff-food-detail-addons"><legend>Make it yours</legend>{addons.map((addon) => <label key={addon.id}><input type="checkbox" checked={addonIds.includes(addon.id)} onChange={(event) => setAddonIds((current) => event.target.checked ? [...current, addon.id] : current.filter((id) => id !== addon.id))}/><span>{addon.label}</span><small>+{money(addon.price, config)}</small></label>)}</fieldset>}
        <div className="ff-food-detail-qty"><span>Quantity</span><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><b>{quantity}</b><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(50, value + 1))}>＋</button></div>
        <button className="ff-food-detail-add" type="button" onClick={addToOrder}>Add to order · {money(unitPrice * quantity, config)} ↗</button>
        {notice && <p className="ff-food-detail-notice" role="status">{notice} <Link href={orderHref}>View your order</Link></p>}
        <small className="ff-food-detail-disclaimer">Orders are enquiries until {config.brand.name} confirms availability, collection or delivery details.</small>
      </section>
    </div>
  </main>;
}
