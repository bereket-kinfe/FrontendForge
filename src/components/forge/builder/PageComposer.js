"use client";

import { useMemo, useState } from "react";

const PINNED_SECTIONS = new Set(["header", "hero", "footer"]);

export default function PageComposer({
  sectionOptions,
  sections,
  orderedSections,
  toggleSection,
  reorderSections,
  activeSection,
  setActiveSection
}) {
  const [draggedSectionId, setDraggedSectionId] = useState("");
  const sectionMap = useMemo(
    () => new Map(sectionOptions.map(([id, title, description]) => [id, { title, description }])),
    [sectionOptions]
  );
  const visibleOrder = orderedSections.filter((id) => !PINNED_SECTIONS.has(id));
  const availableSections = sectionOptions.filter(([id]) => !PINNED_SECTIONS.has(id) && !sections.includes(id));

  function dropOnSection(targetId) {
    if (!draggedSectionId || draggedSectionId === targetId) return;
    const fromIndex = visibleOrder.indexOf(draggedSectionId);
    const toIndex = visibleOrder.indexOf(targetId);
    if (fromIndex >= 0 && toIndex >= 0) reorderSections(fromIndex, toIndex);
    setDraggedSectionId("");
  }

  return (
    <div className="forge-page-composer">
      <section className="forge-composer-column" aria-labelledby="forge-page-order-heading">
        <div className="forge-composer-heading">
          <div>
            <span className="forge-v3-eyebrow">PAGE STRUCTURE</span>
            <h4 id="forge-page-order-heading">Arrange your homepage</h4>
            <p>Drag a section to change its position. Use the arrow buttons for precise keyboard-friendly ordering.</p>
          </div>
          <span className="forge-composer-count">{sections.length} active</span>
        </div>

        <div className="forge-composer-list">
          <button type="button" className={`forge-composer-pinned ${activeSection === "header" ? "is-active" : ""}`} onClick={() => setActiveSection("header")}><span>⌑</span><div><strong>Site header</strong><small>Fixed at the top of the page</small></div><span className="forge-composer-lock">PINNED</span></button>
          <button type="button" className={`forge-composer-pinned ${activeSection === "hero" ? "is-active" : ""}`} onClick={() => setActiveSection("hero")}><span>✦</span><div><strong>Hero / main banner</strong><small>Primary introduction for the business</small></div><span className="forge-composer-lock">PINNED</span></button>

          {visibleOrder.map((id, index) => {
            const section = sectionMap.get(id) || { title: id, description: "Custom page section" };
            return (
              <div
                className={`forge-composer-item ${draggedSectionId === id ? "is-dragging" : ""} ${activeSection === id ? "is-active" : ""}`}
                key={id}
                draggable
                onClick={() => setActiveSection(id)}
                aria-pressed={activeSection === id}
                onDragStart={(event) => {
                  setDraggedSectionId(id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", id);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  dropOnSection(id);
                }}
                onDragEnd={() => setDraggedSectionId("")}
              >
                <span className="forge-composer-grip" aria-hidden="true">⠿</span>
                <div className="forge-composer-item-copy"><strong>{section.title}</strong><small>{section.description}</small></div>
                <div className="forge-composer-item-actions">
                  <button type="button" title={`Move ${section.title} up`} aria-label={`Move ${section.title} up`} disabled={index === 0} onClick={() => reorderSections(index, index - 1)}>↑</button>
                  <button type="button" title={`Move ${section.title} down`} aria-label={`Move ${section.title} down`} disabled={index === visibleOrder.length - 1} onClick={() => reorderSections(index, index + 1)}>↓</button>
                  <button type="button" className="remove" title={`Remove ${section.title}`} aria-label={`Remove ${section.title}`} onClick={() => toggleSection(id)}>×</button>
                </div>
              </div>
            );
          })}

          <button type="button" className={`forge-composer-pinned ${activeSection === "footer" ? "is-active" : ""}`} onClick={() => setActiveSection("footer")}><span>⌄</span><div><strong>Footer</strong><small>Fixed at the end of the page</small></div><span className="forge-composer-lock">PINNED</span></button>
        </div>

        <div className="forge-component-library">
          <div className="forge-composer-heading compact">
            <div><h4>Reusable section library</h4><p>Add ready-to-configure sections to this page.</p></div>
          </div>
          {availableSections.length > 0 ? (
            <div className="forge-library-list">
              {availableSections.map(([id, title, description]) => (
                <div className="forge-library-item" key={id}>
                  <div><strong>{title}</strong><small>{description}</small></div>
                  <button type="button" onClick={() => toggleSection(id)} aria-label={`Add ${title}`}>＋ Add</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="forge-library-empty">All available sections are already on this page.</p>
          )}
        </div>
      </section>
    </div>
  );
}
