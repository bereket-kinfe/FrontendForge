/** Validate same-origin browser mutations. Extra origins must be explicitly configured. */
export function isAllowedRequestOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let parsed;
  try { parsed = new URL(origin); } catch { return false; }
  if (!['http:', 'https:'].includes(parsed.protocol)) return false;
  const allowed = new Set();
  try { allowed.add(new URL(request.url).origin); } catch { /* invalid request URL */ }
  for (const value of String(process.env.PUBLIC_SITE_ORIGINS || '').split(',')) {
    const candidate = value.trim();
    if (!candidate) continue;
    try { allowed.add(new URL(candidate).origin); } catch { /* ignore malformed configured origin */ }
  }
  return allowed.has(parsed.origin);
}

export function assertSameOrigin(request) {
  return isAllowedRequestOrigin(request);
}
