# Brand and theme customization

Each starter has a root class that defines its own palette tokens in `src/app/globals.css`:

| Starter | Root class | Default primary | Default accent |
|---|---|---|---|
| Ecommerce | `.shop-site` | `#24272b` | `#8e6c54` |
| Restaurant | `.restaurant-site` | `#d9b77f` | `#947346` |
| Cafe | `.cafe-site` | `#79513b` | `#9b6747` |
| Food delivery | `.delivery-site` | `#e15b43` | `#e15c43` |
| Grocery | `.grocery-site` | `#2f6549` | `#4f885d` |

For a new client's brand, find the matching root-class rule near the corresponding template section in `globals.css` and change:

```css
--brand-primary: #2f6549;
--brand-accent: #4f885d;
--brand-surface: #fbfaf6;
--brand-text: #1d3025;
```

Then update any section-specific colors that are intentionally different (such as a dark menu band or photo overlay). Preview at mobile and desktop sizes after changing colors. Check text contrast before delivery.

Keep one master palette per template. For clients who need a different identity, override tokens in the client-specific copy rather than changing the master project.
