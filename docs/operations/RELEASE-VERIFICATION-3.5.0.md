# FrontendForge Studio 3.5.0 — Multi-page website generation release verification

Release date: 19 November 2026

## What changed

- Added a niche-specific page registry for cafe, restaurant, food delivery, furniture, ecommerce and grocery.
- Generated client projects now receive separate Next.js routes for each essential page defined by their starter.
- Updated homepage, shared page shell, footer, food menu and food ordering headers to use real multi-page navigation.
- Added collection index and category-detail routes for furniture, ecommerce and grocery.
- Added data-driven product detail routes for all six niches. Furniture uses its variant-aware product detail; food product details support sizes/add-ons and share the menu/order cart; general retail uses a common product detail/cart component.
- Kept client-specific cart keys consistent across listing, product detail, cart and checkout flows.
- Added Playwright tests that visit every configured niche page, open collection routes, test product detail pages and exercise food/furniture ordering handoffs.
- Regenerated six independent branded demo clients and six handover packages.

## Essential page map

| Starter | Main pages | Functional routes |
|---|---|---|
| Cafe & bakery | Home, Menu, About, Visit, Reservations, Catering, Contact, FAQs | Food product details and `/order/[slug]` when ordering is enabled |
| Restaurant | Home, Menu, About, Reservations, Delivery, Visit, Contact, FAQs | Food product details and `/order/[slug]` when ordering is enabled |
| Food delivery | Home, Menu, Delivery, How to Order, About, Contact, FAQs | Food product details and `/order/[slug]` when ordering is enabled |
| Furniture | Home, Shop, Collections, Collection Detail, Product Detail, Showroom, Delivery, Care Guide, About, Contact, FAQs | Variant-aware product pages, shared enquiry bag and `/checkout` |
| Ecommerce | Home, Shop, Collections, Collection Detail, Product Detail, Shipping & Returns, About, Contact, FAQs | Product detail, persistent cart and checkout |
| Grocery | Home, Shop, Departments, Collection Detail, Product Detail, Delivery, About, Contact, FAQs | Product detail, persistent cart and checkout |

## Automated checks completed

| Check | Result |
|---|---:|
| `npm run test:all` | PASS — 89 tests, 0 failures |
| Project structure | PASS — 96 required files |
| SQL migration structure | PASS — 12 requirements across 2 migrations |
| Six generated client audits | PASS — 6/6, zero warnings |
| Client handover packaging | PASS — 6/6, 22 audit checks per client, zero warnings |
| TypeScript parser syntax scan | PASS — 671 JavaScript/JSX-family files, zero syntax diagnostics |

## Checks not completed in this environment

### Next.js production build

`npm run build` returned `next: not found`. A subsequent `npm ci --prefer-offline --no-audit --no-fund` attempt timed out while accessing the package registry. Production compilation is therefore **not verified** for this release.

### Playwright browser tests

The Playwright package and Chromium binaries were unavailable because dependency installation did not complete. The desktop/mobile tests have been added but were not executed here.

### Live integrations

No live booking, delivery, inventory, email, WhatsApp API or Supabase provider accounts were connected. Booking, catering, contact and order forms are enquiry handoffs unless separately connected to a live provider.

## Release guidance

This is a tested multi-page development release: unit/generator, SQL structure, client release audits, handover packages and source syntax checks passed. It is not a production-certified build until `npm ci`, `npm run build`, all client builds and Playwright desktop/mobile tests pass on a machine with registry access and browser binaries. Replace all demonstration copy, images, prices, business hours, address, contact and policy placeholders with approved client data before launch.
