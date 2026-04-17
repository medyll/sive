---
id: S52-04
sprint: 52
title: palette-doc-search-command
status: done
---

# S52-04 — Palette Command — Search Documents

## Goal
Register a `doc:search` command in the command registry that opens/focuses the document search input in the sidebar.

## Acceptance Criteria
- [ ] `doc:search` command registered in `commandRegistry.ts`
- [ ] Executing the command dispatches `CustomEvent('palette:focusSearch')`
- [ ] App page handles `palette:focusSearch` and focuses DocumentList search input
- [ ] Command visible and searchable in CommandPalette (Ctrl+K)

## Notes
Files: `src/lib/commandRegistry.ts`, `src/routes/app/+page.svelte`.
