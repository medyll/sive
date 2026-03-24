---
id: S45-02
sprint: 45
title: epub-export-handler
status: done
---

# S45-02 — EPUB Export Handler

## Goal
Server-side handler that converts document content to an `.epub` file download.

## Acceptance Criteria
- [ ] POST `/api/export/epub` accepts `{ content, title, author }`
- [ ] Returns a valid `.epub` binary with correct content-type
- [ ] Metadata (title, author, language) embedded in EPUB manifest
- [ ] Each h1 heading starts a new chapter

## Notes
Handler at `src/routes/api/export/epub/+server.ts`. Use `epub-gen` or equivalent.
