"use client";

import { useState } from "react";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: 1440 },
  { id: "tablet", label: "Tablet", width: 820 },
  { id: "mobile", label: "Mobile", width: 390 }
];

export default function ActualClientPreview({ slug, title = "Actual generated website", defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewport, setViewport] = useState("desktop");
  const [expanded, setExpanded] = useState(false);
  if (!slug) return null;

  const src = "/forge/preview/" + encodeURIComponent(slug);
  const selectedViewport = VIEWPORTS.find((item) => item.id === viewport) || VIEWPORTS[0];

  return (
    <section className={"forge-actual-preview-card" + (expanded ? " is-expanded" : "")} aria-label={title}>
      <header>
        <div>
          <span className="forge-v3-eyebrow">ACTUAL CLIENT WEBSITE</span>
          <strong>{title}</strong>
          <small>Rendered with the same components and saved configuration as the generated client project.</small>
        </div>
        <div className="forge-actual-preview-actions">
          <div className="forge-actual-preview-viewports" role="group" aria-label="Preview viewport">
            {VIEWPORTS.map((item) => (
              <button key={item.id} type="button" className={viewport === item.id ? "active" : ""} aria-pressed={viewport === item.id} onClick={() => setViewport(item.id)}>{item.label}</button>
            ))}
          </div>
          <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>↻ Refresh</button>
          <a href={src} target="_blank" rel="noreferrer">Open full site ↗</a>
          {open && <button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Exit expanded view" : "Expand preview"}</button>}
          <button type="button" onClick={() => { setExpanded(false); setOpen((value) => !value); }}>{open ? "Hide preview" : "Show preview"}</button>
        </div>
      </header>
      {open && (
        <div className={"forge-actual-preview-stage forge-actual-preview-stage-" + viewport}>
          <div className={"forge-actual-preview-frame forge-actual-preview-frame-" + viewport} style={{ width: "min(100%, " + selectedViewport.width + "px)" }}>
            <iframe key={refreshKey} src={src + "?preview=" + refreshKey} title={title + " for " + slug + " · " + selectedViewport.label} loading="lazy" referrerPolicy="same-origin" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" />
          </div>
        </div>
      )}
    </section>
  );
}
