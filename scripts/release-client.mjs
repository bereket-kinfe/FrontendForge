import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2] || "";
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage: npm run release:client -- <client-slug>");
  process.exit(2);
}
const target = path.join(root, "client-projects", slug);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
function run(label, args, cwd) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npmCommand, args, { cwd, stdio: "inherit", windowsHide: true, shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`${label} failed. The release was stopped; no handover ZIP was created.`);
    process.exit(result.status || 1);
  }
}
run("Client pre-flight audit", ["run", "audit:client"], target);
run("Production build", ["run", "build"], target);
const pack = spawnSync(process.execPath, [path.join(root, "scripts", "package-client.mjs"), slug], { cwd: root, stdio: "inherit", windowsHide: true, env: { ...process.env, FRONTENDFORGE_BUILD_VERIFIED: "1" } });
if (pack.status !== 0) process.exit(pack.status || 1);
console.log(`\nRelease preparation completed for ${slug}. Review client-deliverables/${slug}-handover.zip before sending it to the client.`);
