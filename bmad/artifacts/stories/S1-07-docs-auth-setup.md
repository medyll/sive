# Story S1-07 – Update Docs for Auth Setup

**Epic:** Docs
**Sprint:** 1
**Points:** 1
**Priority:** Could

## User Story
As a developer, I want clear docs for setting up auth locally so new contributors can run the app.

## Acceptance Criteria
- README includes steps to set BETTER_AUTH_SECRET and DATABASE_URL
- Small note on mocking DB for local dev

## Implementation Notes

**Date:** 2026-03-01
**Files changed:**
- `README.md` — expanded auth & database section; merged duplicate setup headers; removed redundant `## Environment` section

**What was added:**
- Step-by-step env setup (`cp .env.example .env`) with full variable table
- `DATABASE_URL` explained (SQLite file path, e.g. `local.db`)
- `BETTER_AUTH_SECRET` generation command (`openssl rand -base64 32`)
- Migration steps (`db:generate` → `db:migrate`)
- **Mock mode note**: app runs with `503 Auth unavailable` when `DATABASE_URL` is unset — useful for pure UI dev
- Auth config pointers to `auth.ts`, `hooks.server.ts`, `auth:schema` script
- Consolidated scripts table (was two separate lists)

**Known limitations:**
- No separate `docs/auth-setup.md` created — coverage is inline in README which is sufficient for this project size.
