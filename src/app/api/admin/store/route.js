import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/server/origin.mjs";
import { authorizeStore, supabaseRequest } from "@/lib/server/supabase.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (payload, status = 200) => NextResponse.json(payload, { status });
const text = (value, max = 500) => String(value ?? "").trim().slice(0, max);
const safeUrl = (value) => {
  const raw = text(value, 1000);
  if (!raw) return null;
  try { const url = new URL(raw); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.toString() : null; }
  catch { return raw.startsWith("/") && !raw.startsWith("//") ? raw : null; }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const access = await authorizeStore(request, searchParams.get("storeSlug"));
  if (!access.ok) return json({ ok: false, error: access.error }, access.status);
  try {
    const rows = await supabaseRequest(`/rest/v1/stores?id=eq.${access.store.id}&select=id,slug,name,tagline,description,address,opening_hours,locale,currency,delivery_fee,delivery_enabled,logo_url,hero_image_url,theme,contact&limit=1`, { admin: true });
    return json({ ok: true, store: rows?.[0] || null });
  } catch (error) { return json({ ok: false, error: error.message }, error.status || 502); }
}

export async function PATCH(request) {
  if (!assertSameOrigin(request)) return json({ ok: false, error: "This request origin is not allowed." }, 403);
  try {
    const body = await request.json();
    const access = await authorizeStore(request, body.storeSlug, ["owner", "admin"]);
    if (!access.ok) return json({ ok: false, error: access.error }, access.status);
    const input = body.updates || {};
    const updates = {};
    const stringFields = { name: 120, tagline: 240, description: 2000, address: 500, opening_hours: 240, locale: 20 };
    for (const [key, max] of Object.entries(stringFields)) if (key in input) updates[key] = text(input[key], max);
    if ("currency" in input) {
      const currency = text(input.currency, 3).toUpperCase();
      if (!/^[A-Z]{3}$/.test(currency)) return json({ ok: false, error: "Currency must be a 3-letter ISO code." }, 400);
      updates.currency = currency;
    }
    if ("delivery_fee" in input) {
      const fee = Number(input.delivery_fee);
      if (!Number.isFinite(fee) || fee < 0) return json({ ok: false, error: "Delivery fee must be zero or greater." }, 400);
      updates.delivery_fee = fee;
    }
    if ("delivery_enabled" in input) updates.delivery_enabled = Boolean(input.delivery_enabled);
    for (const field of ["logo_url", "hero_image_url"]) if (field in input) {
      const value = safeUrl(input[field]);
      if (input[field] && !value) return json({ ok: false, error: `${field} must be a local path or safe HTTP(S) URL.` }, 400);
      updates[field] = value;
    }
    if ("contact" in input) {
      if (!input.contact || typeof input.contact !== "object" || Array.isArray(input.contact)) return json({ ok: false, error: "Contact details must be an object." }, 400);
      updates.contact = { phone: text(input.contact.phone, 40), whatsapp: text(input.contact.whatsapp, 40), email: text(input.contact.email, 254) };
    }
    if ("theme" in input) {
      if (!input.theme || typeof input.theme !== "object" || Array.isArray(input.theme)) return json({ ok: false, error: "Theme must be an object." }, 400);
      const theme = {};
      for (const key of ["primary", "secondary", "background", "surface", "text", "accent"]) {
        if (input.theme[key] !== undefined) {
          const value = text(input.theme[key], 7);
          if (!/^#[0-9a-fA-F]{6}$/.test(value)) return json({ ok: false, error: `Invalid theme color: ${key}.` }, 400);
          theme[key] = value;
        }
      }
      updates.theme = theme;
    }
    if ("name" in updates && updates.name.length < 2) return json({ ok: false, error: "Store name must contain at least 2 characters." }, 400);
    if (!Object.keys(updates).length) return json({ ok: false, error: "No supported store fields were provided." }, 400);
    updates.updated_at = new Date().toISOString();
    const rows = await supabaseRequest(`/rest/v1/stores?id=eq.${access.store.id}`, { method: "PATCH", admin: true, prefer: "return=representation", body: updates });
    if (!rows?.length) return json({ ok: false, error: "Store not found." }, 404);
    return json({ ok: true, store: rows[0] });
  } catch (error) { return json({ ok: false, error: error.message }, error.status || 502); }
}
