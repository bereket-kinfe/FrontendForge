/** Accept only same-site absolute paths or credential-free HTTP(S) asset URLs. */
export function normalizeSafeAssetUrl(value, maxLength = 1000) {
  const raw = String(value ?? "").trim().slice(0, maxLength);
  if (!raw) return "";
  if (raw.startsWith("/") && !raw.startsWith("//") && !/[\\\u0000-\u001f]/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return "";
    return url.toString();
  } catch { return ""; }
}

export function normalizeSafeAssetList(values, maxItems = 12) {
  if (!Array.isArray(values)) return null;
  const result = [];
  for (const value of values.slice(0, maxItems)) {
    const normalized = normalizeSafeAssetUrl(value);
    if (!normalized) return null;
    result.push(normalized);
  }
  return result;
}
