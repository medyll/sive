# Agent Guide — Sive

This single-page guide helps AI coding agents and contributors work effectively in the `sive` repo.

Summary
- SvelteKit app (Svelte v5) with Tailwind v4. Backend: Drizzle ORM + SQLite (`better-sqlite3`) and Better‑Auth.
- Frontend routes: `src/routes`. Server helpers and DB code: `src/lib/server`.
- Tests: Vitest (unit) and Playwright (E2E).

Top priorities
- Preserve DB schema and migrations: edits to `src/lib/server/db/schema.ts` must include a migration plan and run Drizzle commands (`npm run db:generate`, `npm run db:migrate` / `npm run db:push`).
- Preserve auth invariants: keep `sveltekitCookies(getRequestEvent)` last in `src/lib/server/auth.ts` plugin list; ordering changes require human review.
- Maintain server/client separation: server-only logic in `+page.server.ts`; UI in `.svelte` files.

Key workflows (common scripts)
- Install: `pnpm install` (preferred) or `npm install`.
- Dev: `npm run dev`.
- Build/preview: `npm run build` / `npm run preview`.
- Typecheck: `npm run check` / `npm run check:watch`.
- Unit tests: `npm run test:unit`.
- E2E tests: `npm run test:e2e` (Playwright runs `build` + `preview`).
- Drizzle: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:studio`.
- Auth helper: `npm run auth:schema` (regenerates `src/lib/server/db/auth.schema.ts`).

Conventions & style
- Prettier: tabs, single quotes, print width 100; use `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`.
- Imports: external modules → SvelteKit (`$app`/`$lib`) → local relative imports. Prefer `import type` for types.
- TypeScript: `strict: true`. Avoid `any`; use explicit types and `unknown` when narrowing errors.
- Svelte v5: use runes (`$state`, `$effect`, `$props`) and avoid module-scope side effects.

Auth & DB safety
- Do not change DB schema without a migration plan and the resulting artifacts in the PR.
- When editing `schema.ts` regenerate types and run `npm run auth:schema` if relevant.

Files to inspect quickly
- `src/lib/server/auth.ts`
- `src/hooks.server.ts`
- `src/lib/server/db/schema.ts`
- `src/lib/server/db/index.ts`
- `package.json`

Example prompts
- "Run unit tests for the auth routes and summarize failures with file links."
- "How do I add a new Drizzle migration for a schema change? Provide the exact commands."
- "Fix the failing Playwright test `auth-flow.spec.ts` and suggest a PR description."

Recommended agent customizations
- `applyTo` rule for frontend Svelte work: enforce Svelte v5 runes, no module-scope side effects, prefer `import type`, and Prettier settings.
- `applyTo` rule for DB/auth changes: require a migration plan, run `db:generate`, and regenerate `auth.schema.ts` when `schema.ts` is edited.

Enforcement suggestions
- Add CI checks to run `npm run check`, `npm run lint`, `npm run test:unit`, and verify Drizzle migrations run against a test SQLite instance.

When to request human review
- Any DB schema change, auth plugin ordering changes, or structural layout/routing refactor.

If something's missing
- Ask the repo owner for sample env values, a local DB snapshot, or explicit approval before changing DB or auth plumbing.
