import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/server/supabase.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (payload, status = 200) => NextResponse.json(payload, { status });
const safeSlug = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));

export async function GET(_request, { params }) {
  const { slug } = await params;
  if (!safeSlug(slug)) return json({ ok: false, error: "Store not found." }, 404);
  try {
    const stores = await supabaseRequest(`/rest/v1/stores?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=id,slug,name,tagline,description,address,opening_hours,currency,delivery_fee,delivery_enabled,logo_url,hero_image_url,theme,contact&limit=1`);
    const store = stores?.[0];
    if (!store) return json({ ok: false, error: "Store not found." }, 404);
    const products = await supabaseRequest(`/rest/v1/products?store_id=eq.${store.id}&is_active=eq.true&select=id,slug,name,description,category,price,image_url,images,options,stock&order=created_at.desc`);
    return json({ ok: true, store, products: products || [] }, 200);
  } catch (error) {
    return json({ ok: false, error: "The store catalog could not be loaded." }, error.status || 502);
  }
}
