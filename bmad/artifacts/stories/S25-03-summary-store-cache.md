---
id: S25-03
sprint: 25
title: summary-store-cache
status: done
---

# S25-03 — Summary Store + Cache

## Goal
Create a client summaries store that caches summaries per docId and length for 24 hours.

## Acceptance Criteria
- [ ] Summaries cached per docId + length for 24 hours
- [ ] Stale entries expire automatically
- [ ] refreshSummary(docId, length) forces regeneration

## Notes
Sprint 25.
