import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizeForgePayload } from "../src/lib/forge/project.mjs";
import { makeProductDetailSource } from "../src/lib/forge-copy.mjs";

const input = {
  template: "furniture",
  brand: { name: "North House", slug: "north-house", tagline: "Furniture for slower living", description: "A considered collection.", logoUrl: "/images/north-logo.svg", heroImageUrl: "/images/hero.jpg", galleryImages: "/images/room.jpg" },
  business: { address: "Addis Ababa", hours: "Mon-Sat 9-6", currency: "ETB", locale: "en-ET" },
  contact: { whatsapp: "+251911123456" },
  theme: { primary: "#58624F", secondary: "#E8E5DC", background: "#F5F3EE", surface: "#FFFEFA", text: "#202321", muted: "#77796F", accent: "#D9D5C8" },
  sections: ["header", "hero", "catalog", "about", "contact", "footer"],
  products: [{ name: "Mira Chair", price: 24000, category: "Seating", image: "/images/chair.jpg", dimensions: "80 x 70 cm", materials: "Oak and linen" }],
  integrations: {}
};

test("universal white-label config retains full brand, theme, content and starter identity", () => {
  const config = normalizeForgePayload(input);
  assert.equal(config.template, "furniture");
  assert.equal(config.brand.logoUrl, "/images/north-logo.svg");
  assert.equal(config.theme.primary, "#58624F");
  assert.equal(config.products[0].materials, "Oak and linen");
  assert.equal(config.engine, "FrontendForge Universal White-Label Engine");
});

test("generated product route is data-driven and branded per client", () => {
  const source = makeProductDetailSource();
  assert.match(source, /config\.products\.find/);
  assert.match(source, /config\.brand\.name/);
  assert.match(source, /readClientConfig/);
  assert.match(source, /force-dynamic/);
  assert.match(source, /ClientSimpleProductDetail/);
  assert.match(source, /config\.products\.find/);
});

test("all six starters are registered for white-label generation", () => {
  const models = fs.readFileSync(new URL("../src/lib/forge/project.mjs", import.meta.url), "utf8");
  for (const starter of ["ecommerce", "restaurant", "cafe", "foodDelivery", "grocery", "furniture"]) {
    assert.match(models, new RegExp(starter + ":"));
  }
});
