# Reusable Food Business Ordering System

FrontendForge includes a config-driven online ordering storefront for cafes, restaurants, burger shops, bakeries and other food businesses.

## Demo storefronts

- `/order/machi` — MACHI coffee bar (blue / cream)
- `/order/buna-bowl` — BUNA BOWL Ethiopian kitchen (olive / sand)
- `/order/urban-bites` — URBAN BITES burger shop (tomato / warm cream)
- `/order/sugar-cloud` — sugar cloud bakery (rose / blush)
- `/order` — demo brand selector

Each storefront uses the same shared React components and ordering logic. Brand name, copy, colors, contact details, delivery fee, categories, products, sizes, add-ons and prices are defined in `src/config/food-businesses.js`.

## Create a new client brand

1. Open `src/config/food-businesses.js`.
2. Duplicate the closest business object.
3. Give it a unique `slug` using lowercase letters and hyphens.
4. Change the brand name, descriptor, tagline and intro.
5. Update `theme` colors (`background`, `surface`, `text`, `muted`, `primary`, `primaryText`, `accent`, `soft`, `line`, `hero`).
6. Replace the WhatsApp number, phone, email, address and opening hours with details confirmed by the client.
7. Set the currency and locale. Use ISO 4217 currency codes such as `ETB`, `USD`, `KES` or `EUR`.
8. Set an accurate delivery fee and available fulfillment methods.
9. Replace demo products with the client's real menu. Each product should have a unique `id`, `name`, `category`, `description`, numeric `price`, `emoji`, optional local `image`, `sizes` and `addons`.
10. Add the new object to `foodBusinesses`. The route is generated from this array; no new page component is needed.

## Product configuration example

```js
{
  id: "iced-latte",
  name: "Iced Latte",
  category: "Coffee",
  description: "Double espresso and chilled milk over ice.",
  price: 180,
  emoji: "🥤",
  image: "/images/iced-latte.webp",
  sizes: [
    { id: "regular", label: "Regular", price: 0 },
    { id: "large", label: "Large", price: 45 }
  ],
  addons: [
    { id: "extra-shot", label: "Extra espresso shot", price: 35 }
  ]
}
```

Use a unique `id` for every product, size and add-on. Product image paths should point to files inside `public/` (for example `/images/iced-latte.webp`). If no image is supplied, the emoji artwork is used.

## Ordering flow

- Customers filter categories and choose product sizes and add-ons.
- The system calculates each customized line price.
- Cart contents are persisted in browser local storage, separately for each brand.
- Customers can increment/decrement quantities or remove a line.
- Subtotal, delivery fee and order total are calculated in the browser.
- Checkout collects customer name, phone, fulfillment choice, delivery address (when needed), payment preference and optional note.
- The order is formatted into a WhatsApp message and opened in a new tab for the business to review and confirm.

## Production limitations and required integrations

This is a reusable frontend ordering system. It does not include a server-side order database, stock control, admin dashboard, customer accounts, payment processing, delivery tracking or automatic WhatsApp Business API dispatch.

The WhatsApp flow requires a valid business WhatsApp number in international format. The customer must review and press Send in WhatsApp. Do not tell customers an order is confirmed until the business confirms it.

For real online payments, connect a payment provider supported by the client's country and business account. Never collect or store card details in this frontend. For durable orders and an owner dashboard, connect a backend/database and validate price, products, delivery fee and availability on the server before accepting an order.

All prices, phone numbers, addresses, opening hours, delivery fees and menus in the included demo brands are sample content. Confirm and replace them before any client launch.
