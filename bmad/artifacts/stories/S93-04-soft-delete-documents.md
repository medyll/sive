# S93-04 — Soft Delete on Documents

**Sprint:** 93 — Qualité & Performance
**Priority:** 🟡 MOYEN
**Effort:** 2h
**Assignee:** Dev

## Context

Audit: Hard deletes on documents — no recovery possible.

## Acceptance Criteria

- [ ] `documents` table has `deleted_at` column (nullable timestamp)
- [ ] DELETE operations set `deleted_at = now()` instead of hard delete
- [ ] All queries filter `WHERE deleted_at IS NULL`
- [ ] Migration created and applied
- [ ] Existing delete tests updated

## Implementation

1. Drizzle migration: `ALTER TABLE documents ADD COLUMN deleted_at INTEGER` (SQLite timestamp)
2. Update delete handler in `+page.server.ts` and any `/api/documents/` routes
3. Add `isNull(documents.deleted_at)` to all document queries

## Test

Unit test: deleted document not returned by list/search.
Unit test: `deleted_at` set on delete, record still in DB.
