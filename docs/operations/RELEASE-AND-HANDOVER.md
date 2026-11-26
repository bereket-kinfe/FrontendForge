# Client release and handover

Use the release command when a client website is ready for external review.

```bash
npm run release:client -- <client-slug>
```

The release workflow:
1. Runs the client's `audit:client` checks.
2. Runs `next build` in the independent client folder.
3. Stops immediately if either stage fails.
4. Packages a secret-free handover ZIP in `client-deliverables/<slug>-handover.zip`.

The package excludes `.env.local`, `.env`, `node_modules`, `.next`, `.git`, test reports and build output. It includes the client source, public assets, package manifests, configuration, docs, tests and a release audit report.

To create an audit-checked package without rerunning the production build:

```bash
npm run package:client -- <client-slug>
```

Do not describe a website as production-ready solely because the audit passed. A successful release command requires an actual successful production build. Browser QA is a separate step and should also be completed before handover:

```bash
npm run test:clients:e2e
```

Provider integrations selected in the config are not automatically connected. Confirm accounts, implement provider adapters, test workflows, configure secrets privately, and obtain client approval before launch.


## Package every client

To create audit-checked handover ZIPs for all folders under `client-projects/` without claiming that a production build has passed:

```bash
npm run package:all
```

Each client archive is written to `client-deliverables/<slug>-handover.zip`. For a production release, use `release:client` after dependencies are installed; it stops if the audit or build fails.
