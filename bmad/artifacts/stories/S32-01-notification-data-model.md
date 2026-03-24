---
id: S32-01
sprint: 32
title: notification-data-model
status: done
---

# S32-01 — Notification Data Model & Server Store

## Goal
Create notifications.ts server store with types, in-memory Map, and push/markRead/clear operations.

## Acceptance Criteria
- [ ] Types: doc_shared | doc_edited | conflict | mention | system
- [ ] In-memory Map<userId, Notification[]>, max 50 per user
- [ ] push(), markRead(), markAllRead(), getUnread(), clear() implemented

## Notes
src/lib/server/notifications.ts.
