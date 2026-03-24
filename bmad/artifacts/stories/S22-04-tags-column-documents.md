---
id: S22-04
sprint: 22
title: tags-column-documents
status: done
---

# S22-04 — Tags Column on Documents

## Goal
Add tags support to documents — localStorage for guests, DB column for users — with tagStore.svelte.ts.

## Acceptance Criteria
- [ ] tags column added to documents table (JSON text, default '[]')
- [ ] Drizzle migration file created
- [ ] tagStore.svelte.ts with getTags/setTags
- [ ] localStorage fallback for guests (sive.tags.<docId>)
- [ ] Max 5 tags per document

## Notes
Sprint 22 docs epic.
