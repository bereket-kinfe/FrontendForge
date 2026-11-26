import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/server/origin.mjs";
import { sessionCookieName } from "@/lib/server/supabase.mjs";
export const runtime = "nodejs";
export async function POST(request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ ok: false, error: "This request origin is not allowed." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName(), "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
