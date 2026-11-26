"use client";

import { useCallback, useEffect, useState } from "react";

async function readJson(response, fallbackMessage) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

function notifyError(error, fallbackMessage) {
  if (typeof window !== "undefined") {
    window.alert(error?.message || fallbackMessage);
  }
}

/**
 * Owns all client-project API requests and their UI state.
 * The Studio controller consumes this hook and passes its actions to panels.
 */
export default function useForgeProjects() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  const [auditBusySlug, setAuditBusySlug] = useState("");
  const [buildBusySlug, setBuildBusySlug] = useState("");
  const [buildReport, setBuildReport] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const createClientRequest = useCallback(async (payload) => {
    const response = await fetch("/api/forge/create-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return readJson(response, "Unable to create client project.");
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch("/api/forge/projects", { cache: "no-store" });
      const data = await readJson(response, "Unable to load client projects.");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      return data.projects || [];
    } catch (error) {
      notifyError(error, "Unable to load client projects.");
      return [];
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const closeProjectPreview = useCallback(() => {
    setPreviewProject(null);
    setPreviewConfig(null);
  }, []);

  const closeProjectEditor = useCallback(() => {
    setEditProject(null);
    setEditDraft(null);
  }, []);

  const runAudit = useCallback(async (slug) => {
    if (!slug) return;
    setAuditBusySlug(slug);
    setAuditReport(null);

    try {
      const response = await fetch("/api/forge/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });
      const data = await readJson(response, "Unable to run audit.");
      setAuditReport(data.audit || null);
      await fetchProjects();
    } catch (error) {
      notifyError(error, "Audit failed.");
    } finally {
      setAuditBusySlug("");
    }
  }, [fetchProjects]);

  const deleteProject = useCallback(async (slug) => {
    if (!slug || typeof window === "undefined") return;
    const confirmed = window.confirm(`Are you sure you want to permanently delete the client project "${slug}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/forge/projects?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      await readJson(response, "Could not delete project.");
      if (auditReport?.clientSlug === slug) setAuditReport(null);
      if (previewProject?.slug === slug) closeProjectPreview();
      if (editProject?.slug === slug) closeProjectEditor();
      await fetchProjects();
    } catch (error) {
      notifyError(error, "Failed to delete project.");
    }
  }, [auditReport, closeProjectEditor, closeProjectPreview, editProject, fetchProjects, previewProject]);

  const loadProjectConfig = useCallback(async (project, fallbackMessage) => {
    if (!project?.slug) throw new Error(fallbackMessage);
    const response = await fetch(`/api/forge/projects?slug=${encodeURIComponent(project.slug)}`, { cache: "no-store" });
    const data = await readJson(response, fallbackMessage);
    if (!data.config) throw new Error(fallbackMessage);
    return data.config;
  }, []);

  const openProjectPreview = useCallback(async (project) => {
    try {
      const config = await loadProjectConfig(project, "Could not load the client preview.");
      setPreviewProject(project);
      setPreviewConfig(config);
    } catch (error) {
      notifyError(error, "Could not load the client preview.");
    }
  }, [loadProjectConfig]);

  const openProjectEditor = useCallback(async (project) => {
    try {
      const config = await loadProjectConfig(project, "Could not load this client configuration.");
      setEditProject(project);
      setEditDraft({
        name: config.brand?.name || project.name,
        tagline: config.brand?.tagline || "",
        description: config.brand?.description || "",
        phone: config.contact?.phone || "",
        email: config.contact?.email || "",
        whatsapp: config.contact?.whatsapp || "",
        address: config.business?.address || "",
        hours: config.business?.hours || "",
        theme: { ...(config.theme || {}) }
      });
    } catch (error) {
      notifyError(error, "Could not load this client configuration.");
    }
  }, [loadProjectConfig]);

  const updateEditDraft = useCallback((updates) => {
    setEditDraft((current) => current ? { ...current, ...updates } : current);
  }, []);

  const updateEditThemeColor = useCallback((key, value) => {
    setEditDraft((current) => current
      ? { ...current, theme: { ...current.theme, [key]: value } }
      : current);
  }, []);

  const saveProjectEditor = useCallback(async () => {
    if (!editProject || !editDraft) return;
    setEditSaving(true);

    try {
      const response = await fetch("/api/forge/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editProject.slug, updates: editDraft })
      });
      await readJson(response, "Could not save client changes.");
      closeProjectEditor();
      await fetchProjects();
    } catch (error) {
      notifyError(error, "Could not save client changes.");
    } finally {
      setEditSaving(false);
    }
  }, [closeProjectEditor, editDraft, editProject, fetchProjects]);

  const buildClient = useCallback(async (project) => {
    if (!project?.slug) return;
    setBuildBusySlug(project.slug);
    setBuildReport(null);

    try {
      const response = await fetch("/api/forge/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug })
      });
      let data;
      try {
        data = await response.json();
      } catch {
        data = { error: "The build service returned an unreadable response." };
      }
      setBuildReport({ slug: project.slug, ...data, ok: response.ok && data?.ok === true });
      await fetchProjects();
    } catch (error) {
      setBuildReport({ slug: project.slug, ok: false, error: error.message || "Production build failed." });
    } finally {
      setBuildBusySlug("");
    }
  }, [fetchProjects]);

  return {
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
    createClientRequest,
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
  };
}
