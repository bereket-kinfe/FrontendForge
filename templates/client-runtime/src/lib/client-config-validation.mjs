const HEX = /^#[0-9a-fA-F]{6}$/;
const allowedFonts = ["Manrope + DM Sans", "DM Sans", "Georgia + DM Sans", "System sans-serif"];
const allowedStyles = {
  header: ["standard", "centered", "bold"],
  hero: ["split", "centered", "photo-led"],
  catalog: ["cards", "list", "editorial"],
  buttons: ["pill", "rounded", "square"]
};

function text(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function localOrHttpsUrl(value, max = 1000) {
  const candidate = text(value, max);
  if (!candidate) return "";
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function number(value, label, errors, min = 0, max = 1_000_000_000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    errors.push(`${label} must be a number between ${min} and ${max}.`);
    return min;
  }
  return parsed;
}

function options(value, label, errors) {
  if (!Array.isArray(value)) return [];
  if (value.length > 30) errors.push(`${label} cannot contain more than 30 options.`);
  return value.slice(0, 30).map((option, index) => ({
    id: text(option?.id || `option-${index + 1}`, 70).toLowerCase().replace(/[^a-z0-9-]/g, "-") || `option-${index + 1}`,
    label: text(option?.label, 60),
    price: number(option?.price ?? 0, `${label} ${index + 1} price`, errors)
  })).filter((option) => option.label);
}

export function validateClientEditableConfig(current, incoming) {
  const errors = [];
  if (!current || !incoming || typeof incoming !== "object") {
    return { ok: false, errors: ["A client configuration object is required."] };
  }

  const brand = {
    ...current.brand,
    name: text(incoming.brand?.name, 80),
    tagline: text(incoming.brand?.tagline, 150),
    description: text(incoming.brand?.description, 600),
    logoUrl: localOrHttpsUrl(incoming.brand?.logoUrl),
    heroImageUrl: localOrHttpsUrl(incoming.brand?.heroImageUrl),
    galleryImages: Array.isArray(incoming.brand?.galleryImages)
      ? incoming.brand.galleryImages.slice(0, 12).map((url) => localOrHttpsUrl(url)).filter(Boolean)
      : []
  };
  if (brand.name.length < 2) errors.push("Brand name must contain at least 2 characters.");
  if (!HEX.test(incoming.theme?.primary || "")) errors.push("Primary color must be a six-digit hex color.");

  const theme = { ...current.theme };
  for (const key of ["primary", "secondary", "background", "surface", "text", "muted", "accent"]) {
    const value = text(incoming.theme?.[key], 7);
    if (!HEX.test(value)) errors.push(`${key} must be a six-digit hex color.`);
    else theme[key] = value.toUpperCase();
  }

  const business = {
    ...current.business,
    address: text(incoming.business?.address, 250),
    hours: text(incoming.business?.hours, 250),
    currency: text(incoming.business?.currency || current.business.currency, 3).toUpperCase(),
    deliveryFee: number(incoming.business?.deliveryFee ?? current.business.deliveryFee, "Delivery fee", errors),
    locale: text(incoming.business?.locale || current.business.locale, 20)
  };
  if (!/^[A-Z]{3}$/.test(business.currency)) errors.push("Currency must be a 3-letter ISO currency code, such as ETB or USD.");

  const contact = {
    ...current.contact,
    phone: text(incoming.contact?.phone, 40),
    whatsapp: text(incoming.contact?.whatsapp, 40),
    email: text(incoming.contact?.email, 120),
    website: localOrHttpsUrl(incoming.contact?.website)
  };
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.push("Contact email is not valid.");

  if (!Array.isArray(incoming.products) || incoming.products.length > 120) {
    errors.push("Products must be an array containing no more than 120 items.");
  }
  const ids = new Set();
  const products = (Array.isArray(incoming.products) ? incoming.products : []).slice(0, 120).map((product, index) => {
    const name = text(product?.name, 90);
    if (!name) errors.push(`Product ${index + 1} needs a name.`);
    const id = text(product?.id || `item-${index + 1}`, 70).toLowerCase().replace(/[^a-z0-9-]/g, "-") || `item-${index + 1}`;
    if (ids.has(id)) errors.push(`Product ID "${id}" is duplicated.`);
    ids.add(id);
    return {
      ...current.products?.[index],
      ...product,
      id,
      name,
      category: text(product?.category, 50) || "Featured",
      description: text(product?.description, 220),
      price: number(product?.price, `${name || `Product ${index + 1}`} price`, errors),
      image: localOrHttpsUrl(product?.image),
      alt: text(product?.alt || name, 120),
      dimensions: text(product?.dimensions, 100),
      materials: text(product?.materials, 100),
      sizes: options(product?.sizes, `${name} size`, errors),
      addons: options(product?.addons, `${name} add-on`, errors),
      inStock: product?.inStock !== false
    };
  });

  const componentStyles = { ...current.componentStyles };
  for (const [key, choices] of Object.entries(allowedStyles)) {
    const value = text(incoming.componentStyles?.[key] || current.componentStyles?.[key], 30);
    if (!choices.includes(value)) errors.push(`Unsupported ${key} style: ${value}.`);
    else componentStyles[key] = value;
  }
  const font = allowedFonts.includes(incoming.font) ? incoming.font : current.font;

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    config: { ...current, brand, theme, business, contact, products, componentStyles, font }
  };
}
