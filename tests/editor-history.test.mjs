import test from "node:test";
import assert from "node:assert/strict";
import {
  cloneEditorSnapshot,
  pushEditorHistory,
  undoEditorHistory,
  redoEditorHistory
} from "../src/lib/forge/editor-history.mjs";

const snapshot = (name, sections = ["header", "hero", "catalog", "footer"]) => ({
  starter: "cafe",
  form: { name },
  colors: { primary: "#123456" },
  sections,
  orderedSections: sections,
  componentStyles: { hero: "split" },
  catalogText: "Item | Category | Description | 100"
});

test("editor snapshots are deep-cloned and do not mutate the source", () => {
  const source = snapshot("Original");
  const copy = cloneEditorSnapshot(source);
  copy.form.name = "Changed";
  copy.orderedSections.push("about");
  assert.equal(source.form.name, "Original");
  assert.equal(source.orderedSections.includes("about"), false);
});

test("pushEditorHistory adds a snapshot and clears the redo stack", () => {
  const past = [snapshot("Earlier")];
  const future = [snapshot("Future")];
  const next = pushEditorHistory(past, future, snapshot("Current"));
  assert.equal(next.past.length, 2);
  assert.equal(next.past[1].form.name, "Current");
  assert.deepEqual(next.future, []);
});

test("undo restores the previous snapshot and stores the current snapshot for redo", () => {
  const current = snapshot("Current");
  const result = undoEditorHistory([snapshot("Previous")], [], current);
  assert.equal(result.changed, true);
  assert.equal(result.current.form.name, "Previous");
  assert.equal(result.future[0].form.name, "Current");
  assert.equal(result.past.length, 0);
});

test("redo restores the next snapshot and adds the current snapshot to undo history", () => {
  const current = snapshot("Previous");
  const result = redoEditorHistory([], [snapshot("Current")], current);
  assert.equal(result.changed, true);
  assert.equal(result.current.form.name, "Current");
  assert.equal(result.past[0].form.name, "Previous");
  assert.equal(result.future.length, 0);
});

test("history remains bounded to fifty snapshots", () => {
  const past = Array.from({ length: 50 }, (_, index) => snapshot(`Project ${index}`));
  const next = pushEditorHistory(past, [], snapshot("Latest"));
  assert.equal(next.past.length, 50);
  assert.equal(next.past[0].form.name, "Project 1");
  assert.equal(next.past[49].form.name, "Latest");
});

test("undo and redo safely report an empty history", () => {
  const current = snapshot("Current");
  const undo = undoEditorHistory([], [], current);
  const redo = redoEditorHistory([], [], current);
  assert.equal(undo.changed, false);
  assert.equal(redo.changed, false);
  assert.equal(undo.current.form.name, "Current");
  assert.equal(redo.current.form.name, "Current");
});
