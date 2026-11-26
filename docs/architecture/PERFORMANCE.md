# Performance toolkit and practical optimization process

This starter uses Next.js App Router and `next/image` for the product, menu and editorial images. The remote image host `images.unsplash.com` is explicitly allowed in `next.config.mjs` for sample content.

## Performance practices already used

- Next.js App Router pages are server components by default.
- Only the demo add-to-cart control and category filter need client-side state.
- Product/menu cards use responsive Next Image sizing.
- Below-the-fold Next Image components use the default lazy loading behavior.
- Large hero images use priority loading where appropriate.
- CSS includes responsive breakpoints and reduced-motion support.
- UI is shared instead of duplicating markup across starter pages.

## Before production

1. Replace sample remote images with client-approved images.
2. Store approved images in `public/images/` where appropriate and use local image imports or `/images/...` paths.
3. Crop and resize images close to their rendered dimensions; use WebP/AVIF where appropriate.
4. Keep only the hero image eager/priority; avoid marking every image as priority.
5. Remove unused sections, assets and dependencies from the client copy.
6. Keep most pages as server components; add `"use client"` only where browser state or events are necessary.
7. Run `npm run build` and test with Lighthouse on the deployed site.
8. Review LCP, INP and CLS using actual measurements. Do not promise a score or a fixed speed improvement before testing.

## Demo cart boundaries

`AddToCartButton` stores demo cart items in `localStorage` under a key per starter. It is only a UI prototype. A live shop needs server-side validation, inventory rules, secure checkout, payment confirmation, order storage and customer notification.
