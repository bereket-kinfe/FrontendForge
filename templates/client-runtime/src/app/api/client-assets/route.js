import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 8 * 1024 * 1024;
const MIME_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/avif", "avif"]
]);

function isLocalRequest(request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const local = host === "localhost" || host.startsWith("localhost:") || host === "127.0.0.1" || host.startsWith("127.0.0.1:") || host === "[::1]" || host.startsWith("[::1]:");
  if (!local) return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname) && parsed.host.toLowerCase() === host;
  } catch { return false; }
}

export async function POST(request) {
  if ((process.env.NODE_ENV === "production" && process.env.FORGE_LOCAL_PREVIEW !== "1") || !isLocalRequest(request)) {
    return NextResponse.json({ ok: false, error: "Local asset uploads are available only in this project's development server." }, { status: 403 });
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ ok: false, error: "Choose an image file to upload." }, { status: 400 });
    }
    if (!MIME_EXTENSIONS.has(file.type)) {
      return NextResponse.json({ ok: false, error: "Use JPG, PNG, WebP or AVIF images. SVG uploads are disabled for safety." }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Image must be larger than 0 bytes and no more than 8 MB." }, { status: 413 });
    }
    const extension = MIME_EXTENSIONS.get(file.type);
    const safeName = String(file.name || "image").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "image";
    const filename = `${safeName}-${randomUUID().slice(0, 8)}.${extension}`;
    const directory = path.join(process.cwd(), "public", "images", "client-assets");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    return NextResponse.json({ ok: true, path: `/images/client-assets/${filename}`, filename, size: file.size });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not save the image." }, { status: 400 });
  }
}
