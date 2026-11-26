"use client";

import { useMemo, useState } from "react";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: 940, icon: "▭" },
  { id: "tablet", label: "Tablet", width: 680, icon: "▯" },
  { id: "mobile", label: "Mobile", width: 390, icon: "▯" }
];

function parseCatalogRows(catalogText, currency) {
  return String(catalogText || "")
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(0, 3)
    .map((line) => {
      const [name, category, description, price] = line.split("|").map((part) => part?.trim() || "");
      return { name: name || "Featured item", category: category || "Featured", description, price, currency };
    });
}

function InlineEditable({ as: Tag = "p", value, onSave, sectionId, setActiveSection, className = "" }) {
  const [editing, setEditing] = useState(false);
  return (
    <Tag
      className={`forge-inline-editable ${className}`}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={editing}
      tabIndex={0}
      title="Double-click to edit this text"
      onClick={() => setActiveSection(sectionId)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setActiveSection(sectionId);
        const editableNode = event.currentTarget;
        setEditing(true);
        requestAnimationFrame(() => editableNode.focus());
      }}
      onBlur={(event) => {
        if (!editing) return;
        setEditing(false);
        const nextValue = event.currentTarget.textContent || "";
        if (nextValue !== value) onSave(nextValue);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.currentTarget.textContent = value || "";
          event.currentTarget.blur();
        }
      }}
    >{value}</Tag>
  );
}

function InlineImageEditor({ src, alt, label, onSave, setActiveSection, sectionId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(src || "");
  return (
    <div className="forge-inline-image-editor" onClick={() => setActiveSection(sectionId)}>
      {src ? <img src={src} alt={alt} /> : <span className="forge-inline-image-placeholder">Add {label}</span>}
      <button type="button" className="forge-inline-image-action" onClick={(event) => {
        event.stopPropagation();
        setActiveSection(sectionId);
        setDraft(src || "");
        setEditing((current) => !current);
      }}>{editing ? "Close" : `Change ${label}`}</button>
      {editing && (
        <form className="forge-inline-image-form" onSubmit={(event) => {
          event.preventDefault();
          onSave(draft.trim());
          setEditing(false);
        }} onClick={(event) => event.stopPropagation()}>
          <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={`${label} image URL`} placeholder="/images/photo.webp or https://…"/>
          <button type="submit">Apply</button>
        </form>
      )}
    </div>
  );
}

function sectionPresentation(sectionId, styles, colors) {
  const style = styles?.[sectionId] || {};
  const spacing = { compact: 12, comfortable: 20, spacious: 30 }[style.spacing] || 20;
  const headingSize = { small: "0.85em", normal: "1em", large: "1.18em" }[style.headingSize] || "1em";
  const backgrounds = { surface: colors.surface, secondary: colors.secondary, primary: colors.primary };
  return {
    paddingBlock: `${spacing}px`,
    textAlign: style.alignment || "left",
    background: backgrounds[style.background] || undefined,
    "--forge-preview-heading-scale": headingSize,
    maxWidth: style.width === "narrow" ? "88%" : style.width === "wide" ? "100%" : "96%",
    marginInline: "auto"
  };
}

export default function WebsiteCanvasPreview({
  selectedStarter,
  form,
  colors,
  componentStyles,
  orderedSections,
  sectionOptions,
  catalogText,
  sectionContent = {},
  sectionStyles = {},
  activeSection = "hero",
  setActiveSection = () => {},
  updateSectionContent = () => {},
  updateForm = () => {}
}) {
  const [viewport, setViewport] = useState("desktop");
  const [showGrid, setShowGrid] = useState(false);
  const viewportConfig = VIEWPORTS.find((item) => item.id === viewport) || VIEWPORTS[0];
  const sectionMap = useMemo(
    () => new Map(sectionOptions.map(([id, title, description]) => [id, { title, description }])),
    [sectionOptions]
  );
  const products = useMemo(() => parseCatalogRows(catalogText, form.currency || "ETB"), [catalogText, form.currency]);
  const buttonRadius = componentStyles.buttons === "pill" ? 999 : componentStyles.buttons === "rounded" ? 9 : 0;
  const activeSections = orderedSections.filter((id) => id !== "header" && id !== "footer");
  const galleryImages = String(form.galleryImages || "").split(/\r?\n/).filter(Boolean);

  function text(sectionId, field, fallback) {
    return sectionContent?.[sectionId]?.[field] || fallback;
  }

  function sectionProps(id) {
    return {
      className: `forge-canvas-section-shell ${activeSection === id ? "is-selected" : ""}`,
      style: sectionPresentation(id, sectionStyles, colors),
      onClick: () => setActiveSection(id),
      "data-section-id": id
    };
  }

  function editable(sectionId, field, fallback, Tag = "p", className = "") {
    return <InlineEditable
      as={Tag}
      value={text(sectionId, field, fallback)}
      onSave={(value) => updateSectionContent(sectionId, field, value)}
      sectionId={sectionId}
      setActiveSection={setActiveSection}
      className={className}
    />;
  }

  function renderSection(id) {
    const meta = sectionMap.get(id) || { title: id, description: "A section from your page library." };
    if (id === "hero") {
      return (
        <section {...sectionProps(id)} key={id}>
          <div className={`forge-canvas-hero hero-${componentStyles.hero}`} style={{ background: colors.secondary, color: colors.text }}>
            <div className="forge-canvas-hero-copy">
              {editable(id, "eyebrow", `${selectedStarter?.tag || "WELCOME"} · ${form.name || "YOUR BRAND"}`, "small")}
              {editable(id, "heading", form.tagline || "Your headline belongs here.", "h2")}
              {editable(id, "body", form.description || "Add a short introduction that tells visitors what makes this business special.")}
              <button type="button" style={{ background: colors.primary, color: colors.surface, borderRadius: buttonRadius }}>Explore the collection</button>
            </div>
            <InlineImageEditor src={form.heroImageUrl} alt={`${form.name || "Brand"} hero preview`} label="hero image" sectionId={id} setActiveSection={setActiveSection} onSave={(value) => updateForm("heroImageUrl", value)}/>
          </div>
        </section>
      );
    }

    if (id === "catalog") {
      return (
        <section {...sectionProps(id)} key={id}>
          <div className="forge-canvas-section-heading">
            {editable(id, "eyebrow", "CURATED FOR YOU", "small")}
            {editable(id, "heading", meta.title, "h3")}
            {editable(id, "body", meta.description)}
          </div>
          <div className={`forge-canvas-products catalog-${componentStyles.catalog}`}>
            {products.map((product, index) => (
              <article key={`${product.name}-${index}`} style={{ background: colors.surface, borderColor: colors.secondary }}>
                <div className="forge-canvas-product-art" style={{ background: `linear-gradient(145deg, ${colors.secondary}, ${colors.accent})`, color: colors.text }}>{String(index + 1).padStart(2, "0")}</div>
                <small style={{ color: colors.muted }}>{product.category}</small><strong>{product.name}</strong>
                {product.description && <small className="forge-canvas-product-description">{product.description}</small>}
                <span style={{ color: colors.primary }}>{product.price ? `${product.currency} ${product.price}` : "Price on request"}</span>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (id === "gallery") {
      return (
        <section {...sectionProps(id)} key={id}>
          <div className="forge-canvas-section-heading">
            {editable(id, "eyebrow", "VISUAL STORIES", "small")}
            {editable(id, "heading", meta.title, "h3")}
            {editable(id, "body", meta.description)}
          </div>
          <div className="forge-canvas-gallery">
            {[0, 1, 2].map((index) => (
              <InlineImageEditor
                key={index}
                src={galleryImages[index] || ""}
                alt={`${form.name || "Brand"} gallery preview ${index + 1}`}
                label={`gallery image ${index + 1}`}
                sectionId={id}
                setActiveSection={setActiveSection}
                onSave={(value) => {
                  const next = [...galleryImages];
                  next[index] = value;
                  updateForm("galleryImages", next.filter(Boolean).join("\n"));
                }}
              />
            ))}
          </div>
        </section>
      );
    }

    if (id === "testimonials") {
      return (
        <section {...sectionProps(id)} key={id}>
          <div className="forge-canvas-quote" style={{ background: colors.secondary }}>
            <span style={{ color: colors.primary }}>“</span>
            {editable(id, "heading", meta.title, "h3")}
            {editable(id, "body", "Approved customer feedback can appear here once real testimonials are supplied.")}
            <small>REAL CUSTOMER · APPROVED CONTENT REQUIRED</small>
          </div>
        </section>
      );
    }

    return (
      <section {...sectionProps(id)} key={id}>
        <div className="forge-canvas-generic" style={{ borderColor: colors.secondary }}>
          <div className="forge-canvas-generic-mark" style={{ background: colors.secondary, color: colors.primary }}>{meta.title.slice(0, 1)}</div>
          <div>
            {editable(id, "eyebrow", "SECTION PREVIEW", "small")}
            {editable(id, "heading", meta.title, "h3")}
            {editable(id, "body", id === "about" ? form.description || meta.description : id === "location" ? form.address || meta.description : id === "contact" ? `${form.phone || "Phone"} · ${form.email || "Email"}` : meta.description)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="forge-canvas-panel" aria-label="Live website preview">
      <div className="forge-canvas-toolbar">
        <div><span className="forge-v3-eyebrow">LIVE CANVAS</span><strong>Page preview</strong></div>
        <div className="forge-canvas-toolbar-actions">
          {VIEWPORTS.map((item) => (
            <button type="button" key={item.id} className={viewport === item.id ? "active" : ""} onClick={() => setViewport(item.id)} aria-pressed={viewport === item.id} title={`${item.label} preview`}>
              <span aria-hidden="true">{item.icon}</span><small>{item.label}</small>
            </button>
          ))}
          <button type="button" className={`forge-canvas-grid-toggle ${showGrid ? "active" : ""}`} onClick={() => setShowGrid((value) => !value)} aria-pressed={showGrid} title="Toggle layout guides">▦</button>
        </div>
      </div>
      <div className="forge-canvas-stage">
        <div className={`forge-canvas-device ${showGrid ? "show-guides" : ""} viewport-${viewport}`} style={{ width: `min(100%, ${viewportConfig.width}px)` }}>
          <div className="forge-canvas-browser-bar"><span/><span/><span/><small>{form.slug || "client-site"}.local /</small></div>
          <div className="forge-canvas-site" style={{ background: colors.background, backgroundImage: showGrid ? "linear-gradient(#7a68e012 1px, transparent 1px), linear-gradient(90deg, #7a68e012 1px, transparent 1px)" : "none", backgroundSize: showGrid ? "18px 18px" : "auto", color: colors.text, fontFamily: form.font?.includes("Georgia") ? "Georgia, serif" : form.font === "DM Sans" ? "Arial, sans-serif" : "Arial, sans-serif", "--canvas-primary": colors.primary, "--canvas-secondary": colors.secondary, "--canvas-surface": colors.surface, "--canvas-muted": colors.muted, "--canvas-accent": colors.accent, "--canvas-text": colors.text }}>
            {orderedSections.includes("header") && (
              <header className={`forge-canvas-header header-${componentStyles.header} ${activeSection === "header" ? "is-selected" : ""}`} onClick={() => setActiveSection("header")}>
                <strong>
                  {form.logoUrl ? <img src={form.logoUrl} alt=""/> : <span style={{ background: colors.primary }}>{(form.name || "F").slice(0, 1).toUpperCase()}</span>}
                  <InlineEditable as="span" value={form.name || "Your brand"} onSave={(value) => updateForm("name", value)} sectionId="header" setActiveSection={setActiveSection}/>
                </strong>
                <nav><span>Home</span><span>Discover</span><span>About</span><span>Contact</span></nav>
                <button type="button" style={{ background: colors.primary, color: colors.surface, borderRadius: buttonRadius }}>Get in touch</button>
              </header>
            )}
            {activeSections.map((id) => renderSection(id))}
            {orderedSections.includes("footer") && (
              <footer className={`forge-canvas-footer ${activeSection === "footer" ? "is-selected" : ""}`} onClick={() => setActiveSection("footer")} style={{ background: colors.text, color: colors.background }}>
                <strong>{form.name || "Your brand"}</strong><InlineEditable value={text("footer", "heading", form.tagline || "Your brand tagline")} onSave={(value) => updateSectionContent("footer", "heading", value)} sectionId="footer" setActiveSection={setActiveSection}/>
                <small>© {new Date().getFullYear()} · All rights reserved</small>
              </footer>
            )}
          </div>
        </div>
      </div>
      <p className="forge-canvas-disclaimer">Double-click text to edit it. Select any section to open its properties. Use image controls to replace pictures.</p>
    </section>
  );
}
