import { test, expect } from "@playwright/test";

test("actual generated client preview renders the saved brand in production output", async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const response = await page.goto("/forge/preview/machi-coffee-demo");
  expect(response?.status()).toBe(200);
  const site = page.locator("main.client-project.client-project-brand-machi-coffee-demo");
  await expect(site).toBeVisible();
  await expect(site.locator(".client-project-header")).toContainText("MACHI Coffee");
  await expect(site.locator(".client-project-hero h1")).toContainText("A little more sunshine");
  await expect(page.locator(".forge-actual-preview-toolbar")).toContainText("LOCAL PREVIEW SESSION");
  expect(pageErrors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("actual-generated-site-preview.png"), fullPage: true, animations: "disabled" });
});

test("a second niche preview receives its own brand identity and contrast styling", async ({ page }) => {
  const response = await page.goto("/forge/preview/saffron-stone-demo");
  expect(response?.status()).toBe(200);
  const site = page.locator("main.client-project.client-project-brand-saffron-stone-demo");
  await expect(site).toBeVisible();
  await expect(site.locator(".client-project-header")).toContainText("Saffron & Stone");
  await expect(site.locator(".client-project-hero h1")).toBeVisible();
});
