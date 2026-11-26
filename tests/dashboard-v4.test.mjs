import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFile(path.join(root, file), "utf8");

const studioFiles = [
  "src/components/forge/ForgeStudio.js",
  "src/components/forge/dashboard/DashboardPanel.js",
  "src/components/forge/projects/ProjectManagerPanel.js",
  "src/components/forge/builder/BuilderWorkspace.js",
  "src/components/forge/builder/BrandingPanel.js",
  "src/components/forge/builder/IntegrationsPanel.js",
  "src/components/forge/shared/ForgeBuildReport.js",
  "src/hooks/forge/useForgeBuilder.js",
  "src/hooks/forge/useForgeProjects.js"
];

async function readStudio() {
  return (await Promise.all(studioFiles.map(read))).join("\n");
}

test("Studio dashboard uses the 3.5 multi-page production workspace layout", async () => {
  const page = await read("src/components/forge/ForgeStudio.js");
  const dashboard = await read("src/components/forge/dashboard/DashboardPanel.js");
  const projects = await read("src/components/forge/projects/ProjectManagerPanel.js");
  const sharedReport = await read("src/components/forge/shared/ForgeBuildReport.js");
  const css = await read("src/app/forge/dashboard-v4.css");
  const ui = [page, dashboard, projects].join("\n");

  for (const label of ["Dashboard", "Templates", "Components", "Branding", "Integrations", "Projects", "Documentation", "Client Quick-Start", "Choose a Starter", "Your Projects", "Start Quick Start"]) {
    assert.ok(ui.includes(label), `Missing dashboard element: ${label}`);
  }
  assert.ok(ui.includes("v3.5.0"));
  assert.ok(sharedReport.includes("function") || sharedReport.includes("export default function"));
  assert.equal((ui.match(/<ForgeBuildReport report={buildReport} \/>/g) || []).length, 2);
  assert.ok(page.includes("<DashboardPanel"));
  assert.ok(page.includes("<ProjectManagerPanel"));
  assert.ok(page.includes("<BuilderWorkspace"));
  assert.ok(css.includes(".forge-sidebar") && css.includes(".forge-dashboard-hero") && css.includes("@media(max-width:640px)"));
  assert.ok(!ui.includes("STUDIO PLATFORM · V2.6"));
});

test("dashboard starter cards include all six registered starter ids", async () => {
  const dashboard = await read("src/components/forge/dashboard/DashboardPanel.js");
  const builder = await read("src/components/forge/builder/BuilderWorkspace.js");
  const config = await read("src/lib/forge/studio-config.mjs");
  for (const id of ["ecommerce", "restaurant", "cafe", "foodDelivery", "furniture", "grocery"]) assert.ok(config.includes(`id: "${id}"`));
  assert.ok(dashboard.includes("startFromStarter(item.id)"));
  assert.ok(builder.includes("chooseStarter(item.id)"));
});

test("project manager edit and build actions call local APIs", async () => {
  const page = await read("src/components/forge/ForgeStudio.js");
  const projectsHook = await read("src/hooks/forge/useForgeProjects.js");
  const projects = await read("src/components/forge/projects/ProjectManagerPanel.js");
  const projectsApi = await read("src/app/api/forge/projects/route.js");
  const buildApi = await read("src/app/api/forge/build/route.js");
  assert.ok(projectsHook.includes('method: "PATCH"'));
  assert.ok(projectsHook.includes('fetch("/api/forge/build"'));
  assert.ok(page.includes("useForgeProjects"));
  assert.ok(projects.includes("onClick={() => openProjectEditor(proj)}"));
  assert.ok(projects.includes("onClick={() => runAudit(proj.slug)}"));
  assert.ok(projectsApi.includes("export async function PATCH"));
  assert.ok(projectsApi.includes("isLocalForgeRequest(request)"));
  assert.ok(buildApi.includes("export async function POST"));
  assert.ok(buildApi.includes('"run", "build"') || buildApi.includes('"npm"'));
  assert.ok(buildApi.includes("isLocalForgeRequest(request)"));
});

test("Branding and integrations are isolated controlled feature modules", async () => {
  const [builder, branding, integrations] = await Promise.all([
    read("src/components/forge/builder/BuilderWorkspace.js"),
    read("src/components/forge/builder/BrandingPanel.js"),
    read("src/components/forge/builder/IntegrationsPanel.js")
  ]);
  assert.ok(builder.includes("<BrandingPanel"));
  assert.ok(builder.includes("<IntegrationsPanel"));
  assert.ok(branding.includes("updateForm") && branding.includes("choosePalette") && branding.includes("setComponentStyles"));
  assert.ok(integrations.includes("integrationOptions.map") && integrations.includes("updateIntegration"));
});

test("Studio controller delegates project APIs and builder wizard state to custom hooks", async () => {
  const page = await read("src/components/forge/ForgeStudio.js");
  const builderHook = await read("src/hooks/forge/useForgeBuilder.js");
  const projectsHook = await read("src/hooks/forge/useForgeProjects.js");

  assert.ok(page.includes('useState("dashboard")'));
  assert.ok(page.includes("useForgeBuilder"));
  assert.ok(page.includes("useForgeProjects"));
  assert.ok(page.includes("<DashboardPanel"));
  assert.ok(page.includes("<ProjectManagerPanel"));
  assert.ok(page.includes("<BuilderWorkspace"));
  assert.ok(projectsHook.includes('fetch("/api/forge/create-client"'));
  assert.ok(builderHook.includes("createClientRequest(payload)"));
  assert.ok(!builderHook.includes("fetch("));
  assert.ok(builderHook.includes("function useForgeBuilder") || builderHook.includes("export default function useForgeBuilder"));
  assert.ok(projectsHook.includes('fetch("/api/forge/projects"'));
  assert.ok(projectsHook.includes('fetch("/api/forge/audit"'));
  assert.ok(projectsHook.includes('fetch("/api/forge/build"'));
  assert.ok(projectsHook.includes("saveProjectEditor"));
  assert.ok(!page.includes("async function createClientProject()"));
  assert.ok(!page.includes("async function fetchProjects()"));
  assert.ok(!page.includes("forge-dashboard-page"));
  assert.ok(!page.includes("forge-v3-stage"));
});

test("builder hook owns wizard transitions and keeps client payload fields", async () => {
  const builderHook = await read("src/hooks/forge/useForgeBuilder.js");
  for (const field of ["template:", "brand:", "contact:", "business:", "theme:", "componentStyles", "sections", "orderedSections", "catalogText", "integrations"]) {
    assert.ok(builderHook.includes(field), `Missing builder payload field: ${field}`);
  }
  for (const transition of ["chooseStarter", "choosePalette", "toggleSection", "reorderSections", "updateIntegration", "createClientProject"]) {
    assert.ok(builderHook.includes(transition), `Missing builder action: ${transition}`);
  }
});

test("starter registry and generated metadata no longer advertise the legacy 2.6 version", async () => {
  const models = await read("src/schemas/models.mjs");
  const project = await read("src/lib/forge/project.mjs");
  assert.ok(models.includes('version: "3.5.0"'));
  assert.ok(!models.includes('version: "2.6.0"'));
  assert.ok(project.includes('engineVersion: "3.5.0"'));
  assert.ok(project.includes('sourceVersion: "3.5.0"'));
});
