import test from "node:test";
import assert from "node:assert/strict";
import { normalizeForgePayload, parseCatalogText, slugify, makeIntegrationPlan } from "../src/lib/forge-project.mjs";

const validInput = {
  template: "cafe",
  brand: { name: "MACHI Coffee", slug: "machi-coffee", tagline: "A little sunshine", description: "Coffee and good company.", heroImageUrl: "/images/machi-hero-coffee.webp", galleryImages: "/images/machi-coffee-beans.webp" },
  business: { address: "Bole, Addis Ababa", hours: "Daily · 7 AM–10 PM", currency: "ETB", deliveryFee: 80 },
  contact: { phone: "+251911123456", whatsapp: "+251911123456", email: "hello@example.com" },
  theme: { primary: "#08AEEA", secondary: "#E5F6FC", background: "#F6F3EC", surface: "#FFFFFF", text: "#17191A", muted: "#77786F", accent: "#E7F1D2" },
  sections: ["header", "hero", "catalog", "about", "footer"],
  componentStyles: { header: "centered", hero: "photo-led", catalog: "list", buttons: "rounded" },
  sectionContent: { hero: { eyebrow: "Welcome to MACHI", heading: "Coffee for the everyday", body: "Small batch coffee and bakery." }, footer: { heading: "Made with care in Addis Ababa." }, unknown: { heading: "Discard me" } },
  sectionStyles: { hero: { spacing: "spacious", headingSize: "large", alignment: "center", width: "wide", background: "secondary", unsafe: "ignored" } },
  catalogText: "Iced Latte | Drinks | Espresso and milk over ice. | 180 | Regular:0,Large:45 | Extra shot:35,Oat milk:30 | /images/latte.webp",
  integrations: { ordering: { provider: "FrontendForge WhatsApp ordering", notes: "Use approved business WhatsApp" }, payment: { provider: "Cash / pay at pickup" } }
};

test("furniture starter is available to the client project builder", () => {
  const furnitureInput = { ...validInput, template: "furniture", catalogText: "Mira Lounge Chair | Seating | Upholstered lounge chair. | 24900 | Standard:0 |" };
  const config = normalizeForgePayload(furnitureInput);
  assert.equal(config.templateLabel, "Furniture & home store");
  assert.equal(config.businessType, "shop");
  assert.equal(config.products[0].name, "Mira Lounge Chair");
});

test("slugify creates a safe folder name", () => {
  assert.equal(slugify("  Café & Kitchen / Bole  "), "cafe-kitchen-bole");
});

test("catalog parser handles size, add-ons and local image paths", () => {
  const [product] = parseCatalogText(validInput.catalogText);
  assert.equal(product.name, "Iced Latte");
  assert.equal(product.price, 180);
  assert.equal(product.sizes[1].price, 45);
  assert.equal(product.addons[0].label, "Extra shot");
  assert.equal(product.image, "/images/latte.webp");
});

test("normalizer preserves selected starter, theme and component styles", () => {
  const config = normalizeForgePayload(validInput);
  assert.equal(config.template, "cafe");
  assert.equal(config.brand.name, "MACHI Coffee");
  assert.equal(config.theme.primary, "#08AEEA");
  assert.equal(config.componentStyles.hero, "photo-led");
  assert.equal(config.sections.includes("header"), true);
  assert.equal(config.sections.includes("footer"), true);
  assert.equal(config.sectionContent.hero.heading, "Coffee for the everyday");
  assert.equal(config.sectionContent.unknown, undefined);
  assert.equal(config.sectionContent.footer.heading, "Made with care in Addis Ababa.");
  assert.deepEqual(config.sectionStyles.hero, { spacing: "spacious", headingSize: "large", alignment: "center", width: "wide", background: "secondary" });
});

test("selected ordering integration enables generated order route", () => {
  const config = normalizeForgePayload(validInput);
  assert.equal(config.orderEnabled, true);
});

test("ordering route remains disabled when no ordering provider is selected", () => {
  const input = structuredClone(validInput);
  input.integrations.ordering.provider = "Not selected";
  const config = normalizeForgePayload(input);
  assert.equal(config.orderEnabled, false);
});

test("invalid starter is rejected", () => {
  const input = { ...validInput, template: "unknown-template" };
  assert.throws(() => normalizeForgePayload(input), /available website starters/);
});

test("catalog is required when catalog section is selected", () => {
  const input = { ...validInput, catalogText: "" };
  assert.throws(() => normalizeForgePayload(input), /at least one product or menu item/);
});

test("bad colors are rejected before copying", () => {
  const input = structuredClone(validInput);
  input.theme.primary = "javascript:alert(1)";
  assert.throws(() => normalizeForgePayload(input), /valid primary color/);
});

test("integration plan clearly distinguishes planned from connected", () => {
  const config = normalizeForgePayload(validInput);
  const plan = makeIntegrationPlan(config);
  assert.match(plan, /Planned — credentials\/setup required/);
  assert.match(plan, /not live connections/);
});

test("pickup-only selection disables delivery in the order experience", () => {
  const input = structuredClone(validInput);
  input.integrations.delivery = { provider: "Pickup only" };
  const config = normalizeForgePayload(input);
  assert.deepEqual(config.business.fulfillment, ["pickup"]);
});

test("a different ordering platform is recorded but does not fake the WhatsApp engine", () => {
  const input = structuredClone(validInput);
  input.integrations.ordering.provider = "Existing ordering API";
  const config = normalizeForgePayload(input);
  assert.equal(config.orderEnabled, false);
  assert.equal(config.integrations.ordering.provider, "Existing ordering API");
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClientProjectCopy, makeRootPageSource, makeOrderIndexSource, makeOrderDetailSource } from "../src/lib/forge-copy.mjs";

test("client copier creates a separate project, applies the homepage and excludes private/build files", async () => {
  const master = await fs.mkdtemp(path.join(os.tmpdir(), "forge-master-"));
  try {
    await fs.mkdir(path.join(master, "src", "app"), { recursive: true });
    await fs.mkdir(path.join(master, "node_modules", "example"), { recursive: true });
    await fs.mkdir(path.join(master, ".git"), { recursive: true });
    await fs.mkdir(path.join(master, "client-projects", "old-client"), { recursive: true });
    await fs.writeFile(path.join(master, "package.json"), JSON.stringify({ name: "frontendforge", version: "2.4.0" }));
    await fs.writeFile(path.join(master, ".env.local"), "PRIVATE=do-not-copy");
    await fs.writeFile(path.join(master, ".env.example"), "PUBLIC_PLACEHOLDER=");
    await fs.writeFile(path.join(master, "node_modules", "example", "module.js"), "module.exports = true");
    await fs.writeFile(path.join(master, ".git", "config"), "private git metadata");
    await fs.writeFile(path.join(master, "client-projects", "old-client", "keep-out.txt"), "do not nest old projects");
    await fs.writeFile(path.join(master, "src", "app", "page.js"), "export default function OldHome() { return null; }");
    await fs.mkdir(path.join(master, "docs", "operations"), { recursive: true });
    await fs.writeFile(path.join(master, "docs", "operations", "DATABASE-SETUP.md"), "Client database setup guide");
    await fs.mkdir(path.join(master, "supabase", "migrations"), { recursive: true });
    await fs.writeFile(path.join(master, "supabase", "migrations", "0001_store_platform.sql"), "create table stores");
    await fs.writeFile(path.join(master, "supabase", "migrations", "0002_order_permissions.sql"), "create function update_store_order_status");

    const config = normalizeForgePayload(validInput);
    const createdPath = await createClientProjectCopy(master, config);
    assert.equal(createdPath, path.join(master, "client-projects", "machi-coffee"));
    assert.equal(JSON.parse(await fs.readFile(path.join(createdPath, "src", "config", "client-project.json"), "utf8")).brand.name, "MACHI Coffee");
    assert.match(await fs.readFile(path.join(createdPath, "src", "app", "page.js"), "utf8"), /ClientProjectHome/);
    assert.match(await fs.readFile(path.join(createdPath, "src", "app", "page.js"), "utf8"), /readClientConfig/);
    assert.ok(await fs.stat(path.join(createdPath, "src", "app", "studio", "page.js")));
    assert.ok(await fs.stat(path.join(createdPath, "src", "app", "api", "client-config", "route.js")));
    assert.ok(await fs.stat(path.join(createdPath, "src", "components", "client", "ClientConfigEditor.js")));
    assert.ok(await fs.stat(path.join(createdPath, "playwright.config.mjs")));
    assert.match(await fs.readFile(path.join(createdPath, "src", "app", "order", "[slug]", "page.js"), "utf8"), /FoodBusinessExperience/);
    const clientPackage = JSON.parse(await fs.readFile(path.join(createdPath, "package.json"), "utf8"));
    assert.equal(clientPackage.name, "client-machi-coffee");
    assert.deepEqual(Object.keys(clientPackage.scripts).sort(), ["audit:client", "build", "dev", "install:e2e", "start", "test:e2e"]);
    assert.match(await fs.readFile(path.join(createdPath, "README.md"), "utf8"), /MACHI Coffee/);
    assert.equal(await fs.readFile(path.join(createdPath, ".env.example"), "utf8"), "PUBLIC_PLACEHOLDER=");
    await assert.rejects(fs.access(path.join(createdPath, ".env.local")));
    await assert.rejects(fs.access(path.join(createdPath, "node_modules")));
    await assert.rejects(fs.access(path.join(createdPath, ".git")));
    await assert.rejects(fs.access(path.join(createdPath, "client-projects")));
    assert.match(await fs.readFile(path.join(createdPath, "docs", "INTEGRATION-PLAN.md"), "utf8"), /Planned/);
    assert.equal(await fs.readFile(path.join(createdPath, "docs", "DATABASE-SETUP.md"), "utf8"), "Client database setup guide");
    assert.ok(await fs.stat(path.join(createdPath, "supabase", "migrations", "0001_store_platform.sql")));
    assert.ok(await fs.stat(path.join(createdPath, "supabase", "migrations", "0002_order_permissions.sql")));
    const clientEnv = await fs.readFile(path.join(createdPath, ".env.client.example"), "utf8");
    assert.match(clientEnv, /SUPABASE_URL=/);
    assert.match(clientEnv, /SUPABASE_ANON_KEY=/);
    assert.match(clientEnv, /SUPABASE_SERVICE_ROLE_KEY=/);
    assert.doesNotMatch(clientEnv, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=/);
  } finally {
    await fs.rm(master, { recursive: true, force: true });
  }
});

test("client copier refuses to overwrite an existing client folder", async () => {
  const master = await fs.mkdtemp(path.join(os.tmpdir(), "forge-existing-"));
  try {
    const target = path.join(master, "client-projects", "machi-coffee");
    await fs.mkdir(target, { recursive: true });
    await fs.writeFile(path.join(target, "important.txt"), "existing client work");
    await assert.rejects(createClientProjectCopy(master, normalizeForgePayload(validInput)), { code: "CLIENT_PROJECT_EXISTS" });
    assert.equal(await fs.readFile(path.join(target, "important.txt"), "utf8"), "existing client work");
  } finally {
    await fs.rm(master, { recursive: true, force: true });
  }
});

test("approved hosted booking and ordering URLs are preserved safely", () => {
  const input = structuredClone(validInput);
  input.integrations.ordering = { provider: "Third-party ordering platform", publicUrl: "https://orders.example.com/shop" };
  input.integrations.booking = { provider: "Calendly", publicUrl: "https://cal.example.com/brand" };
  const config = normalizeForgePayload(input);
  assert.equal(config.integrations.ordering.publicUrl, "https://orders.example.com/shop");
  assert.equal(config.integrations.booking.publicUrl, "https://cal.example.com/brand");
  assert.equal(config.orderEnabled, false);
  assert.ok(makeOrderIndexSource(config).includes("https://orders.example.com/shop"));
});

test("generated client route sources include the configured client and ordering engine", () => {
  const rootPage = makeRootPageSource();
  const orderPage = makeOrderDetailSource();
  assert.match(rootPage, /ClientProjectHome/);
  assert.match(rootPage, /config\.brand\.name/);
  assert.match(orderPage, /FoodBusinessExperience/);
  assert.match(orderPage, /config\.products/);
});

test("WhatsApp ordering requires a usable business contact", () => {
  const input = structuredClone(validInput);
  input.contact = { phone: "", whatsapp: "", email: "" };
  assert.throws(() => normalizeForgePayload(input), /WhatsApp or phone number/);
});


test("public hosted URLs are kept separate from private API endpoints", () => {
  const input = structuredClone(validInput);
  input.integrations.payment = { provider: "Hosted payment page", publicUrl: "https://pay.example.com/machi" };
  input.integrations.delivery = { provider: "Delivery partner", publicUrl: "https://delivery.example.com/track" };
  input.integrations.inventory = { provider: "Inventory API", publicUrl: "//internal.example.com/api" };
  const config = normalizeForgePayload(input);
  assert.equal(config.integrations.payment.publicUrl, "https://pay.example.com/machi");
  assert.equal(config.integrations.delivery.publicUrl, "https://delivery.example.com/track");
  assert.equal(config.integrations.inventory.publicUrl, "");
});


test("generated client homepage surfaces approved public tool links with clear labels", async () => {
  const fs = await import("node:fs/promises");
  const source = await fs.readFile(new URL("../src/components/client/ClientProjectHome.js", import.meta.url), "utf8");
  assert.match(source, /Payment portal/);
  assert.match(source, /Delivery partner/);
  assert.match(source, /Bookings/);
  assert.match(source, /Support/);
  assert.match(source, /target="_blank" rel="noreferrer"/);
});


test("public links reject protocol-relative URLs and embedded credentials", () => {
  const input = structuredClone(validInput);
  input.integrations.booking = { provider: "Custom booking page", publicUrl: "//example.com/booking" };
  input.integrations.payment = { provider: "Hosted payment page", publicUrl: "https://user:secret@pay.example.com/checkout" };
  const config = normalizeForgePayload(input);
  assert.equal(config.integrations.booking.publicUrl, "");
  assert.equal(config.integrations.payment.publicUrl, "");
});
