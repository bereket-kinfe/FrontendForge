# Production readiness gate

A client project is releasable only after all of these checks are complete for that particular project:

1. `npm ci` completes successfully from the lockfile.
2. `npm run audit:client` exits with code 0 and all warnings are reviewed.
3. `npm run build` completes successfully in the client folder.
4. Playwright desktop and mobile browser suites pass.
5. The deployed preview is reviewed at mobile, tablet and desktop widths.
6. All links, image assets, contact buttons, forms, cart/checkout actions and navigation are checked with client-approved information.
7. If Supabase is enabled, both migrations are applied, the public catalog endpoint returns the intended store only, order creation uses server-calculated prices, admin sign-in requires membership, product changes persist, inventory updates are checked and order status transitions are validated.
8. No payment gateway is advertised as available unless a separate, approved provider integration has been implemented and tested.
9. A deployment URL, domain/SSL, environment variables, backup policy and handover guide are confirmed.

## Verification language

- **Unit tests passed** means logic tests succeeded in Node.
- **Client audit passed** means static project/configuration checks passed.
- **Production build passed** means `next build` ran successfully for that exact project.
- **Browser QA passed** means the Playwright suite ran against the actual running project in the named viewport(s).
- **Deployment verified** means the public deployed URL was opened and checked.

Do not replace one status with another. A static audit is not a production build; a production build is not browser QA; and browser QA is not live integration verification.
