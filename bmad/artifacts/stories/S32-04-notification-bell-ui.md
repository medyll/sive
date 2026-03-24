---
id: S32-04
sprint: 32
title: notification-bell-ui
status: done
---

# S32-04 — Notification Bell UI

## Goal
Create NotificationBell.svelte with red badge, notification panel dropdown, and mark-all-read button.

## Acceptance Criteria
- [ ] Bell icon in toolbar with red badge (hidden if 0 unread)
- [ ] Click opens notification panel
- [ ] Panel lists notifications with icon, title, body, relative time, read indicator
- [ ] "Mark all read" button at top
- [ ] Click notification → navigate to doc (if docId) and mark read
- [ ] Empty state: "You're all caught up"
- [ ] Closes on click outside or Escape

## Notes
src/lib/elements/NotificationBell.svelte.
