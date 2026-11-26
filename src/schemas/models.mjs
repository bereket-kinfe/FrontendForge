/**
 * FrontendForge Core Data Models & Schemas
 * Implements Section 6 of the High-Level System Architecture.
 */

export const STARTER_REGISTRY = {
  ecommerce: {
    id: "ecommerce",
    name: "Ecommerce Storefront",
    industry: "Retail ecommerce",
    version: "3.5.0",
    previewRoute: "/templates/ecommerce",
    supportedSections: ["header", "hero", "catalog", "collections", "about", "gallery", "testimonials", "faq", "contact", "footer"],
    defaultSections: ["header", "hero", "collections", "catalog", "about", "contact", "footer"],
    supportedFeatures: ["Product catalog", "Collection filtering", "Local cart", "Brand story", "Contact"],
    businessType: "shop"
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant Website",
    industry: "Dining & hospitality",
    version: "3.5.0",
    previewRoute: "/templates/restaurant",
    supportedSections: ["header", "hero", "catalog", "about", "gallery", "testimonials", "faq", "location", "booking", "contact", "footer"],
    defaultSections: ["header", "hero", "about", "catalog", "location", "booking", "contact", "footer"],
    supportedFeatures: ["Menu highlights", "Table reservation CTA", "Location & hours", "Contact"],
    businessType: "food"
  },
  cafe: {
    id: "cafe",
    name: "Cafe & Bakery",
    industry: "Food & hospitality",
    version: "3.5.0",
    previewRoute: "/templates/cafe",
    supportedSections: ["header", "hero", "catalog", "about", "gallery", "testimonials", "faq", "location", "booking", "contact", "footer"],
    defaultSections: ["header", "hero", "catalog", "about", "gallery", "location", "contact", "footer"],
    supportedFeatures: ["Drinks & pastries", "Brand storytelling", "Lifestyle gallery", "Online ordering"],
    businessType: "food"
  },
  foodDelivery: {
    id: "foodDelivery",
    name: "Food Delivery & Takeaway",
    industry: "Food & takeaway",
    version: "3.5.0",
    previewRoute: "/templates/food-delivery",
    supportedSections: ["header", "hero", "catalog", "about", "testimonials", "faq", "location", "contact", "footer"],
    defaultSections: ["header", "hero", "catalog", "testimonials", "location", "contact", "footer"],
    supportedFeatures: ["Categorized menu", "Add to order", "WhatsApp order handoff", "Delivery messaging"],
    businessType: "food"
  },
  grocery: {
    id: "grocery",
    name: "Grocery Storefront",
    industry: "Retail & market",
    version: "3.5.0",
    previewRoute: "/templates/grocery",
    supportedSections: ["header", "hero", "catalog", "about", "testimonials", "faq", "location", "contact", "footer"],
    defaultSections: ["header", "hero", "catalog", "about", "location", "contact", "footer"],
    supportedFeatures: ["Fresh produce grid", "Unit pricing", "Local cart", "Delivery info"],
    businessType: "shop"
  },
  furniture: {
    id: "furniture",
    name: "Furniture & Home Store",
    industry: "Furniture & home",
    version: "3.5.0",
    previewRoute: "/templates/furniture",
    supportedSections: ["header", "hero", "collections", "catalog", "roomInspiration", "about", "gallery", "testimonials", "faq", "location", "contact", "footer"],
    defaultSections: ["header", "hero", "collections", "catalog", "roomInspiration", "about", "location", "contact", "footer"],
    supportedFeatures: ["Shop by room", "Furniture catalog", "WhatsApp enquiry bag", "Showroom details", "Material stories"],
    businessType: "shop"
  }
};

export const COMPONENT_DEFINITIONS = [
  { id: "SiteHeader", name: "Site Header", category: "navigation", variants: ["standard", "centered", "bold"], accessibilityNotes: "Nav role, skip-links, ARIA expanded menu." },
  { id: "SiteFooter", name: "Site Footer", category: "navigation", variants: ["standard", "minimal", "detailed"], accessibilityNotes: "Landmark footer with clear legal links." },
  { id: "ProductCard", name: "Product Card", category: "catalog", variants: ["standard", "withBadge", "compact"], accessibilityNotes: "Accessible image alt text and clear button labels." },
  { id: "MenuItem", name: "Menu Item", category: "food", variants: ["standard", "withPhoto", "compact"], accessibilityNotes: "Semantic price formatting and dietary tags." },
  { id: "FurnitureExperience", name: "Furniture Experience", category: "furniture", variants: ["enquiryBag", "catalogOnly"], accessibilityNotes: "Keyboard navigable filters and cart controls." },
  { id: "FoodBusinessExperience", name: "Food Ordering Experience", category: "food", variants: ["pickupAndDelivery", "pickupOnly"], accessibilityNotes: "Accessible cart drawer and live order total updates." },
  { id: "Button", name: "Button", category: "inputs", variants: ["primary", "secondary", "outline", "dark", "light"], accessibilityNotes: "Focus ring and WCAG 2.2 contrast compliance." },
  { id: "Badge", name: "Badge / Tag", category: "display", variants: ["default", "accent", "neutral"], accessibilityNotes: "Text-readable status cues." },
  { id: "Notice", name: "Notice / Alert", category: "feedback", variants: ["info", "warning", "success"], accessibilityNotes: "Role alert where applicable." }
];

export function validateCatalogItem(item) {
  if (!item || typeof item !== "object") throw new Error("Catalog item must be an object.");
  if (!item.name || typeof item.name !== "string" || item.name.trim().length < 1) {
    throw new Error("Catalog item must have a valid name.");
  }
  const price = Number(item.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Catalog item "${item.name}" must have a non-negative price.`);
  }
  return {
    id: item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: item.name.trim(),
    category: (item.category || "Featured").trim(),
    description: (item.description || "").trim(),
    price,
    currency: item.currency || "ETB",
    image: item.image || "",
    alt: item.alt || item.name.trim(),
    sizes: Array.isArray(item.sizes) ? item.sizes : [{ id: "regular", label: "Regular", price: 0 }],
    addons: Array.isArray(item.addons) ? item.addons : [],
    dimensions: item.dimensions || "",
    materials: item.materials || "",
    inStock: item.inStock !== false
  };
}

export function validateBrandConfig(brand) {
  if (!brand || typeof brand !== "object") throw new Error("Brand configuration is required.");
  if (!brand.name || brand.name.trim().length < 2) throw new Error("Brand name must be at least 2 characters.");
  return {
    name: brand.name.trim(),
    tagline: (brand.tagline || "").trim(),
    description: (brand.description || "").trim(),
    logoUrl: (brand.logoUrl || "").trim(),
    heroImageUrl: (brand.heroImageUrl || "").trim(),
    galleryImages: Array.isArray(brand.galleryImages) ? brand.galleryImages : []
  };
}

export function validateIntegrationConfig(integrations = {}) {
  const allowedCapabilities = ["booking", "ordering", "payment", "delivery", "inventory", "contact"];
  const validated = {};
  for (const cap of allowedCapabilities) {
    const entry = integrations[cap] || {};
    validated[cap] = {
      provider: (entry.provider || "Not selected").trim(),
      capability: cap,
      mode: entry.mode === "live" ? "live" : "sandbox",
      publicUrl: (entry.publicUrl || "").trim(),
      notes: (entry.notes || "").trim(),
      status: entry.provider && entry.provider !== "Not selected" ? "planned" : "unconfigured"
    };
  }
  return validated;
}
