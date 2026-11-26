import ForgeBuildReport from "@/components/forge/shared/ForgeBuildReport";

export default function DashboardPanel(props) {
  const {
    starters,
    starterImage,
    filteredStarters,
    filteredProjects,
    loadingProjects,
    projects,
    getProjectStatus,
    searchTerm,
    setActiveTab,
    setStep,
    startFromStarter,
    openProjectPreview,
    openProjectEditor,
    buildClient,
    runAudit,
    buildBusySlug,
    auditBusySlug,
    fetchProjects,
    buildReport,
    auditReport
  } = props;

  return (
    <div className="forge-dashboard-page">
        <section className="forge-dashboard-hero">
          <div className="forge-dashboard-hero-copy"><span>YOUR WEBSITE PRODUCTION WORKSPACE</span><h1>Create Stunning Websites<br/>for Your <em>Business Clients</em></h1><p>Choose a complete starter, customize the brand, and create a separate client website with FrontendForge.</p><button onClick={() => { setActiveTab("builder"); setStep(0); }}>✦ Start Building Now <b>→</b></button></div>
          <div className="forge-dashboard-hero-art"><div className="forge-hero-window forge-window-back"><small>FRONTEND FORGE · STARTERS</small><div className="forge-window-swatch-row"><i/><i/><i/></div><div className="forge-window-blocks"><i/><i/><i/></div></div><div className="forge-hero-window forge-window-front"><div className="forge-window-top"><i/><i/><i/><span>your-client-site.com</span></div><div className="forge-window-photo" style={{backgroundImage:`url(${starterImage.cafe})`}}><strong>Good Coffee,<br/>Better Together.</strong><small>Freshly brewed. Always delightful.</small></div></div><div className="forge-hero-sticker">YOUR BRAND<br/><b>YOUR STYLE</b> ↗</div></div>
        </section>
        <section className="forge-dashboard-main-grid">
          <div className="forge-dashboard-left">
            <div className="forge-dashboard-section-title"><div><span>✦</span><div><h2>Choose a Starter</h2><p>Pick a complete website template and customize it for your client.</p></div></div><button onClick={() => setActiveTab("builder")}>View All Templates →</button></div>
            <div className="forge-featured-starters">
              {starters.filter((item) => ["cafe", "restaurant"].includes(item.id)).filter((item) => !searchTerm || filteredStarters.some((match) => match.id === item.id)).map((item) => <article className="forge-featured-card" key={item.id}>
                <div className={`forge-featured-preview preview-${item.id}`} style={{backgroundImage:`linear-gradient(90deg,rgba(8,18,31,.12),rgba(8,18,31,.04)),url(${starterImage[item.id]})`}}><div className="forge-preview-browser"><i/><i/><i/><span>{item.title}</span></div><div className="forge-preview-headline">{item.id === "cafe" ? "Good Coffee, Better Together." : "Delicious Food, Delivered Fresh"}<small>{item.id === "cafe" ? "Freshly brewed. Always delightful." : "Order your favorite meals from the best restaurant."}</small></div></div>
                <div className="forge-featured-info"><div><h3>{item.id === "cafe" ? "☕ MACHI Coffee" : "🍴 Foodie Restaurant"}<small>{item.description}</small></h3><div className="forge-feature-tags">{item.features.slice(0,3).map((f) => <span key={f}>✓ {f}</span>)}</div></div><button onClick={() => startFromStarter(item.id)}>Use This Template →</button></div>
              </article>)}
            </div>
            <div className="forge-more-starters-head"><h2>More website starters</h2><span>{filteredStarters.length} available</span></div>
            <div className="forge-more-starters">{starters.filter((item) => !["cafe", "restaurant"].includes(item.id)).filter((item) => !searchTerm || filteredStarters.some((match) => match.id === item.id)).map((item) => <article className="forge-mini-starter" key={item.id}><div className="forge-mini-starter-image" style={{backgroundImage:`url(${starterImage[item.id]})`}}><span>{item.tag}</span></div><div className="forge-mini-starter-copy"><strong>{item.title}</strong><small>{item.type}</small><button onClick={() => startFromStarter(item.id)}>Use template →</button></div></article>)}</div>
          </div>
          <aside className="forge-quickstart-card"><div className="forge-quickstart-heading"><span>ϟ</span><h2>Client Quick-Start</h2></div><p>These simple steps help you create your client website.</p><ol><li><b>1</b><div><strong>Choose a Template</strong><small>Select a starter from the gallery.</small></div></li><li><b>2</b><div><strong>Configure Your Brand</strong><small>Add your logo, colors and content.</small></div></li><li><b>3</b><div><strong>Customize Features</strong><small>Enable ordering, booking, delivery and more.</small></div></li><li><b>4</b><div><strong>Create Your Project</strong><small>Make an independent copy of the master project.</small></div></li><li><b>5</b><div><strong>Test & Launch</strong><small>Run quality checks and prepare deployment.</small></div></li></ol><button className="forge-quickstart-cta" onClick={() => { setActiveTab("builder"); setStep(0); }}>ϟ Start Quick Start →</button></aside>
        </section>
        <section className="forge-dashboard-projects"><div className="forge-dashboard-section-title"><div><span>📁</span><div><h2>Your Projects</h2><p>Manage your client websites here.</p></div></div><button onClick={() => { setActiveTab("projects"); fetchProjects(); }}>View All Projects →</button></div>
          {loadingProjects ? <p className="forge-empty-projects">Loading client projects...</p> : projects.length === 0 ? <div className="forge-empty-projects">No client projects yet. Choose a starter above to create your first website.</div> : filteredProjects.length === 0 ? <div className="forge-empty-projects">No client projects match “{searchTerm}”. Try another business name or template.</div> : <div className="forge-project-list">{filteredProjects.slice(0,5).map((proj) => { const status = getProjectStatus(proj); return <article className="forge-project-row" key={proj.slug}><div className="forge-project-thumb" style={{backgroundImage:`url(${starterImage[proj.template] || starterImage.ecommerce})`}}/><div className="forge-project-row-main"><strong>{proj.name} Website <span className={`forge-status-pill forge-status-${status.kind}`}>● {status.label}</span></strong><small>{proj.createdAt ? `Last updated ${new Date(proj.createdAt).toLocaleDateString()}` : "Local client project"} · {proj.sectionsCount} pages/sections</small></div><div className="forge-project-row-actions"><button onClick={() => openProjectPreview(proj)}>◉ Preview</button><button onClick={() => openProjectEditor(proj)}>✎ Edit</button><button onClick={() => buildClient(proj)} disabled={buildBusySlug === proj.slug}>⚙ {buildBusySlug === proj.slug ? "Building…" : "Build"}</button><button className="forge-more-button" title="Run QA audit" onClick={() => runAudit(proj.slug)} disabled={auditBusySlug === proj.slug}>{auditBusySlug === proj.slug ? "…" : "✓ QA"}</button></div></article>;})}</div>}
          <ForgeBuildReport report={buildReport} />
          {auditReport && <div className="forge-build-report"><strong>{auditReport.ok ? "QA audit passed" : "QA audit needs attention"} · {auditReport.clientName}</strong><p>{auditReport.summary}</p>{auditReport.issues?.map((issue) => <small key={issue}>• {issue}</small>)}</div>}
        </section>
      </div>
  );
}
