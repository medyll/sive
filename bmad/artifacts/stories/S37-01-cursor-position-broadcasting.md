---
id: S37-01
sprint: 37
title: cursor-position-broadcasting
status: done
---

# S37-01 — Cursor Position Broadcasting

## Goal
Extend presence SSE to broadcast cursor position with POST /api/presence/cursor endpoint, debounced 200ms.

## Acceptance Criteria
- [ ] cursor: { offset, userId, userName, color } added to presence payload
- [ ] POST /api/presence/cursor accepts { docId, offset } and fans out to subscribers
- [ ] Debounced: only broadcast when offset changes, max every 200ms

## Notes
Extend PresenceUser type in src/lib/server/presence.ts.
