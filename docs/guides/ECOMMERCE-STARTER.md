# Ecommerce starter

The ecommerce starter is available in the master gallery at `/templates/ecommerce` and in the client generator as `ecommerce`.

## Included generated-store features
- Product cards driven by the client's `client-project.json` catalog.
- Category filtering and case-insensitive product search.
- Browser-persisted shopping bag with add, increment, decrement and remove behavior.
- Browser-persisted wishlist.
- Subtotal calculation and quantity count.
- Product detail routes at `/products/<product-slug>`.
- WhatsApp order enquiry when a business WhatsApp/phone number is supplied; otherwise an email enquiry fallback.
- Brand logo, typography, theme colors, hero image, business details and contact information from client configuration.
- Responsive product grid, toolbar, category filters and cart layout.

## Client setup
1. Select **Ecommerce storefront** in Forge.
2. Set the client brand name and unique project slug.
3. Replace logo and approved hero/gallery photos.
4. Add real product names, descriptions, category, prices and image URLs.
5. Confirm currency, locale, contact email and WhatsApp number.
6. Generate a client copy and test the product search, filters, wishlist, cart and enquiry handoff.

## Production boundary
The cart and wishlist use browser local storage. Order enquiry hands the selected items to WhatsApp or email; it does not reserve stock, create a server-side order, process payments or synchronize inventory. Add an authenticated backend and database before promising those capabilities to a client. Payment gateway integration is intentionally not included in this build.
