---
id: S31-03
sprint: 31
title: ghost-text-overlay
status: done
---

# S31-03 — Ghost-Text Overlay in Editor

## Goal
Render ghost text inline after the cursor with Tab to accept and Escape to dismiss.

## Acceptance Criteria
- [ ] Ghost text rendered at cursor (opacity: 0.4, italic, pointer-events: none)
- [ ] Tab accepts suggestion and moves cursor to end
- [ ] Escape dismisses suggestion
- [ ] Any other keypress dismisses + debounces new request
- [ ] Accessible: aria-label="AI suggestion: <text>", role="status"

## Notes
GhostText.svelte or enhanced editor area.
