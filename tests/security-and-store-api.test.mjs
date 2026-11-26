import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedRequestOrigin } from "../src/lib/server/origin.mjs";
import { isLocalForgeRequest } from "../src/lib/forge/local-only.mjs";
import { normalizePublicOrderPayload } from "../src/lib/server/order-validation.mjs";

const originalNodeEnv = process.env.NODE_ENV;

function request(url, { host, origin } = {}) {
  const headers = new Headers();
  if (host) headers.set("host", host);
  if (origin) headers.set("origin", origin);
  return { url, headers };
}

test("local Forge filesystem routes allow loopback hosts only in development", () => {
  process.env.NODE_ENV = "development";
  assert.equal(isLocalForgeRequest(request("http://localhost:3000", { host: "localhost:3000", origin: "http://localhost:3000" })), true);
  assert.equal(isLocalForgeRequest(request("http://127.0.0.1:3000", { host: "127.0.0.1:3000" })), true);
  assert.equal(isLocalForgeRequest(request("https://example.com", { host: "example.com" })), false);
  assert.equal(isLocalForgeRequest(request("http://localhost:3000", { host: "localhost:3000", origin: "https://evil.example" })), false);
  process.env.NODE_ENV = "production";
  assert.equal(isLocalForgeRequest(request("http://localhost:3000", { host: "localhost:3000" })), false);
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalNodeEnv;
});

test("admin/storefront mutations require an approved same origin", () => {
  const previous = process.env.PUBLIC_SITE_ORIGINS;
  delete process.env.PUBLIC_SITE_ORIGINS;
  assert.equal(isAllowedRequestOrigin(request("https://shop.example/api/orders", { origin: "https://shop.example" })), true);
  assert.equal(isAllowedRequestOrigin(request("https://shop.example/api/orders", { origin: "https://evil.example" })), false);
  assert.equal(isAllowedRequestOrigin(request("https://shop.example/api/orders")), false);
  process.env.PUBLIC_SITE_ORIGINS = "https://www.shop.example,https://admin.shop.example";
  assert.equal(isAllowedRequestOrigin(request("https://shop.example/api/orders", { origin: "https://admin.shop.example" })), true);
  if (previous === undefined) delete process.env.PUBLIC_SITE_ORIGINS; else process.env.PUBLIC_SITE_ORIGINS = previous;
});

test("public order payload normalizes valid details and ignores browser totals", () => {
  const result = normalizePublicOrderPayload({
    customer: { name: "  Demo Customer ", phone: "+251 911 000 000", email: "demo@example.com", fulfillment: "pickup" },
    items: [{ product_id: "123e4567-e89b-42d3-a456-426614174000", quantity: 2, options: { material: "Oak" }, price: 0.01 }],
    total: 0.01
  });
  assert.equal(result.ok, true);
  assert.equal(result.customer.name, "Demo Customer");
  assert.deepEqual(result.items, [{ product_id: "123e4567-e89b-42d3-a456-426614174000", quantity: 2, options: { material: "Oak" } }]);
  assert.equal("total" in result, false);
});

test("public order validation rejects missing customer, unsafe email and invalid quantities", () => {
  const validId = "123e4567-e89b-42d3-a456-426614174000";
  assert.equal(normalizePublicOrderPayload({ customer: {}, items: [{ product_id: validId, quantity: 1 }] }).ok, false);
  assert.equal(normalizePublicOrderPayload({ customer: { name: "Test Person", phone: "12345", email: "not-email" }, items: [{ product_id: validId, quantity: 1 }] }).error, "Enter a valid email address.");
  assert.equal(normalizePublicOrderPayload({ customer: { name: "Test Person", phone: "12345" }, items: [{ product_id: validId, quantity: 100 }] }).ok, false);
  assert.equal(normalizePublicOrderPayload({ customer: { name: "Test Person", phone: "12345" }, items: [{ product_id: "not-a-uuid", quantity: 1 }] }).ok, false);
});

test("delivery checkout requires an address and caps order length", () => {
  const validId = "123e4567-e89b-42d3-a456-426614174000";
  const base = { customer: { name: "Demo Customer", phone: "12345", fulfillment: "delivery" }, items: [{ product_id: validId, quantity: 1 }] };
  assert.equal(normalizePublicOrderPayload(base).error, "A delivery address is required.");
  assert.equal(normalizePublicOrderPayload({ customer: { name: "Demo Customer", phone: "12345" }, items: Array.from({ length: 41 }, () => ({ product_id: validId, quantity: 1 })) }).ok, false);
});

test("product asset URLs allow local paths and safe HTTP URLs only", async () => {
  const { normalizeSafeAssetUrl, normalizeSafeAssetList } = await import("../src/lib/server/safe-assets.mjs");
  assert.equal(normalizeSafeAssetUrl("/images/chair.webp"), "/images/chair.webp");
  assert.match(normalizeSafeAssetUrl("https://cdn.example.com/chair.webp"), /^https:\/\//);
  assert.equal(normalizeSafeAssetUrl("//evil.example/chair.webp"), "");
  assert.equal(normalizeSafeAssetUrl("javascript:alert(1)"), "");
  assert.equal(normalizeSafeAssetUrl("https://user:pass@example.com/image.png"), "");
  assert.deepEqual(normalizeSafeAssetList(["/a.webp", "https://cdn.example.com/b.webp"]), ["/a.webp", "https://cdn.example.com/b.webp"]);
  assert.equal(normalizeSafeAssetList(["/a.webp", "javascript:alert(1)"]), null);
});

test("database migrations expose public catalog but protect orders and define stock-aware workflows", async () => {
  const fs = await import("node:fs/promises");
  const migration1 = await fs.readFile(new URL("../supabase/migrations/0001_store_platform.sql", import.meta.url), "utf8");
  const migration2 = await fs.readFile(new URL("../supabase/migrations/0002_order_permissions.sql", import.meta.url), "utf8");
  assert.match(migration1, /create or replace function public\.create_store_order/);
  assert.match(migration1, /v_product\.price \* v_qty/);
  assert.match(migration1, /v_product\.stock < v_qty/);
  assert.match(migration1, /enable row level security/);
  assert.match(migration2, /revoke insert, update, delete on public\.orders from anon, authenticated/i);
  assert.match(migration2, /create or replace function public\.update_store_order_status/);
  assert.match(migration2, /grant execute on function public\.update_store_order_status\(uuid,text\) to authenticated/i);
});
