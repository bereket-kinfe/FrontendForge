# Universal White-Label Engine

Every generated client project is an isolated copy of the master source, with a single normalized `client-project.json` configuration driving the public website.

## What is rebranded

- Brand name, logo, tagline, page description and business copy
- Primary, secondary, background, surface, text, muted and accent colors
- Selected font and reusable header, hero, catalog and button variants
- Hero and gallery images
- Business address, hours, currency, delivery fee and locale
- Product/menu catalog, categories, prices, options, images, materials and stock flags
- Selected sections and section order
- Approved public booking, ordering, payment, delivery and contact portals

## Generated routes

- `/` — complete branded multi-section storefront
- `/products/[slug]` — generated product detail page for each catalog item
- `/order` and `/order/[slug]` — ordering handoff when enabled

All product cards link to their generated product details. The selected starter identity and business type are retained in the client configuration. The generated site is a standalone copy; changes to the master after generation do not silently overwrite client work.

## Create a new client

Use the Forge Quick-Start wizard, choose a starter, set a unique slug, configure brand/theme/catalog/sections/integrations, and select Create Project. The local API copies the master project into `client-projects/<slug>` using a staging directory and excludes build output, dependencies, git history, existing client projects and private environment files.

## Important production boundaries

The builder can expose approved public hosted URLs and create frontend ordering/enquiry flows. It does not create merchant accounts, approve providers, provision API credentials, implement arbitrary third-party APIs, or make payment/inventory services live automatically. Those require provider documentation, client approval, secure server-side integration and end-to-end testing.

## Per-client validation

From a generated client directory:

```bash
npm install
npm run audit:client
npm run build
npm run start
```

Test all generated product pages, ordering handoff, forms, mobile breakpoints, keyboard navigation, image alt text, metadata, and real integration callbacks before delivery.
