import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSectionContent, normalizeSectionStyles, getSectionStyleValues } from "../src/lib/forge/editor-config.mjs";

test("section content keeps only supported fields and caps text length", () => {
  const content = normalizeSectionContent({
    hero: { heading: "A tailored headline", body: "A".repeat(1200), unknown: "ignored" },
    notASection: { heading: "ignored" },
    about: "not an object",
    footer: { heading: "A little sunshine in every sip." }
  });
  assert.equal(content.hero.heading, "A tailored headline");
  assert.equal(content.hero.body.length, 900);
  assert.equal(content.hero.unknown, undefined);
  assert.equal(content.notASection, undefined);
  assert.equal(content.about, undefined);
  assert.equal(content.footer.heading, "A little sunshine in every sip.");
});

test("section style normalization allows only known layout values", () => {
  const styles = normalizeSectionStyles({
    hero: { spacing: "spacious", headingSize: "large", alignment: "center", width: "wide", background: "secondary", arbitrary: "bad" },
    contact: { background: "url(javascript:alert(1))", alignment: "sideways" },
    unknown: { spacing: "compact" }
  });
  assert.deepEqual(styles.hero, { spacing: "spacious", headingSize: "large", alignment: "center", width: "wide", background: "secondary" });
  assert.equal(styles.contact, undefined);
  assert.equal(styles.unknown, undefined);
});

test("section style defaults can be selectively overridden", () => {
  const style = getSectionStyleValues("hero", { hero: { spacing: "compact" } });
  assert.equal(style.spacing, "compact");
  assert.equal(style.headingSize, "large");
  assert.equal(style.width, "wide");
});
