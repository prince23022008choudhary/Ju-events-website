# JECRC Events

A responsive university event discovery and registration portal, prepared for deployment on Netlify. The interface pairs a campus spotlight with category-filtered event listings, personal bookmarks, a monthly calendar, and account-specific registrations.

## Technologies

- A self-contained `index.html` with semantic HTML, inline CSS, Tailwind CSS CDN, and vanilla JavaScript.
- Netlify Functions for the event catalog, account data, bookmarks, and registrations.
- Netlify Identity through `@netlify/identity` for email-confirmed accounts, login, invitations, and password recovery.
- Netlify Database with Drizzle ORM for durable event, bookmark, and registration records.
- Netlify Image CDN for responsive Unsplash photography. Google Fonts supplies DM Sans and Manrope.

## Run locally

Use Node.js 22.12 or newer and the Netlify CLI. Link the repository to the intended Netlify site before working with its platform services.

```sh
npm ci
netlify link
npm run dev
```

Open `http://localhost:8889`. Netlify Dev is necessary to emulate Functions, Identity, Image CDN, and SPA routing; opening the HTML file directly does not provide those services. No frontend build step is required.

## Deployment

Connect this repository to the Netlify project. `netlify.toml` publishes only `public/`, bundles the TypeScript functions, and rewrites non-file browser routes to the SPA. Package installation copies the canonical root `index.html` to `public/index.html`; the checked-in copy also supports direct static publishing. If a UI change is made without reinstalling dependencies, synchronize it with `node scripts/prepare-static.mjs`.

The schema is defined in `db/schema.ts`. The included migration in `netlify/database/migrations/` creates the tables and constraints; the platform applies it during deployment. A first connection provisions the site's database automatically. No database credentials belong in the repository or client HTML.

Netlify Identity activation was configured for the connected project's next deployment with the platform activation script. Its marker is retained in `.netlify/features/netlify-identity`. The default configuration requires email confirmation and permits account signup. For another project, enable Identity in its project settings. Review registration policy, transactional email delivery, and redirect URLs before an institution-wide launch. Use invite-only registration if the institution requires centrally provisioned accounts. Verified email does not itself verify university enrollment; organizers must check student IDs.

The required anti-framing, MIME-sniffing, and legacy XSS headers are configured alongside HTTPS, referrer, and browser-permission safeguards. HTML revalidates on each visit, bundled vendor assets have a one-day browser cache, and API responses are not cached. Tailwind CDN is retained as explicitly requested; complete inline CSS keeps the interface styled if that CDN is unavailable. External fonts and photography fall back to system fonts and image placeholders.

## Launch catalog and publishing

The first catalog request seeds six clearly labeled **preview events**, dated October–November 2026. These are examples, not official university announcements. Preview tickets are explicitly not admission to actual university events. Replace this catalog with institution-approved dates, venues, organizers, and imagery before a public launch.

Before first deployment, edit `db/catalog.ts` and the inline `initialEvents` preview in `index.html` together. Set `sample: false` explicitly on approved catalog records; the schema intentionally defaults to preview status. After a catalog has been initialized, changing the seed file does not overwrite stored events. Existing catalog changes must be delivered as reviewed, data-only SQL migrations under `netlify/database/migrations/`; do not change or delete applied migrations. There is deliberately no unauthenticated publishing or attendee-list endpoint, and no browser admin console.

Registrations are free only. Capacity is checked under an event-row transaction lock, with one registration per user per event. Cancellation before the event starts removes the registration and releases its place. Registrations and bookmarks are associated with authenticated account IDs, not arbitrary submitted emails. Attendees see only their own registration details.

## Repository

```text
index.html                         Canonical SPA: markup, styling, client logic
netlify.toml                       Deployment, routing, caching, image allowlist
public/index.html                  Deployable copy of the SPA
public/vendor/                     Pinned Identity browser bundle and polyfills
db/schema.ts                       Drizzle tables and integrity constraints
db/index.ts                        Netlify Database / Drizzle client factory
db/catalog.ts                      Clearly labeled initial preview event catalog
drizzle.config.ts                  Database migration generation configuration
netlify/functions/                 Catalog and authenticated account endpoints
netlify/lib/http.ts                Validation, authentication, response helpers
netlify/database/migrations/       Platform-managed database migrations
scripts/prepare-static.mjs         Static entry-point synchronization
```

To change the schema, edit `db/schema.ts` and generate a descriptive migration with `npm run db:generate -- --name add_descriptive_change`. Review migration status with `netlify db status` before generation or application; a brand-new, not-yet-deployed database can report that no branch exists.

The browser Identity assets are pinned to `@netlify/identity` 2.0.0 and served locally. Their transitive browser polyfills were sourced from esm.sh; the inline import map resolves them locally, so authentication code has no runtime CDN dependency. Keep the server Identity dependency pinned to the same version when upgrading both. Third-party code in `public/vendor/` retains its upstream license notices. The app uses the supported Identity SDK, not its legacy transitive implementation directly.

## Validation and privacy

The implementation was reviewed by reading the source and generated migration. Local build, server, and test commands were not run; installation and validation are delegated to the deployment pipeline. Verify email confirmation, password recovery, private account access, simultaneous capacity limits, cancellations, and deep-linked routes on a deploy preview before public release.

The application adds no analytics or advertising. Identity uses essential session cookies and its own browser session storage. Registration names and self-reported student IDs are stored in the site's database. Agree on the university's retention, deletion, and enrollment-verification policies before accepting real student records. The in-app privacy dialog explains the storage and external asset providers without making unsupported legal compliance claims.
