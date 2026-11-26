import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "node_modules", "@playwright", "test", "cli.js");
try { await fs.access(cli); } catch {
  console.error("Playwright Test is not installed. Run `npm run install:e2e`, then rerun `npm run test:e2e`.");
  process.exit(2);
}
const result = spawnSync(process.execPath, [cli, "test", "--config", path.join(root, "playwright.master.config.mjs")], {
  cwd: root,
  stdio: "inherit",
  windowsHide: true,
  env: { ...process.env }
});
process.exit(result.status ?? 1);
