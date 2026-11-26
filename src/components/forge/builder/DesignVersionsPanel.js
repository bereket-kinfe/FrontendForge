"use client";

import { useState } from "react";
import useDesignVersions from "@/hooks/forge/useDesignVersions";

export default function DesignVersionsPanel({ storageKey, snapshot, restoreSnapshot }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { versions, ready, saveVersion, restoreVersion, deleteVersion } = useDesignVersions(storageKey, snapshot, restoreSnapshot);

  function handleSave() {
    const saved = saveVersion(name);
    setMessage(saved ? "Version saved in this browser." : "Enter a name and make sure local storage is available.");
    if (saved) setName("");
  }

  return (
    <section className="forge-design-versions" aria-labelledby="forge-versions-title">
      <div className="forge-design-versions-heading">
        <div><span className="forge-v3-eyebrow">DESIGN HISTORY</span><h4 id="forge-versions-title">Saved design versions</h4><p>Save named snapshots and restore them later. Versions are stored in this browser on this computer.</p></div>
        <span>{versions.length}/20</span>
      </div>
      <div className="forge-design-version-save">
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={48} placeholder="Name this version, e.g. Spring launch" aria-label="Design version name" onKeyDown={(event) => { if (event.key === "Enter") handleSave(); }}/>
        <button type="button" onClick={handleSave} disabled={!ready || !name.trim()}>Save version</button>
      </div>
      {message && <p className="forge-design-version-message" role="status">{message}</p>}
      {!ready ? <p className="forge-design-version-empty">Loading saved versions…</p> : versions.length ? (
        <ul className="forge-design-version-list">
          {versions.map((version) => (
            <li key={version.id}>
              <div><strong>{version.name}</strong><small>{new Date(version.createdAt).toLocaleString()}</small></div>
              <button type="button" onClick={() => { const restored = restoreVersion(version.id); setMessage(restored ? `Restored “${version.name}”.` : "Could not restore this version."); }}>Restore</button>
              <button type="button" className="remove" aria-label={`Delete ${version.name}`} onClick={() => { deleteVersion(version.id); setMessage(`Deleted “${version.name}”.`); }}>×</button>
            </li>
          ))}
        </ul>
      ) : <p className="forge-design-version-empty">No saved versions yet. Save your current design before making major changes.</p>}
    </section>
  );
}
