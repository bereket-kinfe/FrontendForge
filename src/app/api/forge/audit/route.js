import { isLocalForgeRequest } from "@/lib/forge/local-only.mjs";
import { NextResponse } from "next/server";
import path from "node:path";
import { runClientAudit } from "../../../../../scripts/audit-client.mjs";
import { readProjectStatus, writeProjectStatus } from "@/lib/forge/project-status.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!isLocalForgeRequest(request)) return NextResponse.json({ ok: false, error: "This local filesystem tool is available only from the local FrontendForge development server." }, { status: 403 });
  try {
    const { slug } = await request.json().catch(() => ({}));
    if (!slug || typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Invalid project slug." }, { status: 400 });
    }

    const projectsRoot = path.join(process.cwd(), "client-projects");
    const target = path.join(projectsRoot, slug);

    // Prevent path traversal
    const relative = path.relative(projectsRoot, target);
    if (relative.includes("..") || path.isAbsolute(relative)) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const result = runClientAudit(target);
    const status = await readProjectStatus(slug);
    status.audit = { ...result, checkedAt: new Date().toISOString() };
    await writeProjectStatus(slug, status);
    return NextResponse.json({ ok: true, audit: status.audit });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
