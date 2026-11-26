import fs from "node:fs";
import path from "node:path";

export function readClientConfig() {
  const file = path.join(process.cwd(), "src", "config", "client-project.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
