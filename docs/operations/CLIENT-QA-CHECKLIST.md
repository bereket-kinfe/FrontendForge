# Client website QA checklist

Complete this checklist for every generated client copy. Mark each item only after physically testing it.

## Content and branding
- [ ] Brand name, logo, favicon, colors, font and metadata match the approved brand pack.
- [ ] Hero, product, gallery and social images are client-owned or licensed, load successfully and have descriptive alt text.
- [ ] Product/menu names, categories, descriptions, sizes, add-ons, prices, currency and availability match the approved source.
- [ ] Business address, map/directions URL, phone, email, WhatsApp, opening hours and delivery charges are verified.
- [ ] No sample testimonials, placeholder copy, fake scarcity, unsupported quality claims or demo contact details remain.

## Links and navigation
- [ ] Header, footer, anchors, breadcrumbs, cards and calls to action all lead to the intended destination.
- [ ] Phone links open the dialer and email links open a mail client.
- [ ] WhatsApp links use the correct business number and a readable prefilled message.
- [ ] External links open safely and point to the client's approved accounts.
- [ ] No broken internal routes, 404 pages, empty hrefs or console errors remain.

## Forms and ordering
- [ ] Required fields show browser validation and labels are associated with their fields.
- [ ] Contact form creates the correct WhatsApp or email draft and the customer can review it before sending.
- [ ] Product category filters show the expected products.
- [ ] Size and add-on price changes calculate correctly.
- [ ] Add-to-cart, quantity increase/decrease, item removal, empty-cart and subtotal behavior work.
- [ ] Delivery fee appears only for delivery; pickup does not include a delivery fee.
- [ ] Customer details and order notes appear correctly in the order message.
- [ ] WhatsApp opens the correct business chat. The customer must press Send; a prepared message is not a confirmed order.
- [ ] Payment, delivery, inventory, booking and CRM sandbox flows have been tested with approved provider test accounts.

## Responsive and accessibility
- [ ] Test at 360px, 390px, 768px, 1024px and 1440px viewport widths.
- [ ] No horizontal overflow, clipped text, overlapping buttons or unusable mobile navigation.
- [ ] All interactive controls can be reached and used with a keyboard.
- [ ] Focus states are visible and logical.
- [ ] Color contrast is adequate; headings and landmarks are in a sensible order.
- [ ] Images have appropriate alt text; decorative images do not create redundant screen-reader output.
- [ ] Form errors and success/feedback messages are understandable and announced.
- [ ] Reduced-motion preference is respected for motion effects.

## Automated checks and production build

Run these commands from the client project folder:

```bash
npm run check:structure
npm test
npm run build
npm run start
```

- [ ] Structure check passes.
- [ ] All unit tests pass.
- [ ] Production build completes without errors.
- [ ] Production server starts and the home, catalog, contact and ordering routes load.
- [ ] Run Lighthouse or another agreed audit on key pages and record the results.
- [ ] Confirm metadata, social preview, robots/indexing, analytics consent and legal pages as scoped.

## Handover
- [ ] Client owns or has access to domain, hosting, source repository, analytics and provider accounts as agreed.
- [ ] No secrets are committed to source control.
- [ ] Client has instructions for editing products/menu items, opening hours and contact details.
- [ ] Backup and post-launch support responsibilities are documented.
