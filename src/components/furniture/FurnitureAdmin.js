"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FURNITURE_ADMIN_KEY } from "@/lib/furniture-store.mjs";

export default function FurnitureAdmin({ products }) {
  const [items, setItems] = useState(products);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const overrides = JSON.parse(localStorage.getItem(FURNITURE_ADMIN_KEY) || "{}");
      setItems(products.map((product) => ({ ...product, ...(overrides[product.id] || {}) })));
    } catch { setItems(products); }
    setReady(true);
  }, [products]);
  function change(id, key, value) {
    setItems((current) => current.map((product) => product.id === id ? { ...product, [key]: value } : product));
    setSaved(false);
  }
  function save() {
    const overrides = {};
    for (const product of items) {
      const base = products.find((item) => item.id === product.id);
      overrides[product.id] = {
        price: Math.max(0, Number(product.price) || 0),
        stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
        hidden: Boolean(product.hidden),
        label: product.label || base?.label || ""
      };
    }
    localStorage.setItem(FURNITURE_ADMIN_KEY, JSON.stringify(overrides));
    setSaved(true);
  }
  function reset() {
    localStorage.removeItem(FURNITURE_ADMIN_KEY);
    setItems(products);
    setSaved(false);
  }
  return <main className="furniture-admin">
    <div className="furniture-admin-head"><div><span className="furniture-kicker">STORE MANAGEMENT · LOCAL DEMO</span><h1>Product & inventory<br/><em>workspace.</em></h1><p>Changes saved here are reflected in the storefront in this browser only.</p></div><Link className="furniture-button dark" href="/templates/furniture">View storefront ↗</Link></div>
    <div className="furniture-admin-notice"><strong>Demo limitation:</strong> This is browser-local administration, not a shared production inventory system. For live staff access and stock shared between customers, enable the database/authentication deployment described in <code>docs/operations/PRODUCTION-READINESS.md</code>.</div>
    <div className="furniture-admin-table"><div className="admin-row admin-label"><span>Product</span><span>Price (ETB)</span><span>Stock</span><span>Visibility</span></div>
      {items.map((product) => <div className="admin-row" key={product.id}><div className="admin-product"><span>{product.name}</span><small>{product.category} · {product.id}</small></div><label><span className="sr-only">Price for {product.name}</span><input type="number" min="0" value={product.price} onChange={(event) => change(product.id, "price", event.target.value)}/></label><label><span className="sr-only">Stock for {product.name}</span><input type="number" min="0" value={product.stock} onChange={(event) => change(product.id, "stock", event.target.value)}/></label><label className="admin-toggle"><input type="checkbox" checked={!product.hidden} onChange={(event) => change(product.id, "hidden", !event.target.checked)}/> {product.hidden ? "Hidden" : "Visible"}</label></div>)}
    </div>
    <div className="furniture-admin-actions"><button className="furniture-button dark" onClick={save} disabled={!ready}>Save local changes</button><button className="furniture-admin-reset" onClick={reset}>Reset demo data</button>{saved && <span role="status">Saved. Reload the storefront to see updated prices and visibility.</span>}</div>
    <div className="furniture-admin-links"><Link href="/templates/furniture#shop">← Back to storefront</Link><Link href="/templates/furniture/checkout">View enquiry checkout ↗</Link></div>
  </main>;
}
