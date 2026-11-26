export function formatFurnitureMoney(value, currency = "ETB", locale = "en-ET") {
  const safeCurrency = /^[A-Z]{3}$/.test(String(currency || "")) ? String(currency) : "ETB";
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  try {
    return new Intl.NumberFormat(locale || "en", { style: "currency", currency: safeCurrency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return safeCurrency + " " + amount.toLocaleString();
  }
}

export const FURNITURE_CART_KEY = "frontendforge:furniture-cart:v2";
export const FURNITURE_WISHLIST_KEY = "frontendforge:furniture-wishlist:v1";
export const FURNITURE_ADMIN_KEY = "frontendforge:furniture-admin:v1";

function nonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function createFurnitureCartLine(product, options = {}) {
  const choiceLabel = (value) => typeof value === "object" && value !== null ? String(value.label || value.name || value.id || "Standard") : String(value ?? "Standard");
  const material = choiceLabel(options.material ?? product.materials?.[0]);
  const color = choiceLabel(options.color ?? product.colors?.[0]);
  const size = choiceLabel(options.size ?? product.sizes?.[0]);
  const key = [product.id, material, color, size].map((part) => String(part).trim()).join("|");
  return {
    key,
    id: String(product.id),
    slug: String(product.slug || product.id),
    name: String(product.name),
    price: nonNegativeNumber(options.price ?? (Number(product.price) + Number(product.sizePriceAdjustments?.[size] || 0)), 0),
    quantity: Math.max(1, Math.min(99, Math.floor(nonNegativeNumber(options.quantity, 1)))),
    image: String(product.image || ""),
    material,
    color,
    size
  };
}

export function addFurnitureCartItem(cart = [], item) {
  const line = { ...item, quantity: Math.max(1, Math.floor(nonNegativeNumber(item.quantity, 1))) };
  const key = line.key || line.id;
  const existing = cart.find((entry) => (entry.key || entry.id) === key);
  if (existing) {
    return cart.map((entry) => (entry.key || entry.id) === key
      ? { ...entry, quantity: Math.min(99, nonNegativeNumber(entry.quantity, 1) + line.quantity) }
      : entry);
  }
  return [...cart, { ...line, key }];
}

export function setFurnitureCartQuantity(cart = [], key, quantity) {
  const nextQuantity = Math.floor(Number(quantity));
  if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
    return cart.filter((entry) => (entry.key || entry.id) !== key);
  }
  return cart.map((entry) => (entry.key || entry.id) === key
    ? { ...entry, quantity: Math.min(99, nextQuantity) }
    : entry);
}

export function removeFurnitureCartItem(cart = [], key) {
  return cart.filter((entry) => (entry.key || entry.id) !== key);
}

export function getFurnitureCartTotals(cart = []) {
  return cart.reduce((result, item) => {
    const quantity = Math.max(0, Math.floor(nonNegativeNumber(item.quantity, 0)));
    const price = nonNegativeNumber(item.price, 0);
    result.count += quantity;
    result.subtotal += price * quantity;
    return result;
  }, { count: 0, subtotal: 0 });
}

export function applyFurnitureCatalogOverrides(products = [], overrides = {}) {
  return products
    .map((product) => {
      const override = overrides?.[product.id] || {};
      return {
        ...product,
        price: nonNegativeNumber(override.price, product.price),
        stock: Math.max(0, Math.floor(nonNegativeNumber(override.stock, product.stock || 0))),
        hidden: Boolean(override.hidden)
      };
    })
    .filter((product) => !product.hidden);
}

export function normalizeFurniturePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

export function buildFurnitureEnquiryUrl(phone, message) {
  const digits = normalizeFurniturePhone(phone);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(String(message || ""))}`;
}

export function buildFurnitureEnquiryMessage({ brandName, customer, cart, total, money }) {
  const items = cart.map((item) => {
    const options = [item.material, item.color, item.size].filter(Boolean).join(", ");
    return `${item.quantity} × ${item.name}${options ? ` (${options})` : ""} — ${money(item.price * item.quantity)}`;
  }).join("\n");
  return [
    `${brandName || "Furniture store"} — product enquiry`,
    `Customer: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email || "Not provided"}`,
    `City: ${customer.city || "Not provided"}`,
    `Address: ${customer.address || "To be confirmed"}`,
    `Fulfilment: ${customer.delivery || "To be confirmed"}`,
    "Items:", items,
    `Estimated subtotal: ${money(total)}`,
    `Notes: ${customer.notes || "None"}`,
    "Please confirm stock, final pricing and delivery."
  ].join("\n");
}

export function normalizeFurnitureClientProduct(product = {}) {
  const labels = (value, fallback) => {
    if (Array.isArray(value)) return value.map((item) => typeof item === "object" && item !== null ? String(item.label || item.name || item.id || fallback) : String(item)).filter(Boolean);
    if (typeof value === "string" && value.trim()) return value.split(/\s*(?:,|\band\b)\s*/i).map((item) => item.trim()).filter(Boolean);
    return fallback;
  };
  const sourceSizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["Standard"];
  const sizes = sourceSizes.map((item) => typeof item === "object" && item !== null ? String(item.label || item.name || item.id || "Standard") : String(item));
  const sizePriceAdjustments = Object.fromEntries(sourceSizes.map((item, index) => [sizes[index], typeof item === "object" && item !== null ? nonNegativeNumber(item.price, 0) : 0]));
  return {
    ...product,
    id: String(product.id || product.slug || product.name || "furniture-item"),
    slug: String(product.slug || product.id || "furniture-item"),
    category: String(product.category || "Furniture"),
    label: String(product.label || "Collection piece"),
    image: String(product.image || ""),
    gallery: Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [product.image].filter(Boolean),
    materials: labels(product.materials, ["Standard material"]),
    colors: labels(product.colors, ["Natural", "Walnut"]),
    sizes,
    sizePriceAdjustments,
    stock: Number.isFinite(Number(product.stock)) ? Math.max(0, Number(product.stock)) : (product.inStock === false ? 0 : 12),
    tone: String(product.tone || "sand")
  };
}
