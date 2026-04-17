---
id: S46-04
sprint: 46
title: document-list-virtualisation
status: done
---

# S46-04 — DocumentList Virtualisation for 100+ Docs

## Goal
Implement virtual scrolling in DocumentList so rendering 100+ documents does not cause layout jank.

## Acceptance Criteria
- [ ] Only visible items (+buffer) are rendered in the DOM
- [ ] Scrolling through 200 items is smooth (no visible jank)
- [ ] Keyboard navigation still works through virtualised list
- [ ] Existing selection/active-doc highlighting preserved

## Notes
Use `svelte-virtual-list` or implement a simple windowed list manually.
