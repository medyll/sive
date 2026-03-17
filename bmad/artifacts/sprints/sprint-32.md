# Sprint 32 — In-App Notification System

**Status:** planned
**Focus:** Async notification delivery for collaboration events — document shared, edited by collaborator, conflict detected, mention.
**Dates:** 2026-03-18

---

## Stories

### S32-01: Notification data model & server store
Create `src/lib/server/notifications.ts`:
- Types: `doc_shared | doc_edited | conflict | mention | system`
- Schema: `{ id, userId, type, title, body, docId?, read, createdAt }`
- In-memory store (Map<userId, Notification[]>), max 50 per user
- `push(userId, notification)` — prepend, trim to 50
- `markRead(userId, id)` — mark single notification read
- `markAllRead(userId)` — bulk mark
- `getUnread(userId)` — count + list
- `clear(userId)` — remove all

### S32-02: Notification API endpoints
Create `src/routes/api/notifications/+server.ts`:
- `GET /api/notifications` — returns `{ notifications[], unreadCount }` for current user
- `PATCH /api/notifications/:id` — mark single as read
- `DELETE /api/notifications` — clear all
- SSE endpoint `GET /api/notifications/stream` — push events to client in real-time
  - On connect: send current unread count
  - On new notification push: send `data: <json>\n\n`
  - Heartbeat every 30s to keep connection alive
- Apply rate limiting; require authenticated user

### S32-03: Notification store (client)
Create `src/lib/notificationStore.svelte.ts`:
- State: `{ notifications[], unreadCount, connected }`
- On mount: open SSE connection to `/api/notifications/stream`
- On SSE event: prepend to list, increment unreadCount
- `markRead(id)` — PATCH API, update local state
- `markAllRead()` — PATCH all, reset unreadCount to 0
- `clearAll()` — DELETE API, empty list
- Reconnect on disconnect (exponential backoff, max 30s)

### S32-04: Notification bell UI
Create `src/lib/elements/NotificationBell.svelte`:
- Bell icon in toolbar with red badge showing unread count (hide badge if 0)
- Click → opens notification panel (dropdown or sidebar)
- Panel lists notifications: icon + title + body + relative time + read indicator
- "Mark all read" button at top of panel
- Click notification → navigate to relevant doc (if docId present), mark read
- Empty state: "You're all caught up ✓"
- Close on click outside or Escape

### S32-05: Wire notification pushes into existing events
Integrate `push()` calls at key event sites:
- `src/routes/api/shares/+server.ts` → `doc_shared` when a doc is shared with a user
- `src/lib/server/` collaboration logic → `doc_edited` when a collaborator saves
- `src/hooks.server.ts` conflict detection → `conflict` notification
- No UI change needed — just server-side `push()` calls at existing event points

### S32-06: Unit tests & E2E tests
**Unit:**
- Notification store: push/trim/read/clear logic
- SSE stream: connection, heartbeat, event delivery
- API endpoints: auth guard, response shape

**E2E:**
- Bell badge shows count after notification pushed
- Click bell → panel opens, lists notifications
- Click notification → navigates to doc
- "Mark all read" → badge disappears
- New notification arrives via SSE → badge increments without refresh
- Clear all → panel shows empty state
