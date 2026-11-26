import fs from "node:fs";
import path from "node:path";
import { furnitureProducts } from "@/config/furniture-products";
import { getCanonicalSiteUrl } from "@/lib/site-url.mjs";

export default function sitemap() {
  const siteUrl = getCanonicalSiteUrl();
  if (!siteUrl) return [];
  const base = siteUrl;
  const now = new Date();
  const configPath = path.join(process.cwd(), "src", "config", "client-project.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const routes = ["/"];
      if (["ecommerce", "furniture", "grocery"].includes(config.template)) {
        for (const item of config.products || []) routes.push(`/products/${encodeURIComponent(item.slug || item.id)}`);
      }
      if (config.orderEnabled && config.slug) routes.push(`/order/${encodeURIComponent(config.slug)}`);
      return [...new Set(routes)].map((route) => ({ url: new URL(route, base).toString(), lastModified: now, changeFrequency: route === "/" ? "weekly" : "monthly", priority: route === "/" ? 1 : 0.7 }));
    } catch { return [{ url: base, lastModified: now, priority: 1 }]; }
  }
  const routes = ["/", "/templates/ecommerce", "/templates/restaurant", "/templates/cafe", "/templates/food-delivery", "/templates/grocery", "/templates/furniture", ...furnitureProducts.map((product) => `/templates/furniture/products/${product.slug}`)];
  return routes.map((route) => ({ url: new URL(route, base).toString(), lastModified: now, changeFrequency: route === "/" ? "weekly" : "monthly", priority: route === "/" ? 1 : 0.7 }));
}
