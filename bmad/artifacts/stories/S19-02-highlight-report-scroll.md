---
id: S19-02
sprint: 19
title: highlight-report-scroll
status: done
---

# S19-02 — Highlight → Report Item Scroll in ReviewScreen

## Goal
Clicking a highlight in ReviewText scrolls the corresponding report item into view.

## Acceptance Criteria
- [ ] Clicking highlight in ReviewText triggers scroll in ReviewReport
- [ ] ReviewReport exposes scrollToItem(id) function
- [ ] ReviewScreen wires handleHighlightClick to call scrollToItem

## Notes
Wire reportEl ref via scrollToItem exposed from ReviewReport.
