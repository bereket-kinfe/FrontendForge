import { getNichePages, getNicheNavigation } from "./niche-pages.mjs";
import { slugify } from "./slug.mjs";
import { normalizeSectionContent, normalizeSectionStyles } from "./editor-config.mjs";
export { slugify } from "./slug.mjs";
export const STARTERS = {
  ecommerce: { route: "/templates/ecommerce", label: "Ecommerce storefront", businessType: "shop" },
  restaurant: { route: "/templates/restaurant", label: "Restaurant website", businessType: "food" },
  cafe: { route: "/templates/cafe", label: "Cafe & bakery", businessType: "food" },
  foodDelivery: { route: "/templates/food-delivery", label: "Food delivery & takeaway", businessType: "food" },
  grocery: { route: "/templates/grocery", label: "Grocery storefront", businessType: "shop" },
  furniture: { route: "/templates/furniture", label: "Furniture & home store", businessType: "shop" }
};

export const SECTION_IDS = [
  "header", "hero", "catalog", "collections", "roomInspiration", "about", "gallery", "testimonials", "faq", "location", "booking", "contact", "footer"
];

const INTEGRATION_KEYS = ["booking", "ordering", "payment", "delivery", "inventory", "contact"];
const HEX = /^#[0-9a-fA-F]{6}$/;

function safeText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function safeUrl(value) {
  const url = safeText(value, 1000);
  if (!url) return "";
  if (url.startsWith("/")) return url.startsWith("//") ? "" : url;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function parseOptionList(value) {
  return String(value || "").split(",").map((part, index) => {
    const [labelPart, pricePart = "0"] = part.split(":");
    const label = safeText(labelPart, 60);
    const price = Number(pricePart.trim());
    if (!label) return null;
    return { id: slugify(label) || `option-${index + 1}`, label, price: Number.isFinite(price) ? Math.max(0, price) : 0 };
  }).filter(Boolean);
}

export function parseCatalogText(text = "") {
  return String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 60).map((line, index) => {
    const [namePart, categoryPart = "Featured", descriptionPart = "", pricePart = "0", sizesPart = "Regular:0", addonsPart = "", imagePart = ""] = line.split("|");
    const name = safeText(namePart, 90);
    const price = Number(String(pricePart).replace(/[^\d.]/g, ""));
    if (!name || !Number.isFinite(price) || price < 0) return null;
    const sizes = parseOptionList(sizesPart);
    const addons = parseOptionList(addonsPart);
    return {
      id: slugify(name) || `item-${index + 1}`,
      name,
      category: safeText(categoryPart, 50) || "Featured",
      description: safeText(descriptionPart, 220),
      price,
      emoji: "🍽️",
      sizes: sizes.length ? sizes : [{ id: "regular", label: "Regular", price: 0 }],
      addons,
      image: safeUrl(imagePart),
      alt: name
    };
  }).filter(Boolean);
}

export function normalizeForgePayload(input = {}) {
  const template = safeText(input.template, 40);
  if (!STARTERS[template]) throw new Error("Choose one of the available website starters.");

  const brandInput = input.brand || {};
  const businessInput = input.business || {};
  const contactInput = input.contact || {};
  const name = safeText(brandInput.name, 80);
  if (name.length < 2) throw new Error("Enter a business or brand name (at least 2 characters).");
  const slug = slugify(brandInput.slug || name);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Enter a valid project folder name using letters, numbers and hyphens.");

  const themeInput = input.theme || {};
  const theme = {};
  for (const key of ["primary", "secondary", "background", "surface", "text", "muted", "accent"]) {
    const value = safeText(themeInput[key], 7);
    if (!HEX.test(value)) throw new Error(`Choose a valid ${key} color.`);
    theme[key] = value;
  }

  const sections = [...new Set((Array.isArray(input.sections) ? input.sections : []).filter((item) => SECTION_IDS.includes(item)))];
  if (!sections.includes("header")) sections.unshift("header");
  if (!sections.includes("hero")) sections.unshift("hero");
  if (!sections.includes("footer")) sections.push("footer");

  const incomingIntegrations = input.integrations || {};
  const integrations = {};
  for (const key of INTEGRATION_KEYS) {
    const entry = incomingIntegrations[key] || {};
    integrations[key] = {
      provider: safeText(entry.provider, 100) || "Not selected",
      publicUrl: safeUrl(entry.publicUrl ?? entry.url),
      notes: safeText(entry.notes, 300),
      status: "planned"
    };
  }

  const rawProducts = Array.isArray(input.products) && input.products.length ? input.products.map((p, idx) => {
    const name = safeText(p.name, 90);
    const price = Number(p.price);
    if (!name || !Number.isFinite(price) || price < 0) return null;
    return {
      id: slugify(p.name) || p.id || `item-${idx + 1}`,
      name,
      category: safeText(p.category, 50) || "Featured",
      description: safeText(p.description, 220),
      price,
      emoji: p.emoji || "🍽️",
      sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : [{ id: "regular", label: "Regular", price: 0 }],
      addons: Array.isArray(p.addons) ? p.addons : [],
      image: safeUrl(p.image),
      alt: safeText(p.alt || p.name, 90),
      dimensions: safeText(p.dimensions, 80),
      materials: safeText(p.materials, 80),
      inStock: p.inStock !== false
    };
  }).filter(Boolean) : parseCatalogText(input.catalogText || "");
  const products = rawProducts;
  if (sections.includes("catalog") && products.length === 0) {
    throw new Error("Add at least one product or menu item, or turn off the catalog section.");
  }

  const orderedSections = Array.isArray(input.orderedSections) && input.orderedSections.length
    ? [...new Set(input.orderedSections.filter((item) => SECTION_IDS.includes(item)))]
    : [...sections];
  if (!orderedSections.includes("header")) orderedSections.unshift("header");
  if (!orderedSections.includes("hero")) {
    const headerIdx = orderedSections.indexOf("header");
    orderedSections.splice(headerIdx + 1, 0, "hero");
  }
  if (!orderedSections.includes("footer")) orderedSections.push("footer");

  const contact = {
    phone: safeText(contactInput.phone, 40),
    whatsapp: safeText(contactInput.whatsapp, 40),
    email: safeText(contactInput.email, 120),
    website: safeUrl(contactInput.website)
  };
  const orderEnabled = integrations.ordering.provider === "FrontendForge WhatsApp ordering" && products.length > 0;
  if (orderEnabled && !String(contact.whatsapp || contact.phone).replace(/\D/g, "")) {
    throw new Error("Add the client's WhatsApp or phone number before enabling FrontendForge WhatsApp ordering.");
  }

  return {
    schemaVersion: 2,
    engine: "FrontendForge Universal White-Label Engine",
    engineVersion: "3.5.0",
    starterVersion: "3.5.0",
    sourceVersion: "3.5.0",
    createdAt: new Date().toISOString(),
    template,
    templateLabel: STARTERS[template].label,
    businessType: STARTERS[template].businessType,
    slug,
    brand: {
      name,
      tagline: safeText(brandInput.tagline, 150),
      description: safeText(brandInput.description, 600),
      logoUrl: safeUrl(brandInput.logoUrl),
      heroImageUrl: safeUrl(brandInput.heroImageUrl),
      galleryImages: String(brandInput.galleryImages || "").split(/\r?\n|,/).map(safeUrl).filter(Boolean).slice(0, 8)
    },
    business: {
      address: safeText(businessInput.address, 250),
      hours: safeText(businessInput.hours, 250),
      currency: safeText(businessInput.currency, 8).toUpperCase() || "ETB",
      deliveryFee: Math.max(0, Number(businessInput.deliveryFee) || 0),
      fulfillment: !incomingIntegrations.delivery?.provider || incomingIntegrations.delivery.provider === "Not selected" || incomingIntegrations.delivery.provider === "Pickup only" ? ["pickup"] : ["pickup", "delivery"],
      locale: safeText(businessInput.locale, 20) || "en-ET"
    },
    contact,
    theme,
    font: safeText(input.font, 80) || "Manrope + DM Sans",
    componentStyles: {
      header: ["standard", "centered", "bold"].includes(input.componentStyles?.header) ? input.componentStyles.header : "standard",
      hero: ["split", "centered", "photo-led"].includes(input.componentStyles?.hero) ? input.componentStyles.hero : "split",
      catalog: ["cards", "list", "editorial"].includes(input.componentStyles?.catalog) ? input.componentStyles.catalog : "cards",
      buttons: ["pill", "rounded", "square"].includes(input.componentStyles?.buttons) ? input.componentStyles.buttons : "pill"
    },
    sections,
    orderedSections,
    sectionContent: normalizeSectionContent(input.sectionContent),
    sectionStyles: normalizeSectionStyles(input.sectionStyles),
    products,
    integrations,
    orderEnabled,
    pageRoutes: getNichePages(template).map(({ slug, label, title, type }) => ({ slug, label, title, type })),
    navigation: getNicheNavigation(template)
  };
}

export function makeIntegrationPlan(config) {
  const lines = [
    `# Integration plan — ${config.brand.name}`,
    "",
    `Starter: ${config.templateLabel}`,
    `Project slug: ${config.slug}`,
    "",
    "Selections below are setup requirements, not live connections. Approved public hosted URLs may be shown as links; never enter private API endpoints or credentials here. Add credentials only in a private local .env file or your hosting provider's secret manager.",
    "",
    "| Area | Selected tool | Status | Approved public link | Notes |",
    "|---|---|---|---|---|"
  ];
  for (const [key, item] of Object.entries(config.integrations)) {
    lines.push(`| ${key} | ${item.provider.replaceAll("|", "\\|")} | ${item.provider === "Not selected" ? "Not selected" : "Planned — credentials/setup required"} | ${item.publicUrl || "—"} | ${item.notes.replaceAll("|", "\\|")} |`);
  }
  lines.push(
    "",
    "## Before launch",
    "",
    "- [ ] Confirm provider accounts, ownership and approval with the client.",
    "- [ ] Obtain API documentation and credentials from the client/provider.",
    "- [ ] Add secrets to local `.env.local` or the deployment secret manager; never commit secrets.",
    "- [ ] Implement and test the provider adapter and webhook verification where applicable.",
    "- [ ] Test success, failure, duplicate, cancellation and refund paths as appropriate.",
    "- [ ] Confirm privacy, retention, consent, tax and consumer-protection requirements.",
    "",
    "## Environment variable placeholders",
    "",
    "See `.env.client.example`. These are placeholders only; provider-specific names may differ.",
    ""
  );
  return lines.join("\n");
}

export function makeClientReadme(config) {
  const primaryCatalogRoute = ["furniture", "ecommerce", "grocery"].includes(config.template) ? "shop" : "menu";
  return `# ${config.brand.name} — Client Website

Generated by FrontendForge Universal White-Label Engine from the **${config.templateLabel}** starter.

## Run locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000.

## Generated customer routes

- \`/\` — branded homepage
- \`/${primaryCatalogRoute}\` — product catalog or food menu
- \`/about\`, \`/contact\`, \`/faq\` — business information and customer support
- \`/products/[slug]\` — data-driven product or menu item detail pages
- \`/collections\` and \`/collections/[slug]\` — collection and category browsing where supported
- \`/delivery\`, \`/visit\`, \`/reservations\`, \`/shipping-returns\` or \`/care-guide\` — niche-specific pages when relevant
- \`/cart\` and \`/checkout\` — persistent cart and customer enquiry flow where supported
- \`/order\` and \`/order/${config.slug}\` — ordering handoff when enabled

Only pages relevant to the selected niche are generated. Master demo routes and Studio-only routes are excluded. All generated pages use the same client configuration, navigation, theme and business data.

## Edit this client website locally

Run \`npm run dev\` and open \`http://localhost:3000/studio\`. The local Client Website Editor lets you update brand copy, logo and hero images, palette, typography, layout styles, contact information, business hours, currency, delivery fee and products. Saving writes to \`src/config/client-project.json\`. The editor and API are local-development-only and are disabled in production.

Use the image upload controls (JPG, PNG, WebP or AVIF; maximum 8 MB) or place image files inside \`public/\` and use paths such as \`/images/hero.webp\`. Uploaded assets are stored in \`public/images/client-assets/\`.

## Client configuration

Edit \`src/config/client-project.json\` to update:
- Brand name, logo, tagline, description and images
- Primary, secondary, background, surface, text, muted and accent colors
- Typography and reusable header, hero, catalog and button styles
- Selected page sections and their display order
- Products/menu items, prices, categories, options, descriptions and images
- Contact details, business address, hours, currency, locale and delivery fee
- Approved hosted integration links

Place local images inside \`public/\` and reference them with paths such as \`/images/hero.webp\`. Remote images should use approved HTTPS URLs.

## Ordering, database and integrations

${config.orderEnabled ? `The ordering experience is enabled at \`/order/${config.slug}\`. It prepares a WhatsApp order message; it does not process payments or persist orders on a server until you configure the database order endpoint.` : "Ordering is not enabled. Implement the client's approved ordering provider before accepting live orders."}

The project includes a Supabase/Postgres schema, public catalog/order API routes and a secured \`/admin\` workspace. These are deployment scaffolding until you create the Supabase project, apply the migrations and configure server environment variables.

- Follow \`docs/DATABASE-SETUP.md\` to provision the store, owner account, RLS and API credentials.
- Apply \`supabase/migrations/0001_store_platform.sql\` then \`0002_order_permissions.sql\` in the Supabase SQL editor.
- Copy \`.env.client.example\` to \`.env.local\`; keep \`SUPABASE_SERVICE_ROLE_KEY\` server-side only.
- Use \`/admin\` for authenticated product, inventory, order and store-profile operations after setup.

See \`docs/INTEGRATION-PLAN.md\`. Provider selections are setup requirements, not live connections. Do not put private API keys in browser code or this JSON file.

## Browser QA

Install Playwright browser tests with \`npm run install:e2e\`, then run \`npm run test:e2e\`. Desktop and mobile tests cover the homepage, navigation anchors, product details, ordering route when enabled, cart/enquiry actions and mobile horizontal overflow. Browser tests require Chromium.

## Before deployment

1. Replace sample copy, images, product data, prices, phone numbers, addresses and hours with client-approved information.
2. Confirm image licenses, image paths and accessible alt text.
3. Test every navigation link, product detail route, form and action.
4. Test cart/order handoff and all selected provider integrations end to end.
5. Test keyboard navigation, focus visibility, color contrast and mobile layouts.
6. Run \`npm run audit:client\`, \`npm run test:e2e\` and \`npm run build\`; complete \`docs/CLIENT-QA-CHECKLIST.md\`.
7. Add legal pages, privacy information, analytics and domain settings as agreed with the client.

`;
}

export function makeClientHandoverDoc(config) {
  return `# ${config.brand.name} — Project Handover Package

Generated: ${new Date().toISOString().split("T")[0]}
Starter: **${config.templateLabel}** (v${config.starterVersion || "3.2.0"})
Project slug: \`${config.slug}\`

---

## 1. Executive Summary & Deliverables

This website was built for **${config.brand.name}** as an independent application. It contains all client-configured branding, color tokens, responsive page sections, catalog data, and operational integration handoffs.

### Key Deliverables:
- Standalone Next.js application codebase with no dependencies on the master builder.
- Configured client theme using the client's brand palette (\`${config.theme.primary}\` / \`${config.theme.secondary}\`).
- Product/Menu catalog containing ${config.products.length} sample/configured item(s); client approval is required before publication.
- Pre-flight automated quality audit and verification report.
- Setup documentation for hosting, domains, and provider credentials.
- Local-only Client Website Editor for brand, theme, content and catalog updates.
- Desktop/mobile browser QA scaffold and release/handover instructions.

---

## 2. Brand & Asset Configuration

All editable brand information is centralized in:
\`\`\`text
src/config/client-project.json
\`\`\`

| Field | Configured Value |
|---|---|
| Business Name | ${config.brand.name} |
| Tagline | ${config.brand.tagline || "—"} |
| Primary Color | \`${config.theme.primary}\` |
| Typography | ${config.font} |
| Phone | ${config.contact.phone || "—"} |
| WhatsApp | ${config.contact.whatsapp || "—"} |
| Email | ${config.contact.email || "—"} |
| Address | ${config.business.address || "—"} |
| Currency | ${config.business.currency} |

---

## 3. Operational Integrations

See \`docs/INTEGRATION-PLAN.md\` for the full integration checklist.
- Ordering status: ${config.orderEnabled ? "WhatsApp Order Handoff enabled" : "Not enabled / Link-out only"}
- Environment configuration: Copy \`.env.client.example\` to \`.env.local\` to store server credentials securely.

---

## 4. Pre-Launch Quality & Verification Sign-Off

Run the client audit suite, browser QA and production build before launch:
\`\`\`bash
npm run audit:client
npm run test:e2e
npm run build
\`\`\`

The /studio editor is local-development-only and must not be exposed as a production admin interface.

Verify all items in \`docs/CLIENT-QA-CHECKLIST.md\`:
- [ ] Brand name, logo, and favicon checked.
- [ ] All placeholder text replaced with client-verified copy.
- [ ] Contact numbers and WhatsApp links tested on real devices.
- [ ] Catalog prices, currencies, and descriptions signed off by client.
- [ ] Responsive navigation and contrast verified at mobile and desktop sizes.
- [ ] Production build succeeds without warnings or console errors.
`;
}
