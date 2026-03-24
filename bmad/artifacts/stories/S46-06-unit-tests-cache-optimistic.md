---
id: S46-06
sprint: 46
title: unit-tests-cache-optimistic
status: done
---

# S46-06 — Unit Tests — LRU Cache & Optimistic Save Rollback

## Goal
Unit tests for the LRU cache eviction logic and optimistic save rollback behaviour.

## Acceptance Criteria
- [ ] Cache evicts LRU entry when capacity exceeded
- [ ] Cache entries expire after TTL
- [ ] Optimistic save updates store immediately
- [ ] Server error triggers rollback to previous content
- [ ] Rollback fires toast notification

## Notes
Test files: `src/lib/server/aiCache.spec.ts`, `src/lib/documentStore.spec.ts`.
