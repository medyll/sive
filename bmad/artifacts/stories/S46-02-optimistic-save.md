---
id: S46-02
sprint: 46
title: optimistic-save
status: done
---

# S46-02 — Optimistic Save — UI Updates Before Server Confirms

## Goal
Update the document store immediately on save, rolling back if the server returns an error.

## Acceptance Criteria
- [ ] Document content updates in UI immediately on keystroke (no wait)
- [ ] Save request is debounced 2 s; UI does not wait for response
- [ ] On server error, content rolls back to last confirmed saved state
- [ ] Toast notification shown on rollback

## Notes
Modify `src/lib/documentStore.svelte.ts` and auto-save logic in `+page.svelte`.
