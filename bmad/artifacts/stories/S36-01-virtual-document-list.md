---
id: S36-01
sprint: 36
title: virtual-document-list
status: done
---

# S36-01 — Virtual Document List

## Goal
Create VirtualDocumentList.svelte rendering only visible rows with overscan of 3 for performance.

## Acceptance Criteria
- [ ] Only visible rows + 3 overscan rendered
- [ ] Fixed 64px row height
- [ ] ResizeObserver recalculates visible window on resize
- [ ] Maintains scroll position when active doc changes
- [ ] Accessible: role="listbox", aria-posinset, aria-setsize

## Notes
src/lib/elements/VirtualDocumentList.svelte.
