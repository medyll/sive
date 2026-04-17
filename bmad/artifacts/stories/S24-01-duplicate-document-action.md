---
id: S24-01
sprint: 24
title: duplicate-document-action
status: done
---

# S24-01 — duplicateDocument Server Action

## Goal
Add a duplicateDocument form action that copies a document with title "Copy of …" and a new UUID.

## Acceptance Criteria
- [ ] duplicateDocument action in +page.server.ts
- [ ] Copies title ("Copy of …") and content
- [ ] Creates new UUID, inserts into documents, creates owner share
- [ ] Mock/dev fallback returns { success: true, id }

## Notes
Sprint 24.
