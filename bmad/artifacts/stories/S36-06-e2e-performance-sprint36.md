---
id: S36-06
sprint: 36
title: e2e-performance-sprint36
status: done
---

# S36-06 — E2E Performance Tests — Sprint 36

## Goal
E2E performance tests verifying list render speed, scroll quality, save debounce, and memory with 50+ docs.

## Acceptance Criteria
- [ ] Load with 50 stub docs → list renders in <300ms
- [ ] Scroll to bottom → no blank gaps
- [ ] Rapid typing → only 1 save request after 1500ms idle
- [ ] No observable memory leak after 100 open/close cycles

## Notes
Sprint 36.
