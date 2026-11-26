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
