import test from "node:test";
import assert from "node:assert/strict";
import { applyClientProjectUpdates } from "../src/lib/forge/client-edit.mjs";

const base = {
  slug: "sample-client", template: "furniture", integrations: { ordering: { provider: "WhatsApp" } },
  products: [{ id: "chair", name: "Chair", price: 100 }],
  brand: { name: "Old Brand", tagline: "Old", description: "Old description" },
  contact: { phone: "123", email: "old@example.com", whatsapp: "123" },
  business: { address: "Old address", hours: "Old hours" },
  theme: { primary: "#111111", secondary: "#222222", background: "#333333", surface: "#444444", text: "#555555", muted: "#666666", accent: "#777777" }
};

test("dashboard client editor updates only allowed brand, contact, business and theme fields", () => {
  const next = applyClientProjectUpdates(base, { name: "New Brand", tagline: "New line", description: "New description", phone: "+251900000000", email: "hello@example.com", whatsapp: "+251900000000", address: "Bole, Addis Ababa", hours: "Daily 8-8", theme: { primary: "#ABCDEF" } });
  assert.equal(next.brand.name, "New Brand");
  assert.equal(next.contact.email, "hello@example.com");
  assert.equal(next.business.address, "Bole, Addis Ababa");
  assert.equal(next.theme.primary, "#ABCDEF");
  assert.equal(next.slug, base.slug);
  assert.equal(next.template, base.template);
  assert.deepEqual(next.integrations, base.integrations);
  assert.deepEqual(next.products, base.products);
  assert.ok(next.updatedAt);
});

test("dashboard client editor rejects invalid names and unsafe theme colors", () => {
  assert.throws(() => applyClientProjectUpdates(base, { name: "x" }), /at least two characters/);
  assert.throws(() => applyClientProjectUpdates(base, { name: "Valid", theme: { primary: "url(javascript:alert(1))" } }), /Invalid primary color/);
});
