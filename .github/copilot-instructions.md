# Copilot instructions for this repository

```markdown
# Copilot instructions for this repository (sive)

Summary
- Sive is a SvelteKit application using Svelte v5, Drizzle ORM (SQLite), and Better-Auth for authentication. Frontend routes live in `src/routes`; server helpers and DB code live under `src/lib/server`.
 - `PROJECT.md` is the central design/spec document for this repository and should be consulted frequently during development.

What to prioritize
- Preserve database schema and migrations: changes to `src/lib/server/db/schema.ts` or the Drizzle schema must be accompanied by `drizzle-kit` commands (`db:generate`, `db:push`, `db:migrate`). See `package.json` scripts.
- Preserve authentication invariants: `src/lib/server/auth.ts` wires `better-auth` and requires `sveltekitCookies` to be the last plugin in `plugins` array. Do not reorder plugins without confirming behavior in `src/hooks.server.ts`.
- Keep server/client separation clear: update `+page.server.ts` for server-only logic, `+page.svelte` for client UI.

Architecture notes (concise)
- Frontend: `src/routes` contains Svelte pages/components and specs (`*.spec.ts`).
- Server helpers: `src/lib/server` holds `auth.ts`, `db/` (Drizzle setup: `index.ts`, `schema.ts`), and API logic.
- Auth flow: `auth` (Better-Auth) is initialized with `drizzleAdapter(db, { provider: 'sqlite' })` in `src/lib/server/auth.ts`. `hooks.server.ts` uses `auth.api.getSession()` and `svelteKitHandler` to attach `event.locals.session` and `event.locals.user`.

Developer workflows (commands & examples)
- Install (preferred): use `pnpm install` (this repository includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`). You may also use `npm install`.
- Run dev server: `npm run dev` (or `pnpm dev`).
- Build: `npm run build`.
- Tests:
  - Unit: `npm run test:unit` (Vitest)
  - E2E: `npm run test:e2e` (Playwright)
- DB tasks (Drizzle):
  - `npm run db:generate` — generate types/migrations
  - `npm run db:push` / `npm run db:migrate` — apply schema changes
  - Use `npm run db:studio` to inspect DB when available
- Auth schema helper: `npm run auth:schema` generates the Better-Auth schema from `src/lib/server/auth.ts` (useful when changing auth config)
- Lint/format: `npm run lint`, `npm run format`.

Patterns & conventions (repo‑specific)
- Auth plugin order matters: `plugins: [ ..., sveltekitCookies(getRequestEvent) ]` — ensure the cookie plugin is last.
- DB provider: project uses SQLite via `better-sqlite3` — connection and adapter code in `src/lib/server/db`.
- Use SvelteKit `event.locals` for request-scoped auth/session data (see `src/hooks.server.ts`).
- Keep server-side code in `+page.server.ts` and `src/lib/server`; client-only logic belongs in `.svelte` files.

Integration points to watch
- Better-Auth (`better-auth`) — credentials come from environment variables: `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ORIGIN`.
- Drizzle (`drizzle-orm`, `drizzle-kit`) — migrations and generated types must stay in sync with `schema.ts` and any changes should include a migration plan.
- Playwright — e2e tests run with `playwright.config.ts` and tests live under `e2e/`.

When you are unsure
- DB migrations: if modifying `schema.ts`, include the exact commands you ran (e.g., `npm run db:generate && npm run db:push`) in PR description.
- Auth changes: if modifying `auth.ts` or plugin order, add a TODO and request a manual verification step (login flow + session propagation in `hooks.server.ts`).

Key files to reference
- `src/lib/server/auth.ts` — auth config and env variables
- `src/hooks.server.ts` — session attachment and request handling
- `src/lib/server/db/schema.ts` and `src/lib/server/db/index.ts` — Drizzle schema and DB export
- `package.json` — scripts for dev/build/test/db tasks
- `playwright.config.ts` and `e2e/` — end-to-end tests

If anything is unclear or you'd like a short PR template for DB/auth changes, tell me which area to expand.

```
