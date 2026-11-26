import { defineConfig } from "@playwright/test";
const port = Number(process.env.MASTER_TEST_PORT || 3189);
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["furniture-starter.spec.js", "admin-workspace.spec.js", "forge-preview.spec.js"],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report-master", open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop-chromium", use: { browserName: "chromium", viewport: { width: 1440, height: 960 } } },
    { name: "mobile-chromium", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NODE_ENV: "production", FORGE_LOCAL_PREVIEW: "1" }
  }
});
