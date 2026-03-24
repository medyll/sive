---
id: S7-03
sprint: 7
title: wire-suggestions-tab-aipanel
status: done
---

# S7-03 — Wire Suggestions Tab in AIPanel

## Goal
Add the Suggestions tab to AIPanel, rendering SuggestionCard list from suggestionStore.

## Acceptance Criteria
- [ ] Suggestions tab is the third tab in AIPanel (after Style, Coherence)
- [ ] "Get suggestions" button triggers `fetchSuggestions()`
- [ ] Loading spinner shown while loading=true
- [ ] Cards render from store; empty state shown when list is empty

## Notes
Modify `src/lib/elements/AIPanel.svelte`.
