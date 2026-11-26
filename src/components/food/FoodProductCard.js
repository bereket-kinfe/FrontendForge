"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export default function FoodProductCard({ product, currency, onAdd, primary }) {
  const sizes = product.sizes?.length ? product.sizes : [{ id: "regular", label: "Regular", price: 0 }];
  const [sizeId, setSizeId] = useState(sizes[0].id);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const selectedSize = sizes.find((size) => size.id === sizeId) || sizes[0];
  const addons = (product.addons || []).filter((addon) => selectedAddons.includes(addon.id));
  const unitPrice = useMemo(() => product.price + selectedSize.price + addons.reduce((sum, addon) => sum + addon.price, 0), [product.price, selectedSize, addons]);

  function toggleAddon(addonId) {
    setSelectedAddons((current) => current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId]);
  }

  function add() {
    const addonIds = [...selectedAddons].sort();
    const lineId = [product.id, sizeId, ...addonIds].join("__");
    onAdd({
      id: lineId,
      productId: product.id,
      name: product.name,
      unitPrice,
      currency,
      sizeLabel: selectedSize.label,
      addonLabels: addons.map((addon) => addon.label),
      quantity: 1,
      emoji: product.emoji
    });
  }

  return <article className="food-product-card">
    <div className="food-product-art" style={{ background: product.artBackground || "var(--food-soft)" }}>
      {product.image ? <Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 88vw, 28vw" className="food-product-image" /> : <span className="food-product-emoji" aria-hidden="true">{product.emoji || "🍽️"}</span>}
      <span className="food-product-category">{product.category}</span>
    </div>
    <div className="food-product-content">
      <div className="food-product-heading"><h3>{product.name}</h3><strong>{currency} {unitPrice.toLocaleString()}</strong></div>
      <p>{product.description}</p>
      <label className="food-field-label" htmlFor={`size-${product.id}`}>Size / serving</label>
      <select id={`size-${product.id}`} value={sizeId} onChange={(event) => setSizeId(event.target.value)} className="food-select">
        {sizes.map((size) => <option value={size.id} key={size.id}>{size.label}{size.price ? ` (+${currency} ${size.price})` : ""}</option>)}
      </select>
      {product.addons?.length > 0 && <div className="food-addons"><span className="food-field-label">Make it yours</span><div className="food-addon-list">{product.addons.map((addon) => <label key={addon.id}><input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} /><span>{addon.label}</span><small>+{currency} {addon.price}</small></label>)}</div></div>}
      <button type="button" className="food-add-button" style={{ background: primary }} onClick={add}>Add to order <span aria-hidden="true">＋</span></button>
    </div>
  </article>;
}
