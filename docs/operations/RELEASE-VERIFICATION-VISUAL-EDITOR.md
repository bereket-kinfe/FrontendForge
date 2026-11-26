# Visual editor release verification

Date: 2026-11-22
Base project: FrontendForge Studio 3.5.0

## Delivered

- Added a page composer with a reusable section library, drag-and-drop reordering and accessible up/down controls. Header, hero and footer remain pinned in the page outline.
- Added a responsive draft canvas with desktop, tablet and mobile presets.
- Added inline editing for canvas text and hero/gallery image URLs.
- Added a Section Inspector for section copy, image paths, spacing, heading size, alignment, content width and background tokens. Footer brand-line edits are retained by the payload normalizer.
- Extended the normalized client config with validated `sectionContent` and `sectionStyles`; the generated `ClientProjectHome` renderer applies those values in the real client homepage.
- Added undo/redo for the current editor session, bounded to 50 snapshots, plus Ctrl/⌘ Z, Ctrl/⌘ Shift Z and Ctrl/⌘ Y shortcuts outside text-editing controls.
- Added named design versions saved in browser local storage, up to 20 snapshots per client slug. Versions are browser-local and are not synchronized between devices.
- Added a local-only generated-site preview route that reads the saved client config and renders the same `ClientProjectHome` used by generated sites. It is embedded in the post-generation review and in the Project Manager preview modal.
- Documented the editor workflow and its boundaries in `docs/guides/VISUAL-EDITOR.md`.

## Verification

| Check | Result |
|---|---|
| `npm run check:structure` | Passed — 110 required files |
| `npm run check:sql` | Passed — 12 requirements across 2 migrations |
| `npm test` | Passed — 113 tests |
| `npm run verify:demo-clients` | Passed — 6 independent demo websites |
| JS/JSX syntax parse | Passed — 91 source files |
| `node --check` for `.mjs` modules | Passed |
| `npm run build` | Blocked — `next: not found`; dependencies are not installed in this extracted workspace |

## Important boundaries

- The live canvas is the editing surface and can differ from the template-specific generated homepage. Use the embedded actual-site preview after project creation to check the saved configuration with the real shared client renderer.
- Inline image editing currently accepts a local public-folder path or HTTPS URL; it does not upload images to a media-storage service.
- Named versions are stored only in the current browser profile's local storage. Undo/redo history is in-memory and resets after reload.
- The master preview endpoint is for localhost development only; it is not a public production preview or hosting feature. Run full client routes and commerce tests by starting the generated client project itself.

## Local verification steps

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`, choose a starter, enter **Components & Page Composition**, and test inline editing, the inspector, section reordering, saved versions and responsive modes. Create a client project to open the generated-site preview. After dependencies are installed, verify production compilation with:

```bash
npm run build
```
