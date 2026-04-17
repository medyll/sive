---
id: S31-02
sprint: 31
title: suggestion-store
status: done
---

# S31-02 — Suggestion Store

## Goal
Create suggestionStore.svelte.ts managing pending state, suggestion text, mode, and cancel logic.

## Acceptance Criteria
- [ ] State: pending, suggestion, mode, error
- [ ] requestSuggestion() calls API and streams into suggestion
- [ ] acceptSuggestion() returns text and clears state
- [ ] dismissSuggestion() clears without inserting
- [ ] In-flight request cancelled on dismiss or new keypress
- [ ] Auto-trigger debounced 800ms after last keystroke

## Notes
src/lib/suggestionStore.svelte.ts.
