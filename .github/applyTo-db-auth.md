Title: ApplyTo - DB & Auth (Drizzle / Better-Auth)

Purpose
- Safeguard schema and authentication changes; require migration steps and verification.

Match
- Files: src/lib/server/db/schema.ts, src/lib/server/auth.ts

Rules
- Any edit to `src/lib/server/db/schema.ts` must include a migration plan and run the appropriate Drizzle commands (`npm run db:generate` and `npm run db:migrate` / `npm run db:push`).
- When `schema.ts` is edited, regenerate related types and auth schema (`npm run auth:schema`) and include artifacts in the PR.
- Do not reorder plugins in `src/lib/server/auth.ts`; `sveltekitCookies(getRequestEvent)` must remain last. Changes to plugin ordering require explicit human review.

When to request human review
- Structural DB changes, auth plugin changes, or migration-related concerns (data loss, backward-incompatible schema updates).

Checks/automation suggestions
- Run `npm run test:unit` and `npm run db:generate` locally; include generated migration files in PR.
- Add a CI gate that verifies migrations run without errors against a test SQLite instance.
