const THEME_KEYS = ["primary", "secondary", "background", "surface", "text", "muted", "accent"];
const HEX = /^#[0-9a-fA-F]{6}$/;

const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);

export function applyClientProjectUpdates(config, updates) {
  if (!config || typeof config !== "object" || !config.brand || !config.slug) throw new Error("Client project configuration is incomplete.");
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) throw new Error("Missing project updates.");
  const name = clean(updates.name, 80);
  if (name.length < 2) throw new Error("Business name must contain at least two characters.");

  const next = structuredClone(config);
  next.brand = { ...next.brand, name, tagline: clean(updates.tagline, 150), description: clean(updates.description, 600) };
  next.contact = { ...next.contact, phone: clean(updates.phone, 40), email: clean(updates.email, 120), whatsapp: clean(updates.whatsapp, 40) };
  next.business = { ...next.business, address: clean(updates.address, 250), hours: clean(updates.hours, 250) };
  const theme = { ...(next.theme || {}) };
  for (const key of THEME_KEYS) {
    if (updates.theme?.[key] !== undefined) {
      const value = String(updates.theme[key]);
      if (!HEX.test(value)) throw new Error(`Invalid ${key} color.`);
      theme[key] = value.toUpperCase();
    }
  }
  next.theme = theme;
  next.updatedAt = new Date().toISOString();
  return next;
}
