# Project guidance

## Architecture

JECRC Events is a static, vanilla-JavaScript SPA with Netlify-hosted serverless APIs. `index.html` is the canonical frontend and contains all application markup, styling, and client logic. `public/` is the only published directory, so database definitions, packages, and server code are not publicly served. `scripts/prepare-static.mjs` synchronizes the entry point on dependency installation; run it after editing the root HTML. Never edit `public/index.html` independently.

The browser uses History API routes, native dialogs, inline SVG icons, keyboard navigation, and an inline import map for the locally served Identity SDK. UI state is temporary; persistent catalog records, registrations, and bookmarks live in Netlify Database. The fallback catalog is read-only presentation content, not a substitute persistence layer. Backend failures are visible and disable registration rather than fabricating success.

## Directories

- `db/`: Drizzle schema, Netlify Database client factory, and preview catalog.
- `netlify/functions/`: Modern `.mts` functions using Request/Response APIs.
- `netlify/lib/`: Shared authentication, request validation, and response helpers.
- `netlify/database/migrations/`: Generated schema migrations applied by Netlify.
- `public/vendor/`: Pinned Identity browser bundle and required browser polyfills.
- `scripts/`: Static-file preparation without a frontend compilation step.

## Conventions and decisions

Keep this a vanilla SPA; do not introduce a frontend framework or separate application stylesheet/script unless the user requests an architectural change. Retain the Tailwind CDN requirement and the complete inline CSS fallback. Match the existing purple-and-lavender campus dashboard style, responsive sidebar, Manrope headings, and DM Sans body typography.

Use descriptive names, escape all values inserted into generated HTML, and use `textContent` where rich markup is unnecessary. Honor reduced-motion settings, visible focus states, input labels, and meaningful loading/error/empty states. All event times display in `Asia/Kolkata`; calendar downloads use UTC timestamps.

Use `@netlify/identity`, not the deprecated direct clients. The installed 2.0.0 SDK exposes verified email through `confirmedAt`, not `emailVerified`. Pin browser and server SDK versions together. Always check authentication server-side, derive ownership from the verified account, and verify same-origin requests for writes. Never accept caller-provided account IDs or expose attendee records publicly.

Use `@netlify/database` with the `drizzle-orm/netlify-db` adapter. Drizzle must stay on the skill-required beta release line unless platform guidance changes. Column names are snake_case; TypeScript property names are camelCase. Schema changes require a generated migration, never runtime DDL. Keep applied migrations immutable. Registration writes lock the event row before checking capacity or duplicates; cancellations release capacity in the same transaction.

Preview events are intentionally marked `sample: true`, including their tickets and details. Do not represent fabricated event details as university-approved announcements. Change both seed and inline fallback content when preparing an initial official catalog. Seed changes do not modify existing database rows. An admin console, payments, institutional enrollment verification, and automatic reminder email delivery are outside the current implementation.

## Deployment and review

Netlify publishes `public/`, deploys functions automatically, and applies migrations. Keep API rewrites before the SPA fallback and preserve security and no-store API headers. Root package installation prepares static files without running a frontend build. Identity activation is handled by the platform skill script for the connected project; this must also be enabled for a different project.

Review modified source and migrations. The deployment pipeline performs installation and validation; do not run local builds, test commands, or development servers during automated project edits. Never inspect `.git`, print credentials, or commit changes. Record finished changes in `.netlify/results.md` in past-tense prose.
