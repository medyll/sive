---
id: S38-03
sprint: 38
title: diff-utility
status: done
---

# S38-03 — Diff Utility

## Goal
Create src/lib/diff.ts with line-level Myers diff algorithm and HTML rendering with ins/del spans.

## Acceptance Criteria
- [ ] computeDiff(a, b) returns DiffChunk[] with equal/insert/delete types
- [ ] renderDiffHtml(chunks) returns HTML with ins/del/plain spans
- [ ] Line-level diff (simplified Myers)

## Notes
src/lib/diff.ts.
