# Demo image notes

The coffee-shop starter stores replaceable image paths in `src/config/coffee-shop.js`. The primary hero photograph is bundled locally as an optimized WebP at `public/images/machi-hero-coffee.webp`, so the top of the homepage does not depend on a third-party image host. The other demonstration photographs currently use remote Unsplash URLs. Before a paid client launch, replace all demo assets with client-approved photography or assets whose usage rights are confirmed for the project.

Reference pages for two of the current example photographs:

- [Coffee with latte art and iced coffee drinks — Kun Liu on Unsplash](https://unsplash.com/photos/coffee-with-latte-art-and-iced-coffee-drinks-FqaicVZBMBo)
- [Iced matcha latte on wooden table — Olena Bohovyk on Unsplash](https://unsplash.com/photos/iced-matcha-latte-on-wooden-table-N1rmKN_EOaA)

For other demo photographs, check the corresponding source URL before production use. Do not assume a remote image is safe for commercial reuse merely because it loads in the browser.


## Local hero asset

- `public/images/machi-hero-coffee.webp` — generated demonstration product photograph showing iced cold brew and a creamy iced latte against a bright blue background.
- The corresponding config value is `/images/machi-hero-coffee.webp`.
- Replace the local file with the client's approved hero photograph (keep the path) or change `heroImage` to another local public asset.
