import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsRoot = path.join(root, "client-projects");
const entries = (await fs.readdir(projectsRoot, { withFileTypes: true }).catch(() => []))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
if (!entries.length) {
  console.error("No client projects found. Run npm run generate:demo-clients first.");
  process.exit(2);
}
const nextPackage = path.join(root, "node_modules", "next", "package.json");
try { await fs.access(nextPackage); }
catch {
  console.error("The master dependencies are not installed. Run npm ci in the FrontendForge root, then rerun npm run build:clients.");
  process.exit(2);
}
const results = [];
for (const slug of entries) {
  const clientDir = path.join(projectsRoot, slug);
  const packageJson = path.join(clientDir, "package.json");
  try { await fs.access(packageJson); }
  catch { results.push({ slug, status: "SKIPPED", reason: "package.json missing" }); continue; }
  console.log(`\n=== Production build: ${slug} ===`);
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
    cwd: clientDir,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
    windowsHide: true
  });
  results.push({ slug, status: result.status === 0 ? "PASS" : "FAIL", exitCode: result.status ?? 1 });
}
const report = { generatedAt: new Date().toISOString(), total: results.length, passed: results.filter((item) => item.status === "PASS").length, failed: results.filter((item) => item.status === "FAIL").length, results };
await fs.writeFile(path.join(root, "client-build-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`\nClient build summary: ${report.passed}/${report.total} passed. Report: client-build-report.json`);
if (report.failed || results.some((item) => item.status === "SKIPPED")) process.exit(1);
