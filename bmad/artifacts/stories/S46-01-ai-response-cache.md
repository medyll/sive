---
id: S46-01
sprint: 46
title: ai-response-cache
status: done
---

# S46-01 — AI Response Cache (LRU, 50-entry, TTL 5 min)

## Goal
In-memory LRU cache for AI responses to avoid redundant API calls for identical prompts.

## Acceptance Criteria
- [ ] Cache stores up to 50 entries, evicts LRU on overflow
- [ ] Entries expire after 5 minutes (TTL)
- [ ] Cache key is hash of (prompt + docId + tabType)
- [ ] Cache hit returns stored response without calling AI API

## Notes
Cache utility at `src/lib/server/aiCache.ts`.
