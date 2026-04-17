---
id: S23-01
sprint: 23
title: prompt-history-store
status: done
---

# S23-01 — promptHistoryStore (Svelte 5 Runes)

## Goal
Create promptHistoryStore storing last 10 unique prompts in localStorage with add/items/clear API.

## Acceptance Criteria
- [ ] Stores last 10 unique non-empty prompts in localStorage (sive.promptHistory)
- [ ] add() prepends and deduplicates consecutive identical entries
- [ ] items readonly array, most-recent-first
- [ ] clear() empties store and localStorage
- [ ] Persists across page reloads

## Notes
src/lib/promptHistoryStore.svelte.ts.
