import test from "node:test";
import assert from "node:assert/strict";
import { clearProjectStatus, readProjectStatus, writeProjectStatus } from "../src/lib/forge/project-status.mjs";

const testSlug = `status-store-test-${process.pid}`;

test("release status persists QA and production build metadata outside client folders", async () => {
  const status = {
    audit: { ok: true, checkedAt: "2026-11-21T00:00:00.000Z", issues: [] },
    build: { ok: true, builtAt: "2026-11-21T00:01:00.000Z" }
  };

  try {
    await writeProjectStatus(testSlug, status);
    assert.deepEqual(await readProjectStatus(testSlug), status);
  } finally {
    await clearProjectStatus(testSlug);
  }

  assert.deepEqual(await readProjectStatus(testSlug), {});
});

test("release status store rejects unsafe project slugs", async () => {
  await assert.rejects(() => readProjectStatus("../outside"), /Invalid client project slug/);
  await assert.rejects(() => writeProjectStatus("Bad Slug", {}), /Invalid client project slug/);
});
