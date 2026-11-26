import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/server/supabase.mjs";
import { assertSameOrigin } from "@/lib/server/origin.mjs";
import { normalizePublicOrderPayload } from "@/lib/server/order-validation.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (payload, status = 200) => NextResponse.json(payload, { status });

export async function POST(request, { params }) {
  if (!assertSameOrigin(request)) return json({ ok: false, error: "This order request origin is not allowed." }, 403);
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || ""))) return json({ ok: false, error: "Store not found." }, 404);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 64_000) return json({ ok: false, error: "Order request is too large." }, 413);
  try {
    const normalized = normalizePublicOrderPayload(await request.json());
    if (!normalized.ok) return json({ ok: false, error: normalized.error }, 400);
    // The database RPC re-reads prices and availability; browser-supplied totals are never trusted.
    const order = await supabaseRequest("/rest/v1/rpc/create_store_order", {
      method: "POST",
      body: { p_store_slug: slug, p_customer: normalized.customer, p_items: normalized.items }
    });
    return json({ ok: true, order }, 201);
  } catch (error) {
    const status = [400, 404, 409].includes(error.status) ? error.status : 502;
    return json({ ok: false, error: status === 502 ? "We could not submit your order. Please contact the store." : error.message }, status);
  }
}
