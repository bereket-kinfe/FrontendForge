import fs from "node:fs/promises";
import path from "node:path";

function statusFile(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid client project slug.");
  }
  return path.join(process.cwd(), ".frontendforge-status", `${slug}.json`);
}

export async function readProjectStatus(slug) {
  try {
    return JSON.parse(await fs.readFile(statusFile(slug), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

export async function writeProjectStatus(slug, status) {
  const file = statusFile(slug);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(status, null, 2)}\n`, "utf8");
}

export async function clearProjectStatus(slug) {
  const file = statusFile(slug);
  try {
    await fs.rm(file, { force: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
