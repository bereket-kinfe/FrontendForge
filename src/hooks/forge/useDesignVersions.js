"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const MAX_DESIGN_VERSIONS = 20;

function readVersions(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item) => item?.id && item?.snapshot) : [];
  } catch {
    return [];
  }
}

export default function useDesignVersions(storageKey, snapshot, restoreSnapshot) {
  const [versions, setVersions] = useState([]);
  const [loadedKey, setLoadedKey] = useState("");

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    setVersions(readVersions(storageKey));
    setLoadedKey(storageKey);
  }, [storageKey]);

  const currentVersions = useMemo(
    () => loadedKey === storageKey ? versions : [],
    [loadedKey, storageKey, versions]
  );

  const persist = useCallback((next) => {
    if (!storageKey || typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setVersions(next);
      setLoadedKey(storageKey);
      return true;
    } catch {
      return false;
    }
  }, [storageKey]);

  const saveVersion = useCallback((name) => {
    const cleanName = String(name || "").trim().slice(0, 48);
    if (!cleanName || loadedKey !== storageKey || !snapshot) return false;
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next = [{ id, name: cleanName, createdAt: new Date().toISOString(), snapshot: structuredClone(snapshot) }, ...currentVersions].slice(0, MAX_DESIGN_VERSIONS);
    return persist(next);
  }, [currentVersions, loadedKey, persist, snapshot, storageKey]);

  const restoreVersion = useCallback((id) => {
    const version = currentVersions.find((item) => item.id === id);
    if (!version) return false;
    restoreSnapshot(structuredClone(version.snapshot));
    return true;
  }, [currentVersions, restoreSnapshot]);

  const deleteVersion = useCallback((id) => {
    return persist(currentVersions.filter((item) => item.id !== id));
  }, [currentVersions, persist]);

  return {
    versions: currentVersions,
    ready: loadedKey === storageKey,
    saveVersion,
    restoreVersion,
    deleteVersion
  };
}
