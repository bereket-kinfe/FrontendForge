"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useForgeBuilder from "@/hooks/forge/useForgeBuilder";
import useForgeProjects from "@/hooks/forge/useForgeProjects";

import DashboardPanel from "@/components/forge/dashboard/DashboardPanel";
import ProjectManagerPanel from "@/components/forge/projects/ProjectManagerPanel";
import BuilderWorkspace from "@/components/forge/builder/BuilderWorkspace";

import {
  starters,
  palettes,
  sectionOptions,
  integrationOptions
} from "@/lib/forge/studio-config.mjs";

export default function ForgeStudio() {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | builder | projects
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const projectState = useForgeProjects();
  const builderState = useForgeBuilder({
    createClientRequest: projectState.createClientRequest,
    onProjectCreated: projectState.fetchProjects
  });

  const {
    projects,
    loadingProjects,
    auditReport,
    setAuditReport,
    auditBusySlug,
    buildBusySlug,
    buildReport,
    previewProject,
    previewConfig,
    editProject,
    editDraft,
    editSaving,
    fetchProjects,
    runAudit,
    deleteProject,
    openProjectPreview,
    closeProjectPreview,
    openProjectEditor,
    closeProjectEditor,
    updateEditDraft,
    updateEditThemeColor,
    saveProjectEditor,
    buildClient
  } = projectState;

  const {
    step,
    setStep,
    starter,
    paletteId,
    colors,
    form,
    sections,
    orderedSections,
    componentStyles,
    setComponentStyles,
    catalogText,
    setCatalogText,
    undo,
    redo,
    canUndo,
    canRedo,
    integrations,
    result,
    error,
    busy,
    selectedStarter,
    selectedCount,
    updateForm,
    chooseStarter,
    choosePalette,
    updateColor,
    toggleSection,
    reorderSections,
    sectionContent,
    sectionStyles,
    activeSection,
    setActiveSection,
    updateSectionContent,
    updateSectionStyle,
    designSnapshot,
    restoreDesignSnapshot,
    updateIntegration,
    createClientProject
  } = builderState;

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !term || `${project.name} ${project.slug} ${project.templateLabel} ${project.tagline}`.toLowerCase().includes(term);
      const hasAudit = Boolean(project.auditStatus);
      const auditPassed = Boolean(project.auditStatus?.ok);
      const hasBuild = Boolean(project.buildStatus?.ok);
      const matchesFilter = projectFilter === "all"
        || (projectFilter === "pending" && !hasAudit)
        || (projectFilter === "attention" && hasAudit && !auditPassed)
        || (projectFilter === "passed" && auditPassed)
        || (projectFilter === "built" && hasBuild);
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, projectFilter]);

  const projectStats = useMemo(() => ({
    total: projects.length,
    pending: projects.filter((project) => !project.auditStatus).length,
    passed: projects.filter((project) => project.auditStatus?.ok).length,
    attention: projects.filter((project) => project.auditStatus && !project.auditStatus.ok).length,
    built: projects.filter((project) => project.buildStatus?.ok).length
  }), [projects]);

  function getProjectStatus(project) {
    if (project.auditStatus) {
      return project.auditStatus.ok
        ? { label: "QA passed", kind: "passed" }
        : { label: "Needs attention", kind: "attention" };
    }
    if (project.buildStatus?.ok) return { label: "Build complete · QA pending", kind: "built" };
    return { label: "QA pending", kind: "pending" };
  }

  useEffect(() => {
    function handleStudioShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector(".forge-global-search input")?.focus();
      }
      const target = event.target;
      const isTextEditing = target instanceof HTMLElement
        && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.ctrlKey || event.metaKey) && !isTextEditing) {
        const key = event.key.toLowerCase();
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
        } else if (key === "y") {
          event.preventDefault();
          redo();
        }
      }
      if (event.key === "Escape") {
        closeProjectEditor();
        closeProjectPreview();
      }
    }
    window.addEventListener("keydown", handleStudioShortcut);
    return () => window.removeEventListener("keydown", handleStudioShortcut);
  }, [closeProjectEditor, closeProjectPreview, redo, undo]);

  function startFromStarter(id) {
    chooseStarter(id);
    setStep(0);
    setActiveTab("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const steps = ["Starter", "Brand", "Components", "Integrations", "Create copy"];

  const filteredStarters = starters.filter((item) => `${item.title} ${item.type} ${item.description}`.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  const starterImage = { cafe: "/images/machi-hero-coffee.webp", restaurant: "/images/forge-dashboard/foodie-burger.webp", foodDelivery: "/images/forge-dashboard/foodie-burger.webp", furniture: "/images/furniture/living-room.jpg", ecommerce: "/images/furniture/reading-corner.jpg", grocery: "/images/machi-coffee-beans.webp" };

  return <main className="forge-app-shell">
    <aside className="forge-sidebar">
      <Link href="/" className="forge-brand-lockup"><span className="forge-brand-mark">ϟ</span><span><strong>FrontendForge</strong><small>Build. Customize. Launch.</small></span></Link>
      <nav className="forge-side-nav" aria-label="Studio navigation">
        <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}><span>⌂</span>Dashboard</button>
        <button className={activeTab === "builder" ? "active" : ""} onClick={() => { setActiveTab("builder"); setStep(0); }}><span>▦</span>Templates</button>
        <Link href="/components"><span>▤</span>Components</Link>
        <button onClick={() => { setActiveTab("builder"); setStep(1); }}><span>✎</span>Branding</button>
        <button onClick={() => { setActiveTab("builder"); setStep(3); }}><span>♧</span>Integrations</button>
        <button className={activeTab === "projects" ? "active" : ""} onClick={() => { setActiveTab("projects"); fetchProjects(); }}><span>▱</span>Projects</button>
        <Link href="/docs"><span>▣</span>Documentation</Link>
        <Link href="/docs#settings"><span>⚙</span>Settings</Link>
      </nav>
      <div className="forge-sidebar-help"><div className="forge-help-rocket">🚀</div><strong>Need Help?</strong><p>Our guide will help you build faster.</p><Link href="/docs">View Guide →</Link></div>
      <div className="forge-sidebar-foot">v3.5.0 • Made with <span>♥</span></div>
    </aside>
    <div className="forge-workspace">
      <header className="forge-topbar">
        <label className="forge-global-search"><span>⌕</span><input aria-label="Search templates and client projects" placeholder="Search templates and client projects... (Ctrl + K)" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); if (activeTab === "builder") setActiveTab("dashboard"); }}/>{searchTerm && <button type="button" className="forge-search-clear" aria-label="Clear search" onClick={() => setSearchTerm("")}>×</button>}</label>
        <div className="forge-topbar-right"><button className="forge-icon-button" type="button" title="Notifications" onClick={() => window.alert("You're all caught up.")}>♧</button><div className="forge-user-avatar">B</div><strong>Studio Workspace</strong><span>⌄</span></div>
      </header>
      {activeTab === "dashboard" && (
        <DashboardPanel
          starters={starters}
          starterImage={starterImage}
          filteredStarters={filteredStarters}
          filteredProjects={filteredProjects}
          loadingProjects={loadingProjects}
          projects={projects}
          getProjectStatus={getProjectStatus}
          searchTerm={searchTerm}
          setActiveTab={setActiveTab}
          setStep={setStep}
          startFromStarter={startFromStarter}
          openProjectPreview={openProjectPreview}
          openProjectEditor={openProjectEditor}
          buildClient={buildClient}
          runAudit={runAudit}
          buildBusySlug={buildBusySlug}
          auditBusySlug={auditBusySlug}
          fetchProjects={fetchProjects}
          buildReport={buildReport}
          auditReport={auditReport}
        />
      )}
      <div className="forge-v3">
        {activeTab === "projects" ? (
          <ProjectManagerPanel
            projectStats={projectStats}
            filteredProjects={filteredProjects}
            projects={projects}
            projectFilter={projectFilter}
            setProjectFilter={setProjectFilter}
            loadingProjects={loadingProjects}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            runAudit={runAudit}
            auditBusySlug={auditBusySlug}
            getProjectStatus={getProjectStatus}
            openProjectPreview={openProjectPreview}
            openProjectEditor={openProjectEditor}
            buildBusySlug={buildBusySlug}
            buildClient={buildClient}
            deleteProject={deleteProject}
            buildReport={buildReport}
            auditReport={auditReport}
            setAuditReport={setAuditReport}
          />
        ) : activeTab === "builder" ? (
          <BuilderWorkspace
            steps={steps}
            step={step}
            setStep={setStep}
            setActiveTab={setActiveTab}
            runAudit={runAudit}
            starters={starters}
            starter={starter}
            chooseStarter={chooseStarter}
            selectedStarter={selectedStarter}
            form={form}
            updateForm={updateForm}
            palettes={palettes}
            paletteId={paletteId}
            choosePalette={choosePalette}
            colors={colors}
            updateColor={updateColor}
            componentStyles={componentStyles}
            setComponentStyles={setComponentStyles}
            sectionOptions={sectionOptions}
            sections={sections}
            toggleSection={toggleSection}
            orderedSections={orderedSections}
            reorderSections={reorderSections}
            sectionContent={sectionContent}
            sectionStyles={sectionStyles}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            updateSectionContent={updateSectionContent}
            updateSectionStyle={updateSectionStyle}
            designSnapshot={designSnapshot}
            restoreDesignSnapshot={restoreDesignSnapshot}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            catalogText={catalogText}
            setCatalogText={setCatalogText}
            integrationOptions={integrationOptions}
            integrations={integrations}
            updateIntegration={updateIntegration}
            result={result}
            error={error}
            busy={busy}
            createClientProject={createClientProject}
            selectedCount={selectedCount}
          />
        ) : null}
      </div>

      {activeTab !== "dashboard" && <footer className="forge-v3-footer forge-inner-footer">
        <span>FrontendForge Studio · Production Client Website Platform · v3.5.0</span>
        <span>Isolated client copies · Reusable starters · Clean handoff packages</span>
      </footer>}
      {previewProject && previewConfig && <div className="forge-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { closeProjectPreview(); } }}><section className="forge-client-preview-modal" role="dialog" aria-modal="true" aria-labelledby="forge-preview-title"><header><div><small>CLIENT WEBSITE PREVIEW</small><h2 id="forge-preview-title">{previewConfig.brand?.name || previewProject.name}</h2></div><button onClick={() => { closeProjectPreview(); }} aria-label="Close preview">×</button></header><div className="forge-client-preview-real"><iframe src={`/forge/preview/${encodeURIComponent(previewProject.slug)}`} title={`Actual generated website for ${previewConfig.brand?.name || previewProject.name}`} loading="lazy"/></div><footer className="forge-preview-modal-actions"><span>Preview uses this client's saved brand configuration.</span><button onClick={() => { closeProjectPreview(); openProjectEditor(previewProject); }}>Edit this client</button></footer></section></div>}
      {editProject && editDraft && <div className="forge-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { closeProjectEditor(); } }}><section className="forge-edit-modal" role="dialog" aria-modal="true" aria-labelledby="forge-edit-title"><header><div><small>CLIENT WEBSITE SETTINGS</small><h2 id="forge-edit-title">Edit {editProject.name}</h2></div><button onClick={() => { closeProjectEditor(); }} aria-label="Close editor">×</button></header><div className="forge-edit-grid"><label>Business name<input value={editDraft.name} onChange={(e) => updateEditDraft({ name: e.target.value })}/></label><label>Tagline<input value={editDraft.tagline} onChange={(e) => updateEditDraft({ tagline: e.target.value })}/></label><label className="wide">Description<textarea rows="3" value={editDraft.description} onChange={(e) => updateEditDraft({ description: e.target.value })}/></label><label>Phone<input value={editDraft.phone} onChange={(e) => updateEditDraft({ phone: e.target.value })}/></label><label>Email<input type="email" value={editDraft.email} onChange={(e) => updateEditDraft({ email: e.target.value })}/></label><label>WhatsApp<input value={editDraft.whatsapp} onChange={(e) => updateEditDraft({ whatsapp: e.target.value })}/></label><label>Business hours<input value={editDraft.hours} onChange={(e) => updateEditDraft({ hours: e.target.value })}/></label><label className="wide">Address<input value={editDraft.address} onChange={(e) => updateEditDraft({ address: e.target.value })}/></label></div><div className="forge-edit-colors">{Object.entries(editDraft.theme).map(([key,value]) => <label key={key}>{key}<input type="color" value={value} onChange={(e) => updateEditThemeColor(key, e.target.value)}/></label>)}</div><footer><button className="forge-edit-cancel" onClick={() => { closeProjectEditor(); }}>Cancel</button><button className="forge-edit-save" onClick={saveProjectEditor} disabled={editSaving}>{editSaving ? "Saving…" : "Save client changes"}</button></footer></section></div>}
    </div>
  </main>;
}
