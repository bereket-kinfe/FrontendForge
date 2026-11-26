import test from "node:test";
import assert from "node:assert/strict";
import {
  STARTER_REGISTRY,
  COMPONENT_DEFINITIONS,
  validateCatalogItem,
  validateBrandConfig,
  validateIntegrationConfig
} from "../src/schemas/models.mjs";
import {
  WhatsAppAdapter,
  BookingAdapter,
  PaymentAdapter,
  MapsAdapter
} from "../src/lib/adapters/index.mjs";
import { runClientAudit } from "../scripts/audit-client.mjs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClientProjectCopy } from "../src/lib/forge-copy.mjs";
import { normalizeForgePayload } from "../src/lib/forge-project.mjs";

test("schemas registry contains all master starters with required metadata", () => {
  const starters = Object.keys(STARTER_REGISTRY);
  assert.ok(starters.includes("furniture"));
  assert.ok(starters.includes("ecommerce"));
  assert.ok(starters.includes("restaurant"));
  assert.ok(starters.includes("cafe"));
  assert.ok(starters.includes("foodDelivery"));
  assert.ok(starters.includes("grocery"));

  for (const s of Object.values(STARTER_REGISTRY)) {
    assert.ok(s.id);
    assert.ok(s.name);
    assert.ok(s.version);
    assert.ok(Array.isArray(s.supportedSections));
    assert.ok(Array.isArray(s.defaultSections));
  }
});

test("schemas component definitions catalog has accessibility notes and categories", () => {
  assert.ok(COMPONENT_DEFINITIONS.length >= 7);
  for (const comp of COMPONENT_DEFINITIONS) {
    assert.ok(comp.id);
    assert.ok(comp.name);
    assert.ok(comp.category);
    assert.ok(comp.accessibilityNotes);
  }
});

test("validateCatalogItem enforces non-negative numeric price and valid attributes", () => {
  const valid = validateCatalogItem({ name: "Lounge Chair", price: 24000, category: "Seating", dimensions: "85x85x75cm", materials: "Solid Oak" });
  assert.equal(valid.name, "Lounge Chair");
  assert.equal(valid.price, 24000);
  assert.equal(valid.materials, "Solid Oak");
  assert.equal(valid.inStock, true);

  assert.throws(() => validateCatalogItem({ name: "", price: 100 }), /valid name/);
  assert.throws(() => validateCatalogItem({ name: "Chair", price: -50 }), /non-negative price/);
});

test("validateBrandConfig requires at least 2 characters for brand name", () => {
  const brand = validateBrandConfig({ name: "Studio North", tagline: "Calm interiors" });
  assert.equal(brand.name, "Studio North");
  assert.equal(brand.tagline, "Calm interiors");
  assert.throws(() => validateBrandConfig({ name: "A" }), /at least 2 characters/);
});

test("validateIntegrationConfig normalizes all supported capability slots", () => {
  const res = validateIntegrationConfig({
    booking: { provider: "Calendly", publicUrl: "https://calendly.com/brand" },
    payment: { provider: "Telebirr", mode: "live" }
  });
  assert.equal(res.booking.provider, "Calendly");
  assert.equal(res.booking.status, "planned");
  assert.equal(res.payment.mode, "live");
  assert.equal(res.ordering.status, "unconfigured");
});

test("WhatsAppAdapter builds compliant WhatsApp enquiry and order messages", () => {
  const enquiry = WhatsAppAdapter.buildEnquiryMessage({
    brandName: "Beetle Pro",
    items: [{ name: "Mira Chair", price: 24900, quantity: 1 }],
    total: 24900,
    currency: "ETB"
  });
  assert.match(enquiry, /Hello Beetle Pro/);
  assert.match(enquiry, /Mira Chair/);
  assert.match(enquiry, /ETB 24,900/);

  const orderMsg = WhatsAppAdapter.buildOrderMessage({
    businessName: "MACHI",
    cart: [{ name: "Latte", unitPrice: 180, quantity: 2, sizeLabel: "Large" }],
    subtotal: 360,
    deliveryFee: 80,
    total: 440,
    currency: "ETB",
    fulfillment: "delivery",
    customer: { name: "Abebe", address: "Bole Medhanialem" }
  });
  assert.match(orderMsg, /Latte/);
  assert.match(orderMsg, /Bole Medhanialem/);
  assert.match(orderMsg, /ETB 440/);

  const url = WhatsAppAdapter.buildUrl("+251 911 123 456", "Hello");
  assert.equal(url, "https://wa.me/251911123456?text=Hello");
});

test("PaymentAdapter resolves regional and card gateway options", () => {
  const telebirr = PaymentAdapter.resolveAction({ provider: "Telebirr (merchant API required)", currency: "ETB" });
  assert.equal(telebirr.provider, "Telebirr");
  assert.equal(telebirr.isSandbox, true);

  const chapa = PaymentAdapter.resolveAction({ provider: "Chapa", publicUrl: "https://checkout.chapa.co/pay" });
  assert.equal(chapa.provider, "Chapa");
  assert.equal(chapa.checkoutUrl, "https://checkout.chapa.co/pay");
  assert.equal(chapa.isSandbox, false);
});

test("BookingAdapter resolves actions for online schedulers and contact channels", () => {
  const calendly = BookingAdapter.resolveAction({ provider: "Calendly", publicUrl: "https://calendly.com/client" });
  assert.equal(calendly.type, "external_link");
  assert.equal(calendly.isConfigured, true);

  const waBooking = BookingAdapter.resolveAction({ provider: "WhatsApp / phone booking", phone: "+251911123456" });
  assert.equal(waBooking.type, "whatsapp");
  assert.ok(waBooking.url.includes("wa.me"));
});

test("MapsAdapter creates directions and embed URLs from address", () => {
  const url = MapsAdapter.getDirectionsUrl("Bole, Addis Ababa");
  assert.match(url, /google\.com\/maps\/search/);
  assert.match(url, /Addis%20Ababa/);
});

test("client copier excludes internal Studio routes (forge, docs, components) from client copy", async () => {
  const master = await fs.mkdtemp(path.join(os.tmpdir(), "forge-clean-scaffold-"));
  try {
    await fs.mkdir(path.join(master, "src", "app", "forge"), { recursive: true });
    await fs.mkdir(path.join(master, "src", "app", "docs"), { recursive: true });
    await fs.mkdir(path.join(master, "src", "app", "components"), { recursive: true });
    await fs.mkdir(path.join(master, "src", "app", "api", "forge"), { recursive: true });
    await fs.writeFile(path.join(master, "package.json"), JSON.stringify({ name: "frontendforge", version: "2.6.0" }));
    await fs.writeFile(path.join(master, "src", "app", "page.js"), "export default function Master() {}");
    await fs.writeFile(path.join(master, "src", "app", "layout.js"), "export default function Layout({ children }) { return children; }");

    // A release-ready client source must include the admin API, database foundation and furniture runtime.
    const requiredSourceFiles = [
      "src/app/admin/page.js",
      "src/app/api/admin/auth/login/route.js",
      "src/app/api/admin/auth/logout/route.js",
      "src/app/api/admin/orders/route.js",
      "src/app/api/admin/products/route.js",
      "src/app/api/admin/store/route.js",
      "src/app/api/storefront/[slug]/products/route.js",
      "src/app/api/storefront/[slug]/orders/route.js",
      "src/lib/server/supabase.mjs",
      "src/lib/server/order-validation.mjs",
      "src/components/furniture/FurnitureProductDetail.js",
      "src/components/furniture/FurnitureCheckout.js",
      "src/components/client/ClientMultiPage.js",
      "src/components/client/ClientMultiPage.css",
      "src/components/client/ClientLeadForm.js",
      "src/components/client/ClientCommerceCheckout.js",
      "src/components/commerce/ClientSimpleProductDetail.js",
      "src/components/food/ClientFoodProductDetail.js",
      "src/lib/forge/niche-pages.mjs",
      "src/components/furniture/furniture.css",
      "src/lib/furniture-store.mjs",
      "docs/operations/DATABASE-SETUP.md",
      "supabase/migrations/0001_store_platform.sql",
      "supabase/migrations/0002_order_permissions.sql"
    ];
    for (const relative of requiredSourceFiles) {
      const file = path.join(master, relative);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, "// fixture");
    }

    const payload = {
      template: "furniture",
      brand: { name: "Nordic Living", slug: "nordic-living" },
      contact: { phone: "+251911123456" },
      business: { address: "Addis Ababa" },
      theme: { primary: "#58624F", secondary: "#E8E5DC", background: "#F5F3EE", surface: "#FFFEFA", text: "#202321", muted: "#77796F", accent: "#D9D5C8" },
      catalogText: "Lounge Chair | Seating | Upholstered. | 25000 | Standard:0 |"
    };

    const config = normalizeForgePayload(payload);
    const target = await createClientProjectCopy(master, config);

    // Verify internal routes are removed
    await assert.rejects(fs.access(path.join(target, "src", "app", "forge")));
    await assert.rejects(fs.access(path.join(target, "src", "app", "docs")));
    await assert.rejects(fs.access(path.join(target, "src", "app", "components")));
    await assert.rejects(fs.access(path.join(target, "src", "app", "api", "forge")));

    // Verify client setup and handover docs exist
    assert.ok(await fs.readFile(path.join(target, "docs", "CLIENT-HANDOVER.md"), "utf8"));
    assert.ok(await fs.readFile(path.join(target, "docs", "CLIENT-SETUP.md"), "utf8"));
    assert.ok(await fs.readFile(path.join(target, "scripts", "audit-client.mjs"), "utf8"));

    // Verify audit runs cleanly
    const auditReport = runClientAudit(target);
    assert.equal(auditReport.ok, true);
    assert.equal(auditReport.clientSlug, "nordic-living");
  } finally {
    await fs.rm(master, { recursive: true, force: true });
  }
});
