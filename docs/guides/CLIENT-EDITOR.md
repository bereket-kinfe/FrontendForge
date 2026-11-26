# Local client website editor

Every newly generated client project includes a local editor at `/studio`.

## Open it

```bash
cd client-projects/<client-slug>
npm install
npm run dev
```

Open `http://localhost:3000/studio`.

## What can be changed

- Brand name, tagline, description, logo path, hero image and gallery images
- Seven design tokens: primary, secondary, background, surface, text, muted and accent
- Typography and reusable header, hero, catalog and button styles
- Address, opening hours, currency, delivery fee, phone, WhatsApp, email and website
- Product/menu name, category, description, price, image, alt text, materials, dimensions and availability

The editor preserves the project's template, folder slug, integrations and ordering configuration. It cannot silently convert one type of business into another or edit private provider credentials.

## Save behavior

Saving writes to `src/config/client-project.json` on disk using a temporary file followed by an atomic rename. The client storefront reads this configuration when rendering. Keep product images in `public/` and reference them with local paths like `/images/sofa.webp`.

## Security boundary

This file editor and its API are development-only. The `/studio` page is hidden in production and the API rejects production and non-loopback requests. It is not a secure public admin dashboard. For client production, edit the JSON in a controlled deployment workflow or implement authenticated server-side administration backed by a database.
