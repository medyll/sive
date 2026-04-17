---
id: S7-02
sprint: 7
title: suggestion-store-stub
status: done
---

# S7-02 — suggestionStore — Stub Suggestions

## Goal
Create a Svelte store that provides 5 stub suggestion objects after a simulated 1.5 s delay.

## Acceptance Criteria
- [ ] Store exposes `suggestions`, `loading`, and `fetchSuggestions()`
- [ ] `fetchSuggestions()` sets loading=true, resolves after 1.5 s with 5 stubs
- [ ] Each stub has: id, category, severity, text fields
- [ ] Dismiss/apply actions mutate the store list reactively

## Notes
Store at `src/lib/suggestionStore.svelte.ts`.
