const SECTION_IDS = [
  "hero", "collections", "catalog", "roomInspiration", "about", "gallery",
  "testimonials", "faq", "booking", "location", "contact", "footer"
];

const CONTENT_FIELDS = ["eyebrow", "heading", "body", "secondaryBody"];
const STYLE_FIELDS = {
  spacing: new Set(["compact", "comfortable", "spacious"]),
  headingSize: new Set(["small", "normal", "large"]),
  alignment: new Set(["left", "center", "right"]),
  width: new Set(["narrow", "standard", "wide"]),
  background: new Set(["default", "surface", "secondary", "primary"])
};

export const DEFAULT_SECTION_STYLES = Object.freeze({
  hero: { spacing: "comfortable", headingSize: "large", alignment: "left", width: "wide", background: "default" },
  collections: { spacing: "comfortable", headingSize: "normal", alignment: "left", width: "wide", background: "default" },
  catalog: { spacing: "comfortable", headingSize: "normal", alignment: "left", width: "wide", background: "default" },
  roomInspiration: { spacing: "spacious", headingSize: "large", alignment: "left", width: "standard", background: "default" },
  about: { spacing: "spacious", headingSize: "large", alignment: "left", width: "standard", background: "default" },
  gallery: { spacing: "comfortable", headingSize: "normal", alignment: "left", width: "wide", background: "default" },
  testimonials: { spacing: "comfortable", headingSize: "normal", alignment: "center", width: "standard", background: "surface" },
  faq: { spacing: "comfortable", headingSize: "normal", alignment: "left", width: "standard", background: "default" },
  booking: { spacing: "comfortable", headingSize: "normal", alignment: "left", width: "standard", background: "secondary" },
  location: { spacing: "comfortable", headingSize: "normal", alignment: "left", width: "wide", background: "default" },
  contact: { spacing: "comfortable", headingSize: "normal", alignment: "left", width: "wide", background: "secondary" }
});

export function normalizeSectionContent(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output = {};
  for (const sectionId of SECTION_IDS) {
    const source = input[sectionId];
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    const fields = {};
    for (const field of CONTENT_FIELDS) {
      if (source[field] !== undefined) fields[field] = String(source[field] ?? "").trim().slice(0, field === "body" || field === "secondaryBody" ? 900 : 180);
    }
    if (Object.keys(fields).length) output[sectionId] = fields;
  }
  return output;
}

export function normalizeSectionStyles(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output = {};
  for (const sectionId of SECTION_IDS) {
    const source = input[sectionId];
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    const style = {};
    for (const [field, allowed] of Object.entries(STYLE_FIELDS)) {
      if (allowed.has(source[field])) style[field] = source[field];
    }
    if (Object.keys(style).length) output[sectionId] = style;
  }
  return output;
}

export function getSectionStyleValues(sectionId, sectionStyles = {}) {
  return {
    ...(DEFAULT_SECTION_STYLES[sectionId] || {}),
    ...(sectionStyles?.[sectionId] || {})
  };
}

export const EDITABLE_SECTION_IDS = Object.freeze(SECTION_IDS);
