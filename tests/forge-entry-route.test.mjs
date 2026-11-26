import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { STARTERS } from "../src/lib/forge/project.mjs";
import { starters } from "../src/lib/forge/studio-config.mjs";

const root = process.cwd();
const read = (file) => fs.readFile(path.join(root, file), "utf8");

test("the root route renders Forge Studio as the application home", async () => {
  const home = await read("src/app/page.js");
  assert.ok(home.includes("ForgeStudio"));
  assert.ok(home.includes("@/components/forge/ForgeStudio"));
  assert.ok(!home.includes("templates/cafe"));
});

test("the legacy /forge route redirects to the canonical root Studio", async () => {
  const legacyRoute = await read("src/app/forge/page.js");
  assert.ok(legacyRoute.includes('redirect("/")'));
});

test("the Studio starter cards use the generator's canonical ids, labels and routes", () => {
  assert.equal(starters.length, Object.keys(STARTERS).length);
  for (const starter of starters) {
    assert.ok(STARTERS[starter.id], `Unknown starter id: ${starter.id}`);
    assert.equal(starter.title, STARTERS[starter.id].label);
    assert.equal(starter.route, STARTERS[starter.id].route);
  }
});
