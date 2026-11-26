# Beetle Pro furniture commerce starter

## Routes
- `/templates/furniture` — storefront and product collection
- `/templates/furniture/products/mira-chair` (and the other catalog slugs) — product detail and variants
- `/templates/furniture/checkout` — customer and delivery enquiry form; submits a prefilled WhatsApp message
- `/templates/furniture/admin` — local demo product and stock editor

## Features
- Product detail pages with image gallery, material, finish/color, size and quantity selections
- Persistent browser cart; separate cart lines for different variants
- Wishlist with a Saved items filter
- Category filtering and sample stock availability display
- Customer name, phone, email, city, address, fulfilment and notes on enquiry checkout
- WhatsApp enquiry message with line items, selected variants and subtotal
- Demo catalog editor for sample price, stock and visibility values

## Customize the catalog
Edit `src/config/furniture-products.js`. Replace all demonstration products, ETB prices, specifications, stock counts and local image paths with client-approved details. Update the WhatsApp destination in `src/components/furniture/FurnitureCheckout.js` and `src/app/templates/furniture/page.js`.

## Important production boundary
The `/admin` route is intentionally a local prototype. It stores edits in browser `localStorage`; it has no authentication, shared database, server-side stock locking, audit trail or role permissions. Do not expose it as a real client admin. Production inventory requires an authenticated server-side admin, database, validation and concurrency-safe stock updates.

The enquiry checkout does not collect payment. It opens WhatsApp with a prefilled message; the customer must send it and the business must confirm availability, pricing and delivery. No payment gateway is included.

## Local checks
Run `npm test`, `npm run check:structure`, `npm run build`, then `npm start`. Test all product routes, mobile breakpoints, keyboard focus, cart persistence and the WhatsApp destination before publishing.
