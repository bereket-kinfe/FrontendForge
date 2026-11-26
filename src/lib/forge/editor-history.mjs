/**
 * Small immutable history helpers for the Forge visual editor.
 * Snapshots contain JSON-serializable builder configuration only.
 */
export function cloneEditorSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

export function pushEditorHistory(past, future, snapshot, limit = 50) {
  const nextPast = [...past, cloneEditorSnapshot(snapshot)].slice(-limit);
  return { past: nextPast, future: [] };
}

export function undoEditorHistory(past, future, currentSnapshot) {
  if (past.length === 0) {
    return { changed: false, current: currentSnapshot, past, future };
  }

  const previous = past[past.length - 1];
  return {
    changed: true,
    current: cloneEditorSnapshot(previous),
    past: past.slice(0, -1),
    future: [...future, cloneEditorSnapshot(currentSnapshot)]
  };
}

export function redoEditorHistory(past, future, currentSnapshot) {
  if (future.length === 0) {
    return { changed: false, current: currentSnapshot, past, future };
  }

  const next = future[future.length - 1];
  return {
    changed: true,
    current: cloneEditorSnapshot(next),
    past: [...past, cloneEditorSnapshot(currentSnapshot)].slice(-50),
    future: future.slice(0, -1)
  };
}
