---
id: S45-06
sprint: 45
title: unit-tests-export
status: done
---

# S45-06 — Unit Tests — DOCX/EPUB Handlers & Chapter Detection

## Goal
Unit test coverage for both export handlers and the chapter detection utility.

## Acceptance Criteria
- [ ] DOCX handler returns Buffer with correct MIME type
- [ ] EPUB handler returns Buffer with correct MIME type
- [ ] chapterDetect splits on h1 correctly
- [ ] chapterDetect handles no-heading document as single chapter
- [ ] Export handlers return 400 on missing content

## Notes
Test files: `src/routes/api/export/docx/docx.spec.ts`, `src/routes/api/export/epub/epub.spec.ts`, `src/lib/server/chapterDetect.spec.ts`.
