import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsRoot = path.join(root, "client-projects");
const cli = path.join(root, "node_modules", "@playwright", "test", "cli.js");
try { await fs.access(cli); } catch {
  console.error("Playwright is not installed. Run: npm run install:e2e");
  process.exit(2);
}
const entries = (await fs.readdir(projectsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : entries.map((entry) => entry.name);
let failures = 0;
for (const [index, slug] of slugs.entries()) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error(`Invalid client slug: ${slug}`); failures++; continue;
  }
  const projectDir = path.join(projectsRoot, slug);
  try { await fs.access(path.join(projectDir, "src", "config", "client-project.json")); }
  catch { console.error(`Client project not found: ${slug}`); failures++; continue; }
  const port = String(3190 + index);
  console.log(`\n=== Browser QA: ${slug} (port ${port}) ===`);
  const result = spawnSync(process.execPath, [cli, "test", "--config", path.join(root, "playwright.config.mjs")], {
    cwd: root,
    env: { ...process.env, CLIENT_PROJECT_DIR: projectDir, CLIENT_TEST_PORT: port },
    stdio: "inherit",
    windowsHide: true
  });
  if (result.status !== 0) failures++;
}
if (failures) {
  console.error(`\nBrowser QA finished with ${failures} client suite(s) failing or unavailable.`);
  process.exit(1);
}
console.log(`\nBrowser QA passed for ${slugs.length} client project(s), in desktop and mobile Chromium viewports.`);
