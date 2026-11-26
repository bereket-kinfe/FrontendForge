import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const projectDir = path.resolve(process.env.CLIENT_PROJECT_DIR || process.cwd());
const config = JSON.parse(fs.readFileSync(path.join(projectDir, "src/config/client-project.json"), "utf8"));

 test("branded homepage loads with no runtime errors", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator(".client-project-hero")).toBeVisible();
  await expect(page.locator(".client-project-hero h1")).toContainText(config.brand.tagline || config.brand.name);
  await expect(page).toHaveTitle(new RegExp(config.brand.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  expect(pageErrors).toEqual([]);
});

test("local client editor loads the matching brand and editable workspace", async ({ page }) => {
  const response = await page.goto("/studio");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: /make this website/i })).toBeVisible();
  await expect(page.getByText(config.brand.name, { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /brand & content/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /products \/ menu/i })).toBeVisible();
  await expect(page.locator('input[type="color"]')).toHaveCount(7);
});

test("homepage section links point to sections that exist", async ({ page }) => {
  await page.goto("/");
  const missingTargets = await page.locator('a[href^="#"]').evaluateAll((links) => links
    .map((link) => link.getAttribute("href"))
    .filter((href) => href && href.length > 1 && !document.querySelector(href)));
  expect(missingTargets).toEqual([]);
});

test("every configured niche page loads and shows the client's brand", async ({ page }) => {
  for (const definition of config.pageRoutes || []) {
    const response = await page.goto(`/${encodeURIComponent(definition.slug)}`);
    expect(response?.ok(), `${definition.slug} should return a successful response`).toBeTruthy();
    await expect(page.locator("body")).toContainText(config.brand.name);
  }
});

test("collection index and category detail pages resolve for catalog starters", async ({ page }) => {
  test.skip(!(config.pageRoutes || []).some((item) => item.slug === "collections"), "This niche does not use collections.");
  const indexResponse = await page.goto("/collections");
  expect(indexResponse?.ok()).toBeTruthy();
  const firstCategory = config.products?.[0]?.category;
  test.skip(!firstCategory, "No product categories are configured.");
  const categorySlug = firstCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const detailResponse = await page.goto(`/collections/${encodeURIComponent(categorySlug)}`);
  expect(detailResponse?.ok()).toBeTruthy();
});

test("first catalog item has a working product detail route", async ({ page }) => {
  test.skip(!config.products?.length, "This client has no catalog items.");
  const product = config.products[0];
  const response = await page.goto(`/products/${encodeURIComponent(product.id)}`);
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
});

test("enabled ordering route opens for the configured brand", async ({ page }) => {
  test.skip(!config.orderEnabled, "Ordering is not enabled for this client.");
  const response = await page.goto(`/order/${encodeURIComponent(config.slug)}`);
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("body")).toContainText(config.brand.name);
});

test("food product detail adds to the same menu order cart", async ({ page }) => {
  test.skip(!["cafe", "restaurant", "foodDelivery"].includes(config.template) || !config.orderEnabled, "Food ordering detail flow is enabled for food starters with ordering.");
  const product = config.products[0];
  await page.goto(`/products/${encodeURIComponent(product.id)}`);
  await page.getByRole("button", { name: /add to order/i }).click();
  await page.getByRole("link", { name: /view your order/i }).click();
  await expect(page).toHaveURL(new RegExp(`/order/${config.slug}$`));
  await expect(page.locator(".food-order-panel")).toContainText(product.name);
});

test("retail and furniture add-to-bag controls respond", async ({ page }) => {
  test.skip(!["ecommerce", "grocery", "furniture"].includes(config.template), "This starter uses a food menu / enquiry layout.");
  await page.goto("/");
  const addButton = page.locator(".ff-commerce-card button", { hasText: "Add to bag" }).first();
  const furnitureButton = page.locator(".furniture-add-button").first();
  if (config.template === "furniture") {
    await expect(furnitureButton).toBeVisible();
    await furnitureButton.click();
    await expect(page.locator(".furniture-cart-panel")).toContainText(config.products[0].name);
  } else {
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(page.locator(".ff-commerce-notice")).toContainText("added to your bag");
  }
});

test("mobile layout has no horizontal page overflow", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
});

test("furniture product variants remain in the same client enquiry cart through checkout", async ({ page }) => {
  test.skip(config.template !== "furniture", "Furniture-specific client checkout flow.");
  const product = config.products[0];
  const response = await page.goto(`/products/${encodeURIComponent(product.id)}`);
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  const material = page.locator("#material");
  if (await material.count()) await material.selectOption({ index: 0 });
  const color = page.locator("#color");
  if (await color.count()) await color.selectOption({ index: 0 });
  const size = page.locator("#size");
  if (await size.count()) await size.selectOption({ index: 0 });
  await page.locator("#qty").fill("2");
  await page.getByRole("button", { name: /add to enquiry bag/i }).click();
  await page.getByRole("link", { name: /continue to enquiry/i }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.locator(".furniture-checkout")).toContainText(product.name);
  await expect(page.locator(".furniture-checkout")).toContainText("Estimated subtotal");
});
