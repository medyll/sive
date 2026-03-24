---
id: S8-02
sprint: 8
title: server-load-save-handlers
status: done
---

# S8-02 — Server Load/Save Handlers

## Goal
Implement `+page.server.ts` load and save form actions for documents with mock fallback.

## Acceptance Criteria
- [ ] `/app` page load returns user documents
- [ ] Save action persists content to DB
- [ ] Mock fallback returns stubs when DB unavailable

## Notes
Depends on S8-01. EditorPanel needs refactor from contenteditable to plain-text content prop.
