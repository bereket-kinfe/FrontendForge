import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (file) => fs.readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("Page Composer supports reusable sections and drag-and-drop reordering", async () => {
  const composer = await read("src/components/forge/builder/PageComposer.js");
  assert.ok(composer.includes("draggable"));
  assert.ok(composer.includes("onDragStart"));
  assert.ok(composer.includes("onDragOver"));
  assert.ok(composer.includes("onDrop"));
  assert.ok(composer.includes("reorderSections(fromIndex, toIndex)"));
  assert.ok(composer.includes("Reusable section library"));
  assert.ok(composer.includes("aria-label={`Move ${section.title} up`}"));
  assert.ok(composer.includes("PINNED_SECTIONS"));
});

test("Website canvas preview provides desktop, tablet and mobile modes", async () => {
  const preview = await read("src/components/forge/builder/WebsiteCanvasPreview.js");
  assert.ok(preview.includes('id: "desktop"'));
  assert.ok(preview.includes('id: "tablet"'));
  assert.ok(preview.includes('id: "mobile"'));
  assert.ok(preview.includes("aria-pressed={viewport === item.id}"));
  assert.ok(preview.includes("orderedSections"));
  assert.ok(preview.includes("catalogText"));
  assert.ok(preview.includes("componentStyles"));
  assert.ok(preview.includes("Double-click text to edit it"));
  assert.ok(preview.includes("contentEditable={editing}"));
  assert.ok(preview.includes("InlineImageEditor"));
  assert.ok(preview.includes("backgroundImage: showGrid"));
});

test("Builder connects the page composer, live canvas and undo/redo controls", async () => {
  const builder = await read("src/components/forge/builder/BuilderWorkspace.js");
  const studio = await read("src/components/forge/ForgeStudio.js");
  assert.ok(builder.includes("<PageComposer"));
  assert.ok(builder.includes("<WebsiteCanvasPreview"));
  assert.ok(builder.includes("<SectionInspector"));
  assert.ok(builder.includes("<DesignVersionsPanel"));
  assert.ok(builder.includes("<ActualClientPreview"));
  assert.ok(builder.includes("onClick={undo}"));
  assert.ok(builder.includes("onClick={redo}"));
  assert.ok(studio.includes("reorderSections={reorderSections}"));
  assert.ok(studio.includes("canUndo={canUndo}"));
  assert.ok(studio.includes('key === "z"'));
  assert.ok(studio.includes("event.shiftKey"));
});

test("Builder hook tracks editable configuration with capped undo and redo history", async () => {
  const hook = await read("src/hooks/forge/useForgeBuilder.js");
  const history = await read("src/lib/forge/editor-history.mjs");
  for (const action of ["recordHistory", "applySnapshot", "undo", "redo", "reorderSections"]) {
    assert.ok(hook.includes(action), `Expected builder hook to include ${action}`);
  }
  assert.ok(hook.includes("canUndo:"));
  assert.ok(hook.includes("canRedo:"));
  assert.ok(history.includes("slice(-limit)"));
});


test("section inspector exposes content, image, typography, spacing and layout controls", async () => {
  const inspector = await read("src/components/forge/builder/SectionInspector.js");
  for (const item of ["Heading", "Main text", "Hero image URL", "Section spacing", "Heading size", "Text alignment", "Content width", "Background"]) {
    assert.ok(inspector.includes(item), `Expected inspector control ${item}`);
  }
});

test("saved design versions persist named snapshots in browser storage", async () => {
  const hook = await read("src/hooks/forge/useDesignVersions.js");
  const panel = await read("src/components/forge/builder/DesignVersionsPanel.js");
  assert.ok(hook.includes("window.localStorage.setItem"));
  assert.ok(hook.includes("structuredClone(snapshot)"));
  assert.ok(hook.includes("MAX_DESIGN_VERSIONS"));
  assert.ok(panel.includes("Restore"));
  assert.ok(panel.includes("Delete"));
});

test("actual client preview route renders the same ClientProjectHome used by generated sites", async () => {
  const route = await read("src/app/forge/preview/[slug]/page.js");
  const renderer = await read("src/components/client/ClientProjectHome.js");
  const frame = await read("src/components/forge/builder/ActualClientPreview.js");
  assert.ok(route.includes("ClientProjectHome"));
  assert.ok(route.includes("client-project.json"));
  assert.ok(route.includes("isLocalForgeRequest"));
  assert.ok(renderer.includes("sectionAttributes"));
  assert.ok(renderer.includes('content("hero", "heading"'));
  assert.ok(renderer.includes('content("footer", "heading"'));
  assert.ok(renderer.includes('content("about", "secondaryBody"'));
  assert.ok(renderer.includes('"data-forge-heading-size"'));
  assert.ok(frame.includes("/forge/preview/"));
  assert.ok(frame.includes("Preview viewport"));
  assert.ok(frame.includes('"desktop"'));
  assert.ok(frame.includes('"tablet"'));
  assert.ok(frame.includes('"mobile"'));
  assert.ok(frame.includes("Expand preview"));
});


test("generated client homepage has an accessible mobile navigation and niche art direction layer", async () => {
  const homepage = await read("src/components/client/ClientProjectHome.js");
  const styles = await read("src/components/client/ClientProjectHomeArtDirection.css");
  assert.ok(homepage.includes("client-project-desktop-nav"));
  assert.ok(homepage.includes("client-project-mobile-menu"));
  assert.ok(styles.includes(".client-project-cafe"));
  assert.ok(styles.includes(".client-project-restaurant"));
  assert.ok(styles.includes(".client-project-furniture"));
  assert.ok(styles.includes(".client-project-ecommerce"));
  assert.ok(styles.includes(".client-project-grocery"));
  assert.ok(styles.includes(".client-project-foodDelivery"));
});
