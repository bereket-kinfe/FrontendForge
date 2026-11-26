import ForgeBuildReport from "@/components/forge/shared/ForgeBuildReport";

export default function ProjectManagerPanel(props) {
  const {
    projectStats,
    filteredProjects,
    projects,
    projectFilter,
    setProjectFilter,
    loadingProjects,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    runAudit,
    auditBusySlug,
    getProjectStatus,
    openProjectPreview,
    openProjectEditor,
    buildBusySlug,
    buildClient,
    deleteProject,
    buildReport,
    auditReport,
    setAuditReport
  } = props;

  return (
    <section className="forge-v3-builder" style={{ paddingTop: "20px" }}>
          <div className="forge-v3-section-head">
            <div>
              <span className="forge-v3-eyebrow">PROJECT MANAGEMENT & QA</span>
              <h2>Generated Client Workspaces</h2>
              <p>Independent client websites generated on this machine under <code>client-projects/</code>. Run pre-flight audits, check release readiness, or manage workspace folders.</p>
            </div>
            <button type="button" className="forge-v3-primary" onClick={() => setActiveTab("builder")}>+ New Client Project</button>
          </div>

          <div className="forge-project-stats" aria-label="Project release overview">
            <div><strong>{projectStats.total}</strong><span>Client websites</span></div>
            <div><strong>{projectStats.pending}</strong><span>Awaiting QA</span></div>
            <div><strong>{projectStats.passed}</strong><span>QA passed</span></div>
            <div><strong>{projectStats.attention}</strong><span>Need attention</span></div>
            <div><strong>{projectStats.built}</strong><span>Production builds</span></div>
          </div>

          <div className="forge-project-toolbar">
            <div className="forge-project-filter" role="group" aria-label="Filter client projects">
              {[ ["all", "All projects"], ["pending", "Awaiting QA"], ["attention", "Needs attention"], ["passed", "QA passed"], ["built", "Built"] ].map(([value, label]) => (
                <button type="button" key={value} className={projectFilter === value ? "active" : ""} onClick={() => setProjectFilter(value)}>{label}</button>
              ))}
            </div>
            <span className="forge-project-result-count">Showing {filteredProjects.length} of {projects.length}</span>
          </div>

          {loadingProjects ? (
            <p style={{ color: "#9aa7be", fontSize: "12px" }}>Scanning client projects directory...</p>
          ) : projects.length === 0 ? (
            <div className="forge-v3-created" style={{ background: "#111a2d", borderColor: "#2d3954" }}>
              <strong>No client projects found yet.</strong>
              <p style={{ margin: "6px 0 14px", fontSize: "11px", color: "#8d9cb5" }}>Use the Project Builder to create your first isolated client website from any starter template.</p>
              <button type="button" onClick={() => setActiveTab("builder")}>Create First Client Project →</button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="forge-project-empty-filter"><strong>No matching client websites.</strong><span>Change the search term or select another status filter.</span><button type="button" onClick={() => { setSearchTerm(""); setProjectFilter("all"); }}>Clear search and filters</button></div>
          ) : (
            <div className="forge-projects-grid">
              {filteredProjects.map((proj) => {
                const status = getProjectStatus(proj);
                return (
                  <article className="forge-project-card" key={proj.slug}>
                    <div className="forge-project-card-header">
                      <div>
                        <strong>{proj.name}</strong>
                        <br /><small>{proj.slug}</small>
                      </div>
                      <span className="forge-project-tag">{proj.templateLabel}</span>
                    </div>
                    <div className="forge-project-status-line"><span className={`forge-status-pill forge-status-${status.kind}`}>● {status.label}</span><small>{proj.createdAt ? `Updated ${new Date(proj.createdAt).toLocaleDateString()}` : "Local client project"}</small></div>
                    <div className="forge-project-meta">
                      <div><span>Products:</span> <b>{proj.productsCount}</b></div>
                      <div><span>Sections:</span> <b>{proj.sectionsCount}</b></div>
                      <div><span>Ordering:</span> <b>{proj.orderEnabled ? "WhatsApp Order" : "Link-out / Enquire"}</b></div>
                      <div><span>Last QA:</span> <b>{proj.auditStatus?.checkedAt ? new Date(proj.auditStatus.checkedAt).toLocaleDateString() : "Not run"}</b></div>
                      <div><span>Production build:</span> <b>{proj.buildStatus?.builtAt ? new Date(proj.buildStatus.builtAt).toLocaleDateString() : "Not run"}</b></div>
                      <div><span>Audit checks:</span> <b>{proj.auditStatus ? `${proj.auditStatus.passedChecks?.length || 0} passed · ${proj.auditStatus.issues?.length || 0} issues` : "Pending"}</b></div>
                    </div>
                    <div className="forge-project-colors" aria-label="Client brand color palette">
                      {Object.entries(proj.theme || {}).slice(0, 5).map(([key, color]) => (
                        <span key={key} title={`${key}: ${color}`} style={{ background: color }} />
                      ))}
                    </div>
                    <div className="forge-project-actions">
                      <button type="button" onClick={() => openProjectPreview(proj)}>Preview</button>
                      <button type="button" onClick={() => openProjectEditor(proj)}>Edit brand</button>
                      <button type="button" className="primary" disabled={auditBusySlug === proj.slug} onClick={() => runAudit(proj.slug)}>
                        {auditBusySlug === proj.slug ? "Auditing…" : "Run QA"}
                      </button>
                      <button type="button" disabled={buildBusySlug === proj.slug} onClick={() => buildClient(proj)}>
                        {buildBusySlug === proj.slug ? "Building…" : "Build"}
                      </button>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(proj.path)}>Copy path</button>
                      <button type="button" className="danger" onClick={() => deleteProject(proj.slug)}>Delete</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <ForgeBuildReport report={buildReport} />

          {/* Audit Results Modal / Box */}
          {auditReport && (
            <div className="forge-audit-modal">
              <div className="forge-audit-header">
                <div>
                  <strong style={{ fontSize: "14px" }}>Release Readiness Audit: {auditReport.clientName}</strong>
                  <br /><small style={{ color: "#8ca0be" }}>Folder: client-projects/{auditReport.clientSlug}</small>
                </div>
                <span className={`forge-audit-badge ${auditReport.ok ? "pass" : "fail"}`}>
                  {auditReport.ok ? "AUDIT PASSED" : "ACTION REQUIRED"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: auditReport.ok ? "#a9e0cf" : "#ffb5b5" }}>{auditReport.summary}</p>
              
              <div className="forge-audit-list">
                {auditReport.issues.map((issue, idx) => (
                  <div className="forge-audit-item issue" key={`iss-${idx}`}>✗ {issue}</div>
                ))}
                {auditReport.warnings.map((warn, idx) => (
                  <div className="forge-audit-item warning" key={`wrn-${idx}`}>⚠ {warn}</div>
                ))}
                {auditReport.passedChecks.map((chk, idx) => (
                  <div className="forge-audit-item pass" key={`chk-${idx}`}>✓ {chk.name}</div>
                ))}
              </div>
              <button type="button" style={{ justifySelf: "start", background: "#1c2844", border: "1px solid #37476c", color: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "10px", cursor: "pointer" }} onClick={() => setAuditReport(null)}>Close Report</button>
            </div>
          )}
        </section>
  );
}
