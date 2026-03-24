---
id: S30-02
sprint: 30
title: document-search-store
status: done
---

# S30-02 — Document Search Store & Client State

## Goal
Create searchStore.svelte.ts managing query, results, filters, and search history with localStorage persistence.

## Acceptance Criteria
- [ ] Store: query, results, selected filters (tags, date range)
- [ ] Last search persisted to localStorage
- [ ] Search history: last 20 searches
- [ ] Input debounced 300ms
- [ ] results, isSearching, error exposed to UI

## Notes
src/lib/searchStore.svelte.ts.
