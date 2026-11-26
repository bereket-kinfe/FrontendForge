import Link from "next/link";
import BrandingPanel from "@/components/forge/builder/BrandingPanel";
import IntegrationsPanel from "@/components/forge/builder/IntegrationsPanel";
import PageComposer from "@/components/forge/builder/PageComposer";
import WebsiteCanvasPreview from "@/components/forge/builder/WebsiteCanvasPreview";
import SectionInspector from "@/components/forge/builder/SectionInspector";
import DesignVersionsPanel from "@/components/forge/builder/DesignVersionsPanel";
import ActualClientPreview from "@/components/forge/builder/ActualClientPreview";

export default function BuilderWorkspace(props) {
  const {
    steps,
    step,
    setStep,
    setActiveTab,
    runAudit,
    starters,
    starter,
    chooseStarter,
    selectedStarter,
    form,
    updateForm,
    palettes,
    paletteId,
    choosePalette,
    colors,
    updateColor,
    componentStyles,
    setComponentStyles,
    sectionOptions,
    sections,
    toggleSection,
    orderedSections,
    reorderSections,
    sectionContent,
    sectionStyles,
    updateSectionContent,
    updateSectionStyle,
    activeSection,
    setActiveSection,
    designSnapshot,
    restoreDesignSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    catalogText,
    setCatalogText,
    integrationOptions,
    integrations,
    updateIntegration,
    result,
    error,
    busy,
    createClientProject,
    selectedCount
  } = props;

  const versionStorageKey = `frontendforge:design-versions:${form.slug || "new-client"}`;

  return (
    <>
          <section className="forge-v3-hero">
            <div>
              <span className="forge-v3-eyebrow">YOUR CLIENT WEBSITE WORKSPACE</span>
              <h1>Build the next client site.<br/><em>Start with a system.</em></h1>
              <p>Select a complete starter, shape the brand, choose reusable sections and record the business integrations. Forge then creates a separate, client-specific copy of the master project on this computer.</p>
              <div className="forge-v3-hero-actions">
                <a href="#builder" className="forge-v3-primary">Create a client project <span>↓</span></a>
                <a href="#starters" className="forge-v3-secondary">Explore all starters ↗</a>
              </div>
            </div>
            <div className="forge-v3-hero-preview">
              <div className="forge-v3-preview-bar"><span/><span/><span/><small>client-project / homepage</small></div>
              <div className="forge-v3-preview-inner">
                <span>BRAND SYSTEM · COMPONENTS · LAUNCH</span>
                <strong>One master.<br/><em>Every client.</em></strong>
                <div className="forge-v3-preview-swatches"><i/><i/><i/><i/><i/></div>
                <div className="forge-v3-preview-cards"><i/><i/><i/></div>
                <small>RESPONSIVE · REUSABLE · READY TO CUSTOMIZE</small>
              </div>
            </div>
          </section>

          <section className="forge-v3-metrics">
            <div><strong>06</strong><span>Designed website starters</span></div>
            <div><strong>13</strong><span>Modular page sections</span></div>
            <div><strong>06</strong><span>Integration categories</span></div>
            <div><strong>01</strong><span>Clean independent client copy</span></div>
          </section>

          <section className="forge-v3-library" id="starters">
            <div className="forge-v3-section-head">
              <div>
                <span className="forge-v3-eyebrow">MASTER STARTER LIBRARY</span>
                <h2>Choose a fully designed starting point.</h2>
                <p>Preview each complete website before using it. The selected design is preserved in the client copy alongside your customized client homepage.</p>
              </div>
              <Link href="/components">Browse reusable components ↗</Link>
            </div>
            <div className="forge-v3-starter-grid">
              {starters.map((item) => (
                <article className={`forge-v3-starter ${starter === item.id ? "is-selected" : ""}`} key={item.id}>
                  <div className={`forge-v3-starter-art ${item.preview}`}>
                    <span className="forge-v3-starter-no">{item.number} / STARTER</span>
                    <span className="forge-v3-starter-tag">{item.tag}</span>
                    <strong>{item.title}</strong>
                    <div className="forge-v3-art-blocks"><i/><i/><i/></div>
                  </div>
                  <div className="forge-v3-starter-content">
                    <small>{item.type}</small>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                    <div className="forge-v3-starter-actions">
                      <button type="button" className={starter === item.id ? "is-active" : ""} onClick={() => chooseStarter(item.id)}>
                        {starter === item.id ? "✓ Selected starter" : "Use this starter"}
                      </button>
                      <Link href={item.route} target="_blank">Preview full site ↗</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="forge-v3-builder" id="builder">
            <div className="forge-v3-section-head">
              <div>
                <span className="forge-v3-eyebrow">CLIENT QUICK START · FUNCTIONAL BUILDER</span>
                <h2>Turn the starter into a client project.</h2>
                <p>Complete the stages below. Required information is validated before Forge creates a new folder, leaving the master project unchanged.</p>
              </div>
              <div className="forge-v3-progress-copy">STEP {step + 1} OF 5</div>
            </div>

            <div className="forge-v3-stepper">
              {steps.map((label, index) => (
                <button type="button" className={`${index === step ? "active" : ""} ${index < step ? "done" : ""}`} onClick={() => setStep(index)} key={label}>
                  <span>{index < step ? "✓" : `0${index + 1}`}</span>{label}
                </button>
              ))}
            </div>

            <div className="forge-v3-builder-layout">
              {/* Summary with Live Brand Preview Simulation */}
              <aside className="forge-v3-summary">
                <span className="forge-v3-eyebrow">CURRENT PROJECT</span>
                <div className="forge-v3-summary-mark" style={{ background: colors.primary, color: colors.background }}>
                  {form.logoUrl ? <img src={form.logoUrl} alt={`${form.name} logo preview`} /> : (form.name.slice(0, 1).toUpperCase() || "F")}
                </div>
                <h3>{form.name || "Your client brand"}</h3>
                <p>{form.tagline || "Your brand tagline will appear here."}</p>
                <div className="forge-v3-summary-template">{selectedStarter?.title}</div>
                <div className="forge-v3-summary-colors">
                  {Object.entries(colors).slice(0, 5).map(([key, color]) => (
                    <span key={key} title={`${key}: ${color}`} style={{ background: color }} />
                  ))}
                </div>
                <div className="forge-v3-summary-meta"><span>Sections selected</span><b>{sections.length}</b></div>
                <div className="forge-v3-summary-meta"><span>Integration plans</span><b>{selectedCount}/6</b></div>

                <div className="forge-v3-summary-note">
                  Clean isolation: Internal Studio routes (<code>/</code>, <code>/docs</code>) are automatically excluded from the generated project.
                </div>
              </aside>

              <div className="forge-v3-panel">
                {step !== 4 && (
                  <div className="forge-editor-toolbar">
                    <div><strong>Visual editor history</strong><small>Undo or restore your latest design changes · Ctrl/⌘ Z</small></div>
                    <div>
                      <button type="button" onClick={undo} disabled={!canUndo} title="Undo last design change">↶ Undo</button>
                      <button type="button" onClick={redo} disabled={!canRedo} title="Redo design change">↷ Redo</button>
                    </div>
                  </div>
                )}
                {step === 0 && (
                  <div className="forge-v3-stage">
                    <span className="forge-v3-eyebrow">01 · WEBSITE STARTER</span>
                    <h3>Which type of business are you building for?</h3>
                    <p>Select the closest complete site. You can preview each one in the starter library above.</p>
                    <div className="forge-v3-choice-list">
                      {starters.map((item) => (
                        <div className={starter === item.id ? "selected" : ""} key={item.id}>
                          <span className="forge-v3-radio" aria-hidden="true"/>
                          <button type="button" className="forge-v3-choice-select" onClick={() => chooseStarter(item.id)} aria-pressed={starter === item.id}>
                            <strong>{item.title}</strong>
                            <small>{item.type}</small>
                          </button>
                          <Link href={item.route} target="_blank">Preview ↗</Link>
                        </div>
                      ))}
                    </div>
                    <div className="forge-v3-tip">
                      The generated client website will authentically render the <strong>{selectedStarter?.title}</strong> experience tailored with your client's custom brand tokens and catalog.
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <BrandingPanel
                    form={form}
                    updateForm={updateForm}
                    palettes={palettes}
                    paletteId={paletteId}
                    choosePalette={choosePalette}
                    colors={colors}
                    updateColor={updateColor}
                    componentStyles={componentStyles}
                    setComponentStyles={setComponentStyles}
                  />
                )}

                {step === 2 && (
                  <div className="forge-v3-stage">
                    <span className="forge-v3-eyebrow">03 · VISUAL PAGE COMPOSER</span>
                    <h3>Design the page structure and preview it as you work.</h3>
                    <p>Add reusable sections, drag them into the order you want, and switch between desktop, tablet and mobile canvas sizes. The header, hero and footer stay in their fixed positions.</p>

                    <div className="forge-visual-editor-layout">
                      <div className="forge-visual-editor-sidebar">
                        <PageComposer
                          sectionOptions={sectionOptions}
                          sections={sections}
                          orderedSections={orderedSections}
                          toggleSection={toggleSection}
                          reorderSections={reorderSections}
                          activeSection={activeSection}
                          setActiveSection={setActiveSection}
                        />
                        <SectionInspector
                          activeSection={activeSection}
                          sectionContent={sectionContent}
                          sectionStyles={sectionStyles}
                          updateSectionContent={updateSectionContent}
                          updateSectionStyle={updateSectionStyle}
                          form={form}
                          updateForm={updateForm}
                        />
                        <DesignVersionsPanel
                          storageKey={versionStorageKey}
                          snapshot={designSnapshot}
                          restoreSnapshot={restoreDesignSnapshot}
                        />
                      </div>
                      <WebsiteCanvasPreview
                        selectedStarter={selectedStarter}
                        form={form}
                        colors={colors}
                        componentStyles={componentStyles}
                        orderedSections={orderedSections}
                        sectionOptions={sectionOptions}
                        catalogText={catalogText}
                        sectionContent={sectionContent}
                        sectionStyles={sectionStyles}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        updateSectionContent={updateSectionContent}
                        updateForm={updateForm}
                      />
                    </div>

                    <div className="forge-v3-subhead">
                      <div><h4>Product & catalog data</h4><p>Changes here are reflected immediately in the preview canvas.</p></div>
                    </div>
                    <label className="forge-v3-textarea-label">
                      Catalog rows *
                      <textarea className="forge-v3-catalog" rows={8} value={catalogText} onChange={(e) => setCatalogText(e.target.value)} spellCheck="false"/>
                    </label>
                    <div className="forge-v3-tip">
                      <strong>Format:</strong> <code>Name | Category | Description | Price | Size:extra price | Add-on:extra price | Image path (optional)</code>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <IntegrationsPanel
                    integrationOptions={integrationOptions}
                    integrations={integrations}
                    updateIntegration={updateIntegration}
                  />
                )}

                {step === 4 && (
                  <div className="forge-v3-stage">
                    <span className="forge-v3-eyebrow">05 · REVIEW & CREATE</span>
                    <h3>{result ? "Your client workspace is ready." : "Ready to create an isolated project?"}</h3>
                    <p>{result ? result.message : "Forge will scaffold an isolated client project from the selected starter, apply your brand design tokens, and generate handover documentation."}</p>

                    {result ? (
                      <div className="forge-v3-created">
                        <span className="forge-v3-created-icon">✓</span>
                        <div>
                          <strong>{result.projectName}</strong>
                          <small>Client folder created under client-projects/{result.slug}</small>
                        </div>
                        <code>{result.path}</code>
                        <ActualClientPreview slug={result.slug} title={`${result.projectName} · actual generated website`} defaultOpen/>
                        <div className="forge-v3-created-commands">
                          <strong>Open this folder in VS Code, install dependencies, and run pre-flight QA:</strong>
                          <pre>cd client-projects/{result.slug}{"\n"}npm install{"\n"}npm run audit:client{"\n"}npm run dev</pre>
                          {result.orderUrl && <p>Ordering route: <code>{result.orderUrl}</code></p>}
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button type="button" onClick={() => navigator.clipboard?.writeText(result.path)}>Copy project path</button>
                            <button type="button" onClick={() => { setActiveTab("projects"); runAudit(result.slug); }}>View in Project Manager →</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="forge-v3-review-grid">
                        <div><small>SELECTED STARTER</small><strong>{selectedStarter?.title}</strong></div>
                        <div><small>CLIENT BRAND</small><strong>{form.name}</strong></div>
                        <div><small>ISOLATED FOLDER</small><strong>client-projects/{form.slug || "your-client"}</strong></div>
                        <div><small>SECTIONS SEQUENCE</small><strong>{orderedSections.length} sections configured</strong></div>
                        <div><small>PRODUCTS / MENU</small><strong>{catalogText.split(/\r?\n/).filter(Boolean).length} lines entered</strong></div>
                        <div><small>INTEGRATION PLANS</small><strong>{selectedCount} selected</strong></div>
                      </div>
                    )}

                    {error && <div className="forge-v3-error" role="alert">{error}</div>}
                    {!result && (
                      <button type="button" className="forge-v3-create-button" disabled={busy} onClick={createClientProject}>
                        {busy ? "Scaffolding client workspace…" : "Create separate client project →"}
                      </button>
                    )}
                    {result && (
                      <div className="forge-v3-after-create">
                        <p><strong>Next steps:</strong> Open the folder above. Replace sample photography with client-approved assets, configure provider credentials, and run <code>npm run audit:client</code> before handover.</p>
                        <button type="button" onClick={() => { setStep(0); setResult(null); setError(""); }}>Create another client</button>
                      </div>
                    )}
                  </div>
                )}

                {!result && (
                  <div className="forge-v3-panel-footer">
                    <button type="button" className="forge-v3-back" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                      ← Back
                    </button>
                    <div>
                      <span>{step + 1} / 5</span>
                      <button type="button" className="forge-v3-next" onClick={() => { setError(""); setStep((s) => Math.min(4, s + 1)); }}>
                        {step === 3 ? "Review project" : "Continue →"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
  );
}
