import { test, expect } from "@playwright/test";

test("store admin workspace explains sign-in and has labeled credential fields", async ({ page }) => {
  const response = await page.goto("/admin");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: /store team sign in/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
  await expect(page.getByText(/requires configured supabase auth/i)).toBeVisible();
});

test("admin pages are explicitly excluded from indexing", async ({ page }) => {
  await page.goto("/admin");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots || "").toMatch(/noindex/);
});


test("actual generated client preview renders the saved brand in production output", async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const response = await page.goto("/forge/preview/machi-coffee-demo");
  expect(response?.ok()).toBeTruthy();
  const site = page.locator("main.client-project.client-project-brand-machi-coffee-demo");
  await expect(site).toBeVisible();
  await expect(site.locator(".client-project-header")).toContainText("MACHI Coffee");
  await expect(site.locator(".client-project-hero h1")).toContainText("A little more sunshine");
  await expect(page.locator(".forge-actual-preview-toolbar")).toContainText("LOCAL PREVIEW SESSION");
  expect(pageErrors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("actual-generated-site-preview.png"), fullPage: true, animations: "disabled" });
});
