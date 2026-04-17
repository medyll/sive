```markdown
# PR: Specification – Application (MVP)

## Summary

This PR introduces the application-level specification for the Sive MVP: `bmad/docs/spec-application.md` (draft). The spec defines purpose, scope, requirements, architecture, data model summary, API examples, and acceptance criteria.

## Changes

- Add spec draft: [bmad/docs/spec-application.md](bmad/docs/spec-application.md)
- Add this PR helper file with checklist and testing notes.

## Checklist (Acceptance → Testable items)

- [ ] AC-01: Authentication — verify `POST /api/auth/*` flows and `GET /api/auth/session` returns user + expiry.
- [ ] AC-02: Pages CRUD — create/read/update/delete pages via endpoints and verify DB persistence.
- [ ] AC-03: Suggestions — `POST /api/suggestions` returns patch payload; suggestion stored in `suggestions` table.
- [ ] AC-04: Permissions — attempt unauthorized edit of another user's private page, expect `403`.
- [ ] AC-05: DB Migrations — run `npm run db:generate` and `npm run db:migrate` (or `db:push`) without errors in CI.
- [ ] AC-06: Tests — add unit tests for auth, CRUD, suggestions; add one E2E validating editor + suggestion apply.

## How to test locally

1. Install deps:

```bash
pnpm install
```

2. Start dev server:

```bash
pnpm dev
```

3. Run unit tests (Vitest):

```bash
pnpm test:unit
```

4. Run E2E (Playwright):

```bash
pnpm test:e2e
```

5. Drizzle migration smoke test (when schema changed):

```bash
pnpm db:generate
pnpm db:migrate
```

## Reviewer notes

- The canonical schema lives in `src/lib/server/db/schema.ts`. Any schema edits must include Drizzle migration steps.  
- Auth plugin ordering is critical: ensure `sveltekitCookies(getRequestEvent)` remains last in `plugins` in `src/lib/server/auth.ts`.

---

If this looks good I can open a PR with these changes, or I can also add initial test stubs for the checklist items.

```
