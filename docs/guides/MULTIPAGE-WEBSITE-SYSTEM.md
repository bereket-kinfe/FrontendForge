# Multi-page website generation

FrontendForge generates a niche-specific set of real Next.js routes for every client project. The page registry is maintained in `src/lib/forge/niche-pages.mjs`; the generated app uses the selected starter and client configuration to resolve those routes.

## Essential pages by niche

| Starter | Core pages | Additional functional routes |
|---|---|---|
| Cafe & bakery | Home, Menu, About, Visit, Reservations, Catering, Contact, FAQs | `/order`, `/order/[slug]` when ordering is enabled |
| Restaurant | Home, Menu, About, Reservations, Delivery & Pickup, Visit, Contact, FAQs | `/order`, `/order/[slug]` when ordering is enabled |
| Food delivery | Home, Menu, Delivery, How to Order, About, Contact, FAQs | `/order`, `/order/[slug]` when ordering is enabled |
| Furniture | Home, Shop, Collections, Collection Detail, Product Detail, Showroom, Delivery, Care Guide, About, Contact, FAQs | `/cart`, `/checkout`, `/products/[slug]` |
| Ecommerce | Home, Shop, Collections, Collection Detail, Product Detail, Shipping & Returns, About, Contact, FAQs | `/cart`, `/checkout`, `/products/[slug]` |
| Grocery | Home, Shop, Departments, Collection Detail, Product Detail, Delivery, About, Contact, FAQs | `/cart`, `/checkout`, `/products/[slug]` |

## How route generation works

- `getNichePages(template)` provides the authoritative page definitions and copy metadata.
- `getNicheNavigation(template)` creates the primary navigation for the selected starter.
- `normalizeForgePayload()` stores `pageRoutes` and `navigation` in the client configuration.
- `createClientProjectCopy()` writes the Next.js App Router routes into a separate client project.
- `src/app/[page]/page.js` resolves niche-specific top-level pages against the registry and returns a 404 for unsupported slugs.
- `/collections` and `/collections/[slug]` are generated only for catalog starters that support collections.
- Product detail pages are generated from the client's catalog. Furniture uses its furniture-specific variant experience; other retail starters use the shared product detail/cart component.
- Food menu and order routes use the food ordering experience. The generated food header receives the full niche navigation, not only in-page anchors.

## Functional flows

### Furniture

`/shop` or `/collections/[slug]` → `/products/[slug]` → shared persistent enquiry bag → `/checkout` → WhatsApp/email enquiry. Product variants are stored as distinct cart lines. The master and generated client routes use the same furniture cart key for that client slug.

### Ecommerce and grocery

`/shop` or `/collections/[slug]` → `/products/[slug]` → `/cart` → `/checkout` → WhatsApp/email enquiry. Catalog, product detail and checkout use the same client-specific browser cart key.

### Cafe, restaurant and food delivery

`/menu` and `/order/[slug]` share the same food ordering experience and client-specific food cart. Reservation, catering, delivery, visit, about, FAQ and contact routes are separate pages. Booking/ordering messages are enquiries; they do not confirm a reservation or process payment.

## Add or change niche pages

1. Edit the appropriate starter array in `src/lib/forge/niche-pages.mjs`.
2. Add the rendering branch in `src/components/client/ClientMultiPage.js` (or an appropriate shared feature component).
3. Add the slug to the `requiredByTemplate` map in `scripts/audit-client.mjs` if it is an essential page.
4. Add a route-generation assertion in `tests/multipage-routes.test.mjs`.
5. Keep primary navigation in `getNicheNavigation()` aligned with the actual pages.
6. Regenerate demo clients and run `npm run test:all`.

## Client data and safety

Page copy includes starter wording and placeholders. Before launch, replace sample contact details, business hours, policies, delivery regions, catalog data and imagery with client-approved information. Confirm every public route, external provider URL, form destination and order handoff. Payment processing and persistent order fulfillment require separately commissioned provider/backend integrations.

## Validation

Use the following commands from the master project:

```bash
npm run check:structure
npm run test:all
npm run test:e2e
npm run test:clients:e2e
npm run build
npm run build:clients
```

The Playwright tests load every configured niche page, verify the branded shell, open collection routes where supported, test the first product detail page and exercise the commerce/furniture cart paths. Browser tests require the Playwright package and installed Chromium browser.
