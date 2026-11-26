"use client";
import { useMemo, useState } from "react";

const money = (value, currency = "ETB") => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value || 0));

export default function AdminWorkspace() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [storeSlug, setStoreSlug] = useState("");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [draft, setDraft] = useState({ name: "", price: "", stock: "", category: "Featured", description: "" });
  const [storeProfile, setStoreProfile] = useState({ name: "", tagline: "", description: "", address: "", opening_hours: "", currency: "ETB", delivery_fee: 0, delivery_enabled: false, contact: { phone: "", whatsapp: "", email: "" }, theme: { primary: "#6454d9", secondary: "#eeeaff", background: "#ffffff", surface: "#f5f7fb", text: "#182337", accent: "#65c7b5" } });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const headers = useMemo(() => ({ "Content-Type": "application/json" }), []);
  async function api(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) }, credentials: "same-origin", cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }
  async function signIn(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const data = await api("/api/admin/auth/login", { method: "POST", body: JSON.stringify(credentials) });
      setUser(data.user); setNotice(`Signed in as ${data.user.email}. Now load your store.`);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function loadStore() {
    if (!storeSlug.trim()) { setError("Enter the store slug configured in Supabase."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const [productData, orderData, storeData] = await Promise.all([
        api(`/api/admin/products?storeSlug=${encodeURIComponent(storeSlug.trim())}`),
        api(`/api/admin/orders?storeSlug=${encodeURIComponent(storeSlug.trim())}`),
        api(`/api/admin/store?storeSlug=${encodeURIComponent(storeSlug.trim())}`)
      ]);
      setProducts(productData.products || []); setOrders(orderData.orders || []);
      if (storeData.store) setStoreProfile({ ...storeProfile, ...storeData.store, contact: { ...storeProfile.contact, ...(storeData.store.contact || {}) }, theme: { ...storeProfile.theme, ...(storeData.store.theme || {}) } });
      setNotice(`Loaded ${productData.products?.length || 0} products and ${orderData.orders?.length || 0} orders.`);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function addProduct(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await api("/api/admin/products", { method: "POST", body: JSON.stringify({ storeSlug, product: { ...draft, price: Number(draft.price), stock: draft.stock === "" ? null : Number(draft.stock) } }) });
      setDraft({ name: "", price: "", stock: "", category: "Featured", description: "" });
      await loadStore(); setNotice("Product added successfully.");
    } catch (err) { setError(err.message); setBusy(false); }
  }
  async function updateProduct(productId, updates) {
    setBusy(true); setError("");
    try { await api("/api/admin/products", { method: "PATCH", body: JSON.stringify({ storeSlug, productId, updates }) }); await loadStore(); setNotice("Product updated."); }
    catch (err) { setError(err.message); setBusy(false); }
  }
  async function updateOrder(orderId, status) {
    setBusy(true); setError("");
    try { await api("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ storeSlug, orderId, status }) }); await loadStore(); setNotice(`Order updated to ${status}.`); }
    catch (err) { setError(err.message); setBusy(false); }
  }
  async function saveStore(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const data = await api("/api/admin/store", { method: "PATCH", body: JSON.stringify({ storeSlug, updates: storeProfile }) });
      if (data.store) setStoreProfile((current) => ({ ...current, ...data.store, contact: { ...current.contact, ...(data.store.contact || {}) }, theme: { ...current.theme, ...(data.store.theme || {}) } }));
      setNotice("Store profile and branding saved.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    try { await api("/api/admin/auth/logout", { method: "POST", body: "{}" }); setUser(null); setProducts([]); setOrders([]); setNotice("Signed out."); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <main className="ff-admin-shell">
    <header className="ff-admin-header"><a href="/" className="ff-admin-brand">FrontendForge <span>STORE ADMIN</span></a><a href="/" className="ff-admin-back">View storefront ↗</a></header>
    <section className="ff-admin-intro"><span className="ff-admin-eyebrow">STORE OPERATIONS</span><h1>Manage your store.</h1><p>Sign in with a Supabase Auth account that has membership in the selected store. Payment processing is not included.</p></section>
    {error && <p role="alert" className="ff-admin-alert error">{error}</p>}{notice && <p role="status" className="ff-admin-alert success">{notice}</p>}
    {!user ? <form className="ff-admin-card ff-admin-login" onSubmit={signIn}>
      <h2>Store team sign in</h2>
      <label>Email<input type="email" autoComplete="username" required value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}/></label>
      <label>Password<input type="password" autoComplete="current-password" required value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}/></label>
      <button disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button>
      <small>Requires configured Supabase Auth and an existing store membership.</small>
    </form> : <>
      <section className="ff-admin-card ff-admin-storebar"><div><span className="ff-admin-muted">SIGNED IN</span><strong>{user.email}</strong></div><label>Store slug<input value={storeSlug} onChange={(e) => setStoreSlug(e.target.value)} placeholder="your-store-slug"/></label><button onClick={loadStore} disabled={busy}>{busy ? "Loading…" : "Load store"}</button><button className="secondary" onClick={signOut} disabled={busy}>Sign out</button></section>
      <section className="ff-admin-stats"><article><span>Products</span><strong>{products.length}</strong></article><article><span>Orders</span><strong>{orders.length}</strong></article><article><span>Pending</span><strong>{orders.filter((order) => order.status === "pending").length}</strong></article></section>
      <nav className="ff-admin-tabs" aria-label="Admin sections"><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Orders</button><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>Products & stock</button><button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>Store profile</button></nav>
      {tab === "settings" ? <form className="ff-admin-card ff-admin-settings" onSubmit={saveStore}>
        <h2>Store profile & branding</h2>
        <div className="ff-admin-form-grid"><label>Business name<input value={storeProfile.name || ""} onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })} required minLength="2"/></label><label>Tagline<input value={storeProfile.tagline || ""} onChange={(e) => setStoreProfile({ ...storeProfile, tagline: e.target.value })}/></label><label>Address<input value={storeProfile.address || ""} onChange={(e) => setStoreProfile({ ...storeProfile, address: e.target.value })}/></label><label>Opening hours<input value={storeProfile.opening_hours || ""} onChange={(e) => setStoreProfile({ ...storeProfile, opening_hours: e.target.value })}/></label><label>Email<input type="email" value={storeProfile.contact?.email || ""} onChange={(e) => setStoreProfile({ ...storeProfile, contact: { ...storeProfile.contact, email: e.target.value } })}/></label><label>Phone<input value={storeProfile.contact?.phone || ""} onChange={(e) => setStoreProfile({ ...storeProfile, contact: { ...storeProfile.contact, phone: e.target.value } })}/></label><label>WhatsApp<input value={storeProfile.contact?.whatsapp || ""} onChange={(e) => setStoreProfile({ ...storeProfile, contact: { ...storeProfile.contact, whatsapp: e.target.value } })}/></label><label>Currency<input maxLength="3" value={storeProfile.currency || "ETB"} onChange={(e) => setStoreProfile({ ...storeProfile, currency: e.target.value.toUpperCase() })}/></label><label>Delivery fee<input type="number" min="0" step="0.01" value={storeProfile.delivery_fee ?? 0} onChange={(e) => setStoreProfile({ ...storeProfile, delivery_fee: Number(e.target.value) })}/></label></div>
        <label>Business description<textarea rows="3" value={storeProfile.description || ""} onChange={(e) => setStoreProfile({ ...storeProfile, description: e.target.value })}/></label>
        <label className="ff-admin-check"><input type="checkbox" checked={Boolean(storeProfile.delivery_enabled)} onChange={(e) => setStoreProfile({ ...storeProfile, delivery_enabled: e.target.checked })}/> Enable delivery</label>
        <h3>Brand colors</h3><div className="ff-admin-colors">{["primary", "secondary", "background", "surface", "text", "accent"].map((key) => <label key={key}>{key}<input type="color" value={storeProfile.theme?.[key] || "#ffffff"} onChange={(e) => setStoreProfile({ ...storeProfile, theme: { ...storeProfile.theme, [key]: e.target.value } })}/></label>)}</div>
        <button disabled={busy}>Save store profile</button>
      </form> : tab === "products" ? <section className="ff-admin-workspace">
        <form className="ff-admin-card ff-admin-product-form" onSubmit={addProduct}><h2>Add a product</h2><div className="ff-admin-form-grid"><label>Name<input required minLength={2} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}/></label><label>Price<input required type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })}/></label><label>Stock <input type="number" min="0" step="1" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} placeholder="Blank = not tracked"/></label><label>Category<input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}/></label></div><label>Description<textarea rows="2" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}/></label><button disabled={busy}>Add product</button></form>
        <div className="ff-admin-list">{products.map((product) => <article className="ff-admin-card ff-admin-product-row" key={product.id}><div><strong>{product.name}</strong><small>{product.category} · {money(product.price)}</small><small>{product.stock === null ? "Stock not tracked" : `${product.stock} in stock`}</small></div><div className="ff-admin-row-actions"><button className="secondary" onClick={() => updateProduct(product.id, { is_active: !product.is_active })} disabled={busy}>{product.is_active ? "Hide" : "Publish"}</button><label className="ff-admin-stock">Price<input type="number" min="0" step="0.01" value={product.price} onChange={(e) => setProducts((all) => all.map((item) => item.id === product.id ? { ...item, price: Number(e.target.value) } : item))} onBlur={(e) => updateProduct(product.id, { price: Number(e.target.value) })}/></label><label className="ff-admin-stock">Stock<input type="number" min="0" value={product.stock ?? ""} placeholder="∞" onChange={(e) => setProducts((all) => all.map((item) => item.id === product.id ? { ...item, stock: e.target.value === "" ? null : Number(e.target.value) } : item))} onBlur={(e) => updateProduct(product.id, { stock: e.target.value === "" ? null : Number(e.target.value) })}/></label></div></article>)}</div>
      </section> : <section className="ff-admin-list">{orders.length === 0 && <div className="ff-admin-card ff-admin-empty">No orders yet. Customer orders submitted through the configured storefront API will appear here.</div>}{orders.map((order) => <article className="ff-admin-card ff-admin-order" key={order.id}><div className="ff-admin-order-head"><div><strong>#{order.order_number}</strong><span>{new Date(order.created_at).toLocaleString()}</span></div><b className={`status-${order.status}`}>{order.status}</b></div><p><strong>{order.customer_name}</strong> · {order.customer_phone}</p><p>{order.fulfillment === "delivery" ? order.delivery_address : "Pickup"}</p><ul>{(order.order_items || []).map((item) => <li key={item.id}>{item.quantity} × {item.product_snapshot?.name || "Product"} — {money(item.line_total, order.currency)}</li>)}</ul><div className="ff-admin-order-foot"><strong>Total: {money(order.total, order.currency)}</strong><div>{order.status === "pending" && <button onClick={() => updateOrder(order.id, "confirmed")} disabled={busy}>Confirm</button>}{order.status === "confirmed" && <button onClick={() => updateOrder(order.id, "preparing")} disabled={busy}>Start preparing</button>}{order.status === "preparing" && <button onClick={() => updateOrder(order.id, "ready")} disabled={busy}>Mark ready</button>}{order.status === "ready" && <button onClick={() => updateOrder(order.id, "completed")} disabled={busy}>Complete</button>}{!['completed','cancelled'].includes(order.status) && <button className="danger" onClick={() => updateOrder(order.id, "cancelled")} disabled={busy}>Cancel</button>}</div></div></article>)}</section>}
    </>}
    <footer className="ff-admin-footer">FrontendForge Store Admin · Server-side authorization required · No payment gateway configured</footer>
  </main>;
}
