# Copilot instructions for this repository

```markdown
# Copilot instructions for this repository (sive)

Summary
- Sive is a SvelteKit application using Svelte v5, Drizzle ORM (SQLite), and Better-Auth for authentication. Frontend routes live in `src/routes`; server helpers and DB code live under `src/lib/server`.
 - `bmad/references/PROJECT.md` is the central design/spec document for this repository and should be consulted frequently during development.

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
# Copilot instructions for this repository (sive)

This file gives concise, repo-specific guidance so AI coding agents can be immediately productive.

## Summary
- Sive is a SvelteKit app (Svelte v5) using Drizzle ORM (SQLite) and Better-Auth. Routes and UI live in `src/routes`; server helpers and DB code are under `src/lib/server`.

## Top priorities
- Preserve DB schema/migrations: editing `src/lib/server/db/schema.ts` requires running Drizzle commands and including a migration plan in PRs.
- Preserve auth invariants: `src/lib/server/auth.ts` config + plugin ordering is sensitive — do not reorder `sveltekitCookies` (it must be last) without manual verification.
- Maintain server/client separation: server-only logic in `+page.server.ts`; UI and client behavior in `.svelte` files.

## Key workflows (commands)
- Install: `pnpm install` (or `npm install`).
- Dev: `npm run dev` (runs `vite dev`).
- Build: `npm run build`.
- Unit tests: `npm run test:unit` (Vitest).
- E2E tests: `npm run test:e2e` (Playwright).
- Drizzle (DB): `npm run db:generate`, `npm run db:push` / `npm run db:migrate`, `npm run db:studio`.
- Better-Auth helper: `npm run auth:schema` (generates `src/lib/server/db/auth.schema.ts`).
- Lint/format: `npm run lint` and `npm run format`.

## Project-specific patterns & examples
- Auth plugin order: see `src/lib/server/auth.ts`. Ensure `sveltekitCookies(getRequestEvent)` is last in `plugins` (hooks rely on this ordering).
- Auth/session propagation: `src/hooks.server.ts` calls `auth.api.getSession()` and `svelteKitHandler` to attach `event.locals.session` and `event.locals.user` — server code and tests read from `event.locals`.
- DB: code uses `better-sqlite3` + Drizzle. Keep generated types and migrations aligned with `src/lib/server/db/schema.ts`.
- Server vs client: update `+page.server.ts` for server-only data access (DB, secrets); use `+page.svelte` for UI. See `src/routes/application/+page.server.ts` and the paired `+page.svelte` for an example.

## Integration points to watch
- Better-Auth: env vars include `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ORIGIN`.
- Drizzle: use the `db:*` scripts above for consistent schema changes.
- Playwright/Vitest: tests live under `e2e/` and `src/*.spec.ts` — run with the `test` scripts.

## When to ask for human review
- Any change to `src/lib/server/db/schema.ts` (DB migration plan + regenerated types must be included).
- Any change to auth config (`src/lib/server/auth.ts`) or plugin order — request manual verification of login flows and `event.locals` propagation.

## Key files to inspect
- `src/lib/server/auth.ts`
- `src/hooks.server.ts`
- `src/lib/server/db/schema.ts`
- `src/lib/server/db/index.ts`
- `package.json`

If something is missing, ask for sample env values or a local DB dump and request explicit confirmation before changing DB or auth plumbing.

— End —
