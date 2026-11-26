import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runClientAudit } from "./audit-client.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2] || "";
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage: npm run package:client -- <client-slug>");
  process.exit(2);
}
const source = path.join(root, "client-projects", slug);
try { await fs.access(path.join(source, "src", "config", "client-project.json")); }
catch { console.error(`Client project not found: ${source}`); process.exit(2); }

const audit = runClientAudit(source);
if (!audit.ok) {
  console.error("Client release audit failed. Resolve these issues before packaging:");
  audit.issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

const outputRoot = path.join(root, "client-deliverables");
const staging = path.join(outputRoot, `${slug}-handover`);
const zipPath = `${staging}.zip`;
await fs.mkdir(outputRoot, { recursive: true });
await fs.rm(staging, { recursive: true, force: true });
await fs.rm(zipPath, { force: true });

const excluded = new Set(["node_modules", ".next", ".git", "coverage", "playwright-report", "test-results", "client-deliverables"]);
await fs.cp(source, staging, {
  recursive: true,
  filter: (item) => {
    const relative = path.relative(source, item);
    if (!relative) return true;
    const first = relative.split(path.sep)[0];
    const base = path.basename(item);
    if (excluded.has(first)) return false;
    if (base === ".env.local" || base === ".env" || base.startsWith(".env.production")) return false;
    return true;
  }
});

const report = {
  generatedAt: new Date().toISOString(),
  client: slug,
  audit: { ok: audit.ok, passedChecks: audit.passedChecks, warnings: audit.warnings, issues: audit.issues },
  build: process.env.FRONTENDFORGE_BUILD_VERIFIED === "1" ? "Production build passed via release:client." : "Not run by package:client; use npm run release:client for audit + production build + package.",
  secretsIncluded: false
};
await fs.writeFile(path.join(staging, "RELEASE-AUDIT.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(staging, "HANDOVER-START-HERE.md"), `# ${audit.clientName || slug} — Handover\n\n1. Read README.md and docs/CLIENT-HANDOVER.md.\n2. Install dependencies with npm install.\n3. Run npm run audit:client.\n4. Run npm run build before deployment.\n5. Configure hosting, domain, approved provider credentials and environment variables privately.\n\nThe local-only website editor is available at /studio only while running npm run dev. It is disabled in production.\n\nThis package excludes .env.local, node_modules, build output and Git history. Review sample content and provider status before client handover.\n`, "utf8");

if (process.platform === "win32") {
  const command = `$source = '${staging.replaceAll("'", "''")}'; $destination = '${zipPath.replaceAll("'", "''")}'; Compress-Archive -Path (Join-Path $source '*') -DestinationPath $destination -Force`;
  const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", command], { stdio: "inherit", windowsHide: true });
  if (result.status !== 0) throw new Error("PowerShell Compress-Archive failed. The handover folder was created, but ZIP packaging did not complete.");
} else {
  const result = spawnSync("zip", ["-qr", zipPath, "."], { cwd: staging, stdio: "inherit" });
  if (result.status !== 0) throw new Error("The zip command failed. The handover folder was created, but ZIP packaging did not complete.");
}
const stat = await fs.stat(zipPath);
console.log(JSON.stringify({ ok: true, slug, folder: staging, zip: zipPath, sizeBytes: stat.size, auditPassed: audit.passedChecks.length, warnings: audit.warnings.length }, null, 2));
