"use client";
import "./furniture.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FURNITURE_ADMIN_KEY, FURNITURE_CART_KEY, addFurnitureCartItem,
  createFurnitureCartLine
} from "@/lib/furniture-store.mjs";

export default function FurnitureProductDetail({ product, money, brandName = "Furniture", cartStorageKey = FURNITURE_CART_KEY, wishlistStorageKey, adminStorageKey = FURNITURE_ADMIN_KEY, checkoutPath = "/templates/furniture/checkout", productBasePath = "/templates/furniture" }) {
  const [image, setImage] = useState(product.gallery?.[0] || product.image);
  const [material, setMaterial] = useState(product.materials?.[0] || "Standard");
  const [color, setColor] = useState(product.colors?.[0] || "Standard");
  const [size, setSize] = useState(product.sizes?.[0] || "Standard");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stock, setStock] = useState(product.stock ?? 0);
  const [price, setPrice] = useState(product.price);
  const selectedPrice = Math.max(0, price + Number(product.sizePriceAdjustments?.[size] || 0));

  useEffect(() => {
    try {
      const overrides = JSON.parse(localStorage.getItem(adminStorageKey) || "{}");
      const override = overrides?.[product.id] || {};
      setStock(Number.isFinite(Number(override.stock)) ? Math.max(0, Number(override.stock)) : (product.stock ?? 0));
      setPrice(Number.isFinite(Number(override.price)) ? Math.max(0, Number(override.price)) : product.price);
    } catch {
      setStock(product.stock ?? 0);
      setPrice(product.price);
    }
  }, [product, adminStorageKey]);

  const gallery = useMemo(() => product.gallery?.length ? product.gallery : [product.image], [product]);
  const collectionHref = productBasePath ? `${productBasePath}/shop` : "/shop";
  const homeHref = productBasePath || "/";

  function add() {
    if (stock <= 0) return;
    let current = [];
    try { current = JSON.parse(localStorage.getItem(cartStorageKey) || "[]"); } catch { current = []; }
    const item = createFurnitureCartLine({ ...product, price }, { material, color, size, quantity: qty, price: selectedPrice });
    localStorage.setItem(cartStorageKey, JSON.stringify(addFurnitureCartItem(Array.isArray(current) ? current : [], item)));
    setAdded(true);
  }

  return <main className="furniture-detail-page">
    <header className="furniture-detail-site-header"><Link href={homeHref} className="furniture-detail-site-brand">{brandName}</Link><nav><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/collections">Collections</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav><Link href={checkoutPath}>Enquiry bag ↗</Link></header>
    <div className="furniture-detail-breadcrumb"><Link href={homeHref}>Home</Link> / <Link href={collectionHref}>Shop</Link> / {product.name}</div>
    <div className="furniture-detail-grid">
      <div className="furniture-detail-gallery">
        <div className="furniture-detail-main-image"><Image src={image} alt={`${product.name} product view`} fill priority sizes="(max-width:800px) 100vw, 55vw"/></div>
        <div className="furniture-detail-thumbs">{gallery.map((src) => <button type="button" key={src} className={image === src ? "selected" : ""} onClick={() => setImage(src)} aria-label={`View ${product.name} image`} aria-pressed={image === src}><Image src={src} alt="" fill sizes="100px"/></button>)}</div>
      </div>
      <div className="furniture-detail-info">
        <span className="furniture-kicker">{product.category} · {product.label}</span>
        <h1>{product.name}</h1>
        <strong className="furniture-detail-price">{money(selectedPrice)}</strong>
        <p>{product.description}</p>
        <div className="furniture-option"><label htmlFor="material">Upholstery / material</label><select id="material" value={material} onChange={(event) => setMaterial(event.target.value)}>{(product.materials || ["Standard"]).map((value) => <option key={value}>{value}</option>)}</select></div>
        <div className="furniture-option"><label htmlFor="color">Finish / color</label><select id="color" value={color} onChange={(event) => setColor(event.target.value)}>{(product.colors || ["Standard"]).map((value) => <option key={value}>{value}</option>)}</select></div>
        <div className="furniture-option"><label htmlFor="size">Size</label><select id="size" value={size} onChange={(event) => setSize(event.target.value)}>{(product.sizes || ["Standard"]).map((value) => <option key={value}>{value}</option>)}</select></div>
        <div className="furniture-quantity"><label htmlFor="qty">Quantity</label><div><button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button><input id="qty" type="number" min="1" max="20" value={qty} onChange={(event) => setQty(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}/><button type="button" onClick={() => setQty((value) => Math.min(20, value + 1))} aria-label="Increase quantity">＋</button></div></div>
        {stock > 0 ? <p className="furniture-stock-note">{stock} currently shown in demo stock</p> : <p className="furniture-stock-note">Currently unavailable — contact the showroom.</p>}
        <button className="furniture-button dark furniture-detail-add" type="button" onClick={add} disabled={stock <= 0}>Add to enquiry bag · {money(selectedPrice * qty)}</button>
        {added && <p className="furniture-added-message" role="status">Added to your bag. <Link href={checkoutPath}>Continue to enquiry ↗</Link></p>}
        <div className="furniture-specs"><h3>Details & dimensions</h3><p>{product.dimensions}</p><p>Materials and finish are selected above. Please confirm final specifications and lead time with the showroom.</p></div>
        <Link className="furniture-text-link" href={collectionHref}>← Back to collection</Link>
      </div>
    </div>
  </main>;
}
