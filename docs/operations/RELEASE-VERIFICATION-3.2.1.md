# FrontendForge Studio 3.2.1 — Release verification

Date: 2026-11-17

## Release scope

This release includes the repaired furniture experience, generated-client furniture variant/cart parity, Supabase/Postgres multi-store scaffolding, authenticated store admin APIs, server-side order validation, client generation and editing, release auditing, CI configuration, six generated demo client projects and six individual handover packages. Payment gateway integration remains intentionally excluded.

## Checks completed successfully

| Check | Result | Evidence |
|---|---:|---|
| `npm run test:all` | PASS | Structure, SQL migration checks, 72/72 unit and generator tests, and six generated-client audits |
| Structure audit | PASS | 86 required project files found |
| SQL migration structure | PASS | 12 requirements across 2 migrations |
| Unit and generator tests | PASS | 72 passed, 0 failed |
| Generated client verification | PASS | 6 independent demo client projects verified |
| Client handover packaging | PASS | 6 ZIPs created; 6 audits passed with 0 warnings |
| JS/JSX/TS-family static parse | PASS | 589 files parsed; 0 syntax errors |
| Handover archive integrity | PASS | All six individual archives passed ZIP integrity checks |
| Furniture route/cart regressions | PASS | Correct product detail route, variant cart and collection/detail/checkout cart-key parity covered by tests |

## Checks blocked or still requiring an external environment

| Check | Status | Reason |
|---|---|---|
| Master Next.js production build | NOT RUN SUCCESSFULLY | `npm run build` returned `next: not found`. `npm ci` timed out while reaching the package registry, so dependencies are not installed in this environment. |
| Six client production builds | BLOCKED | Client build script correctly stopped because master dependencies are not installed. |
| Master Playwright browser tests | BLOCKED | `@playwright/test` is not installed. The test runner reports the exact install command. |
| Six-client desktop/mobile browser tests | BLOCKED | Playwright is not installed; no browser automation results are claimed. |
| Live Supabase/Postgres migration and API test | NOT RUN | No Supabase project URL, anon key, service-role secret or database access was supplied. SQL has structural checks only. |
| Real payment processing | EXCLUDED | Payment gateway was explicitly left out of scope. |
| Production deployment | NOT PERFORMED | No hosting account, deployment target or production environment credentials were supplied. |

## Furniture starter repair

The product collection now links to the configured product detail route instead of a broken hard-coded path. Collection, detail and checkout use one persistent, client-scoped cart key. Selected material/color/size variants create distinct cart lines, and generated furniture clients receive the same detail and checkout experience under their own route prefix and cart storage key.

## Local release acceptance commands

Run from the master project root on a machine with registry access and Node.js >= 20.9:

```bash
npm ci
npm run test:all
npm run build
npm run install:e2e
npm run test:e2e
npm run test:clients:e2e
npm run build:clients
```

For live admin/order acceptance, configure a dedicated Supabase project using `docs/operations/DATABASE-SETUP.md`, apply both migrations, create an owner membership, set server-side environment secrets, and test authenticated staff and public order flows in a staging environment.

## Release decision

**Development release candidate; not yet production-certified.** Unit, generator, static syntax, SQL structure, client audit and archive tests passed. Production build, browser automation, live database acceptance and deployment must still pass in an environment with installed dependencies, real service configuration and a staging host before paid client delivery.
