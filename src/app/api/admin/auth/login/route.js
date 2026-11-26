import { assertSameOrigin } from "@/lib/server/origin.mjs";
import { NextResponse } from "next/server";
import { getSupabaseConfig, supabaseRequest, sessionCookieName } from "@/lib/server/supabase.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ ok: false, error: "This request origin is not allowed." }, { status: 403 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ ok: false, error: "Supabase is not configured. Follow docs/operations/DATABASE-SETUP.md." }, { status: 503 });
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().slice(0, 254);
    const password = String(body.password || "");
    if (!email || !password || password.length > 1024) return NextResponse.json({ ok: false, error: "Enter your email and password." }, { status: 400 });
    const session = await supabaseRequest("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password } });
    if (!session?.access_token || !session?.user?.id) return NextResponse.json({ ok: false, error: "Sign-in did not return a valid session." }, { status: 401 });
    const response = NextResponse.json({ ok: true, user: { id: session.user.id, email: session.user.email } });
    response.cookies.set(sessionCookieName(), session.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
      maxAge: Math.max(60, Math.min(Number(session.expires_in) || 3600, 60 * 60 * 24))
    });
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.status === 400 || error.status === 401 ? "Email or password was not accepted." : error.message }, { status: error.status || 502 });
  }
}
