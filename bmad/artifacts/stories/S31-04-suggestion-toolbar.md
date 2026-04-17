---
id: S31-04
sprint: 31
title: suggestion-toolbar
status: done
---

# S31-04 — Selection-Based Suggestion Toolbar

## Goal
Create SuggestionToolbar that floats over selected text with Rewrite, Make Vivid, and Formal buttons.

## Acceptance Criteria
- [ ] Floating toolbar appears when ≥10 chars selected
- [ ] Buttons: Rewrite | Make vivid | Formal
- [ ] Clicking calls requestSuggestion with appropriate mode
- [ ] Inline diff preview (original vs. suggested) with Accept/Dismiss
- [ ] Dismiss on click outside or Escape

## Notes
src/lib/elements/SuggestionToolbar.svelte.
