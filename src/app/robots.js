import { getCanonicalSiteUrl } from "@/lib/site-url.mjs";

export default function robots() {
  const siteUrl = getCanonicalSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/studio", "/forge", "/docs", "/components", "/client-projects/", "/templates/furniture/admin"] }],
    ...(siteUrl ? { sitemap: new URL("/sitemap.xml", siteUrl).toString() } : {})
  };
}
