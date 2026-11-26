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
  const [frameStatus, setFrameStatus] = useState("loading");
  if (!slug) return null;

  const src = "/forge/preview/" + encodeURIComponent(slug);
  const selectedViewport = VIEWPORTS.find((item) => item.id === viewport) || VIEWPORTS[0];

  function refreshPreview() {
    setFrameStatus("loading");
    setRefreshKey((value) => value + 1);
  }

  return (
    <section className={"forge-actual-preview-card" + (expanded ? " is-expanded" : "")} aria-label={title}>
      <header className="forge-actual-preview-header">
        <div className="forge-actual-preview-heading">
          <span className="forge-v3-eyebrow">ACTUAL GENERATED WEBSITE</span>
          <div className="forge-actual-preview-heading-row">
            <strong>{title}</strong>
            <span className="forge-actual-preview-live"><i/>LOCAL PREVIEW</span>
          </div>
          <small>Live rendering of the saved client project · {slug}</small>
        </div>
        <div className="forge-actual-preview-actions">
          <div className="forge-actual-preview-viewports" role="group" aria-label="Preview viewport">
            {VIEWPORTS.map((item) => (
              <button key={item.id} type="button" className={viewport === item.id ? "active" : ""} aria-pressed={viewport === item.id} onClick={() => setViewport(item.id)}>{item.label}</button>
            ))}
          </div>
          <button type="button" onClick={refreshPreview} aria-label="Refresh website preview">↻ Refresh</button>
          <a href={src} target="_blank" rel="noreferrer">Open full site ↗</a>
          {open && <button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Exit expanded view" : "Expand preview"}</button>}
          <button type="button" className="forge-actual-preview-toggle" onClick={() => { setExpanded(false); setOpen((value) => !value); }}>{open ? "Hide preview" : "Show preview"}</button>
        </div>
      </header>
      {open && (
        <div className={"forge-actual-preview-stage forge-actual-preview-stage-" + viewport}>
          <div className={"forge-actual-preview-frame forge-actual-preview-frame-" + viewport} style={{ width: "min(100%, " + selectedViewport.width + "px)" }}>
            <div className="forge-actual-preview-browserbar">
              <span className="forge-actual-preview-browser-dots" aria-hidden="true"><i/><i/><i/></span>
              <span className="forge-actual-preview-address">localhost:3000/forge/preview/{slug}</span>
              <span className={"forge-actual-preview-frame-status is-" + frameStatus} aria-live="polite">
                <i/>{frameStatus === "ready" ? "LIVE" : frameStatus === "error" ? "ERROR" : "LOADING"}
              </span>
            </div>
            <div className="forge-actual-preview-screen">
              {frameStatus === "loading" && <div className="forge-actual-preview-loading" aria-live="polite">Loading the generated website…</div>}
              {frameStatus === "error" && <div className="forge-actual-preview-error" role="alert">The local preview could not be loaded. Refresh the preview or open the site in a new tab.</div>}
              <iframe
                key={refreshKey}
                src={src + "?preview=" + refreshKey}
                title={title + " for " + slug + " · " + selectedViewport.label}
                loading="lazy"
                referrerPolicy="same-origin"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                onLoad={() => setFrameStatus("ready")}
                onError={() => setFrameStatus("error")}
              />
            </div>
          </div>
        </div>
      )}
      <footer className="forge-actual-preview-footer">
        <span>Rendered from the generated client configuration</span>
        <span>Desktop · Tablet · Mobile</span>
      </footer>
    </section>
  );
}
