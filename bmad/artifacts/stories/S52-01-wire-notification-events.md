---
id: S52-01
sprint: 52
title: wire-notification-events
status: done
---

# S52-01 — Wire Notification Events from App Actions

## Goal
Dispatch real server-side notifications when a document is shared or a conflict is detected, pushing them to the SSE stream so NotificationBell shows a live badge.

## Acceptance Criteria
- [ ] Sharing a document POSTs a `doc_shared` event to `/api/notifications`
- [ ] ConflictIndicator dispatches a `conflict` event to `/api/notifications` on concurrent edit detection
- [ ] Both event types appear in the SSE stream consumed by NotificationBell
- [ ] NotificationBell badge count increments on new events

## Notes
Files: `src/routes/app/+page.svelte`, `src/routes/api/notifications/+server.ts`.
