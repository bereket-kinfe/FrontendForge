export function getCanonicalSiteUrl(raw = process.env.NEXT_PUBLIC_SITE_URL || "") {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}
