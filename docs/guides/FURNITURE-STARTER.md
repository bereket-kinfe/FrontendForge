# Furniture & home store starter

Open `/templates/furniture` to preview the Beetle Pro-inspired furniture website.

## Included sections

- Sticky header and responsive navigation
- Editorial hero featuring the signature lounge chair
- Four brand/service benefits
- Shop-by-room category tiles
- Featured product catalog with category filters
- Local enquiry bag with quantity controls and estimated subtotal
- WhatsApp enquiry message for the selected products
- Room inspiration, brand story and showroom contact
- Responsive mobile layouts and visible keyboard focus states

## Customize before a client launch

Edit `src/app/templates/furniture/page.js` and `src/components/furniture/FurnitureExperience.js`:

- Replace the temporary Beetle Pro brand name and logo wordmark
- Replace sample product names, specifications, prices and categories
- Replace the sample WhatsApp number `251911123456`
- Replace the example email, showroom address and opening hours
- Replace all reference-derived demonstration photos with client-owned or properly licensed product and interior photographs
- Confirm product dimensions, materials, warranty, stock and delivery information
- Add product detail pages, secure checkout, payment provider and inventory API only when the client approves the required services

## Enquiry bag behavior

The enquiry bag is client-side state. It creates a prefilled WhatsApp message and does not create a server-side order, reserve stock, process payment or guarantee availability. The shop must confirm the enquiry manually.

## Before delivery

Run `npm run check:structure`, `npm test`, and `npm run build`. Manually test every anchor, product filter, quantity button, WhatsApp link, keyboard interaction, narrow mobile viewport and tablet layout.
