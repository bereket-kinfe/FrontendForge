# FrontendForge Studio 3.5.0

A local website production studio for freelancers. Choose a starter, apply a client's brand and content, generate an independent website project, then audit and build it before handover.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The root route opens FrontendForge Studio directly; `/forge` remains as a legacy redirect to `/`.

## Included starters

| Starter | Route | Core experience |
|---|---|---|
| Ecommerce storefront | `/templates/ecommerce` | Retail catalog, filters, cart, wishlist and WhatsApp/email order enquiry in generated sites |
| Restaurant | `/templates/restaurant` | Restaurant landing page and food catalog |
| Cafe & bakery | `/templates/cafe` | Cafe landing page and optional WhatsApp ordering |
| Food delivery | `/templates/food-delivery` | Food ordering and fulfillment-oriented layout |
| Grocery | `/templates/grocery` | Grocery categories and reusable retail cart |
| Furniture & home | `/templates/furniture` | Furniture catalog, variants, enquiry bag and product pages |

## Create client websites

1. Open `/` and select the closest starter.
2. Set the client's brand name, slug, logo, colors, fonts and copy.
3. Add approved images, hours, contact details and real product/menu data.
4. Select sections and supported customer-facing provider links.
5. Generate a separate copy under `client-projects/<slug>`.
6. Open that folder separately, install dependencies, run its tests/audit and build it.

The master project is never modified by client generation. Existing client folders are not overwritten. Generation runs only from the local development server.

## Commands

```bash
npm run dev                 # run the studio locally
npm run test:all            # structure + SQL + unit/generator + six client audits
npm test                    # unit and generator tests only
npm run check:structure     # required source tree check
npm run check:sql           # migration structure checks
npm run audit:client -- client-projects/<slug>  # audit one client folder
npm run verify:demo-clients # verify all twelve branded demo websites
npm run test:e2e              # master furniture/admin browser tests (Chromium desktop + mobile)
npm run test:clients:e2e       # desktop + mobile browser QA for all generated clients
npm run package:client -- <slug> # audit-checked handover for one client
npm run package:all             # audit-checked handovers for every client
npm run release:client -- <slug> # audit, production build and package one client
npm run release:all             # release all client projects sequentially
npm run build                   # production compile
```

## Scope and production boundaries

The ecommerce, food and furniture starters include their own browser commerce flows (catalogs, filters, product pages, cart/wishlist where supported, and WhatsApp/email enquiry handoffs). The master also includes a Supabase/Postgres multi-store schema, public catalog/order API routes and authenticated admin APIs for server-side product, inventory, store-profile and order operations.

The database/admin layer is deployable scaffolding, not a live connection: each client must create its own Supabase project/store, apply the included migrations, configure server-only credentials and verify its deployment. The existing template checkout UIs still use their enquiry handoff until they are explicitly connected to the database order API. Provider selections and public hosted URLs are setup records, not live API connections. No payment gateway is included.

Twelve separately branded demonstration projects are included under `client-projects/`. Run `npm run verify:demo-clients` to confirm their identities, assets, project boundaries and release audits.

## Edit a generated client locally

Every generated client includes a local-only editor at `/studio`. Start that client with `npm run dev`, open `http://localhost:3000/studio`, and edit the brand, palette, typography, component styles, business details, contact information and product catalog. Saving writes to `src/config/client-project.json`; the storefront reads that config at request time. The editor API and page return 404/403 in production and are not intended as a public admin system.

## Browser tests and release handover

Install optional Playwright tooling with `npm run install:e2e`. Run `npm run test:clients:e2e` from the master project to test every client in desktop and mobile Chromium viewports. You can also run `npm run test:e2e` inside a client folder. `npm run release:client -- <slug>` runs the client audit, production build, and creates a secret-free ZIP under `client-deliverables/`. `npm run package:all` creates separate audit-checked handover ZIPs for every client without claiming a production build has passed.

## Documentation

Start at [docs/README.md](docs/README.md). The project map is [docs/architecture/PROJECT-STRUCTURE.md](docs/architecture/PROJECT-STRUCTURE.md). The current release verification is [docs/operations/RELEASE-VERIFICATION-3.5.0.md](docs/operations/RELEASE-VERIFICATION-3.5.0.md), with machine-readable details in [RELEASE-MANIFEST-v3.5.0.json](RELEASE-MANIFEST-v3.5.0.json).

## Release readiness and database-backed store administration

FrontendForge now includes a Supabase/Postgres integration scaffold with RLS policies, public catalog/order endpoints, authenticated store membership checks, an `/admin` workspace, and store/product/order APIs. Follow `docs/operations/DATABASE-SETUP.md` and apply both SQL migrations before enabling the live store admin. Payment gateway support is intentionally not wired.

### Complete quality checks

```bash
npm ci
npm run test:all
npm run check:sql
npm run build
npm run build:clients
npm run install:e2e
npx playwright install chromium
npm run test:e2e
npm run test:clients:e2e
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the same checks after push and pull request. `npm run build:clients` runs a production build for every generated project; all twelve client projects must be present first (`npm run generate:demo-clients`). `npm run test:all` includes the structure check, SQL migration structure check, all unit/generator tests and six client audits.

Set `NEXT_PUBLIC_SITE_URL` for canonical metadata and sitemap generation. Server-side Supabase keys belong only in `.env.local` or the deployment provider's secret environment; never commit service-role credentials.


## Multi-page website generation 3.5.0

Each generated client receives niche-specific customer routes (shop/menu, product detail, collections, policies, visit/showroom, reservations and contact as relevant). See [Multi-page website system](docs/guides/MULTIPAGE-WEBSITE-SYSTEM.md) for the route map, generator flow and test commands.

The root workspace now opens the dashboard-first Forge Studio layout: sidebar navigation, searchable starter gallery, client quick-start panel, project list, inline client branding editor, QA audit and local production-build action. Client project file operations and builds are restricted to the local development server.


## Studio UI architecture

The Studio UI is split into feature modules under `src/components/forge/`: `ForgeStudio.js` composes the shared shell and navigation; `dashboard/` renders the overview; `projects/` manages generated client workspaces and QA/build actions; `builder/` contains the template workflow with dedicated Branding and Integrations panels; and `shared/` holds common presentation such as production build reports. Custom hooks under `src/hooks/forge/` separate concerns: `useForgeProjects.js` owns local API operations and project request state, while `useForgeBuilder.js` owns wizard form state and payload preparation. The builder hook receives the project-creation request as a callback, so it remains independent of HTTP details. Feature panels receive controlled data and callbacks, preventing duplicated state while preserving the existing API contracts.


## Visual page editor

The Builder's Components & Page Composition step includes a visual page editor with a reusable section library, drag-and-drop ordering, and accessible up/down controls. Select a section to edit its content, image URLs, typography, spacing, alignment, content width and background. Double-click text in the canvas for inline editing; use image controls or the inspector to replace hero and gallery images. The editor tracks undo/redo across design changes (up to 50 steps in the current session).

Named design versions can be saved and restored from browser local storage (up to 20 versions per client slug on that browser/computer). They are not synced to a server and will not automatically appear in another browser or device. After a project is generated, the Review & Create screen embeds the actual generated homepage using the same `ClientProjectHome` renderer as the client copy. The Project Manager preview modal uses that same local preview route. The generated-site preview route is restricted to local development; the production website does not expose the master Studio's preview endpoint.

The interactive canvas is a responsive editing surface for draft changes. The embedded generated-site preview is the fidelity check for the saved client configuration. See [Visual editor guide](docs/guides/VISUAL-EDITOR.md) for usage and current boundaries.
