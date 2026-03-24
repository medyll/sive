---
id: S37-03
sprint: 37
title: remote-cursor-overlay
status: done
---

# S37-03 — Remote Cursor Overlay in Editor

## Goal
Create RemoteCursors.svelte rendering colored cursor carets at correct character offset with name labels.

## Acceptance Criteria
- [ ] Colored vertical bar at correct character offset
- [ ] Name label appears on hover or 2s then fades
- [ ] Only shows cursors for same docId from presenceStore
- [ ] ResizeObserver recalculates positions on editor resize

## Notes
src/lib/elements/RemoteCursors.svelte.
