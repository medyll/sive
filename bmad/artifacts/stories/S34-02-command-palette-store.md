---
id: S34-02
sprint: 34
title: command-palette-store
status: done
---

# S34-02 — Command Palette Store

## Goal
Create commandPaletteStore.svelte.ts with open/close state, query, results, selectedIndex, and persistent recents.

## Acceptance Criteria
- [ ] State: open, query, results, selectedIndex, recentIds[]
- [ ] openPalette/closePalette/togglePalette
- [ ] setQuery recomputes results (commands + doc search merged)
- [ ] selectNext/selectPrev wrap around
- [ ] executeSelected runs action, closes, adds to recents
- [ ] Recent commands: last 5, localStorage persisted (sive:palette:recents)

## Notes
src/lib/commandPaletteStore.svelte.ts.
