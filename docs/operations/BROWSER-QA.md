# Browser QA: desktop and mobile

FrontendForge includes Playwright end-to-end tests for generated client sites.

## Install once in the master project

```bash
npm run install:e2e
```

This installs `@playwright/test` 1.65.1 and the Chromium browser binary. See the [Playwright installation guide](https://playwright.dev/docs/intro).

## Test all generated websites

```bash
npm run test:clients:e2e
```

The runner starts each client independently on a dedicated local port and runs desktop Chromium (1440 × 960) and mobile Chromium (390 × 844).

Tests cover:
- Branded homepage and document title
- Local navigation anchor targets
- First product detail route
- Ordering route when enabled
- Add-to-bag behavior on retail and furniture clients
- Horizontal overflow at the mobile viewport

## Test one client

```bash
CLIENT_PROJECT_DIR=client-projects/machi-coffee-demo npm run test:e2e
```

On Windows PowerShell:

```powershell
$env:CLIENT_PROJECT_DIR = "client-projects/machi-coffee-demo"
npm run test:e2e
```

The browser tests require a running dependency installation and Chromium binary. The unit tests do not require Playwright.
