"use client";

import { useState } from "react";

export default function ActualClientPreview({ slug, title = "Actual generated website", defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [refreshKey, setRefreshKey] = useState(0);
  if (!slug) return null;
  const src = `/forge/preview/${encodeURIComponent(slug)}`;

  return (
    <section className="forge-actual-preview-card" aria-label={title}>
      <header>
        <div><span className="forge-v3-eyebrow">GENERATED SITE RENDERER</span><strong>{title}</strong><small>The real client-site React renderer and saved client configuration.</small></div>
        <div className="forge-actual-preview-actions">
          <button type="button" onClick={() => setRefreshKey((value) => value + 1)} title="Refresh actual website preview">↻ Refresh</button>
          <a href={src} target="_blank" rel="noreferrer">Open full site ↗</a>
          <button type="button" onClick={() => setOpen((value) => !value)}>{open ? "Hide preview" : "Show preview"}</button>
        </div>
      </header>
      {open && <iframe key={refreshKey} src={`${src}?preview=${refreshKey}`} title={`${title} for ${slug}`} loading="lazy" referrerPolicy="same-origin" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"/>}
    </section>
  );
}
