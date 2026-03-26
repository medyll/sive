# Sprint 70 — Notifications & Writing Reminders

**Goal:** Keep writers engaged with smart reminders and in-app notifications for streaks, partner activity, and challenge deadlines.

**Duration:** 1 sprint

---

## Stories

### S70-01 — Notification Store
Create `notificationStore.svelte.ts` with:
- Types: `streak_reminder | partner_activity | challenge_deadline | goal_reminder`
- `notify(type, message, meta?)` — adds notification with auto-dismiss after 6s
- `dismiss(id)` — manual dismiss
- `markAllRead()` — mark all as read
- `unreadCount` derived
- Ring buffer: max 50, persists to localStorage

### S70-02 — Notification Bell UI
Create `NotificationBell.svelte` component:
- Bell icon with unread badge (red dot if unread > 0)
- Click opens dropdown panel listing recent notifications
- Each item shows icon, message, timestamp (relative: "2m ago", "1h ago")
- "Mark all read" button
- Mount in app header/layout

### S70-03 — Streak Reminder
In `streakStore.svelte.ts`, emit a `streak_reminder` notification when:
- User hasn't written today AND it's past 8pm (20:00 local time)
- Triggered once per day (track `lastReminderDate` in localStorage)
- Message: "🔥 Don't break your {N}-day streak! Write something today."
- Uses `queueMicrotask` pattern

### S70-04 — Challenge Deadline Reminder
In `challengeStore.svelte.ts`, on store load check for joined challenges ending within 48h:
- Emit `challenge_deadline` notification for each
- Message: "⏰ Challenge '{title}' ends in {N}h — keep writing!"
- Only once per challenge per day

### S70-05 — Partner Activity Notifications
In `partnerFeedStore.svelte.ts`, when new partner events arrive (on `getGroupedFeed` call):
- If new events since `lastChecked`, emit `partner_activity` notification
- Message: "{N} new activities from your writing partners"
- Debounce: only if unread > 0

### S70-06 — Unit Tests
Cover:
- `notificationStore`: add, dismiss, markAllRead, unreadCount, ring buffer cap
- `streakStore` reminder: emits when past 8pm + no write today, skips if already written
- `challengeStore` deadline: emits for challenges ending within 48h

---

## Acceptance Criteria
- Notification bell visible in layout with live unread count
- Streak reminder fires once per day when streak at risk
- Challenge deadlines surface 48h before end
- All tests passing
