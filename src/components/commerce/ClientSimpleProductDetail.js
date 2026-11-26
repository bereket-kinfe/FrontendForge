"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "@/components/client/ClientMultiPage.css";

function money(value, config) {
  try { return new Intl.NumberFormat(config.business.locale || "en", { style: "currency", currency: config.business.currency || "ETB", maximumFractionDigits: 0 }).format(value); }
  catch { return `${config.business.currency || "ETB"} ${Number(value || 0).toLocaleString()}`; }
}

export default function ClientSimpleProductDetail({ product, config }) {
  const cartKey = `${config.slug}-commerce-cart`;
  const wishlistKey = `${config.slug}-wishlist`;
  const sizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : [];
  const addons = Array.isArray(product.addons) ? product.addons : [];
  const [sizeId, setSizeId] = useState(sizes[0]?.id || "");
  const [addonIds, setAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [image, setImage] = useState(product.image || "");
  const selectedSize = sizes.find((item) => item.id === sizeId);
  const selectedAddons = addons.filter((item) => addonIds.includes(item.id));
  const unitPrice = Number(product.price || 0) + Number(selectedSize?.price || 0) + selectedAddons.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const lineId = useMemo(() => [product.id, sizeId, ...[...addonIds].sort()].filter(Boolean).join("--"), [product.id, sizeId, addonIds]);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(wishlistKey) || "[]").includes(product.id)); } catch { setSaved(false); }
  }, [wishlistKey, product.id]);
  function toggleWish() {
    let items=[]; try { items=JSON.parse(localStorage.getItem(wishlistKey)||"[]"); } catch {}
    const next = items.includes(product.id) ? items.filter((id)=>id!==product.id) : [...items, product.id];
    localStorage.setItem(wishlistKey, JSON.stringify(next)); setSaved(next.includes(product.id));
  }
  function addToCart() {
    let cart=[]; try { cart=JSON.parse(localStorage.getItem(cartKey)||"[]"); } catch {}
    const existing = cart.find((item)=>item.id===lineId);
    const line = { id: lineId, productId: product.id, name: product.name + (selectedSize ? ` · ${selectedSize.label}` : "") + selectedAddons.map((item)=>` · ${item.label}`).join(""), price: unitPrice, image: product.image || "", quantity };
    const next = existing ? cart.map((item)=>item.id===lineId ? {...item,quantity:item.quantity+quantity} : item) : [...cart,line];
    localStorage.setItem(cartKey,JSON.stringify(next)); setNotice(`${product.name} added to your bag.`);
  }
  const phone = String(config.contact.whatsapp || config.contact.phone || "").replace(/\D/g, "");
  const enquireUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hello ${config.brand.name}, I'd like to ask about ${product.name}.`)}` : `mailto:${config.contact.email || ""}?subject=${encodeURIComponent(`Product enquiry — ${config.brand.name}`)}`;

  return <main className="ff-simple-product" style={{"--mp-primary":config.theme.primary,"--mp-secondary":config.theme.secondary,"--mp-bg":config.theme.background,"--mp-surface":config.theme.surface,"--mp-text":config.theme.text,"--mp-muted":config.theme.muted}}>
    <header><Link href="/" className="ff-simple-product-brand">{config.brand.name}</Link><nav><Link href="/shop">Shop</Link><Link href="/collections">Collections</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav><Link className="ff-simple-product-cart" href="/cart">View bag ↗</Link></header>
    <div className="ff-simple-product-grid"><div className="ff-simple-product-gallery">{image ? <img src={image} alt={product.alt || product.name}/> : <div>{product.emoji || "✦"}</div>}{config.brand.galleryImages?.length>0 && <div className="ff-simple-product-thumbs">{[product.image,...config.brand.galleryImages].filter(Boolean).slice(0,5).map((src,index)=><button key={`${src}-${index}`} type="button" onClick={()=>setImage(src)} aria-label={`View product image ${index+1}`} aria-pressed={image===src}><img src={src} alt=""/></button>)}</div>}</div>
      <section className="ff-simple-product-info"><span>{product.category || config.templateLabel}</span><h1>{product.name}</h1><strong className="ff-simple-price">{money(unitPrice,config)}</strong><p>{product.description}</p>
        {product.dimensions && <p><b>Dimensions:</b> {product.dimensions}</p>}{product.materials && <p><b>Materials:</b> {product.materials}</p>}
        {sizes.length>0 && <label>Choose an option<select value={sizeId} onChange={(event)=>setSizeId(event.target.value)}>{sizes.map((item)=><option key={item.id} value={item.id}>{item.label}{item.price?` (+${money(item.price,config)})`:""}</option>)}</select></label>}
        {addons.length>0 && <fieldset><legend>Optional extras</legend>{addons.map((item)=><label className="ff-addon" key={item.id}><input type="checkbox" checked={addonIds.includes(item.id)} onChange={(event)=>setAddonIds((current)=>event.target.checked?[...current,item.id]:current.filter((id)=>id!==item.id))}/><span>{item.label}</span><small>+{money(item.price,config)}</small></label>)}</fieldset>}
        <div className="ff-simple-qty"><span>Quantity</span><button type="button" onClick={()=>setQuantity((q)=>Math.max(1,q-1))} aria-label="Decrease quantity">−</button><b>{quantity}</b><button type="button" onClick={()=>setQuantity((q)=>Math.min(50,q+1))} aria-label="Increase quantity">＋</button></div>
        <div className="ff-simple-product-actions"><button type="button" onClick={addToCart}>Add to bag · {money(unitPrice*quantity,config)}</button><button type="button" className="secondary" onClick={toggleWish}>{saved?"♥ Saved":"♡ Save"}</button></div>
        {notice && <p className="ff-simple-notice" role="status">{notice} <Link href="/cart">View bag ↗</Link></p>}
        <a className="ff-simple-enquire" href={enquireUrl} target={phone?"_blank":undefined} rel={phone?"noreferrer":undefined}>Ask the business about this item ↗</a>
        <small className="ff-simple-disclaimer">Availability, final pricing, fulfilment and payment are confirmed by {config.brand.name}.</small>
      </section></div>
  </main>;
}
