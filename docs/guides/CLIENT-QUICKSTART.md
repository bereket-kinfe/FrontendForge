# FrontendForge client quick-start builder

The root (`/`) dashboard is the FrontendForge Studio entry point and provides a functional local client-project builder. It creates a clean new directory for each client and applies a JSON-driven brand configuration.

## 1. Start FrontendForge locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The legacy `/forge` path redirects to the root Studio. Project-copy generation is intentionally available only from the local development server. A deployed serverless instance generally cannot create durable folders on your computer.

## 2. Select the closest full website starter

The starter library contains complete designed multi-section website routes, not just component samples. See `docs/STARTER-CATALOG.md` for the full feature inventory:

| Client | Preview route | Included page structure |
|---|---|---|
| Ecommerce | `/templates/ecommerce` | Brand header, editorial hero, collections, product grid, story and contact |
| Restaurant | `/templates/restaurant` | Photo hero, story, menu highlights, visit details and reservation CTA |
| Cafe / bakery | `/templates/cafe` | MACHI-style hero, drinks, story, lifestyle imagery, visit section and ordering CTA |
| Food delivery | `/templates/food-delivery` | Food hero, menu categories, product cards, cart interactions and delivery messaging |
| Grocery | `/templates/grocery` | Market hero, categories, product cards, store promise and contact |

Use **Preview full site** to inspect a starter in a new tab, then select it in the builder.

## 3. Make a new copy of the master for the client

In the builder, complete the five stages and select **Create separate client project**. Forge copies the master source into:

```text
client-projects/<client-slug>/
```

The master project is not overwritten. A duplicate slug is rejected rather than replacing an existing client project. The copy excludes `node_modules`, `.next`, `.git`, existing client copies and private local environment files.

After successful creation, open that new directory in VS Code and run:

```bash
npm install
npm run dev
```

Each client should have its own folder and Git repository.

## 4. Replace brand, colors, content and photos

The builder captures:

- Business name, project slug, tagline and description
- Logo path / URL and hero photo path / URL
- Gallery photo paths / URLs
- Phone, WhatsApp, email and website
- Verified address, business hours, currency, locale and delivery fee
- Seven brand colors and typography preference
- Component styles for header, hero, catalog and buttons
- Product / menu rows with prices, sizes, add-ons and optional image paths

The generated configuration is `src/config/client-project.json`. Add local image files into the copied project's `public/` folder and reference them with a path such as `/images/client-hero.webp`. Use only client-owned or properly licensed images. For external assets, use approved HTTPS URLs.

### Catalog line format

One row per product:

```text
Name | Category | Description | Price | Size:extra price,Size:extra price | Add-on:extra price,Add-on:extra price | /images/product.webp
```

Example:

```text
Iced Latte | Coffee | Espresso and milk over ice. | 180 | Regular:0,Large:45 | Oat milk:30,Extra shot:35 | /images/iced-latte.webp
```

The image path and add-ons are optional. Prices and all business information must be confirmed by the client.

## 5. Select reusable sections and component styles

The builder allows these page sections to be toggled: header, hero, catalog/menu, about, gallery, testimonials, FAQ, location, booking CTA, contact and footer. Header, hero and footer remain enabled for a usable site shell.

Component layout options:

- Header: standard, centered or bold brand bar
- Hero: split, centered or photo-led
- Catalog: cards, compact list or editorial cards
- Buttons: pill, rounded or square

The generated copy uses the selected component styles and color system on its client homepage. The original complete starter pages remain available under `/templates/...` for reference or further development.

## 6. Select the client's operational tools

The builder records selected booking, ordering, payment, delivery, inventory and contact providers in `docs/INTEGRATION-PLAN.md`, plus placeholder environment-variable names in `.env.client.example`.

A selected provider is marked **planned**, not connected. Live API integrations require the client's approval, provider account, API documentation, private credentials, server-side implementation and end-to-end testing. Never paste secrets into the builder or commit them to Git.

The builder field is specifically for an **approved customer-facing public URL**, not an API endpoint. Forge can surface a hosted booking, ordering, payment, delivery or support page as an external link on the generated site. A static payment URL is only a link to the provider's hosted page: it does not automatically pass a cart total, create an order, verify payment or update inventory. Those workflows need the provider's supported checkout/API integration.

When an ordering provider is selected and catalog items exist, the generated copy includes `/order/<client-slug>` using the shared FrontendForge food-ordering UI. That demo supports variant/add-on pricing, persistent browser cart, pickup/delivery choice and a WhatsApp order handoff. It does not process online payments or persist orders on a server.

## 7. Test and launch

Use `docs/CLIENT-SETUP.md`, `docs/INTEGRATION-PLAN.md` and `docs/LAUNCH-CHECKLIST.md` in every copy. Test:

- Every link, navigation item, CTA, form and phone / email / WhatsApp action
- All catalog categories, product variants, add-ons, cart updates and order summaries
- Booking, payment, delivery, inventory and contact flows with provider sandbox / test credentials
- Mobile, tablet and desktop breakpoints
- Keyboard-only navigation, focus visibility, labels, alt text, color contrast and reduced motion
- Console errors, image loading, metadata and broken routes
- `npm run check:structure`, `npm test` and `npm run build`

Protect the Studio root (`/`), `/components` and `/docs` routes before a public launch, unless the client has explicitly commissioned those pages.

## Important boundaries

- Project folder generation is a local development workflow, not a cloud deployment service.
- Copying a selected provider into the integration plan does not connect the provider.
- The default generated homepage is a customizable branded site driven by `src/config/client-project.json`; the selected complete starter route remains in the copy for its richer reference layout.
- Confirm business copy, claims, menu data, pricing, opening hours, delivery charges, policies and imagery with the client before launch.
