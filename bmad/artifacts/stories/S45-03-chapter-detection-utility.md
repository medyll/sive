---
id: S45-03
sprint: 45
title: chapter-detection-utility
status: done
---

# S45-03 — Heading-Based Chapter Detection Utility

## Goal
Pure utility function that splits document content into chapters based on heading markers.

## Acceptance Criteria
- [ ] Detects h1, h2, h3 markers in plain text/markdown
- [ ] Returns array of `{ title, content }` chapter objects
- [ ] Documents without headings returned as single chapter
- [ ] Utility is pure (no side effects, testable in isolation)

## Notes
Utility at `src/lib/server/chapterDetect.ts`.
