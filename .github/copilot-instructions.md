## Copilot instructions for this repository (sive)

These concise instructions help AI coding agents work effectively in this repository.

Summary
- Sive is a SvelteKit app (Svelte v5) using Drizzle ORM (SQLite) and Better‑Auth. Frontend routes live in `src/routes`; server helpers and DB code live under `src/lib/server`.
- The central spec is `bmad/references/PROJECT.md` — consult it for product requirements and decisions.

Top priorities
- Preserve DB schema and migrations: any change to `src/lib/server/db/schema.ts` must be accompanied by appropriate `drizzle-kit` steps (`npm run db:generate`, `npm run db:push` / `npm run db:migrate`) and a migration plan in PRs.
- Preserve auth invariants: `src/lib/server/auth.ts` wires `better-auth`. Keep `sveltekitCookies(getRequestEvent)` as the last plugin in the `plugins` array; do not reorder without verification.
- Maintain server/client separation: put server-only logic in `+page.server.ts` and keep UI/interactive code in `.svelte` files.

Architecture notes
- Framework: SvelteKit (Svelte v5).
- DB/ORM: Drizzle ORM with SQLite (`better-sqlite3`) and `drizzle-kit` for migrations.
- Auth: Better‑Auth (drizzle adapter) integrated with SvelteKit hooks.
- Testing: Vitest (unit) and Playwright (E2E).

Key workflows (common scripts)
- Install: `pnpm install` (preferred) or `npm install`.
- Dev: `npm run dev`.
- Build: `npm run build`.
- Preview: `npm run preview`.
- Typecheck: `npm run check` / `npm run check:watch`.
- Unit tests: `npm run test:unit`.
- E2E tests: `npm run test:e2e`.
- Drizzle: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:studio`.
- Auth helper: `npm run auth:schema` (regenerates `src/lib/server/db/auth.schema.ts`).
- Lint/format: `npm run lint`, `npm run format`.

Project conventions and patterns
- Formatting: Prettier (tabs, single quotes, print width 100) with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`.
- Imports: external modules first, then SvelteKit (`$app`/`$lib`), then local relative imports.
- TypeScript: `strict: true`; prefer `import type` and explicit types.
- Svelte v5 patterns: use runes (`$state`, `$effect`, `$props`) for reactivity; avoid side-effects at module scope.
- Auth pattern: `drizzleAdapter(db, { provider: 'sqlite' })` in `src/lib/server/auth.ts`; `hooks.server.ts` should call `auth.api.getSession()` and apply `svelteKitHandler`.
- DB workflow: update `src/lib/server/db/schema.ts`, then run Drizzle commands and include migration artifacts in PRs.

Integration points and env vars
- Important env vars: `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ORIGIN`, `DATABASE_URL`.
- Native bindings: `better-sqlite3` is native; on systems without the correct binary it may fall back to mocks in dev.

When to ask for human review
- Any change to `src/lib/server/db/schema.ts` (include migration plan and regenerate types).
- Any change to authentication configuration or plugin ordering in `src/lib/server/auth.ts`.

Key files to inspect
- `src/lib/server/auth.ts`
- `src/hooks.server.ts`
- `src/lib/server/db/schema.ts`
- `src/lib/server/db/index.ts`
- `package.json`

If details are missing for a requested change, ask the repo owner for sample env values, a local DB snapshot, or explicit approval before modifying DB or auth plumbing.
## Example prompts
- "Run unit tests for the auth routes and summarize failures with file links."
- "How do I add a new Drizzle migration for a schema change? Provide the exact commands."
- "Fix the failing Playwright test `auth-flow.spec.ts` and suggest a PR description."

## Recommended agent customizations
- Create an `applyTo` rule for frontend Svelte work to enforce Svelte v5 runes and no module-scope side effects.
- Create an `applyTo` rule for DB/auth changes that requires a migration plan and regenerating `auth.schema.ts` when `schema.ts` is edited.

If you'd like, I can create those `applyTo` instruction files now.

