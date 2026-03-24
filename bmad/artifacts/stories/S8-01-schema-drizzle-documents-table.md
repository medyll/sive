---
id: S8-01
sprint: 8
title: schema-drizzle-documents-table
status: done
---

# S8-01 — Schema Drizzle documents Table

## Goal
Create the `documents` table in Drizzle schema and apply the migration.

## Acceptance Criteria
- [ ] `documents` table defined in schema.ts
- [ ] Migration applied successfully
- [ ] Table includes id, userId, title, content, createdAt, updatedAt columns

## Notes
Must be done before S8-02. isMock fallback must degrade gracefully when better-sqlite3 unavailable.
