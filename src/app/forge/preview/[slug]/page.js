import fs from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ClientProjectHome from "@/components/client/ClientProjectHome";
import { isLocalForgeRequest } from "@/lib/forge/local-only.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ActualClientWebsitePreview({ params }) {
  const requestHeaders = await headers();
  if (!isLocalForgeRequest({ headers: requestHeaders })) notFound();

  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "")) notFound();

  const configPath = path.join(process.cwd(), "client-projects", slug, "src", "config", "client-project.json");
  let config;
  try {
    config = JSON.parse(await fs.readFile(configPath, "utf8"));
  } catch {
    notFound();
  }

  const brandName = config.brand?.name || slug;
  const brandColor = config.theme?.primary || "#5b58df";

  return (
    <div className="forge-actual-preview-page">
      <div className="forge-actual-preview-toolbar">
        <div className="forge-actual-preview-toolbar-brand">
          <span style={{ background: brandColor }}>{brandName.slice(0, 1).toUpperCase()}</span>
          <div><strong>{brandName}</strong><small>Actual generated storefront · {slug}</small></div>
        </div>
        <div className="forge-actual-preview-toolbar-meta">
          <span><i/>LOCAL PREVIEW SESSION</span>
          <a href="/" target="_blank" rel="noreferrer">Return to Forge Studio ↗</a>
        </div>
      </div>
      <ClientProjectHome config={config}/>
    </div>
  );
}
