import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { isLocalForgeRequest } from "@/lib/forge/local-only.mjs";
import { readProjectStatus, writeProjectStatus } from "@/lib/forge/project-status.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const execFileAsync = promisify(execFile);

export async function POST(request) {
  if (!isLocalForgeRequest(request)) return NextResponse.json({ ok: false, error: "Client builds can only be started from the local development server." }, { status: 403 });
  let requestedSlug = "";
  try {
    const { slug } = await request.json();
    requestedSlug = slug;
    if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ ok: false, error: "Invalid client project slug." }, { status: 400 });
    const projectsRoot = path.join(process.cwd(), "client-projects");
    const projectRoot = path.join(projectsRoot, slug);
    const relative = path.relative(projectsRoot, projectRoot);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return NextResponse.json({ ok: false, error: "Access denied." }, { status: 403 });
    await fs.access(path.join(projectRoot, "package.json"));
    try { await fs.access(path.join(projectRoot, "node_modules")); }
    catch { return NextResponse.json({ ok: false, error: "Dependencies are not installed for this client. Open its folder and run npm install before building.", output: "npm install" }, { status: 409 }); }
    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    const { stdout = "", stderr = "" } = await execFileAsync(command, ["run", "build"], { cwd: projectRoot, timeout: 180000, maxBuffer: 5 * 1024 * 1024, windowsHide: true, shell: process.platform === "win32" });
    const status = await readProjectStatus(slug);
    status.build = { ok: true, builtAt: new Date().toISOString() };
    await writeProjectStatus(slug, status);
    return NextResponse.json({ ok: true, message: "Next.js production build completed successfully.", builtAt: status.build.builtAt, output: `${stdout}\n${stderr}`.trim().slice(-18000) });
  } catch (error) {
    // Do not leave a previous success badge after a later failed build attempt.
    try {
      const slug = requestedSlug;
      if (typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        const status = await readProjectStatus(slug);
        delete status.build;
        await writeProjectStatus(slug, status);
      }
    } catch {}
    return NextResponse.json({ ok: false, error: error.killed ? "Build timed out after three minutes." : error.message || "Production build failed.", output: `${error.stdout || ""}\n${error.stderr || ""}`.trim().slice(-18000) }, { status: 500 });
  }
}
