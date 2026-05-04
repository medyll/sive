# S93-02 — Add Pagination to /api/search

**Sprint:** 93 — Qualité & Performance
**Priority:** 🟡 MOYEN
**Effort:** 2h
**Assignee:** Dev

## Context

Audit: `/api/search` returns all results without pagination.
Risk: Performance degradation at scale.

## Acceptance Criteria

- [ ] `/api/search?q=...&limit=20&offset=0` works
- [ ] Response includes `{ results, total, limit, offset }`
- [ ] Default limit: 20, max: 100
- [ ] Existing search tests updated

## Implementation

`src/routes/api/search/+server.ts`:
1. Extract `limit` (default 20, max 100) and `offset` (default 0) from URL params
2. Apply to DB query via Drizzle `.limit().offset()`
3. Return `{ results, total, limit, offset }`

## Test

Unit test: search returns max 20 results by default.
Unit test: offset=20 returns next page.
