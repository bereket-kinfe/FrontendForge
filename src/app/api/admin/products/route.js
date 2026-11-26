import { normalizeSafeAssetUrl, normalizeSafeAssetList } from "@/lib/server/safe-assets.mjs";
import { assertSameOrigin } from "@/lib/server/origin.mjs";
import { NextResponse } from "next/server";
import { authorizeStore, supabaseRequest } from "@/lib/server/supabase.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (payload, status = 200) => NextResponse.json(payload, { status });
const text = (value, max = 500) => String(value ?? "").trim().slice(0, max);
const slugify = (value) => text(value, 120).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const access = await authorizeStore(request, searchParams.get("storeSlug"));
  if (!access.ok) return json({ ok: false, error: access.error }, access.status);
  try {
    const products = await supabaseRequest(`/rest/v1/products?store_id=eq.${access.store.id}&select=id,slug,sku,name,description,category,price,stock,is_active,image_url,images,options,created_at,updated_at&order=created_at.desc`, { admin: true });
    return json({ ok: true, products });
  } catch (error) { return json({ ok: false, error: error.message }, error.status || 502); }
}

export async function POST(request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ ok: false, error: "This request origin is not allowed." }, { status: 403 });
  try {
    const body = await request.json();
    const access = await authorizeStore(request, body.storeSlug, ["owner", "admin"]);
    if (!access.ok) return json({ ok: false, error: access.error }, access.status);
    const product = body.product || {};
    const name = text(product.name, 120);
    const price = Number(product.price);
    const stock = product.stock === null || product.stock === "" ? null : Number(product.stock);
    if (name.length < 2 || !Number.isFinite(price) || price < 0 || (stock !== null && (!Number.isInteger(stock) || stock < 0))) return json({ ok: false, error: "Product name, price or stock is invalid." }, 400);
    const imageUrl = product.image_url ? normalizeSafeAssetUrl(product.image_url) : "";
    const images = product.images === undefined ? [] : normalizeSafeAssetList(product.images);
    if ((product.image_url && !imageUrl) || images === null) return json({ ok: false, error: "Product images must use a local path or a safe HTTP(S) URL." }, 400);
    if (slugify(product.slug || name).length < 1) return json({ ok: false, error: "Product slug is invalid." }, 400);
    if (product.options && (typeof product.options !== "object" || Array.isArray(product.options) || JSON.stringify(product.options).length > 16000)) return json({ ok: false, error: "Product options must be a small JSON object." }, 400);
    const created = await supabaseRequest("/rest/v1/products", {
      method: "POST", admin: true, prefer: "return=representation",
      body: { store_id: access.store.id, name, slug: slugify(product.slug || name), sku: text(product.sku, 80) || null, description: text(product.description, 2000), category: text(product.category, 80) || "Featured", price, stock, is_active: product.is_active !== false, image_url: imageUrl || null, images, options: product.options && typeof product.options === "object" ? product.options : {} }
    });
    return json({ ok: true, product: created?.[0] }, 201);
  } catch (error) { return json({ ok: false, error: error.message }, error.status || 502); }
}

export async function PATCH(request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ ok: false, error: "This request origin is not allowed." }, { status: 403 });
  try {
    const body = await request.json();
    const access = await authorizeStore(request, body.storeSlug, ["owner", "admin"]);
    if (!access.ok) return json({ ok: false, error: access.error }, access.status);
    const productId = text(body.productId, 80);
    if (!/^[0-9a-f-]{36}$/i.test(productId)) return json({ ok: false, error: "Invalid product ID." }, 400);
    const input = body.updates || {};
    const updates = {};
    for (const key of ["name", "description", "category", "sku"]) if (key in input) updates[key] = text(input[key], key === "description" ? 2000 : 500) || null;
    if ("image_url" in input) {
      const imageUrl = input.image_url ? normalizeSafeAssetUrl(input.image_url) : "";
      if (input.image_url && !imageUrl) return json({ ok: false, error: "Product image must use a local path or a safe HTTP(S) URL." }, 400);
      updates.image_url = imageUrl || null;
    }
    if ("price" in input) { const price = Number(input.price); if (!Number.isFinite(price) || price < 0) return json({ ok: false, error: "Price must be zero or greater." }, 400); updates.price = price; }
    if ("stock" in input) { const stock = input.stock === null || input.stock === "" ? null : Number(input.stock); if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return json({ ok: false, error: "Stock must be a non-negative whole number or blank." }, 400); updates.stock = stock; }
    if ("is_active" in input) updates.is_active = Boolean(input.is_active);
    if ("images" in input) {
      const images = normalizeSafeAssetList(input.images);
      if (images === null) return json({ ok: false, error: "Product images must use a local path or a safe HTTP(S) URL." }, 400);
      updates.images = images;
    }
    if (!Object.keys(updates).length) return json({ ok: false, error: "No supported product fields were provided." }, 400);
    updates.updated_at = new Date().toISOString();
    const saved = await supabaseRequest(`/rest/v1/products?id=eq.${productId}&store_id=eq.${access.store.id}`, { method: "PATCH", admin: true, prefer: "return=representation", body: updates });
    if (!saved?.length) return json({ ok: false, error: "Product not found." }, 404);
    return json({ ok: true, product: saved[0] });
  } catch (error) { return json({ ok: false, error: error.message }, error.status || 502); }
}
