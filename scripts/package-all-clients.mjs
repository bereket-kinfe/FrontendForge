import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsRoot = path.join(root, "client-projects");
const entries = (await fs.readdir(projectsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));
if (!entries.length) {
  console.error("No client projects were found in client-projects/.");
  process.exit(2);
}

let failed = 0;
for (const entry of entries) {
  console.log(`\n=== Preparing handover: ${entry.name} ===`);
  const result = spawnSync(process.execPath, [path.join(root, "scripts", "package-client.mjs"), entry.name], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true
  });
  if (result.status !== 0) failed++;
}
console.log(`\nHandover packaging finished. Successful: ${entries.length - failed}; failed: ${failed}.`);
if (failed) process.exit(1);
