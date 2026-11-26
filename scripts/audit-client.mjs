/**
 * FrontendForge Pre-flight Client Audit Tool
 * Automated verification for structure, brand completeness, WCAG AA contrast, and catalog.
 */

import fs from "node:fs";
import path from "node:path";

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getLuminance({ r, g, b }) {
  const [sR, sG, sB] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

function getContrastRatio(hex1, hex2) {
  try {
    const lum1 = getLuminance(hexToRgb(hex1));
    const lum2 = getLuminance(hexToRgb(hex2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 1;
  }
}

export function runClientAudit(targetDir = process.cwd()) {
  const issues = [];
  const checks = [];
  const warnings = [];

  // 1. Structure Checks
  const configPath = path.join(targetDir, "src", "config", "client-project.json");
  const pkgPath = path.join(targetDir, "package.json");
  const rootPagePath = path.join(targetDir, "src", "app", "page.js");
  const layoutPath = path.join(targetDir, "src", "app", "layout.js");

  if (!fs.existsSync(configPath)) {
    return {
      ok: false,
      summary: "Missing client-project.json configuration.",
      issues: ["src/config/client-project.json not found in target directory."]
    };
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    checks.push({ name: "Configuration file parsed successfully", status: "PASS" });
  } catch (err) {
    return { ok: false, summary: "Invalid JSON in client-project.json", issues: [err.message] };
  }

  if (fs.existsSync(pkgPath)) checks.push({ name: "package.json verified", status: "PASS" });
  else issues.push("package.json is missing.");
  if (fs.existsSync(path.join(targetDir, "playwright.config.mjs")) && fs.existsSync(path.join(targetDir, "tests", "e2e", "client-site.spec.js"))) {
    checks.push({ name: "Desktop/mobile Playwright smoke tests included", status: "PASS" });
  } else warnings.push("Playwright browser QA scaffold is missing; add it before release.");

  if (fs.existsSync(rootPagePath)) checks.push({ name: "Homepage route (src/app/page.js) verified", status: "PASS" });
  else issues.push("src/app/page.js is missing.");

  if (fs.existsSync(layoutPath)) checks.push({ name: "Root layout (src/app/layout.js) verified", status: "PASS" });
  else issues.push("src/app/layout.js is missing.");

  // Niche-specific multi-page storefront architecture. The page registry is authoritative;
  // each generated route resolves its page slug against the selected business type.
  const multipageRequired = [
    "src/app/[page]/page.js",
    "src/components/client/ClientMultiPage.js",
    "src/components/client/ClientMultiPage.css",
    "src/components/client/ClientLeadForm.js",
    "src/components/client/ClientCommerceCheckout.js",
    "src/components/commerce/ClientSimpleProductDetail.js",
    "src/components/food/ClientFoodProductDetail.js",
    "src/lib/forge/niche-pages.mjs"
  ];
  const missingMultipage = multipageRequired.filter((item) => !fs.existsSync(path.join(targetDir, item)));
  if (missingMultipage.length) issues.push(`Multi-page client runtime is incomplete: ${missingMultipage.join(", ")}`);
  else if (!Array.isArray(config.pageRoutes) || !config.pageRoutes.some((item) => item.slug === "about") || !config.pageRoutes.some((item) => item.slug === "contact")) {
    issues.push("Client pageRoutes must include at least the niche registry's About and Contact pages.");
  } else {
    checks.push({ name: `Niche multi-page route runtime included (${config.pageRoutes.length} configured pages)`, status: "PASS" });
    if (config.pageRoutes.some((item) => item.slug === "collections")) {
      const collectionRoutes = ["src/app/collections/page.js", "src/app/collections/[slug]/page.js"];
      const missingCollections = collectionRoutes.filter((item) => !fs.existsSync(path.join(targetDir, item)));
      if (missingCollections.length) issues.push(`Collection routes are missing: ${missingCollections.join(", ")}`);
      else checks.push({ name: "Collection index and category detail routes verified", status: "PASS" });
    }
  }

  // Deployment scaffolding must travel with every generated client, not just the master.
  const backendRequired = [
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
    "supabase/migrations/0001_store_platform.sql",
    "supabase/migrations/0002_order_permissions.sql",
    "docs/DATABASE-SETUP.md",
    ".env.client.example"
  ];
  const missingBackend = backendRequired.filter((item) => !fs.existsSync(path.join(targetDir, item)));
  if (missingBackend.length) issues.push(`Client database/admin foundation is incomplete: ${missingBackend.join(", ")}`);
  else checks.push({ name: "Supabase schema, public catalog/order APIs, secured admin APIs and setup guide included", status: "PASS" });

  const envExample = path.join(targetDir, ".env.client.example");
  if (fs.existsSync(envExample)) {
    const envText = fs.readFileSync(envExample, "utf8");
    if (!["SUPABASE_URL=", "SUPABASE_ANON_KEY=", "SUPABASE_SERVICE_ROLE_KEY=", "NEXT_PUBLIC_SITE_URL="].every((key) => envText.includes(key))) {
      issues.push("Client environment example is missing required database/server variables.");
    } else if (envText.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")) {
      issues.push("Service-role key must never be exposed with a NEXT_PUBLIC_ prefix.");
    } else checks.push({ name: "Client environment example includes server-only database placeholders", status: "PASS" });
  }

  if (config.template === "furniture") {
    const furnitureRequired = [
      "src/app/products/[slug]/page.js",
      "src/app/checkout/page.js",
      "src/app/cart/page.js",
      "src/components/furniture/FurnitureProductDetail.js",
      "src/components/furniture/FurnitureCheckout.js",
      "src/lib/furniture-store.mjs"
    ];
    const missingFurniture = furnitureRequired.filter((item) => !fs.existsSync(path.join(targetDir, item)));
    if (missingFurniture.length) issues.push(`Furniture commerce routes/components are missing: ${missingFurniture.join(", ")}`);
    else {
      const productSource = fs.readFileSync(path.join(targetDir, "src/app/products/[slug]/page.js"), "utf8");
      const checkoutSource = fs.readFileSync(path.join(targetDir, "src/app/checkout/page.js"), "utf8");
      if (!productSource.includes("FurnitureProductDetail") || !checkoutSource.includes("frontendforge:furniture-cart:")) {
        issues.push("Furniture client detail and checkout routes are not using the shared furniture commerce runtime/cart key.");
      } else checks.push({ name: "Furniture client has dedicated detail, variant and shared-cart checkout runtime", status: "PASS" });
    }
  } else {
    const productRoute = path.join(targetDir, "src/app/products/[slug]/page.js");
    if (!fs.existsSync(productRoute)) issues.push("Data-driven product detail route is missing.");
    else checks.push({ name: "Data-driven client product detail route verified", status: "PASS" });
  }

  if (Array.isArray(config.pageRoutes)) {
    const pageSlugs = new Set(config.pageRoutes.map((item) => item.slug));
    const requiredByTemplate = {
      cafe: ["menu", "about", "visit", "reservations", "contact"],
      restaurant: ["menu", "about", "reservations", "delivery", "contact"],
      foodDelivery: ["menu", "delivery", "how-to-order", "contact"],
      furniture: ["shop", "collections", "showroom", "delivery", "care-guide", "about", "contact"],
      ecommerce: ["shop", "collections", "shipping-returns", "about", "contact"],
      grocery: ["shop", "collections", "delivery", "about", "contact"]
    };
    const missingPages = (requiredByTemplate[config.template] || []).filter((slug) => !pageSlugs.has(slug));
    if (missingPages.length) issues.push(`Required ${config.template} pages are missing from pageRoutes: ${missingPages.join(", ")}`);
    else checks.push({ name: `${config.template} essential pages declared`, status: "PASS" });
  }

  const clientPackage = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, "utf8")) : null;
  if (clientPackage?.scripts?.build && clientPackage?.scripts?.["test:e2e"]) checks.push({ name: "Client production build and E2E scripts are declared", status: "PASS" });
  else issues.push("Client package must declare build and E2E test scripts.");

  const editorPage = path.join(targetDir, "src", "app", "studio", "page.js");
  const editorApi = path.join(targetDir, "src", "app", "api", "client-config", "route.js");
  const assetApi = path.join(targetDir, "src", "app", "api", "client-assets", "route.js");
  const editorComponent = path.join(targetDir, "src", "components", "client", "ClientConfigEditor.js");
  const configValidator = path.join(targetDir, "src", "lib", "client-config-validation.mjs");
  if (fs.existsSync(editorPage) && fs.existsSync(editorApi) && fs.existsSync(editorComponent) && fs.existsSync(configValidator)) {
    const pageSource = fs.readFileSync(editorPage, "utf8");
    const apiSource = fs.readFileSync(editorApi, "utf8");
    if (!pageSource.includes("NODE_ENV") || !pageSource.includes("notFound()") || !apiSource.includes("NODE_ENV === \"production\"")) {
      issues.push("Client editor must be restricted to local development and blocked in production.");
    } else checks.push({ name: "Local-only client configuration editor and validated save API verified", status: "PASS" });
  } else {
    issues.push("Client configuration editor, API or validator is missing.");
  }
  if (fs.existsSync(assetApi)) {
    const uploadSource = fs.readFileSync(assetApi, "utf8");
    if (uploadSource.includes("MAX_BYTES") && uploadSource.includes("image/png") && uploadSource.includes("NODE_ENV === \"production\"")) checks.push({ name: "Local image upload size/type and production guard verified", status: "PASS" });
    else issues.push("Client asset upload route is missing its file validation or production guard.");
  } else issues.push("Client asset upload route is missing.");

  // Check no residual internal developer routes
  const internalRoutes = ["src/app/forge", "src/app/docs", "src/app/components"];
  for (const r of internalRoutes) {
    if (fs.existsSync(path.join(targetDir, r))) {
      warnings.push(`Internal developer resource "${r}" is present in client folder. Consider removing it before production launch.`);
    }
  }

  // 2. Brand Completeness & Placeholder Detection
  const placeholders = [
    { field: "business.address", val: config.business?.address, pattern: /Add.*address|your.*address/i, note: "Replace sample address with client-verified address." },
    { field: "contact.email", val: config.contact?.email, pattern: /example\.com|hello@business\.com/i, note: "Replace demo email address with client email." },
    { field: "contact.phone", val: config.contact?.phone, pattern: /\+251\s*900\s*000|\+251911123456/i, note: "Replace sample phone number with verified client phone." },
    { field: "brand.name", val: config.brand?.name, pattern: /^Your Business$/i, note: "Set client brand name." }
  ];

  for (const p of placeholders) {
    if (!p.val || p.pattern.test(p.val)) {
      warnings.push(`[Placeholder detected] ${p.field}: "${p.val || "empty"}". ${p.note}`);
    } else {
      checks.push({ name: `Brand field "${p.field}" verified`, status: "PASS" });
    }
  }

  // 3. WCAG 2.2 AA Contrast Checks
  const theme = config.theme || {};
  if (theme.background && theme.text) {
    const ratioBg = getContrastRatio(theme.background, theme.text);
    if (ratioBg < 4.5) {
      issues.push(`Contrast failure: background (${theme.background}) vs text (${theme.text}) ratio is ${ratioBg.toFixed(2)}:1 (Minimum WCAG AA requirement is 4.5:1).`);
    } else {
      checks.push({ name: `Background / Text contrast: ${ratioBg.toFixed(2)}:1 (WCAG AA pass)`, status: "PASS" });
    }
  }

  if (theme.surface && theme.text) {
    const ratioSurface = getContrastRatio(theme.surface, theme.text);
    if (ratioSurface < 4.5) {
      issues.push(`Contrast failure: surface (${theme.surface}) vs text (${theme.text}) ratio is ${ratioSurface.toFixed(2)}:1 (Minimum WCAG AA requirement is 4.5:1).`);
    } else {
      checks.push({ name: `Surface / Text contrast: ${ratioSurface.toFixed(2)}:1 (WCAG AA pass)`, status: "PASS" });
    }
  }

  if (theme.primary) {
    const ratioButton = getContrastRatio(theme.primary, "#ffffff");
    if (ratioButton < 3.0) {
      warnings.push(`Contrast warning: primary button color (${theme.primary}) vs white text is ${ratioButton.toFixed(2)}:1 (Recommended minimum is 3.0:1 for large text / UI buttons).`);
    } else {
      checks.push({ name: `Primary button / White text contrast: ${ratioButton.toFixed(2)}:1`, status: "PASS" });
    }
  }

  // 4. Catalog Verification
  const products = Array.isArray(config.products) ? config.products : [];
  if (config.sections?.includes("catalog")) {
    if (products.length === 0) {
      issues.push("Catalog section is enabled but contains 0 products.");
    } else {
      checks.push({ name: `Catalog verified (${products.length} products)`, status: "PASS" });
      for (const item of products) {
        if (!item.name || item.name.length < 1) issues.push(`Catalog item missing name.`);
        if (typeof item.price !== "number" || item.price < 0) issues.push(`Catalog item "${item.name}" has invalid price: ${item.price}`);
      }
    }
  }

  // 5. Integration Safety
  if (config.orderEnabled) {
    const digits = String(config.contact?.whatsapp || config.contact?.phone || "").replace(/\D/g, "");
    if (!digits) issues.push("WhatsApp ordering is enabled but no phone or WhatsApp number is configured.");
    else checks.push({ name: "WhatsApp ordering contact verified", status: "PASS" });
  }

  const ok = issues.length === 0;
  const result = {
    ok,
    clientSlug: config.slug,
    clientName: config.brand?.name,
    starter: config.templateLabel,
    totalChecks: checks.length,
    passedChecks: checks,
    issues,
    warnings,
    summary: ok
      ? `Release audit passed with ${warnings.length} warning(s). Project is ready for client review.`
      : `Release audit failed with ${issues.length} critical issue(s). Resolve issues before release.`
  };

  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"))) {
  const target = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  console.log(`Running FrontendForge client audit on: ${target}`);
  const report = runClientAudit(target);
  console.log(`Result: ${report.ok ? "PASS" : "FAIL"}`);
  console.log(`Summary: ${report.summary}`);
  if (report.issues.length) {
    console.log("\nCritical Issues:");
    report.issues.forEach((i) => console.log(`  ✗ ${i}`));
  }
  if (report.warnings.length) {
    console.log("\nWarnings:");
    report.warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }
  process.exit(report.ok ? 0 : 1);
}
