# FrontendForge visual editor

The visual editor is in the Builder's **Components & Page Composition** step. It combines draft editing controls with the same homepage renderer used by generated client projects.

## Edit page content

1. Select a section in the page outline or click the section in the canvas.
2. Use **Section Inspector** to edit its eyebrow, heading, main text, supporting text (where available), images and layout settings.
3. Double-click editable text directly in the canvas to make a quick inline change. Press Enter to save the edit, or Escape to cancel it.
4. Use the image overlay or inspector fields to enter an approved local `/` path or HTTPS image URL. Hero imagery is saved as the client's hero image; gallery imagery is saved in the client's gallery image list.
5. Use the section library to add/remove sections and drag cards to reorder them. Header, hero and footer stay pinned in the outline; select header/footer to edit their supported properties.

The section appearance controls include spacing (`compact`, `comfortable`, `spacious`), heading size (`small`, `normal`, `large`), alignment, content width and background token. These values are validated before they are written to `client-project.json`.

## Undo and redo

Undo and redo controls, Ctrl/⌘ Z, and Ctrl/⌘ Shift Z (or Ctrl/⌘ Y) operate on the current in-memory builder session. The history stores up to 50 design snapshots and resets when the page is reloaded. Form inputs retain normal text-editing shortcuts.

## Save named design versions

Use **Saved design versions** in the editor sidebar to save a named snapshot and restore or delete it later. Up to 20 versions are kept per client slug in this browser's local storage. Versions are local to the current browser profile/computer; they are not uploaded to the server, included in client handover ZIPs, or shared with other users. Changing a project's slug uses a different version-history key.

## Verify the generated site

After creating a client project, the Review & Create screen shows **Actual generated website** in an embedded preview. The Project Manager's Preview action opens the same route. That route reads `client-projects/<slug>/src/config/client-project.json` and renders it through `src/components/client/ClientProjectHome.js`, which is also copied into generated clients. This is the fidelity check for the saved homepage configuration, rather than the draft canvas approximation.

The master Studio preview route (`/forge/preview/<slug>`) is available only from the local development server on localhost and returns not-found outside local development. Run `npm run dev` in the master project to use it. The preview is for the generated homepage; full client-specific routes and commerce flows should be tested by running the generated client project itself.

## Current boundaries

- Images are configured by URL or public-folder path; the editor does not upload media to a storage provider.
- Content editing currently targets section text and the hero/gallery images; product details are edited through the catalog rows field.
- Saved named versions use browser local storage, while undo/redo uses in-memory history.
- The canvas is optimized for editing; use the actual generated-site preview to validate final template-specific presentation.
