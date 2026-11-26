"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./ClientConfigEditor.css";

const COLOR_FIELDS = [
  ["primary", "Primary"], ["secondary", "Secondary"], ["background", "Background"],
  ["surface", "Surface"], ["text", "Text"], ["muted", "Muted"], ["accent", "Accent"]
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ProductEditor({ product, index, onChange, onRemove, onUpload }) {
  const update = (key, value) => onChange(index, { ...product, [key]: value });
  const serializeOptions = (items = []) => items.map((item) => `${item.label}:${item.price || 0}`).join(", ");
  const parseOptions = (value) => value.split(",").map((entry, optionIndex) => {
    const [label, price = "0"] = entry.split(":");
    return { id: `${index}-${optionIndex}-${label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label: label.trim(), price: Number(price.trim()) || 0 };
  }).filter((item) => item.label);
  return (
    <article className="client-editor-product">
      <div className="client-editor-product-head">
        <div><span>PRODUCT {String(index + 1).padStart(2, "0")}</span><strong>{product.name || "New product"}</strong></div>
        <button type="button" className="client-editor-danger" onClick={() => onRemove(index)}>Remove</button>
      </div>
      <div className="client-editor-grid two">
        <label>Product name<input value={product.name || ""} onChange={(e) => update("name", e.target.value)} /></label>
        <label>Category<input value={product.category || ""} onChange={(e) => update("category", e.target.value)} /></label>
        <label>Price<input type="number" min="0" step="0.01" value={product.price ?? 0} onChange={(e) => update("price", e.target.value === "" ? "" : Number(e.target.value))} /></label>
        <label>Image URL or local path<input value={product.image || ""} onChange={(e) => update("image", e.target.value)} placeholder="/images/product.webp" /><span className="client-editor-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => onUpload(e.target.files?.[0], (value) => update("image", value))}/><small>Upload product photo</small></span></label>
        <label className="span-two">Description<textarea rows="2" value={product.description || ""} onChange={(e) => update("description", e.target.value)} /></label>
        <label>Materials<input value={product.materials || ""} onChange={(e) => update("materials", e.target.value)} /></label>
        <label>Dimensions<input value={product.dimensions || ""} onChange={(e) => update("dimensions", e.target.value)} /></label>
        <label className="span-two">Variants (label: extra price, comma separated)<input value={serializeOptions(product.sizes)} onChange={(e) => update("sizes", parseOptions(e.target.value))} placeholder="Standard:0, Wide:1200" /></label>
        <label className="span-two">Add-ons (label: extra price, comma separated)<input value={serializeOptions(product.addons)} onChange={(e) => update("addons", parseOptions(e.target.value))} placeholder="Extra cushion:800, Gift wrap:150" /></label>
        <label className="span-two">Alt text<input value={product.alt || ""} onChange={(e) => update("alt", e.target.value)} /></label>
        <label className="client-editor-check"><input type="checkbox" checked={product.inStock !== false} onChange={(e) => update("inStock", e.target.checked)} /> Available / in stock</label>
      </div>
    </article>
  );
}

export default function ClientConfigEditor() {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState("brand");

  useEffect(() => {
    let live = true;
    fetch("/api/client-config", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Could not load the client configuration.");
        if (live) {
          const next = clone(data.config);
          setConfig(next);
          setBaseline(JSON.stringify(next));
        }
      })
      .catch((error) => { if (live) setErrors([error.message]); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const dirty = useMemo(() => Boolean(config) && JSON.stringify(config) !== baseline, [config, baseline]);
  const updateGroup = (group, key, value) => setConfig((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
  const updateProduct = (index, product) => setConfig((current) => ({ ...current, products: current.products.map((item, i) => i === index ? product : item) }));
  const removeProduct = (index) => setConfig((current) => ({ ...current, products: current.products.filter((_, i) => i !== index) }));
  const addProduct = () => setConfig((current) => ({
    ...current,
    products: [...current.products, { id: `new-product-${Date.now()}`, name: "New product", category: "Featured", description: "", price: 0, image: "", alt: "New product", sizes: [{ id: "standard", label: "Standard", price: 0 }], addons: [], inStock: true }]
  }));

  async function uploadAsset(file, onUploaded) {
    if (!file) return;
    setUploading(true); setMessage(""); setErrors([]);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/client-assets", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Image upload failed.");
      onUploaded(data.path);
      setMessage(`Uploaded ${data.filename}. Save website settings to keep the new image path.`);
    } catch (error) {
      setErrors([error.message || "Image upload failed."]);
    } finally { setUploading(false); }
  }

  async function save() {
    if (!config || saving) return;
    setSaving(true); setMessage(""); setErrors([]);
    try {
      const response = await fetch("/api/client-config", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error((data.errors || [data.error || "Save failed."]).join(" "));
      const next = clone(data.config);
      setConfig(next); setBaseline(JSON.stringify(next));
      setMessage("Saved to src/config/client-project.json. Your storefront will use these settings on refresh.");
      router.refresh();
    } catch (error) {
      setErrors([error.message || "Could not save settings."]);
    } finally { setSaving(false); }
  }

  function reset() {
    if (!baseline || !window.confirm("Discard your unsaved changes?")) return;
    setConfig(JSON.parse(baseline)); setErrors([]); setMessage("Unsaved changes discarded.");
  }

  if (loading) return <main className="client-editor-shell"><p>Loading client settings…</p></main>;
  if (!config) return <main className="client-editor-shell"><h1>Client editor unavailable</h1>{errors.map((error) => <p role="alert" key={error}>{error}</p>)}<Link href="/">Return to website</Link></main>;

  const tabs = [["brand", "Brand & content"], ["colors", "Colors & layout"], ["business", "Business details"], ["products", "Products / menu"]];
  return (
    <main className="client-editor-shell">
      <header className="client-editor-topbar">
        <div><span className="client-editor-mark">F</span><div><strong>Client website editor</strong><small>Local project workspace · {config.brand.name}</small></div></div>
        <div className="client-editor-top-actions"><Link href="/" target="_blank">Preview storefront ↗</Link><button type="button" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : dirty ? "Save changes" : "All changes saved"}</button></div>
      </header>
      <section className="client-editor-intro">
        <span>FRONTENDFORGE · LOCAL EDITOR</span>
        <h1>Make this website <em>yours.</em></h1>
        <p>Update the brand, theme, business details and catalog. Changes are written to this project's configuration file, not to the FrontendForge master.</p>
        <div className="client-editor-status"><span className={dirty ? "is-dirty" : ""}>{dirty ? "Unsaved changes" : "Saved configuration"}</span><code>src/config/client-project.json</code></div>
      </section>
      {message && <div className="client-editor-success" role="status">✓ {message}</div>}
      {errors.length > 0 && <div className="client-editor-errors" role="alert">{errors.map((error) => <p key={error}>• {error}</p>)}</div>}
      <div className="client-editor-layout">
        <nav className="client-editor-tabs" aria-label="Editor sections">{tabs.map(([id, label]) => <button type="button" key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>{label}<span>→</span></button>)}<div className="client-editor-preview-card"><small>BRAND PREVIEW</small><div className="client-editor-preview" style={{ background: config.theme.background, color: config.theme.text, borderColor: config.theme.secondary }}><b>{config.brand.name}</b><span style={{ background: config.theme.primary, color: "#fff" }}>Shop now ↗</span><h3>{config.brand.tagline}</h3><small>{config.templateLabel}</small></div><Link href="/" target="_blank">Open live preview ↗</Link></div></nav>
        <section className="client-editor-panel">
          {activeTab === "brand" && <>
            <div className="client-editor-panel-heading"><span>01 · IDENTITY</span><h2>Brand & content</h2><p>Keep the brand details clear and consistent across the website.</p></div>
            <div className="client-editor-grid two">
              <label>Business / brand name<input value={config.brand.name} onChange={(e) => updateGroup("brand", "name", e.target.value)} /></label>
              <label>Tagline<input value={config.brand.tagline} onChange={(e) => updateGroup("brand", "tagline", e.target.value)} /></label>
              <label className="span-two">Brand description<textarea rows="4" value={config.brand.description} onChange={(e) => updateGroup("brand", "description", e.target.value)} /></label>
              <label>Logo URL or local path<input value={config.brand.logoUrl || ""} onChange={(e) => updateGroup("brand", "logoUrl", e.target.value)} placeholder="/brand-logo.svg" /><span className="client-editor-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(e) => uploadAsset(e.target.files?.[0], (value) => updateGroup("brand", "logoUrl", value))}/><small>Upload logo · max 8 MB</small></span></label>
              <label>Hero image URL or local path<input value={config.brand.heroImageUrl || ""} onChange={(e) => updateGroup("brand", "heroImageUrl", e.target.value)} placeholder="/images/hero.webp" /><span className="client-editor-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(e) => uploadAsset(e.target.files?.[0], (value) => updateGroup("brand", "heroImageUrl", value))}/><small>Upload hero image · max 8 MB</small></span></label>
              <label className="span-two">Gallery image paths / URLs<textarea rows="3" value={(config.brand.galleryImages || []).join("\n")} onChange={(e) => updateGroup("brand", "galleryImages", e.target.value.split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean))} /></label>
            </div>
          </>}
          {activeTab === "colors" && <>
            <div className="client-editor-panel-heading"><span>02 · DESIGN SYSTEM</span><h2>Colors & layout</h2><p>Change the brand palette and shared visual styles.</p></div>
            <div className="client-editor-colors">{COLOR_FIELDS.map(([key, label]) => <label key={key}><span><i style={{ background: config.theme[key] }}/>{label}</span><input type="color" value={config.theme[key]} onChange={(e) => updateGroup("theme", key, e.target.value)} /><code>{config.theme[key]}</code></label>)}</div>
            <div className="client-editor-grid two">
              <label>Typography<select value={config.font || "Manrope + DM Sans"} onChange={(e) => setConfig((current) => ({ ...current, font: e.target.value }))}><option>Manrope + DM Sans</option><option>DM Sans</option><option>Georgia + DM Sans</option><option>System sans-serif</option></select></label>
              <label>Header style<select value={config.componentStyles?.header || "standard"} onChange={(e) => updateGroup("componentStyles", "header", e.target.value)}><option value="standard">Standard</option><option value="centered">Centered</option><option value="bold">Bold</option></select></label>
              <label>Hero layout<select value={config.componentStyles?.hero || "split"} onChange={(e) => updateGroup("componentStyles", "hero", e.target.value)}><option value="split">Split</option><option value="centered">Centered</option><option value="photo-led">Photo led</option></select></label>
              <label>Catalog layout<select value={config.componentStyles?.catalog || "cards"} onChange={(e) => updateGroup("componentStyles", "catalog", e.target.value)}><option value="cards">Cards</option><option value="list">List</option><option value="editorial">Editorial</option></select></label>
              <label>Button style<select value={config.componentStyles?.buttons || "rounded"} onChange={(e) => updateGroup("componentStyles", "buttons", e.target.value)}><option value="pill">Pill</option><option value="rounded">Rounded</option><option value="square">Square</option></select></label>
            </div>
          </>}
          {activeTab === "business" && <>
            <div className="client-editor-panel-heading"><span>03 · BUSINESS</span><h2>Business & contact details</h2><p>Use verified details supplied or approved by the client.</p></div>
            <div className="client-editor-grid two">
              <label className="span-two">Business address<input value={config.business.address || ""} onChange={(e) => updateGroup("business", "address", e.target.value)} /></label>
              <label className="span-two">Opening hours<input value={config.business.hours || ""} onChange={(e) => updateGroup("business", "hours", e.target.value)} /></label>
              <label>Currency<select value={config.business.currency} onChange={(e) => updateGroup("business", "currency", e.target.value)}><option>ETB</option><option>USD</option><option>EUR</option><option>GBP</option><option>KES</option></select></label>
              <label>Delivery fee<input type="number" min="0" value={config.business.deliveryFee ?? 0} onChange={(e) => updateGroup("business", "deliveryFee", Number(e.target.value))} /></label>
              <label>Phone<input value={config.contact.phone || ""} onChange={(e) => updateGroup("contact", "phone", e.target.value)} /></label>
              <label>WhatsApp<input value={config.contact.whatsapp || ""} onChange={(e) => updateGroup("contact", "whatsapp", e.target.value)} /></label>
              <label>Email<input type="email" value={config.contact.email || ""} onChange={(e) => updateGroup("contact", "email", e.target.value)} /></label>
              <label>Website<input type="url" value={config.contact.website || ""} onChange={(e) => updateGroup("contact", "website", e.target.value)} /></label>
            </div>
          </>}
          {activeTab === "products" && <>
            <div className="client-editor-panel-heading"><span>04 · CATALOG</span><h2>Products & menu</h2><p>Manage product information, availability and images. Prices are editable and saved to the client catalog.</p></div>
            <div className="client-editor-products-heading"><strong>{config.products.length} catalog items</strong><button type="button" onClick={addProduct}>＋ Add product</button></div>
            <div className="client-editor-products">{config.products.map((product, index) => <ProductEditor key={product.id || index} product={product} index={index} onChange={updateProduct} onRemove={removeProduct} onUpload={uploadAsset} />)}</div>
            {config.products.length === 0 && <div className="client-editor-empty">No products yet. Add your first catalog item.</div>}
          </>}
          <div className="client-editor-panel-footer"><button type="button" className="client-editor-reset" onClick={reset} disabled={!dirty}>Discard changes</button><button type="button" className="client-editor-save" onClick={save} disabled={!dirty || saving || uploading}>{saving ? "Saving changes…" : uploading ? "Uploading image…" : "Save website settings →"}</button></div>
        </section>
      </div>
      <footer className="client-editor-footer">FrontendForge Local Client Editor · This tool edits only this client project.</footer>
    </main>
  );
}
