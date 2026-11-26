import { STARTERS } from "./project.mjs";

// Starter identity, route and public label come from the generator registry.
// This file adds only the Studio-specific presentation and starter content.
export const starters = [
  {
    id: "ecommerce", number: "01", title: STARTERS.ecommerce.label, type: "Retail · Products",
    description: "A complete shop layout with editorial hero, collections, product cards, brand story and contact sections.",
    route: STARTERS.ecommerce.route, tag: "Shop", preview: "tone-violet",
    features: ["Product catalog", "Collection navigation", "Local demo cart", "Story & contact"]
  },
  {
    id: "restaurant", number: "02", title: STARTERS.restaurant.label, type: "Dining · Hospitality",
    description: "A hospitality-led website with photographic hero, menu highlights, story, visit information and reservation calls to action.",
    route: STARTERS.restaurant.route, tag: "Restaurant", preview: "tone-amber",
    features: ["Menu highlights", "Reservation CTA", "Location & hours", "Contact"]
  },
  {
    id: "cafe", number: "03", title: STARTERS.cafe.label, type: "Coffee · Bakery",
    description: "A bright cafe layout for drinks, pastries, brand storytelling, gallery photography and online ordering.",
    route: STARTERS.cafe.route, tag: "Cafe", preview: "tone-cafe",
    features: ["Drinks / pastry menu", "Brand story", "Lifestyle gallery", "Order online"]
  },
  {
    id: "foodDelivery", number: "04", title: STARTERS.foodDelivery.label, type: "Quick service · Takeaway",
    description: "A conversion-focused food menu starter with categories, product cards and an order-first structure.",
    route: STARTERS.foodDelivery.route, tag: "Food ordering", preview: "tone-red",
    features: ["Menu categories", "Add-to-cart demo", "Order CTA", "Delivery messaging"]
  },
  {
    id: "furniture", number: "05", title: STARTERS.furniture.label, type: "Home · Furniture · Decor",
    description: "A refined homeware storefront with room collections, featured furniture, product enquiry bag, brand story and showroom contact.",
    route: STARTERS.furniture.route, tag: "Furniture", preview: "tone-earth",
    features: ["Shop by room", "Furniture catalog", "WhatsApp enquiry bag", "Showroom & contact"]
  },
  {
    id: "grocery", number: "06", title: STARTERS.grocery.label, type: "Market · Fresh produce",
    description: "A fresh-market storefront with product categories, unit pricing, delivery messaging and store information.",
    route: STARTERS.grocery.route, tag: "Grocery", preview: "tone-green",
    features: ["Fresh product grid", "Category links", "Local demo cart", "Delivery / contact"]
  }
];

export const palettes = [
  { id: "machi", name: "Sky & cream", colors: { primary: "#08AEEA", secondary: "#E5F6FC", background: "#F6F3EC", surface: "#FFFFFF", text: "#17191A", muted: "#77786F", accent: "#E7F1D2" } },
  { id: "furniture", name: "Linen & olive", colors: { primary: "#58624F", secondary: "#E8E5DC", background: "#F5F3EE", surface: "#FFFEFA", text: "#202321", muted: "#77796F", accent: "#D9D5C8" } },
  { id: "earth", name: "Earth & olive", colors: { primary: "#587548", secondary: "#E8EDDF", background: "#F6F1E6", surface: "#FFFDF7", text: "#292B20", muted: "#737364", accent: "#E7D4A6" } },
  { id: "terracotta", name: "Terracotta", colors: { primary: "#D6533D", secondary: "#FFE9D8", background: "#FFF7EF", surface: "#FFFFFF", text: "#211B18", muted: "#776C65", accent: "#FFC95B" } },
  { id: "rose", name: "Rose & blush", colors: { primary: "#BD6E91", secondary: "#F9EAF1", background: "#FFF7F8", surface: "#FFFFFF", text: "#30232C", muted: "#82717D", accent: "#EFD8E5" } },
  { id: "midnight", name: "Midnight & lime", colors: { primary: "#B7D941", secondary: "#242B28", background: "#111815", surface: "#1B2520", text: "#F6F7EF", muted: "#B3BDAF", accent: "#DDF58C" } },
  { id: "ocean", name: "Ocean & sand", colors: { primary: "#176E83", secondary: "#D8E8E9", background: "#F4F1E9", surface: "#FFFFFF", text: "#18282D", muted: "#64767A", accent: "#E4CBA1" } }
];

export const sectionOptions = [
  ["header", "Site header & navigation", "Brand mark, navigation links and primary action"],
  ["hero", "Hero / main banner", "First impression, headline and primary call to action"],
  ["collections", "Shop by room / collections", "Categorized room collections or seasonal edits"],
  ["catalog", "Products / menu", "Product cards, menu items, descriptions and prices"],
  ["roomInspiration", "Room inspiration & story", "Editorial room scene and material qualities"],
  ["about", "About / brand story", "Business introduction and brand values"],
  ["gallery", "Photo gallery", "Additional product, interior or lifestyle photography"],
  ["testimonials", "Customer feedback", "A space for real client-approved reviews"],
  ["faq", "Frequently asked questions", "Common customer questions and answers"],
  ["location", "Location & business hours", "Address, hours, directions and visit details"],
  ["booking", "Booking / reservation CTA", "A call to the approved booking provider"],
  ["contact", "Contact section", "Phone, email and WhatsApp contact details"],
  ["footer", "Footer / legal links", "Brand signature and important site navigation"]
];

export const integrationOptions = [
  { id: "booking", title: "Booking & reservations", description: "Appointments, table bookings or reservation requests.", choices: ["Not selected", "WhatsApp / phone booking", "Calendly", "Setmore", "Custom booking backend"] },
  { id: "ordering", title: "Ordering & checkout", description: "Customer carts, order requests and order submission.", choices: ["Not selected", "FrontendForge WhatsApp ordering", "Existing ordering API", "Third-party ordering platform", "Custom ordering backend"] },
  { id: "payment", title: "Payments", description: "Online payments or clear pay-on-pickup / delivery instructions.", choices: ["Not selected", "Cash / pay at pickup", "Telebirr (merchant API required)", "Chapa (merchant account / API required)", "Stripe (subject to business eligibility)", "Other approved payment gateway"] },
  { id: "delivery", title: "Delivery & fulfillment", description: "Delivery zones, fees, courier services and pickup.", choices: ["Not selected", "Business-managed delivery", "Pickup only", "Third-party courier API", "Custom delivery workflow"] },
  { id: "inventory", title: "Inventory & stock", description: "Availability, stock counts and product synchronization.", choices: ["Not selected", "Manual stock management", "POS / inventory system", "Existing inventory API", "Custom inventory backend"] },
  { id: "contact", title: "Contact & CRM", description: "Enquiries, email forms, WhatsApp and lead management.", choices: ["Not selected", "Email + phone + WhatsApp", "Form endpoint / CRM", "Existing CRM integration", "Custom contact API"] }
];

export const defaultSections = ["header", "hero", "catalog", "about", "gallery", "location", "contact", "footer"];

export const catalogSamples = {
  ecommerce: "Everyday Cotton Shirt | Clothing | Soft cotton shirt for everyday wear. | 1450 | S:0,M:0,L:0 |\nCity Weekend Bag | Accessories | Minimal leather handbag. | 2900 | Standard:0 |\nClassic Everyday Watch | Accessories | Minimal wristwatch. | 3600 | Standard:0 |",
  restaurant: "Signature House Plate | Main dishes | A generous plate prepared fresh by the kitchen. | 520 | Regular:0,Large:150 | Extra side:60,Add drink:75\nSeasonal Garden Salad | Starters | Fresh greens, local vegetables and citrus dressing. | 280 | Regular:0 | Extra avocado:80",
  cafe: "Iced Spanish Latte | Iced coffee | Espresso with sweet condensed milk, poured over ice. | 180 | Regular:0,Large:45 | Extra shot:35,Oat milk:30 | /images/machi-spanish-latte.webp\nIced Matcha Latte | Matcha | Stone-ground matcha whisked with cold milk. | 190 | Regular:0,Large:45 | Vanilla:20,Oat milk:30 | /images/machi-matcha-latte.webp",
  foodDelivery: "Classic Smash Burger | Burgers | Double smash patty, cheese, pickles and house sauce. | 360 | Single:0,Double:130 | Extra cheese:35,Jalapenos:25\nLoaded Fries | Sides | Golden fries with house sauce. | 190 | Regular:0,Large:65 | Extra sauce:20",
  grocery: "Fresh Vine Tomatoes | Produce | Fresh tomatoes sold per kilogram. | 95 | 1 kg:0,2 kg:95 |\nFresh Country Bread | Bakery | Freshly baked country loaf. | 120 | 1 loaf:0,2 loaves:120 |",
  furniture: "Mira Lounge Chair | Seating | A sculptural upholstered chair with a soft, welcoming profile. | 24900 | Standard:0 | | /images/furniture/hero-lounge-chair.jpg\nArlo Three-Seat Sofa | Sofas | A relaxed three-seat sofa for everyday living. | 68900 | Standard:0 | | /images/furniture/living-room.jpg\nTove Side Table | Tables | A compact side table with a warm natural finish. | 12900 | Standard:0 | | /images/furniture/living-room-detail.jpg\nLune Dome Pendant | Lighting | A soft ambient pendant for calm interiors. | 8900 | Standard:0 | | /images/furniture/reading-corner.jpg"
};

export function createEmptyIntegrations() {
  return Object.fromEntries(integrationOptions.map(({ id }) => [id, { provider: "Not selected", publicUrl: "", notes: "" }]));
}

export const emptyForm = {
  name: "MACHI Coffee",
  slug: "machi-coffee",
  tagline: "A little more sunshine in every sip.",
  description: "Slow-steeped cold brew, creamy iced lattes and feel-good matcha. Made for the everyday.",
  logoUrl: "",
  heroImageUrl: "/images/machi-hero-coffee.webp",
  galleryImages: "/images/machi-coffee-beans.webp\n/images/machi-lifestyle.webp",
  phone: "+251 911 123 456",
  whatsapp: "+251911123456",
  email: "hello@example.com",
  website: "",
  address: "Bole, Addis Ababa, Ethiopia",
  hours: "Monday – Sunday · 7:00 AM – 10:00 PM",
  currency: "ETB",
  deliveryFee: "80",
  locale: "en-ET",
  font: "Manrope + DM Sans"
};
