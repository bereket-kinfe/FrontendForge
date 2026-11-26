import { isLocalForgeRequest } from "@/lib/forge/local-only.mjs";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { applyClientProjectUpdates } from "@/lib/forge/client-edit.mjs";
import { readProjectStatus, clearProjectStatus } from "@/lib/forge/project-status.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isLocalForgeRequest(request)) return NextResponse.json({ ok: false, error: "This local filesystem tool is available only from the local FrontendForge development server." }, { status: 403 });
  const projectsRoot = path.join(process.cwd(), "client-projects");
  try {
    const requestedSlug = new URL(request.url).searchParams.get("slug");
    if (requestedSlug) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedSlug)) return NextResponse.json({ ok: false, error: "Invalid project slug." }, { status: 400 });
      const configPath = path.join(projectsRoot, requestedSlug, "src", "config", "client-project.json");
      const config = JSON.parse(await fs.readFile(configPath, "utf8"));
      return NextResponse.json({ ok: true, config });
    }
    await fs.mkdir(projectsRoot, { recursive: true });
    const entries = await fs.readdir(projectsRoot, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const projectPath = path.join(projectsRoot, slug);
      const configPath = path.join(projectPath, "src", "config", "client-project.json");

      try {
        const rawConfig = await fs.readFile(configPath, "utf8");
        const config = JSON.parse(rawConfig);
        let releaseStatus = {};
        try { releaseStatus = await readProjectStatus(slug); } catch {}
        projects.push({
          slug,
          name: config.brand?.name || slug,
          tagline: config.brand?.tagline || "",
          template: config.template || "custom",
          templateLabel: config.templateLabel || "Custom Website",
          createdAt: config.updatedAt || config.createdAt || null,
          productsCount: Array.isArray(config.products) ? config.products.length : 0,
          sectionsCount: Array.isArray(config.sections) ? config.sections.length : 0,
          orderEnabled: Boolean(config.orderEnabled),
          auditStatus: releaseStatus.audit || null,
          buildStatus: releaseStatus.build || null,
          theme: config.theme || {},
          path: projectPath
        });
      } catch {
        // Fallback for folders without complete config
        projects.push({
          slug,
          name: slug,
          tagline: "Incomplete configuration",
          template: "unknown",
          templateLabel: "Unconfigured folder",
          createdAt: null,
          productsCount: 0,
          sectionsCount: 0,
          orderEnabled: false,
          theme: {},
          path: projectPath
        });
      }
    }

    projects.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return NextResponse.json({ ok: true, projects });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!isLocalForgeRequest(request)) return NextResponse.json({ ok: false, error: "Client project editing is available only on the local development server." }, { status: 403 });
  try {
    const { slug, updates } = await request.json();
    if (!slug || typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ ok: false, error: "Invalid project slug." }, { status: 400 });
    if (!updates || typeof updates !== "object") return NextResponse.json({ ok: false, error: "Missing project updates." }, { status: 400 });
    const projectsRoot = path.join(process.cwd(), "client-projects");
    const projectRoot = path.join(projectsRoot, slug);
    const relative = path.relative(projectsRoot, projectRoot);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return NextResponse.json({ ok: false, error: "Access denied." }, { status: 403 });
    const configPath = path.join(projectRoot, "src", "config", "client-project.json");
    const config = JSON.parse(await fs.readFile(configPath, "utf8"));
    let updated;
    try { updated = applyClientProjectUpdates(config, updates); }
    catch (error) { return NextResponse.json({ ok: false, error: error.message }, { status: 400 }); }
    await fs.writeFile(configPath, JSON.stringify(updated, null, 2) + "\n", "utf8");
    // A configuration change makes earlier QA/build results stale.
    await clearProjectStatus(slug).catch(() => {});
    return NextResponse.json({ ok: true, message: "Client configuration saved. Previous release checks were cleared because the project changed.", config: updated });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not update client project." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isLocalForgeRequest(request)) return NextResponse.json({ ok: false, error: "This local filesystem tool is available only from the local FrontendForge development server." }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || (await request.json().catch(() => ({}))).slug;
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

    await fs.rm(target, { recursive: true, force: true });
    await clearProjectStatus(slug).catch(() => {});
    return NextResponse.json({ ok: true, message: `Project "${slug}" deleted successfully.` });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
