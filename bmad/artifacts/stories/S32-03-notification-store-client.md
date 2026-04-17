---
id: S32-03
sprint: 32
title: notification-store-client
status: done
---

# S32-03 — Notification Store (Client)

## Goal
Create notificationStore.svelte.ts with SSE connection, state management, and exponential backoff reconnect.

## Acceptance Criteria
- [ ] Opens SSE connection to /api/notifications/stream on mount
- [ ] SSE events prepend to list and increment unreadCount
- [ ] markRead(), markAllRead(), clearAll() implemented
- [ ] Reconnects on disconnect with exponential backoff (max 30s)

## Notes
src/lib/notificationStore.svelte.ts.
