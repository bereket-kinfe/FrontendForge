# FrontendForge project structure

FrontendForge is organized into five practical layers.

```text
frontendforge-pro/
├── docs/
│   ├── architecture/       # system design and engineering decisions
│   ├── guides/              # starter and customization guides
│   └── operations/          # client intake, QA, security and launch
├── public/                  # static images, logos, icons and fonts
├── scripts/                 # local generation, audits and structure checks
├── tests/                   # unit, integration and generator tests
├── src/
│   ├── app/                 # Next.js routes, layouts and API endpoints
│   │   ├── api/forge/        # local Forge project-generation APIs
│   │   ├── forge/            # preview route, legacy /forge redirect and Studio styles
│   │   └── templates/        # master starter previews
│   ├── components/
│   │   ├── forge/             # modular Forge Studio application UI
│   │   │   ├── ForgeStudio.js # shared application shell and feature composition
│   │   │   ├── dashboard/     # dashboard and starter overview
│   │   │   ├── projects/      # client project manager, QA and build actions
│   │   │   ├── builder/       # starter builder, page composer, responsive canvas, inspector, versions and actual preview
│   │   │   └── shared/        # shared build/audit presentation components
│   │   ├── client/           # generated client-site renderer
│   │   ├── commerce/         # reusable retail catalog/cart/wishlist
│   │   ├── food/             # restaurant and cafe ordering experience
│   │   ├── furniture/       # furniture-specific shopping experience
│   │   ├── site/             # shared site chrome
│   │   └── ui/               # small reusable interface primitives
│   ├── config/               # demo data and shared configuration
│   ├── hooks/
│   │   └── forge/             # useForgeProjects, useForgeBuilder and useDesignVersions
│   ├── lib/
│   │   ├── forge/             # white-label generator, starter registry, editor config/history, Studio config and shared slug helper
│   │   └── adapters/          # integration adapter contracts
│   └── schemas/              # shared data contracts
├── client-projects/          # generated, independent client copies (gitignored)
└── package.json
```

## Import conventions

- App Router pages and API handlers live under `src/app`; `/` renders the Studio, while `/forge` redirects to `/` for compatibility.
- Reusable UI belongs in `src/components`; `src/components/forge/ForgeStudio.js` is the shared application shell and feature composer. It delegates visible feature areas to `dashboard/DashboardPanel.js`, `projects/ProjectManagerPanel.js`, and `builder/BuilderWorkspace.js`. The builder delegates brand controls to `builder/BrandingPanel.js` and provider setup to `builder/IntegrationsPanel.js`. Shared build-result UI lives in `shared/ForgeBuildReport.js`.
- Keep client-project network operations and their request lifecycle in `src/hooks/forge/useForgeProjects.js`. This hook owns listing, creation requests, audit, build, preview, edit, save and delete operations, plus their loading/report state.
- Keep wizard form state, design mutations, undo/redo snapshots and state transitions in `src/hooks/forge/useForgeBuilder.js`. It prepares the normalized client payload and calls the injected `createClientRequest` operation; it does not call `fetch` directly. History is a bounded 50-snapshot in-memory stack implemented by the pure helpers in `src/lib/forge/editor-history.mjs`.
- Keep the visual page composer, responsive draft canvas, section inspector, saved-version panel and actual-site preview in the `builder/` feature folder. The composer exposes registered sections as a reusable library, supports drag-and-drop ordering plus accessible up/down controls, and keeps the header, hero and footer pinned. `WebsiteCanvasPreview.js` supports inline text and image URL edits at desktop, tablet and mobile widths; `SectionInspector.js` owns section content, typography, spacing, alignment, width and background controls. `useDesignVersions.js` stores up to 20 named design snapshots per client slug in browser local storage.
- The local-only route `src/app/forge/preview/[slug]/page.js` reads the generated client configuration and renders `ClientProjectHome.js`, the same homepage renderer copied into generated client projects. Use it from the post-generation preview card or Project Manager preview modal; it is disabled outside localhost development.
- Keep only cross-feature navigation and derived presentation state in `ForgeStudio.js`. Pass values and callbacks explicitly so panels do not create duplicate copies of the same state.
- Keep domain features grouped by `commerce`, `food` or `furniture`.
- Pure data normalization and generation belong in `src/lib/forge`; `editor-config.mjs` validates section content and style values before generation, `studio-config.mjs` uses the canonical starter registry instead of duplicating starter names and routes, and `slug.mjs` provides the shared browser/server slug helper.
- Shared configuration and schemas must not depend on React components.
- Keep each generated website under `client-projects/<client-slug>`; never customize the master starter in place.

## Main generation flow

1. The Forge wizard submits a selected starter and client configuration.
2. `src/lib/forge/project.mjs` validates and normalizes brand, theme, sections, products and integration choices.
3. `src/lib/forge/copy.mjs` copies the master into a new client folder, excluding secrets, build output, dependencies and existing client folders.
4. The generated site reads `src/config/client-project.json` and renders the chosen starter experience.
5. The client project is audited and independently built before deployment.

Legacy import shims at `src/lib/forge-project.mjs` and `src/lib/forge-copy.mjs` remain temporarily for compatibility with older scripts. New code should import from `src/lib/forge/`.
