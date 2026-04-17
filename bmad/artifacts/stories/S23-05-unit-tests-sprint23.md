---
id: S23-05
sprint: 23
title: unit-tests-sprint23
status: done
---

# S23-05 — Unit Tests for Sprint 23

## Goal
Unit tests for promptHistoryStore and stream context system prompt construction.

## Acceptance Criteria
- [ ] add() prepends, deduplicates, caps at 10
- [ ] clear() empties store and localStorage
- [ ] Persistence via localStorage pre-seed tested
- [ ] System prompt includes excerpt when ctx provided
- [ ] System prompt unchanged when ctx absent
- [ ] Excerpt truncated to 2000 chars

## Notes
Files: promptHistoryStore.spec.ts, stream.context.spec.ts.
