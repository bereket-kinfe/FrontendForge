"use client";

import { useMemo } from "react";
import { sectionOptions } from "@/lib/forge/studio-config.mjs";
import { getSectionStyleValues } from "@/lib/forge/editor-config.mjs";

const STYLE_OPTIONS = {
  spacing: [["compact", "Compact"], ["comfortable", "Comfortable"], ["spacious", "Spacious"]],
  headingSize: [["small", "Small"], ["normal", "Standard"], ["large", "Large"]],
  alignment: [["left", "Left"], ["center", "Center"], ["right", "Right"]],
  width: [["narrow", "Narrow"], ["standard", "Standard"], ["wide", "Wide"]],
  background: [["default", "Theme default"], ["surface", "Surface"], ["secondary", "Secondary"], ["primary", "Primary"]]
};

function Field({ label, value, onChange, multiline = false, placeholder = "Write your content…", maxLength }) {
  const shared = {
    value: value || "",
    onChange: (event) => onChange(event.target.value),
    placeholder,
    maxLength
  };
  return (
    <label className="forge-inspector-field">
      <span>{label}</span>
      {multiline ? <textarea rows={3} {...shared}/> : <input type="text" {...shared}/>}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="forge-inspector-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option value={optionValue} key={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

export default function SectionInspector({
  activeSection,
  sectionContent,
  sectionStyles,
  updateSectionContent,
  updateSectionStyle,
  form,
  updateForm
}) {
  const section = useMemo(
    () => sectionOptions.find(([id]) => id === activeSection),
    [activeSection]
  );
  const title = section?.[1] || activeSection || "Page section";
  const content = sectionContent?.[activeSection] || {};
  const style = getSectionStyleValues(activeSection, sectionStyles);
  const hasImageField = ["hero", "about", "roomInspiration", "gallery", "header"].includes(activeSection);
  const galleryImages = String(form.galleryImages || "").split(/\r?\n/).filter(Boolean);

  function updateGalleryImage(index, value) {
    const next = [...galleryImages];
    next[index] = value;
    updateForm("galleryImages", next.filter(Boolean).join("\n"));
  }

  return (
    <section className="forge-section-inspector" aria-labelledby="forge-inspector-title">
      <header>
        <div><span className="forge-v3-eyebrow">SELECTED ELEMENT</span><h4 id="forge-inspector-title">{title}</h4></div>
        <small>Live properties</small>
      </header>

      {activeSection === "header" ? (
        <div className="forge-inspector-fields">
          <Field label="Brand name" value={form.name} onChange={(value) => updateForm("name", value)} maxLength={80}/>
          <Field label="Logo image URL" value={form.logoUrl} onChange={(value) => updateForm("logoUrl", value)} placeholder="/images/logo.svg or https://…" maxLength={1000}/>
        </div>
      ) : activeSection === "footer" ? (
        <div className="forge-inspector-fields">
          <Field label="Footer brand line" value={content.heading} onChange={(value) => updateSectionContent("footer", "heading", value)} placeholder={form.tagline}/>
          <p className="forge-inspector-hint">The footer also uses your business name, tagline and navigation links.</p>
        </div>
      ) : (
        <div className="forge-inspector-fields">
          <Field label="Eyebrow / small label" value={content.eyebrow} onChange={(value) => updateSectionContent(activeSection, "eyebrow", value)} placeholder="Optional short label" maxLength={180}/>
          <Field label="Heading" value={content.heading} onChange={(value) => updateSectionContent(activeSection, "heading", value)} placeholder="Keep the starter heading or enter your own" maxLength={180}/>
          <Field label="Main text" value={content.body} onChange={(value) => updateSectionContent(activeSection, "body", value)} multiline maxLength={900}/>
          {(["about", "roomInspiration"].includes(activeSection)) && (
            <Field label="Supporting text" value={content.secondaryBody} onChange={(value) => updateSectionContent(activeSection, "secondaryBody", value)} multiline maxLength={900}/>
          )}
        </div>
      )}

      {hasImageField && (
        <div className="forge-inspector-images">
          <strong>Images</strong>
          {(activeSection === "hero") && <Field label="Hero image URL" value={form.heroImageUrl} onChange={(value) => updateForm("heroImageUrl", value)} placeholder="/images/hero.webp or https://…" maxLength={1000}/>}
          {(activeSection === "about" || activeSection === "roomInspiration" || activeSection === "gallery") && (
            <>
              <Field label="Image 1 URL" value={galleryImages[0]} onChange={(value) => updateGalleryImage(0, value)} placeholder="/images/photo-1.webp or https://…" maxLength={1000}/>
              <Field label="Image 2 URL" value={galleryImages[1]} onChange={(value) => updateGalleryImage(1, value)} placeholder="/images/photo-2.webp or https://…" maxLength={1000}/>
              <Field label="Image 3 URL" value={galleryImages[2]} onChange={(value) => updateGalleryImage(2, value)} placeholder="/images/photo-3.webp or https://…" maxLength={1000}/>
            </>
          )}
        </div>
      )}

      {activeSection !== "header" && activeSection !== "footer" && (
        <div className="forge-inspector-style-grid">
          <div className="forge-inspector-subhead"><strong>Layout & appearance</strong><small>Changes update the generated site.</small></div>
          {Object.entries(STYLE_OPTIONS).map(([field, options]) => (
            <SelectField
              key={field}
              label={{ spacing: "Section spacing", headingSize: "Heading size", alignment: "Text alignment", width: "Content width", background: "Background" }[field]}
              value={style[field] || options[1][0]}
              options={options}
              onChange={(value) => updateSectionStyle(activeSection, field, value)}
            />
          ))}
        </div>
      )}

      <p className="forge-inspector-hint">Tip: double-click editable text or use these fields. Image URLs can point to a file in <code>public/</code> or an approved HTTPS image.</p>
    </section>
  );
}
