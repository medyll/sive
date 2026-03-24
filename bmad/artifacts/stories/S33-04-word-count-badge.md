---
id: S33-04
sprint: 33
title: word-count-badge
status: done
---

# S33-04 — Per-Document Stat Badge

## Goal
Add WordCountBadge.svelte below the title showing words, reading time, and paragraphs updating live.

## Acceptance Criteria
- [ ] "1,234 words · 5 min read · 8 paragraphs" displayed below title
- [ ] Updates live as user types (debounced 500ms, client-side only)
- [ ] Show/hide toggle in settings (default: visible)

## Notes
WordCountBadge.svelte. No API call — client-side computation only.
