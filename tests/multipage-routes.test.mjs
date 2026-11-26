import test from "node:test";
import assert from "node:assert/strict";
import { getNichePages, getNicheNavigation } from "../src/lib/forge/niche-pages.mjs";
import { normalizeForgePayload } from "../src/lib/forge/project.mjs";
import { makeNichePageRouteSource, makeCollectionIndexRouteSource, makeCollectionDetailRouteSource, makeCommerceCartRouteSource, makeProductDetailSource, makeOrderDetailSource } from "../src/lib/forge/copy.mjs";

const expected = {
  cafe: ["menu", "about", "visit", "reservations", "contact"],
  restaurant: ["menu", "about", "reservations", "delivery", "contact"],
  foodDelivery: ["menu", "delivery", "how-to-order", "contact"],
  furniture: ["shop", "collections", "showroom", "delivery", "care-guide", "about", "contact"],
  ecommerce: ["shop", "collections", "shipping-returns", "about", "contact"],
  grocery: ["shop", "collections", "delivery", "about", "contact"]
};
for (const [template, pages] of Object.entries(expected)) {
  test(`${template} starter defines its essential multi-page routes`, () => {
    const actual = new Set(getNichePages(template).map((page) => page.slug));
    for (const slug of pages) assert.ok(actual.has(slug), `${template} missing ${slug}`);
    const nav = getNicheNavigation(template);
    assert.ok(nav.length >= 4);
    assert.ok(nav.every((item) => item.href.startsWith("/")));
  });
}

test("white-label config stores the selected niche page routes and navigation", () => {
  const config = normalizeForgePayload({ template: "furniture", brand: { name: "North House" }, theme: { primary: "#58624F", secondary: "#E8E5DC", background: "#F5F3EE", surface: "#FFFEFA", text: "#202321", muted: "#77796F", accent: "#D9D5C8" }, sections: ["header","hero","catalog","footer"], products: [{ name: "Chair", price: 200 }] });
  assert.ok(config.pageRoutes.some((item) => item.slug === "care-guide"));
  assert.ok(config.navigation.some((item) => item.href === "/showroom"));
});

test("generated top-level and collection pages resolve against client config", () => {
  assert.match(makeNichePageRouteSource(), /getNichePage/);
  assert.match(makeCollectionIndexRouteSource(), /page="collections"/);
  assert.match(makeCollectionDetailRouteSource(), /categorySlug/);
});

test("commerce pages use a shared cart and product details add variants to cart", () => {
  assert.match(makeCommerceCartRouteSource("checkout"), /ClientMultiPage/);
  assert.match(makeProductDetailSource({ template: "ecommerce" }), /ClientSimpleProductDetail/);
  assert.match(makeProductDetailSource({ template: "restaurant" }), /ClientFoodProductDetail/);
});


test("generated food ordering route receives the complete niche navigation", () => {
  const source = makeOrderDetailSource();
  assert.match(source, /getNicheNavigation/);
  assert.match(source, /siteLinks: getNicheNavigation\(config\.template\)/);
});

test("food product detail uses the same food-order cart key as the menu ordering experience", async () => {
  const fs = await import("node:fs");
  const source = fs.readFileSync(new URL("../src/components/food/ClientFoodProductDetail.js", import.meta.url), "utf8");
  assert.match(source, /food-order-\$\{config\.slug\}-cart/);
  assert.match(source, /addOrIncrementCartItem/);
});
