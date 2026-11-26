import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeClientReadme, makeIntegrationPlan, makeClientHandoverDoc } from "./project.mjs";
import { getNichePages, getNicheNavigation } from "./niche-pages.mjs";

export function makeRootPageSource() {
  return `import ClientProjectHome from "@/components/client/ClientProjectHome";
import { readClientConfig } from "@/lib/client-config.mjs";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const config = readClientConfig();
  return {
    title: config.brand.name + " | " + config.brand.tagline,
    description: config.brand.description
  };
}

export default function Home() {
  const config = readClientConfig();
  return <>
    {process.env.NODE_ENV === "development" ? <div className="client-local-editor-bar"><span>Local project workspace</span><a href="/studio">Edit this website ↗</a></div> : null}
    <ClientProjectHome config={config} />
  </>;
}
`;
}


export function makeProductDetailSource(config = {}) {
  if (["cafe", "restaurant", "foodDelivery"].includes(config.template)) {
    return `import { notFound } from "next/navigation";
import ClientFoodProductDetail from "@/components/food/ClientFoodProductDetail";
import { readClientConfig } from "@/lib/client-config.mjs";
import { getNicheNavigation } from "@/lib/forge/niche-pages.mjs";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const config = readClientConfig(); const { slug } = await params;
  const product = config.products.find((item) => item.id === slug);
  return product ? { title: product.name + " | " + config.brand.name, description: product.description } : {};
}
export default async function FoodProductPage({ params }) {
  const config = readClientConfig(); const { slug } = await params;
  const product = config.products.find((item) => item.id === slug);
  if (!product) notFound();
  return <ClientFoodProductDetail product={product} config={config} navigation={getNicheNavigation(config.template)} />;
}
`;
  }
  if (config.template === "furniture") {
    return `import { notFound } from "next/navigation";
import FurnitureProductDetail from "@/components/furniture/FurnitureProductDetail";
import { normalizeFurnitureClientProduct } from "@/lib/furniture-store.mjs";
import { readClientConfig } from "@/lib/client-config.mjs";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const config = readClientConfig();
  const { slug } = await params;
  const product = config.products.find((item) => item.id === slug);
  return product ? { title: product.name + " | " + config.brand.name, description: product.description } : {};
}
export default async function FurnitureProductPage({ params }) {
  const config = readClientConfig();
  const { slug } = await params;
  const rawProduct = config.products.find((item) => item.id === slug);
  if (!rawProduct) notFound();
  const product = normalizeFurnitureClientProduct(rawProduct);
  const cartStorageKey = "frontendforge:furniture-cart:" + config.slug;
  return <FurnitureProductDetail product={product} currency={config.business.currency} locale={config.business.locale} cartStorageKey={cartStorageKey} adminStorageKey={"frontendforge:furniture-admin:" + config.slug} checkoutPath="/checkout" productBasePath="" brandName={config.brand.name} />;
}
`;
  }

  return `import { notFound } from "next/navigation";
import ClientSimpleProductDetail from "@/components/commerce/ClientSimpleProductDetail";
import { readClientConfig } from "@/lib/client-config.mjs";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const config = readClientConfig(); const { slug } = await params;
  const product = config.products.find((item) => item.id === slug);
  return product ? { title: product.name + " | " + config.brand.name, description: product.description, openGraph: { images: product.image ? [product.image] : [] } } : {};
}
export default async function ProductDetailPage({ params }) {
  const config = readClientConfig(); const { slug } = await params;
  const product = config.products.find((item) => item.id === slug);
  if (!product) notFound();
  return <ClientSimpleProductDetail product={product} config={config} />;
}
`;
}

export function makeFurnitureCheckoutSource() {
  return `import FurnitureCheckout from "@/components/furniture/FurnitureCheckout";
import { readClientConfig } from "@/lib/client-config.mjs";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const config = readClientConfig();
  return { title: "Furniture enquiry | " + config.brand.name, robots: { index: false, follow: true } };
}
export default function FurnitureCheckoutPage() {
  const config = readClientConfig();
  const store = {
    brandName: config.brand.name,
    whatsappNumber: config.contact.whatsapp || config.contact.phone || "",
    email: config.contact.email || "",
    currency: config.business.currency || "ETB",
    locale: config.business.locale || "en",
    deliveryNote: "Delivery fees, stock and lead times are confirmed by the showroom."
  };
  return <FurnitureCheckout store={store} cartStorageKey={"frontendforge:furniture-cart:" + config.slug} productBasePath="" />;
}
`;
}

export function makeOrderIndexSource(config) {
  if (!config.orderEnabled) {
    const destination = config.integrations.ordering?.publicUrl || "/#catalog";
    return `import { redirect } from "next/navigation";
export default function OrderIndex(){ redirect(${JSON.stringify(destination)}); }
`;
  }
  return `import { redirect } from "next/navigation";
export default function OrderIndex(){ redirect("/order/${config.slug}"); }
`;
}

export function makeOrderDetailSource() {
  return `import { notFound } from "next/navigation";
import FoodBusinessExperience from "@/components/food/FoodBusinessExperience";
import { readClientConfig } from "@/lib/client-config.mjs";
import { getNicheNavigation } from "@/lib/forge/niche-pages.mjs";

export const dynamic = "force-dynamic";

function makeBusiness(config) {
  return {
    slug: config.slug,
    name: config.brand.name,
    descriptor: config.templateLabel.toUpperCase(),
    tagline: config.brand.tagline,
    intro: config.brand.description,
    currency: config.business.currency,
    locale: config.business.locale,
    whatsapp: config.contact.whatsapp,
    phone: config.contact.phone,
    email: config.contact.email,
    address: config.business.address,
    hours: config.business.hours,
    fulfillment: config.business.fulfillment,
    deliveryFee: config.business.deliveryFee,
    deliveryLabel: "Delivery fee",
    theme: {
      background: config.theme.background, surface: config.theme.surface, text: config.theme.text,
      muted: config.theme.muted, primary: config.theme.primary, primaryText: "#ffffff",
      accent: config.theme.accent, soft: config.theme.secondary, line: "#e5e5e5",
      hero: config.theme.primary
    },
    categories: ["All", ...new Set(config.products.map((item) => item.category))],
    products: config.products,
    siteLinks: getNicheNavigation(config.template)
  };
}

export async function generateMetadata() {
  const config = readClientConfig();
  return { title: config.brand.name + " | Order online", description: config.brand.description };
}

export default async function ClientOrderPage({ params }) {
  const config = readClientConfig();
  const { slug } = await params;
  if (!config.orderEnabled || slug !== config.slug) notFound();
  return <FoodBusinessExperience business={makeBusiness(config)} />;
}
`;
}


function makeProductDetailCss() {
  return `.white-label-product{min-height:100vh;background:var(--brand-bg);color:var(--brand-text);padding:0 clamp(20px,6vw,90px) 80px;font-family:Arial,sans-serif}.white-label-product header{height:76px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid color-mix(in srgb,var(--brand-text) 15%,transparent)}.white-label-product header a{color:inherit;text-decoration:none;font-weight:700}.white-label-product-grid{max-width:1180px;margin:70px auto;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,6vw,80px);align-items:center}.white-label-product-image{min-height:520px;border-radius:24px;background:var(--brand-secondary);overflow:hidden;display:grid;place-items:center}.white-label-product-image img{width:100%;height:100%;min-height:520px;object-fit:cover}.white-label-product-image span{font-size:90px;color:var(--brand-primary)}.white-label-product section>small{color:var(--brand-primary);text-transform:uppercase;letter-spacing:1.5px;font-size:11px}.white-label-product h1{font-size:clamp(38px,5vw,66px);line-height:1.02;letter-spacing:-2px;margin:18px 0}.white-label-product .price{font-size:22px}.white-label-product p{color:var(--brand-muted);line-height:1.8}.white-label-product .options{display:grid;gap:10px;margin:26px 0}.white-label-product .options span{padding:12px 14px;border:1px solid color-mix(in srgb,var(--brand-text) 15%,transparent);border-radius:10px}.white-label-product .action{display:inline-flex;padding:16px 22px;border-radius:999px;background:var(--brand-primary);color:white;text-decoration:none;font-weight:700}.white-label-product .note{font-size:12px}@media(max-width:760px){.white-label-product-grid{grid-template-columns:1fr;margin:32px auto}.white-label-product-image,.white-label-product-image img{min-height:340px}}`;
}

export function makeNichePageRouteSource() {
  return `import { notFound } from "next/navigation";
import ClientMultiPage from "@/components/client/ClientMultiPage";
import { readClientConfig } from "@/lib/client-config.mjs";
import { getNichePage } from "@/lib/forge/niche-pages.mjs";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const config = readClientConfig();
  const { page } = await params;
  const definition = getNichePage(config.template, page);
  return definition ? { title: definition.title + " | " + config.brand.name, description: definition.description, alternates: { canonical: "/" + page } } : {};
}
export default async function ClientNichePage({ params }) {
  const config = readClientConfig();
  const { page } = await params;
  if (!getNichePage(config.template, page)) notFound();
  return <ClientMultiPage config={config} page={page} />;
}
`;
}

export function makeCollectionIndexRouteSource() {
  return `import ClientMultiPage from "@/components/client/ClientMultiPage";
import { readClientConfig } from "@/lib/client-config.mjs";
import { getNichePage } from "@/lib/forge/niche-pages.mjs";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export async function generateMetadata() { const config = readClientConfig(); const page = getNichePage(config.template, "collections"); return page ? { title: page.title + " | " + config.brand.name, description: page.description } : {}; }
export default function CollectionsPage() { const config = readClientConfig(); if (!getNichePage(config.template, "collections")) notFound(); return <ClientMultiPage config={config} page="collections" />; }
`;
}

export function makeCollectionDetailRouteSource() {
  return `import { notFound } from "next/navigation";
import ClientMultiPage from "@/components/client/ClientMultiPage";
import { readClientConfig } from "@/lib/client-config.mjs";
import { getNichePage } from "@/lib/forge/niche-pages.mjs";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) { const config = readClientConfig(); const { slug } = await params; const exists = config.products.some((product) => String(product.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug); return exists ? { title: slug.replaceAll("-", " ") + " | " + config.brand.name, description: "Browse this collection from " + config.brand.name } : {}; }
export default async function CollectionDetailPage({ params }) { const config = readClientConfig(); const { slug } = await params; if (!getNichePage(config.template, "collections")) notFound(); const exists = config.products.some((product) => String(product.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug); if (!exists) notFound(); return <ClientMultiPage config={config} page="collection-detail" categorySlug={slug} />; }
`;
}

export function makeCommerceCartRouteSource(mode = "cart") {
  return `import { notFound } from "next/navigation";
import ClientMultiPage from "@/components/client/ClientMultiPage";
import { readClientConfig } from "@/lib/client-config.mjs";
export const dynamic = "force-dynamic";
export async function generateMetadata() { const config = readClientConfig(); return { title: "${mode === "cart" ? "Shopping bag" : "Checkout"} | " + config.brand.name, robots: { index: false, follow: true } }; }
export default function CommerceCartPage() { const config = readClientConfig(); if (!["ecommerce", "grocery", "furniture"].includes(config.template)) notFound(); return <ClientMultiPage config={config} page="${mode}" />; }
`;
}

export function makeCartRedirectSource(destination) {
  return `import { redirect } from "next/navigation"; export default function CartRedirect(){ redirect(${JSON.stringify(destination)}); }\n`;
}

function makeEnvExample(config) {
  return [
    `# ${config.brand.name} — placeholder names only; confirm the provider's actual variable names`,
    "# Put real values in .env.local or your hosting provider's secret manager.",
    "# Never commit secrets to Git or expose private keys in browser code.",
    "",
    "BOOKING_PROVIDER_API_KEY=",
    "ORDERING_PROVIDER_API_URL=",
    "PAYMENT_PROVIDER_SECRET_KEY=",
    "PAYMENT_WEBHOOK_SECRET=",
    "DELIVERY_PROVIDER_API_KEY=",
    "INVENTORY_PROVIDER_API_URL=",
    "CONTACT_FORM_ENDPOINT=",
    "",
    "# Optional persistent store backend (Supabase/Postgres).",
    "# Apply supabase/migrations/0001_store_platform.sql and 0002_order_permissions.sql first.",
    "NEXT_PUBLIC_SITE_URL=",
    "SUPABASE_URL=",
    "SUPABASE_ANON_KEY=",
    "SUPABASE_SERVICE_ROLE_KEY=",
    "PUBLIC_SITE_ORIGINS=",
    ""
  ].join("\n");
}

export async function createClientProjectCopy(projectRoot, config) {
  const projectsRoot = path.join(projectRoot, "client-projects");
  const target = path.join(projectsRoot, config.slug);
  await fs.mkdir(projectsRoot, { recursive: true });
  try {
    await fs.access(target);
    const error = new Error(`A client project named "${config.slug}" already exists. Choose a different folder name.`);
    error.code = "CLIENT_PROJECT_EXISTS";
    throw error;
  } catch (error) {
    if (error.code === "CLIENT_PROJECT_EXISTS") throw error;
  }

  // Stage outside the master folder because Node's fs.cp forbids copying a
  // directory into any descendant of itself, even with a filter callback.
  const stagingRoot = await fs.mkdtemp(path.join(path.dirname(projectRoot), `.frontendforge-${config.slug}-`));
  const stagedProject = path.join(stagingRoot, config.slug);
  try {
    const excludedDirectories = new Set(["node_modules", ".next", ".git", "client-projects", "client-deliverables", "templates", "tests", "out", "coverage", "playwright-report", "test-results"]);
    await fs.cp(projectRoot, stagedProject, {
      recursive: true,
      errorOnExist: true,
      force: false,
      filter: (source) => {
        const relative = path.relative(projectRoot, source);
        if (!relative || relative === ".") return true;
        const firstSegment = relative.split(path.sep)[0];
        if (excludedDirectories.has(firstSegment)) return false;
        const base = path.basename(source);
        if (firstSegment === "scripts" && base !== "audit-client.mjs") return false;
        if (base.startsWith(".env") && ![".env.example", ".env.client.example"].includes(base)) return false;
        if (base.startsWith("RELEASE-MANIFEST-") || base.startsWith("RELEASE-VERIFICATION-")) return false;
        if (base.endsWith(".zip")) return false;
        return true;
      }
    });

    // Strip internal Studio and master demo template routes. The generated client
    // receives the selected starter's white-label homepage and data-driven product/order routes.
    const internalAppDirs = ["forge", "docs", "components", "templates"];
    for (const d of internalAppDirs) {
      await fs.rm(path.join(stagedProject, "src", "app", d), { recursive: true, force: true }).catch(() => {});
    }
    await fs.rm(path.join(stagedProject, "src", "app", "api", "forge"), { recursive: true, force: true }).catch(() => {});

    await fs.rm(path.join(stagedProject, "docs"), { recursive: true, force: true });
    await fs.mkdir(path.join(stagedProject, "src", "config"), { recursive: true });
    await fs.mkdir(path.join(stagedProject, "docs"), { recursive: true });
    await fs.mkdir(path.join(stagedProject, "scripts"), { recursive: true });
    await fs.mkdir(path.join(stagedProject, "src", "app", "order", "[slug]"), { recursive: true });
    await fs.mkdir(path.join(stagedProject, "src", "app", "products", "[slug]"), { recursive: true });
    await fs.writeFile(path.join(stagedProject, "src", "config", "client-project.json"), `${JSON.stringify(config, null, 2)}\n`, "utf8");
    // Copy the local-only editor and its validation/API routes into each client site.
    const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
    const runtimeRoot = path.join(projectRoot, "templates", "client-runtime");
    let runtimeSource = runtimeRoot;
    try { await fs.access(runtimeRoot); } catch { runtimeSource = path.join(repositoryRoot, "templates", "client-runtime"); }
    const playwrightConfigSource = path.join(projectRoot, "playwright.config.mjs");
    const e2eSpecSource = path.join(projectRoot, "tests", "e2e", "client-site.spec.js");
    await fs.cp(runtimeSource, stagedProject, { recursive: true, force: true });
    await fs.copyFile(playwrightConfigSource, path.join(stagedProject, "playwright.config.mjs")).catch(async () => fs.copyFile(path.join(repositoryRoot, "playwright.config.mjs"), path.join(stagedProject, "playwright.config.mjs")));
    await fs.mkdir(path.join(stagedProject, "tests", "e2e"), { recursive: true });
    await fs.copyFile(e2eSpecSource, path.join(stagedProject, "tests", "e2e", "client-site.spec.js")).catch(async () => fs.copyFile(path.join(repositoryRoot, "tests", "e2e", "client-site.spec.js"), path.join(stagedProject, "tests", "e2e", "client-site.spec.js")));
    await fs.writeFile(path.join(stagedProject, "src", "lib", "client-config.mjs"), `import fs from "node:fs";\nimport path from "node:path";
import { fileURLToPath } from "node:url";\n\nexport function readClientConfig() {\n  const file = path.join(process.cwd(), "src", "config", "client-project.json");\n  return JSON.parse(fs.readFileSync(file, "utf8"));\n}\n`, "utf8");
    await fs.writeFile(path.join(stagedProject, "src", "app", "page.js"), makeRootPageSource(), "utf8");
    // One route module handles the niche-specific top-level pages; the page registry
    // defines which slugs exist for each business type.
    await fs.mkdir(path.join(stagedProject, "src", "app", "[page]"), { recursive: true });
    await fs.writeFile(path.join(stagedProject, "src", "app", "[page]", "page.js"), makeNichePageRouteSource(), "utf8");
    if (getNichePages(config.template).some((page) => page.slug === "collections")) {
      await fs.mkdir(path.join(stagedProject, "src", "app", "collections", "[slug]"), { recursive: true });
      await fs.writeFile(path.join(stagedProject, "src", "app", "collections", "page.js"), makeCollectionIndexRouteSource(), "utf8");
      await fs.writeFile(path.join(stagedProject, "src", "app", "collections", "[slug]", "page.js"), makeCollectionDetailRouteSource(), "utf8");
    }
    if (["ecommerce", "grocery"].includes(config.template)) {
      await fs.mkdir(path.join(stagedProject, "src", "app", "cart"), { recursive: true });
      await fs.mkdir(path.join(stagedProject, "src", "app", "checkout"), { recursive: true });
      await fs.writeFile(path.join(stagedProject, "src", "app", "cart", "page.js"), makeCommerceCartRouteSource("cart"), "utf8");
      await fs.writeFile(path.join(stagedProject, "src", "app", "checkout", "page.js"), makeCommerceCartRouteSource("checkout"), "utf8");
    } else if (config.template === "furniture") {
      await fs.mkdir(path.join(stagedProject, "src", "app", "cart"), { recursive: true });
      await fs.writeFile(path.join(stagedProject, "src", "app", "cart", "page.js"), makeCartRedirectSource("/checkout"), "utf8");
    } else {
      await fs.mkdir(path.join(stagedProject, "src", "app", "cart"), { recursive: true });
      await fs.writeFile(path.join(stagedProject, "src", "app", "cart", "page.js"), makeCartRedirectSource(config.orderEnabled ? `/order/${config.slug}` : "/menu"), "utf8");
      await fs.mkdir(path.join(stagedProject, "src", "app", "checkout"), { recursive: true });
      await fs.writeFile(path.join(stagedProject, "src", "app", "checkout", "page.js"), makeCartRedirectSource(config.orderEnabled ? `/order/${config.slug}` : "/menu"), "utf8");
    }
    await fs.writeFile(path.join(stagedProject, "src", "app", "order", "page.js"), makeOrderIndexSource(config), "utf8");
    await fs.writeFile(path.join(stagedProject, "src", "app", "order", "[slug]", "page.js"), makeOrderDetailSource(), "utf8");
    await fs.writeFile(path.join(stagedProject, "src", "app", "products", "[slug]", "page.js"), makeProductDetailSource(config), "utf8");
    if (config.template === "furniture") {
      await fs.mkdir(path.join(stagedProject, "src", "app", "checkout"), { recursive: true });
      await fs.writeFile(path.join(stagedProject, "src", "app", "checkout", "page.js"), makeFurnitureCheckoutSource(), "utf8");
    }
    await fs.writeFile(path.join(stagedProject, "src", "app", "products", "[slug]", "product-detail.css"), makeProductDetailCss(), "utf8");
    await fs.writeFile(path.join(stagedProject, "docs", "INTEGRATION-PLAN.md"), makeIntegrationPlan(config), "utf8");
    await fs.writeFile(path.join(stagedProject, "docs", "CLIENT-SETUP.md"), makeClientReadme(config), "utf8");
    await fs.writeFile(path.join(stagedProject, "docs", "CLIENT-HANDOVER.md"), makeClientHandoverDoc(config), "utf8");
    await fs.writeFile(path.join(stagedProject, ".env.client.example"), makeEnvExample(config), "utf8");
    // Every generated client receives the operational runbooks and the exact database migrations
    // needed if the client commissions persistent products, inventory and server-side orders.
    const operationalDocs = ["DATABASE-SETUP.md", "PRODUCTION-READINESS.md", "CLIENT-QA-CHECKLIST.md", "LAUNCH-CHECKLIST.md", "INTEGRATION-AND-SECURITY.md"];
    for (const document of operationalDocs) {
      const source = path.join(projectRoot, "docs", "operations", document);
      try {
        await fs.copyFile(source, path.join(stagedProject, "docs", document));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }

    // Copy audit script to the client project
    let auditContent = "";
    try {
      auditContent = await fs.readFile(path.join(projectRoot, "scripts", "audit-client.mjs"), "utf8");
    } catch {
      try {
        auditContent = await fs.readFile(path.join(process.cwd(), "scripts", "audit-client.mjs"), "utf8");
      } catch {}
    }
    if (auditContent) {
      await fs.writeFile(path.join(stagedProject, "scripts", "audit-client.mjs"), auditContent, "utf8");
    }

    const packagePath = path.join(stagedProject, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
    packageJson.name = `client-${config.slug}`;
    packageJson.version = "1.0.0";
    packageJson.scripts = {
      dev: "next dev",
      build: "next build",
      start: "next start",
      "audit:client": "node scripts/audit-client.mjs",
      "test:e2e": "playwright test",
      "install:e2e": "npm install --save-dev @playwright/test@1.65.1 && npx playwright install chromium"
    };
    await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
    const lockPath = path.join(stagedProject, "package-lock.json");
    try {
      const lock = JSON.parse(await fs.readFile(lockPath, "utf8"));
      lock.name = packageJson.name;
      lock.version = packageJson.version;
      if (lock.packages?.[""]) {
        lock.packages[""].name = packageJson.name;
        lock.packages[""].version = packageJson.version;
      }
      await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
    } catch {}
    await fs.writeFile(path.join(stagedProject, "README.md"), makeClientReadme(config), "utf8");

    try {
      await fs.rename(stagedProject, target);
    } catch (error) {
      if (["EEXIST", "ENOTEMPTY"].includes(error.code)) {
        const conflict = new Error(`A client project named "${config.slug}" already exists. Choose a different folder name.`);
        conflict.code = "CLIENT_PROJECT_EXISTS";
        throw conflict;
      }
      if (error.code === "EXDEV") {
        await fs.cp(stagedProject, target, { recursive: true });
        await fs.rm(stagedProject, { recursive: true, force: true }).catch(() => {});
      } else {
        throw error;
      }
    }
    return target;
  } finally {
    await fs.rm(stagingRoot, { recursive: true, force: true }).catch(() => {});
  }
}
