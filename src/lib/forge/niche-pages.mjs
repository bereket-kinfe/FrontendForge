const COMMON = [
  { slug: "about", label: "About", title: "A little more about us", type: "about", description: "Learn about the people, principles and care behind this business." },
  { slug: "contact", label: "Contact", title: "Let's talk", type: "contact", description: "Get in touch with the team for questions, support and enquiries." },
  { slug: "faq", label: "FAQs", title: "Good to know", type: "faq", description: "Answers to common questions about this business." }
];

const DEFINITIONS = {
  cafe: [
    { slug: "menu", label: "Menu", title: "The menu", type: "food-menu", description: "Browse drinks, food and seasonal favorites." },
    { slug: "visit", label: "Visit us", title: "Come on in", type: "visit", description: "Find the cafe, check opening hours and plan your visit." },
    { slug: "reservations", label: "Reservations", title: "Save your seat", type: "booking", description: "Send a reservation request to the cafe." },
    { slug: "catering", label: "Catering", title: "Coffee for your gathering", type: "lead", description: "Ask about catering, coffee service and group orders." },
    ...COMMON
  ],
  restaurant: [
    { slug: "menu", label: "Menu", title: "Explore the menu", type: "food-menu", description: "Browse dishes, sides and drinks from the kitchen." },
    { slug: "reservations", label: "Reservations", title: "Book a table", type: "booking", description: "Send a table reservation request to the restaurant." },
    { slug: "delivery", label: "Delivery & pickup", title: "Enjoy it your way", type: "delivery", description: "Find out how to order, collect or arrange delivery." },
    { slug: "visit", label: "Visit us", title: "Find the restaurant", type: "visit", description: "Check the address and opening hours." },
    ...COMMON
  ],
  foodDelivery: [
    { slug: "menu", label: "Menu", title: "Order something good", type: "food-menu", description: "Browse the menu and customize your order." },
    { slug: "delivery", label: "Delivery", title: "Delivery information", type: "delivery", description: "Review delivery and pickup information before ordering." },
    { slug: "how-to-order", label: "How to order", title: "Three simple steps", type: "how-to-order", description: "How to choose your meal and send your order." },
    ...COMMON
  ],
  furniture: [
    { slug: "shop", label: "Shop", title: "Shop the collection", type: "furniture-shop", description: "Explore furniture, materials and finishes." },
    { slug: "collections", label: "Collections", title: "Shop by room", type: "collections", description: "Explore pieces grouped by room and category." },
    { slug: "showroom", label: "Showroom", title: "Visit the showroom", type: "visit", description: "Plan a visit and speak with the furniture team." },
    { slug: "delivery", label: "Delivery", title: "Delivery & assembly", type: "delivery", description: "Ask the store to confirm delivery, assembly and lead times." },
    { slug: "care-guide", label: "Care guide", title: "Keep it looking its best", type: "care", description: "General care guidance for furniture and home pieces." },
    ...COMMON
  ],
  ecommerce: [
    { slug: "shop", label: "Shop", title: "Shop all products", type: "commerce-shop", description: "Search, filter and browse the product collection." },
    { slug: "collections", label: "Collections", title: "Explore collections", type: "collections", description: "Browse products by category." },
    { slug: "shipping-returns", label: "Shipping & returns", title: "Shipping, delivery & returns", type: "shipping", description: "Review the store's shipping and return information." },
    ...COMMON
  ],
  grocery: [
    { slug: "shop", label: "Shop", title: "Shop groceries", type: "commerce-shop", description: "Browse fresh produce and everyday essentials." },
    { slug: "collections", label: "Departments", title: "Shop by department", type: "collections", description: "Explore products grouped by department." },
    { slug: "delivery", label: "Delivery", title: "Delivery & collection", type: "delivery", description: "Confirm delivery areas, fees and collection options." },
    ...COMMON
  ]
};

export function getNichePages(template) {
  return DEFINITIONS[template] || DEFINITIONS.ecommerce;
}

export function getNichePage(template, slug) {
  return getNichePages(template).find((page) => page.slug === slug) || null;
}

export function getNicheNavigation(template) {
  const preferred = {
    cafe: ["menu", "about", "visit", "reservations", "contact"],
    restaurant: ["menu", "about", "reservations", "delivery", "contact"],
    foodDelivery: ["menu", "how-to-order", "delivery", "about", "contact"],
    furniture: ["shop", "collections", "about", "showroom", "delivery", "contact"],
    ecommerce: ["shop", "collections", "about", "shipping-returns", "contact"],
    grocery: ["shop", "collections", "delivery", "about", "contact"]
  }[template] || ["shop", "about", "contact"];
  const pages = getNichePages(template);
  return preferred.map((slug) => pages.find((page) => page.slug === slug)).filter(Boolean).map(({ slug, label }) => ({ label, href: `/${slug}` }));
}
