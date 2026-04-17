---
id: S36-03
sprint: 36
title: lazy-stats-document-list
status: done
---

# S36-03 — Lazy Stats in Document List

## Goal
Compute word counts per document lazily using requestIdleCallback, batch 5 per frame, cached in Map.

## Acceptance Criteria
- [ ] Word count computed client-side lazily (requestIdleCallback)
- [ ] Max 5 docs processed per idle frame
- [ ] Cache in Map<docId, number>, cleared on doc update
- [ ] WordCountBadge uses cached value (no server round-trip)

## Notes
Sprint 36.
