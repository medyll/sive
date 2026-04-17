---
id: S45-01
sprint: 45
title: docx-export-handler
status: done
---

# S45-01 — DOCX Export Handler

## Goal
Server-side handler that converts document content to a `.docx` file download.

## Acceptance Criteria
- [ ] POST `/api/export/docx` accepts `{ content, title, author }`
- [ ] Returns a valid `.docx` binary with correct content-type
- [ ] Headings in content become Word heading styles
- [ ] File name derived from document title

## Notes
Handler at `src/routes/api/export/docx/+server.ts`. Use `docx` npm package.
