import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { validateClientEditableConfig } from "@/lib/client-config-validation.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isLocalRequest(request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const local = host === "localhost" || host.startsWith("localhost:") ||
    host === "127.0.0.1" || host.startsWith("127.0.0.1:") ||
    host === "[::1]" || host.startsWith("[::1]:");
  if (!local) return false;
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET";
  try {
    const parsed = new URL(origin);
    return ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname) && parsed.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

function blocked() {
  return NextResponse.json({ ok: false, error: "The client editor is available only from this project's local development server." }, { status: 403 });
}

async function readConfig(configPath) {
  const raw = await fs.readFile(configPath, "utf8");
  return JSON.parse(raw);
}

export async function GET(request) {
  if (process.env.NODE_ENV === "production" || !isLocalRequest(request)) return blocked();
  try {
    const configPath = path.join(process.cwd(), "src", "config", "client-project.json");
    return NextResponse.json({ ok: true, config: await readConfig(configPath) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not read client configuration." }, { status: 500 });
  }
}

export async function PUT(request) {
  if (process.env.NODE_ENV === "production" || !isLocalRequest(request)) return blocked();
  try {
    const body = await request.json();
    const configPath = path.join(process.cwd(), "src", "config", "client-project.json");
    const current = await readConfig(configPath);
    const result = validateClientEditableConfig(current, body?.config);
    if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });

    const tempPath = `${configPath}.${process.pid}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(result.config, null, 2)}\n`, "utf8");
    await fs.rename(tempPath, configPath);
    revalidatePath("/", "layout");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/order/[slug]", "page");
    return NextResponse.json({ ok: true, config: result.config, message: "Client website settings saved to src/config/client-project.json." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not save client configuration." }, { status: 400 });
  }
}
