# Coffee shop website — MACHI concept

The `/templates/cafe` route has been redesigned from the supplied reference image. It follows the reference's light cream canvas, sky-blue hero, pastel drink cards, editorial coffee story and lifestyle photography.

## Page sections

1. Hero — brand message, primary menu CTA and featured coffee photo.
2. Fan favorites — three drink cards with category labels and descriptions.
3. Our brew — story / preparation philosophy and three editable brand values.
4. Lifestyle — full-width campaign photo and store CTA.
5. Visit us — address, opening hours, email, phone and footer.

## Edit the content first

Open `src/config/coffee-shop.js`. This is the main content file for this template.

- `brand`: replace `machi` with the real shop name.
- `descriptor`: short brand descriptor shown above the hero.
- `email`, `phone`, `address`, `hours`: replace with verified details.
- `heroImage`, `storyImage`, `lifestyleImage`: replace with approved, licensed images.
- `drinks`: update drink names, descriptions, categories and image URLs.

Prices are intentionally not invented. Add actual sizes and prices only after confirming them with the business owner.

## Edit the visual style

Search for `MACHI coffee-shop concept` in `src/app/globals.css`. Start by adjusting these variables in `.machi-site`:

- `--machi-paper`: main cream background
- `--machi-ink`: main text color
- `--machi-blue`: hero sky blue
- `--machi-blue-deep`: blue accent
- `--machi-line`: divider color

The individual cards use `.machi-peach`, `.machi-sage` and `.machi-blue`.

## Before publishing for a real business

- Get approval for the final brand name, logo, colors and wording.
- Confirm menu products, sizes, allergens and prices.
- Replace sample photos with the owner's images or assets licensed for this project.
- Verify the address, opening hours, email and telephone number.
- Wire reservation / order links to a real destination (WhatsApp, phone, booking tool or backend).
- Test on mobile and desktop, then run `npm run build`.

The current page is a responsive marketing/menu frontend. It does not accept payment, submit live orders or manage inventory.

## Complete MACHI landing page update

The cafe starter now includes the complete landing-page flow:

1. Hero and primary calls to action
2. Four featured drink cards with sample ETB prices
3. Coffee story and brand values
4. Full-width lifestyle banner
5. Visit details, an illustrative map panel and social links
6. Shared site footer

All coffee photography used by this demo is stored locally in `public/images/` as WebP files. This avoids broken third-party image URLs during local development. The lower-page photographs are cropped demo visuals prepared from the approved visual reference; replace them with original, client-approved photography before a commercial launch.

Edit `src/config/coffee-shop.js` to update the brand, drinks, sample prices, contact details and image paths. The displayed ETB prices and opening hours are examples only. The map panel is decorative and is not a real map or verified location. Replace it with a real map embed or directions link once the client provides a confirmed address.
