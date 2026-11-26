# FrontendForge Studio Dashboard 3.5.0

## Dashboard layout

The root (`/`) route now opens the dashboard-first production workspace based on the supplied Client Quick-Start Dashboard reference:

- Dark left navigation for Dashboard, Templates, Components, Branding, Integrations, Projects, Documentation and Settings.
- Workspace search with Ctrl/Cmd+K focus shortcut.
- Blue/purple production hero and Start Building Now action.
- Featured MACHI Coffee and Foodie restaurant starters.
- Additional Furniture, Ecommerce, Food Delivery and Grocery starters.
- Five-step Client Quick-Start explainer and functional entry into the existing project wizard.
- Your Projects list with Preview, Edit, Build and QA audit actions.

## Client project actions

- **Preview** loads the saved client configuration and renders a branded preview modal with the client hero, products, palette and contact information.
- **Edit** updates allowed brand copy, contact fields, business address/hours and validated theme colors in that client's `src/config/client-project.json`. Project slug, starter identity, products and integrations are not changed by this quick editor.
- **Build** calls the local-only `/api/forge/build` endpoint. It executes the fixed `npm run build` command in the selected client folder after verifying the project slug and that its dependencies are installed.
- **QA audit** uses the existing local audit endpoint.

All filesystem-reading, editing, deletion, auditing and build operations remain restricted to the local loopback development server. Do not expose these routes through a public deployment.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The legacy `/forge` route redirects to `/`.

## Verify

```bash
npm run test:all
npm run build
```

The dashboard source and local logic tests are included in the test suite. A successful `npm run build` and Playwright browser run are still required on a machine where dependencies and browser binaries can be installed.
