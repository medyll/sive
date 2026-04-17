---
id: S44-01
sprint: 44
title: templates-table
status: done
---

# S44-01 — templates DB Table + Seed Data

## Goal
Define the `templates` Drizzle table and seed 3 built-in templates.

## Acceptance Criteria
- [ ] Table: id, name, category, content, isBuiltIn, userId (nullable), createdAt
- [ ] Migration applied successfully
- [ ] 3 seed templates: blog-post, short-story, essay
- [ ] Schema exported from `src/lib/server/db/schema.ts`

## Notes
Seed data lives in `src/lib/server/db/seed.ts`.
