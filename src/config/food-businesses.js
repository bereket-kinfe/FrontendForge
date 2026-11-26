/**
 * Reusable food-business storefront configurations.
 * Duplicate one object, choose a new slug, update its branding/content, and the same
 * ordering experience will render without changing the shared components.
 */
const machi = {
  slug: "machi",
  name: "machi",
  descriptor: "COLD BREW · COFFEE BAR",
  tagline: "A little more sunshine in every sip.",
  intro: "Slow-steeped cold brew, creamy iced lattes and feel-good matcha. Made for the long way round, the catch-up and the everyday.",
  currency: "ETB",
  locale: "en-ET",
  whatsapp: "+251900000000", // Replace with the business WhatsApp number.
  phone: "+251 900 000 000",
  email: "hello@example.com",
  address: "Add the verified shop address, Addis Ababa",
  hours: "Daily · 7:00 AM – 10:00 PM (sample hours)",
  fulfillment: ["pickup", "delivery"],
  deliveryFee: 80,
  deliveryLabel: "Local delivery (sample fee)",
  theme: {
    background: "#fbf8f1", surface: "#ffffff", text: "#171b1d", muted: "#68747a",
    primary: "#08aeea", primaryText: "#071a21", accent: "#e7f1d2", soft: "#e5f6fc", line: "#e7e2d8",
    hero: "linear-gradient(120deg,#61c7ea,#91ddf4)"
  },
  categories: ["All", "Iced coffee", "Matcha"],
  products: [
    { id: "spanish-latte", name: "Iced Spanish Latte", category: "Iced coffee", description: "Espresso with sweet condensed milk, poured over ice.", price: 180, emoji: "🥤", image: "/images/machi-spanish-latte.webp", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 45 }], addons: [{ id: "extra-shot", label: "Extra espresso shot", price: 35 }, { id: "oat-milk", label: "Oat milk", price: 30 }] },
    { id: "matcha-latte", name: "Iced Matcha Latte", category: "Matcha", description: "Stone-ground matcha whisked with cold milk.", price: 190, emoji: "🍵", image: "/images/machi-matcha-latte.webp", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 45 }], addons: [{ id: "vanilla", label: "Vanilla", price: 20 }, { id: "oat-milk", label: "Oat milk", price: 30 }] },
    { id: "cold-brew", name: "Classic Cold Brew", category: "Iced coffee", description: "Slow-steeped coffee. Smooth, bold and refreshing.", price: 160, emoji: "🧊", image: "/images/machi-cold-brew.webp", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 40 }], addons: [{ id: "extra-shot", label: "Extra coffee shot", price: 30 }] },
    { id: "caramel-latte", name: "Caramel Latte", category: "Iced coffee", description: "Rich espresso, caramel and chilled milk.", price: 200, emoji: "☕", image: "/images/machi-caramel-latte.webp", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 45 }], addons: [{ id: "extra-caramel", label: "Extra caramel", price: 20 }, { id: "extra-shot", label: "Extra espresso shot", price: 35 }] }
  ]
};

const bunaBowl = {
  slug: "buna-bowl", name: "BUNA BOWL", descriptor: "ETHIOPIAN KITCHEN · FRESH DAILY",
  tagline: "A table full of good things.",
  intro: "Comforting Ethiopian favorites, colorful bowls and generous plates made for sharing.",
  currency: "ETB", locale: "en-ET", whatsapp: "+251911000000", phone: "+251 911 000 000",
  email: "orders@example.com", address: "Add the verified restaurant address, Addis Ababa", hours: "Daily · 11:00 AM – 10:00 PM (sample hours)",
  fulfillment: ["pickup", "delivery"], deliveryFee: 100, deliveryLabel: "City delivery (sample fee)",
  theme: { background: "#f6f1e6", surface: "#fffdf7", text: "#292b20", muted: "#737364", primary: "#567447", primaryText: "#ffffff", accent: "#e7d4a6", soft: "#e8eddf", line: "#e4ddcc", hero: "linear-gradient(125deg,#d9e2c9,#f1dfb6)" },
  categories: ["All", "Ethiopian favorites", "Vegetarian", "Fresh bowls"],
  products: [
    { id: "buna-combo", name: "Buna House Combo", category: "Ethiopian favorites", description: "A generous selection of house favorites served together.", price: 420, emoji: "🍲", sizes: [{ id: "single", label: "Single", price: 0 }, { id: "sharing", label: "Sharing", price: 280 }], addons: [{ id: "extra-injera", label: "Extra injera", price: 35 }, { id: "ayib", label: "Ayib", price: 55 }] },
    { id: "shiro", name: "Shiro Bowl", category: "Vegetarian", description: "Silky chickpea stew with fresh sides and injera.", price: 240, emoji: "🥘", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 70 }], addons: [{ id: "extra-injera", label: "Extra injera", price: 35 }, { id: "salad", label: "Fresh salad", price: 45 }] },
    { id: "veggie-bowl", name: "Garden Veggie Bowl", category: "Fresh bowls", description: "Seasonal vegetables, grains, greens and house dressing.", price: 280, emoji: "🥗", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 75 }], addons: [{ id: "avocado", label: "Avocado", price: 60 }, { id: "egg", label: "Boiled egg", price: 35 }] },
    { id: "doro-tibs", name: "Doro Tibs Plate", category: "Ethiopian favorites", description: "A hearty house-style chicken plate with warm spices.", price: 390, emoji: "🍗", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 100 }], addons: [{ id: "extra-injera", label: "Extra injera", price: 35 }, { id: "salad", label: "Fresh salad", price: 45 }] }
  ]
};

const urbanBites = {
  slug: "urban-bites", name: "URBAN BITES", descriptor: "BURGERS · SIDES · GOOD TIMES",
  tagline: "Big flavor. No fuss.", intro: "Stacked burgers, golden sides and cold drinks. Order your favorites and make lunch the best part of the day.",
  currency: "ETB", locale: "en-ET", whatsapp: "+251922000000", phone: "+251 922 000 000",
  email: "orders@example.com", address: "Add the verified restaurant address, Addis Ababa", hours: "Daily · 12:00 PM – 11:00 PM (sample hours)",
  fulfillment: ["pickup", "delivery"], deliveryFee: 90, deliveryLabel: "Delivery (sample fee)",
  theme: { background: "#fff7ef", surface: "#ffffff", text: "#211b18", muted: "#776c65", primary: "#dc4a35", primaryText: "#ffffff", accent: "#ffc95b", soft: "#ffe9d8", line: "#eddfd4", hero: "linear-gradient(120deg,#f7b34d,#ef684c)" },
  categories: ["All", "Burgers", "Sides", "Drinks"],
  products: [
    { id: "classic-smash", name: "Classic Smash Burger", category: "Burgers", description: "Double smash patty, cheese, pickles and house sauce.", price: 360, emoji: "🍔", sizes: [{ id: "single", label: "Single", price: 0 }, { id: "double", label: "Double", price: 130 }], addons: [{ id: "extra-cheese", label: "Extra cheese", price: 35 }, { id: "jalapeno", label: "Jalapeños", price: 25 }] },
    { id: "crispy-chicken", name: "Crispy Chicken Burger", category: "Burgers", description: "Crunchy chicken, slaw and a tangy mayo dressing.", price: 330, emoji: "🍔", sizes: [{ id: "regular", label: "Regular", price: 0 }], addons: [{ id: "extra-patty", label: "Extra chicken", price: 110 }, { id: "extra-cheese", label: "Extra cheese", price: 35 }] },
    { id: "loaded-fries", name: "Loaded Fries", category: "Sides", description: "Golden fries with melted cheese and signature sauce.", price: 190, emoji: "🍟", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 65 }], addons: [{ id: "jalapeno", label: "Jalapeños", price: 25 }] },
    { id: "lemonade", name: "Fresh Lemonade", category: "Drinks", description: "Freshly mixed lemonade served ice cold.", price: 95, emoji: "🍋", sizes: [{ id: "regular", label: "Regular", price: 0 }, { id: "large", label: "Large", price: 35 }], addons: [{ id: "mint", label: "Fresh mint", price: 10 }] }
  ]
};

const sugarCloud = {
  slug: "sugar-cloud", name: "sugar cloud", descriptor: "BAKERY · CAKES · LITTLE TREATS",
  tagline: "A sweeter kind of everyday.", intro: "Fresh bakes, soft-centered treats and little celebrations made with care.",
  currency: "ETB", locale: "en-ET", whatsapp: "+251933000000", phone: "+251 933 000 000",
  email: "orders@example.com", address: "Add the verified bakery address, Addis Ababa", hours: "Daily · 8:00 AM – 8:00 PM (sample hours)",
  fulfillment: ["pickup", "delivery"], deliveryFee: 85, deliveryLabel: "Bakery delivery (sample fee)",
  theme: { background: "#fff7f8", surface: "#ffffff", text: "#30232c", muted: "#82717d", primary: "#bd6e91", primaryText: "#ffffff", accent: "#efd8e5", soft: "#f9eaf1", line: "#efdeea", hero: "linear-gradient(120deg,#f1dce8,#f8edcf)" },
  categories: ["All", "Cakes", "Pastries", "Cookies"],
  products: [
    { id: "red-velvet", name: "Red Velvet Slice", category: "Cakes", description: "Soft cocoa sponge layered with smooth cream cheese frosting.", price: 180, emoji: "🍰", sizes: [{ id: "slice", label: "Slice", price: 0 }, { id: "two-slices", label: "Two slices", price: 160 }], addons: [{ id: "candle", label: "Add a candle", price: 15 }] },
    { id: "croissant", name: "Butter Croissant", category: "Pastries", description: "Golden, flaky pastry with a buttery center.", price: 95, emoji: "🥐", sizes: [{ id: "single", label: "Single", price: 0 }, { id: "box-four", label: "Box of four", price: 260 }], addons: [{ id: "jam", label: "Side of jam", price: 20 }] },
    { id: "choc-cookie", name: "Chocolate Chunk Cookie", category: "Cookies", description: "A soft-baked cookie filled with chocolate chunks.", price: 75, emoji: "🍪", sizes: [{ id: "single", label: "Single", price: 0 }, { id: "box-six", label: "Box of six", price: 300 }], addons: [] },
    { id: "vanilla-cupcake", name: "Vanilla Cloud Cupcake", category: "Cakes", description: "Vanilla sponge topped with a light whipped swirl.", price: 110, emoji: "🧁", sizes: [{ id: "single", label: "Single", price: 0 }, { id: "box-four", label: "Box of four", price: 300 }], addons: [{ id: "sprinkles", label: "Colorful sprinkles", price: 10 }] }
  ]
};

export const foodBusinesses = [machi, bunaBowl, urbanBites, sugarCloud];
export const foodBusinessBySlug = Object.fromEntries(foodBusinesses.map((business) => [business.slug, business]));
