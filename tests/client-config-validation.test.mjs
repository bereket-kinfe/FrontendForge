import test from "node:test";
import assert from "node:assert/strict";
import { validateClientEditableConfig } from "../templates/client-runtime/src/lib/client-config-validation.mjs";

const base = {
  schemaVersion: 2,
  slug: "client-demo",
  brand: { name: "North House", tagline: "Live simply", description: "Furniture for good living", logoUrl: "/brand-logo.svg", heroImageUrl: "/images/hero.webp", galleryImages: [] },
  business: { address: "Bole, Addis Ababa", hours: "Mon-Sat 9-6", currency: "ETB", deliveryFee: 80, locale: "en-ET" },
  contact: { phone: "+251911123456", whatsapp: "+251911123456", email: "hello@north.example", website: "" },
  theme: { primary: "#58624F", secondary: "#E8E5DC", background: "#F5F3EE", surface: "#FFFEFA", text: "#202321", muted: "#77796F", accent: "#D9D5C8" },
  font: "Manrope + DM Sans",
  componentStyles: { header: "standard", hero: "split", catalog: "cards", buttons: "rounded" },
  products: [{ id: "mira-chair", name: "Mira Chair", category: "Seating", description: "An oak chair", price: 24900, image: "/images/chair.webp", alt: "Mira Chair", dimensions: "80 x 70 cm", materials: "Oak and linen", sizes: [{ id: "natural", label: "Natural oak", price: 0 }], addons: [], inStock: true }]
};

test("client editor accepts branding, palette, contact and catalog updates", () => {
  const incoming = structuredClone(base);
  incoming.brand.name = "North House Studio";
  incoming.theme.primary = "#324B3A";
  incoming.contact.email = "team@northhouse.example";
  incoming.products[0].price = 29900;
  const result = validateClientEditableConfig(base, incoming);
  assert.equal(result.ok, true);
  assert.equal(result.config.brand.name, "North House Studio");
  assert.equal(result.config.theme.primary, "#324B3A");
  assert.equal(result.config.products[0].price, 29900);
  assert.equal(result.config.slug, base.slug, "project slug must remain fixed by the editor");
});

test("client editor rejects unsafe asset URLs and invalid colors", () => {
  const incoming = structuredClone(base);
  incoming.brand.heroImageUrl = "javascript:alert(1)";
  incoming.theme.primary = "red";
  const result = validateClientEditableConfig(base, incoming);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.includes("Primary color")));
  assert.ok(result.errors.some((item) => item.includes("primary must be a six-digit hex color")));
});

test("client editor rejects duplicate product ids and invalid prices", () => {
  const incoming = structuredClone(base);
  incoming.products.push({ ...incoming.products[0], name: "Another chair", price: -1 });
  const result = validateClientEditableConfig(base, incoming);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.includes("duplicated")));
  assert.ok(result.errors.some((item) => item.includes("price must be a number")));
});

test("editor leaves integrations, order setting and project identity unchanged", () => {
  const current = { ...structuredClone(base), integrations: { payment: { provider: "Not selected", publicUrl: "" } }, orderEnabled: true, template: "furniture" };
  const incoming = structuredClone(current);
  incoming.slug = "another-client";
  incoming.orderEnabled = false;
  incoming.integrations.payment.provider = "Injected provider";
  const result = validateClientEditableConfig(current, incoming);
  assert.equal(result.ok, true);
  assert.equal(result.config.slug, "client-demo");
  assert.equal(result.config.orderEnabled, true);
  assert.equal(result.config.integrations.payment.provider, "Not selected");
});
