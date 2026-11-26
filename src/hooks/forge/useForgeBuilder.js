"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { pushEditorHistory, undoEditorHistory, redoEditorHistory } from "@/lib/forge/editor-history.mjs";
import { slugify as toSlug } from "@/lib/forge/slug.mjs";
import { DEFAULT_SECTION_STYLES } from "@/lib/forge/editor-config.mjs";
import {
  starters,
  palettes,
  defaultSections,
  catalogSamples,
  emptyForm,
  createEmptyIntegrations
} from "@/lib/forge/studio-config.mjs";

const DEFAULT_COMPONENT_STYLES = {
  header: "standard",
  hero: "split",
  catalog: "cards",
  buttons: "pill"
};

const FURNITURE_SECTIONS = [
  "header", "hero", "collections", "catalog", "roomInspiration", "about", "location", "contact", "footer"
];

/**
 * Owns the client-site builder wizard state and its state transitions.
 * API lifecycle for projects is delegated to useForgeProjects.
 */
export default function useForgeBuilder({ createClientRequest, onProjectCreated } = {}) {
  const [step, setStep] = useState(0);
  const [starter, setStarter] = useState("cafe");
  const [paletteId, setPaletteId] = useState("machi");
  const [colors, setColors] = useState(() => ({ ...palettes[0].colors }));
  const [form, setForm] = useState(() => ({ ...emptyForm }));
  const [sections, setSections] = useState(() => [...defaultSections]);
  const [orderedSections, setOrderedSections] = useState(() => [...defaultSections]);
  const [sectionContent, setSectionContent] = useState({});
  const [sectionStyles, setSectionStyles] = useState(() => structuredClone(DEFAULT_SECTION_STYLES));
  const [activeSection, setActiveSection] = useState("hero");
  const [componentStyles, setComponentStylesState] = useState(() => ({ ...DEFAULT_COMPONENT_STYLES }));
  const [catalogText, setCatalogTextState] = useState(catalogSamples.cafe);
  const [integrations, setIntegrations] = useState(createEmptyIntegrations);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const historyPastRef = useRef([]);
  const historyFutureRef = useRef([]);
  const [historyVersion, setHistoryVersion] = useState(0);
  const snapshotRef = useRef(null);
  snapshotRef.current = {
    starter,
    paletteId,
    colors,
    form,
    sections,
    orderedSections,
    sectionContent,
    sectionStyles,
    componentStyles,
    catalogText
  };

  const recordHistory = useCallback(() => {
    const next = pushEditorHistory(
      historyPastRef.current,
      historyFutureRef.current,
      snapshotRef.current
    );
    historyPastRef.current = next.past;
    historyFutureRef.current = next.future;
    setHistoryVersion((version) => version + 1);
  }, []);

  const applySnapshot = useCallback((snapshot) => {
    setStarter(snapshot.starter);
    setPaletteId(snapshot.paletteId);
    setColors({ ...snapshot.colors });
    setForm({ ...snapshot.form });
    setSections([...snapshot.sections]);
    setOrderedSections([...snapshot.orderedSections]);
    setSectionContent(structuredClone(snapshot.sectionContent || {}));
    setSectionStyles(structuredClone(snapshot.sectionStyles || DEFAULT_SECTION_STYLES));
    setComponentStylesState({ ...snapshot.componentStyles });
    setCatalogTextState(snapshot.catalogText);
  }, []);

  const undo = useCallback(() => {
    const result = undoEditorHistory(
      historyPastRef.current,
      historyFutureRef.current,
      snapshotRef.current
    );
    if (!result.changed) return;
    historyPastRef.current = result.past;
    historyFutureRef.current = result.future;
    applySnapshot(result.current);
    setHistoryVersion((version) => version + 1);
  }, [applySnapshot]);

  const redo = useCallback(() => {
    const result = redoEditorHistory(
      historyPastRef.current,
      historyFutureRef.current,
      snapshotRef.current
    );
    if (!result.changed) return;
    historyPastRef.current = result.past;
    historyFutureRef.current = result.future;
    applySnapshot(result.current);
    setHistoryVersion((version) => version + 1);
  }, [applySnapshot]);

  const restoreDesignSnapshot = useCallback((snapshot) => {
    if (!snapshot || typeof snapshot !== "object") return;
    applySnapshot(snapshot);
    historyPastRef.current = [];
    historyFutureRef.current = [];
    setHistoryVersion((version) => version + 1);
  }, [applySnapshot]);

  const updateSectionContent = useCallback((sectionId, field, value) => {
    if (!sectionId || !["eyebrow", "heading", "body", "secondaryBody"].includes(field)) return;
    recordHistory();
    setSectionContent((current) => ({
      ...current,
      [sectionId]: { ...current[sectionId], [field]: String(value ?? "") }
    }));
  }, [recordHistory]);

  const updateSectionStyle = useCallback((sectionId, field, value) => {
    const allowed = {
      spacing: ["compact", "comfortable", "spacious"],
      headingSize: ["small", "normal", "large"],
      alignment: ["left", "center", "right"],
      width: ["narrow", "standard", "wide"],
      background: ["default", "surface", "secondary", "primary"]
    };
    if (!allowed[field]?.includes(value)) return;
    recordHistory();
    setSectionStyles((current) => ({
      ...current,
      [sectionId]: { ...(current[sectionId] || DEFAULT_SECTION_STYLES[sectionId]), [field]: value }
    }));
  }, [recordHistory]);

  const updateComponentStyles = useCallback((nextValue) => {
    recordHistory();
    setComponentStylesState((current) => (
      typeof nextValue === "function" ? nextValue(current) : nextValue
    ));
  }, [recordHistory]);

  const updateCatalogText = useCallback((value) => {
    if (typeof value !== "string") return;
    recordHistory();
    setCatalogTextState(value);
  }, [recordHistory]);

  const selectedStarter = useMemo(
    () => starters.find((item) => item.id === starter),
    [starter]
  );

  const selectedCount = useMemo(
    () => Object.values(integrations).filter((item) => item.provider !== "Not selected").length,
    [integrations]
  );

  const updateForm = useCallback((key, value) => {
    recordHistory();
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && (!current.slug || current.slug === toSlug(current.name))) {
        next.slug = toSlug(value);
      }
      return next;
    });
  }, [recordHistory]);

  const chooseStarter = useCallback((id) => {
    const nextStarter = starters.find((item) => item.id === id);
    if (!nextStarter || id === starter) return;
    recordHistory();

    setStarter(id);
    setCatalogTextState(catalogSamples[id] || catalogSamples.cafe);

    if (id === "furniture") {
      const furniturePalette = palettes.find((item) => item.id === "furniture");
      if (furniturePalette) {
        setPaletteId(furniturePalette.id);
        setColors({ ...furniturePalette.colors });
      }
      setSections([...FURNITURE_SECTIONS]);
      setOrderedSections([...FURNITURE_SECTIONS]);
    } else {
      setSections([...defaultSections]);
      setOrderedSections([...defaultSections]);
    }

    setResult(null);
    setError("");
  }, [recordHistory, starter]);

  const choosePalette = useCallback((palette) => {
    if (!palette?.id || !palette.colors || palette.id === paletteId) return;
    recordHistory();
    setPaletteId(palette.id);
    setColors({ ...palette.colors });
  }, [paletteId, recordHistory]);

  const updateColor = useCallback((key, value) => {
    if (typeof value !== "string" || colors[key] === value.toUpperCase()) return;
    recordHistory();
    setPaletteId("custom");
    setColors((current) => ({ ...current, [key]: value.toUpperCase() }));
  }, [colors, recordHistory]);

  const toggleSection = useCallback((id) => {
    if (["header", "hero", "footer"].includes(id)) return;
    const isCurrentlySelected = sections.includes(id);
    recordHistory();

    setSections((current) => isCurrentlySelected
      ? current.filter((item) => item !== id)
      : [...current, id]);

    setOrderedSections((order) => {
      if (isCurrentlySelected) return order.filter((item) => item !== id);
      if (order.includes(id)) return order;
      return [...order.filter((section) => section !== "footer"), id, "footer"];
    });
  }, [recordHistory, sections]);

  const reorderSections = useCallback((fromIndex, toIndex) => {
    const visibleSections = orderedSections.filter((id) => !["header", "hero", "footer"].includes(id));
    if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= visibleSections.length || toIndex >= visibleSections.length || fromIndex === toIndex) return;

    recordHistory();
    const nextVisible = [...visibleSections];
    const [moved] = nextVisible.splice(fromIndex, 1);
    nextVisible.splice(toIndex, 0, moved);
    setOrderedSections(["header", "hero", ...nextVisible, "footer"]);
  }, [orderedSections, recordHistory]);

  const updateIntegration = useCallback((id, key, value) => {
    setIntegrations((current) => {
      if (!current[id]) return current;
      return { ...current, [id]: { ...current[id], [key]: value } };
    });
  }, []);

  const createClientProject = useCallback(async () => {
    setBusy(true);
    setError("");
    setResult(null);

    const payload = {
      template: starter,
      brand: {
        name: form.name,
        slug: form.slug,
        tagline: form.tagline,
        description: form.description,
        logoUrl: form.logoUrl,
        heroImageUrl: form.heroImageUrl,
        galleryImages: form.galleryImages
      },
      contact: {
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        website: form.website
      },
      business: {
        address: form.address,
        hours: form.hours,
        currency: form.currency,
        deliveryFee: form.deliveryFee,
        locale: form.locale
      },
      theme: colors,
      font: form.font,
      componentStyles,
      sections,
      orderedSections,
      sectionContent,
      sectionStyles,
      catalogText,
      integrations
    };

    try {
      if (typeof createClientRequest !== "function") {
        throw new Error("The project creation service is unavailable.");
      }
      const data = await createClientRequest(payload);
      setResult(data);
      setStep(4);
      if (typeof onProjectCreated === "function") await onProjectCreated();
    } catch (createError) {
      setError(createError.message || "Something went wrong while creating the project.");
    } finally {
      setBusy(false);
    }
  }, [catalogText, colors, componentStyles, createClientRequest, form, integrations, onProjectCreated, orderedSections, sectionContent, sectionStyles, sections, starter]);

  return {
    step,
    setStep,
    starter,
    setStarter,
    paletteId,
    colors,
    form,
    sections,
    orderedSections,
    sectionContent,
    sectionStyles,
    activeSection,
    setActiveSection,
    componentStyles,
    setComponentStyles: updateComponentStyles,
    catalogText,
    setCatalogText: updateCatalogText,
    undo,
    redo,
    canUndo: historyPastRef.current.length > 0,
    canRedo: historyFutureRef.current.length > 0,
    historyVersion,
    designSnapshot: snapshotRef.current,
    restoreDesignSnapshot,
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
    updateSectionContent,
    updateSectionStyle,
    toggleSection,
    reorderSections,
    updateIntegration,
    createClientProject
  };
}
