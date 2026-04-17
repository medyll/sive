# Story S1-05 – Unit Tests for Auth Logic

**Epic:** QA
**Sprint:** 1
**Points:** 2
**Priority:** Should

## User Story
As a QA engineer, I want unit tests for auth helper functions so regressions are caught early.

## Acceptance Criteria
- Tests for password hashing, session creation, and adapter integration (mocked DB)
- Coverage targets set for auth modules

## Technical Notes
- Use Vitest and appropriate mocks for DB layers

## Definition of Done
- Unit tests passing locally and in CI

---

## Implementation Notes

**Date:** 2026-03-01
**Files changed:**
- `src/routes/auth/tests/server.spec.ts` — 8 unit tests for the POST /auth handler

**Test coverage:**
| Test | Status |
|---|---|
| Missing email → 400 | ✅ |
| Missing password → 400 | ✅ |
| Both fields missing → 400 | ✅ |
| Auth unavailable (signInEmail undefined) → 503 | ✅ |
| Successful sign-in → 200 + ok:true | ✅ |
| Credentials forwarded correctly to signInEmail | ✅ |
| Sign-in throws with message → 401 | ✅ |
| Sign-in throws without message → 401 fallback | ✅ |

**Notable decisions:**
- Mocked `$lib/server/auth` entirely via `vi.mock` to avoid native binding issues (better-sqlite3).
- Used `mockAuth` object (vitest `mock`-prefixed variable) to allow per-test mutation of `signInEmail`.
- Dynamic `import` after `vi.mock` registration ensures the handler receives the mocked module.

**Known limitations:**
- Password hashing tests deferred: better-auth handles hashing internally; no exposed utility to unit-test independently.
- DB adapter integration tests (drizzle mock) deferred to S1-06 or a future story when a test-specific DB fixture is available.

