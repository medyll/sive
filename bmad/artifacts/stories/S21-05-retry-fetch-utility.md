---
id: S21-05
sprint: 21
title: retry-fetch-utility
status: done
---

# S21-05 — Retry Helper Utility + Retry on Save Failure

## Goal
Create retryFetch utility with 3x exponential backoff, used in the document save path.

## Acceptance Criteria
- [ ] src/lib/retryFetch.ts created
- [ ] Retries up to 3 times on network errors or 5xx
- [ ] Delays: 300/600/1200 ms
- [ ] Used in document save path

## Notes
Sprint 21 "Should" priority.
