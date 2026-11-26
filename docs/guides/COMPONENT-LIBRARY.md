# Shared component library

The shared components live in `src/components/` and are used across the starter pages.

## UI components

- `Container` — consistent max-width and horizontal spacing.
- `Button` — link/button styles with primary, secondary, outline and light variants.
- `Badge` — compact category or status label.
- `Card` — common content surface.
- `SectionHeading` — eyebrow, heading and supporting copy.
- `ProductCard` — optimized product image, product details, price and add action.
- `MenuItem` — optimized food photo, menu details and add action.
- `AddToCartButton` — saves a demo item in browser localStorage.
- `CartSummary` — displays demo cart count, items and subtotal; no checkout/payment.
- `CategoryPills` — selectable category controls.
- `Price` — reusable amount and unit display.
- `FeatureCard` — service/feature content block.
- `StatCard` — number and label display.
- `TestimonialCard` — testimonial layout; use only genuine, approved quotes.
- `PromoBanner` — promotional section with CTA.
- `FAQItem` — accessible details/summary accordion item.
- `FormField` — labeled input with optional hint and required state.
- `Notice` — informational, warning or success note.
- `Breadcrumbs` — small page hierarchy navigation.
- `BusinessHours` — day/hour list.
- `ImageWithCaption` — optimized editorial image and caption.

## Site components

- `SiteHeader` — responsive navigation, CTA and optional demo cart.
- `SiteFooter` — reusable footer and contact summary.
- `WhatsAppCTA` — WhatsApp deep link using `NEXT_PUBLIC_WHATSAPP_NUMBER`.

To activate the WhatsApp component in a client copy, duplicate `.env.example` as `.env.local`, set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the business number with country code and digits only, and restart the dev server. Example usage:

```jsx
import WhatsAppCTA from "@/components/site/WhatsAppCTA";

<WhatsAppCTA message="Hello, I would like to place an order." />
```

## Usage

```jsx
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

<Container>
  <SectionHeading eyebrow="Our story" title="Good food, made with care" />
  <Button href="#contact">Contact us</Button>
</Container>
```

## Guidelines for adding components

- Keep components focused and composable.
- Prefer semantic HTML (`header`, `nav`, `main`, `section`, `article`, `footer`).
- Keep content and client branding in the page/config layer, not hardcoded inside generic UI elements.
- Add keyboard focus states and useful accessible labels.
- Document new props and provide a small usage example.
- Avoid adding dependencies for tiny UI needs.
