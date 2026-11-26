import { assertSameOrigin } from "@/lib/server/origin.mjs";
import { NextResponse } from "next/server";
import { authorizeStore, supabaseRequest } from "@/lib/server/supabase.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (payload, status = 200) => NextResponse.json(payload, { status });

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const access = await authorizeStore(request, searchParams.get("storeSlug"));
  if (!access.ok) return json({ ok: false, error: access.error }, access.status);
  try {
    const orders = await supabaseRequest(`/rest/v1/orders?store_id=eq.${access.store.id}&select=*,order_items(*)&order=created_at.desc&limit=100`, { admin: true });
    return json({ ok: true, orders });
  } catch (error) { return json({ ok: false, error: error.message }, error.status || 502); }
}

export async function PATCH(request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ ok: false, error: "This request origin is not allowed." }, { status: 403 });
  try {
    const body = await request.json();
    const access = await authorizeStore(request, body.storeSlug);
    if (!access.ok) return json({ ok: false, error: access.error }, access.status);
    const orderId = String(body.orderId || "");
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return json({ ok: false, error: "Invalid order ID." }, 400);
    let result;
    const allowed = ["confirmed", "preparing", "ready", "completed", "cancelled"];
    if (!allowed.includes(body.status)) return json({ ok: false, error: "Unsupported order status transition." }, 400);
    result = await supabaseRequest("/rest/v1/rpc/update_store_order_status", {
      method: "POST", accessToken: access.token,
      body: { p_order_id: orderId, p_status: body.status }
    });
    return json({ ok: true, result });
  } catch (error) { return json({ ok: false, error: error.message }, error.status || 502); }
}
