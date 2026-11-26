import { test, expect } from "@playwright/test";

test.describe("master furniture starter", () => {
  test.skip(Boolean(process.env.CLIENT_PROJECT_DIR), "This suite runs against the master FrontendForge project only.");

  test("collection renders product cards and category filters", async ({ page }) => {
    await page.goto("/templates/furniture");
    await expect(page.getByRole("heading", { name: /crafted calm/i })).toBeVisible();
    await expect(page.locator(".furniture-product-card")).toHaveCount(4);
    await page.getByRole("button", { name: "Sofas" }).click();
    await expect(page.locator(".furniture-product-card")).toHaveCount(1);
    await expect(page.locator(".furniture-product-card")).toContainText("Arlo Three-Seat Sofa");
  });

  test("product variants remain in the same cart through enquiry checkout", async ({ page }) => {
    await page.goto("/templates/furniture/products/mira-chair");
    await expect(page.getByRole("heading", { name: "Mira Lounge Chair" })).toBeVisible();
    await page.locator("#material").selectOption({ label: "Linen blend" });
    await page.locator("#color").selectOption({ label: "Stone" });
    await page.locator("#size").selectOption({ label: "Wide" });
    await page.locator("#qty").fill("2");
    await page.getByRole("button", { name: /add to enquiry bag/i }).click();
    await page.getByRole("link", { name: /continue to enquiry/i }).click();
    await expect(page).toHaveURL(/\/templates\/furniture\/checkout$/);
    await expect(page.locator(".furniture-checkout")).toContainText("Mira Lounge Chair");
    await expect(page.locator(".furniture-checkout")).toContainText("Linen blend");
    await expect(page.locator(".furniture-checkout")).toContainText("Stone");
  });

  test("product photos have alternative text and mobile layout does not overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/templates/furniture");
    const imagesWithoutAlt = await page.locator("img:not([alt])").count();
    expect(imagesWithoutAlt).toBe(0);
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
  });
});
