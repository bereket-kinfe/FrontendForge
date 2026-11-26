import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientsRoot = path.join(root, "client-projects");
const entries = (await fs.readdir(clientsRoot, { withFileTypes: true })).filter((item) => item.isDirectory());
const releaseScript = path.join(root, "scripts", "release-client.mjs");
let failed = 0;
for (const entry of entries) {
  console.log(`\n\n######## RELEASE ${entry.name} ########`);
  const result = spawnSync(process.execPath, [releaseScript, entry.name], { cwd: root, stdio: "inherit", windowsHide: true });
  if (result.status !== 0) failed++;
}
console.log(`\nRelease preparation finished. Successes: ${entries.length - failed}; failures: ${failed}.`);
if (failed) process.exit(1);
