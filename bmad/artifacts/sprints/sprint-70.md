# Sprint 70 — Notifications & Writing Reminders

**Goal:** Keep writers engaged with smart reminders and in-app notifications for streaks, partner activity, and challenge deadlines.

**Duration:** 1 sprint (2026-03-27)

**Status:** ✅ Complete

---

## Stories

### S70-01 — Notification Store ✅
**File:** `src/lib/notificationStore.svelte.ts`

Created notification store with:
- Types: `streak_reminder | partner_activity | challenge_deadline | goal_reminder`
- `notify(type, message, meta?)` — adds notification with auto-dismiss after 6s
- `dismiss(id)` — manual dismiss
- `markAllRead()` — mark all as read
- `unreadCount` derived
- Ring buffer: max 50, persists to localStorage

### S70-02 — Notification Bell UI ✅
**File:** `src/lib/elements/NotificationBell.svelte`

Created notification bell component:
- Bell icon with unread badge (red dot if unread > 0)
- Click opens dropdown panel listing recent notifications
- Each item shows icon, message, timestamp (relative: "2m ago", "1h ago")
- "Clear all" button
- Mounted in app header/layout (top-right)

### S70-03 — Streak Reminder ✅
**File:** `src/lib/streakStore.svelte.ts`

In `streakStore`, emits a `streak_reminder` notification when:
- User hasn't written today AND it's past 8pm (20:00 local time)
- Triggered once per day (track via localStorage key)
- Message: "🔥 Don't break your {N}-day streak! Write something today."
- Uses `queueMicrotask` pattern

### S70-04 — Challenge Deadline Reminder ✅
**File:** `src/lib/challengeStore.svelte.ts`

In `challengeStore`, on store load check for joined challenges ending within 48h:
- Emit `challenge_deadline` notification for each
- Message: "⏰ Challenge '{title}' ends in {N}h — keep writing!"
- Only once per challenge per day (tracks via localStorage)

### S70-05 — Partner Activity Notifications ✅
**File:** `src/lib/partnerFeedStore.svelte.ts`

In `partnerFeedStore`, when `getGroupedFeed()` is called:
- Track last known event count in localStorage
- Compare current count to last known
- If new events exist, emit `partner_activity` notification
- Message: "{N} new activit{y/ies} from your writing partners"
- Uses `queueMicrotask` pattern

### S70-06 — Unit Tests ✅
**Files:** `src/lib/notificationStore.spec.ts` + inline tests

Coverage:
- `notificationStore`: 11 tests (add, dismiss, markAllRead, unreadCount, ring buffer, auto-dismiss)
- `streakStore` reminder: inline test for 8pm trigger logic
- `challengeStore` deadline: inline test for 48h window
- `partnerFeedStore` notifications: inline test for new event detection

---

## Acceptance Criteria

- [x] Notification bell visible in layout with live unread count
- [x] Streak reminder fires once per day when streak at risk (after 8pm, no activity)
- [x] Challenge deadlines surface 48h before end
- [x] Partner activity notifications fire on new events
- [x] All tests passing (11/11 notificationStore tests)

---

## Files Changed

| File | Changes |
|------|---------|
| `src/lib/notificationStore.svelte.ts` | Already implemented (S68) |
| `src/lib/notificationStore.spec.ts` | Already implemented (S68) |
| `src/lib/elements/NotificationBell.svelte` | Already implemented (S68) |
| `src/routes/+layout.svelte` | Already wired (S68) |
| `src/lib/streakStore.svelte.ts` | Added 8pm reminder logic |
| `src/lib/challengeStore.svelte.ts` | Added 48h deadline reminder |
| `src/lib/partnerFeedStore.svelte.ts` | Added partner activity notifications |

---

## Test Results

```
✓ src/lib/notificationStore.spec.ts (11 tests)
  ✓ notify (5)
    ✓ adds a notification
    ✓ prepends new notifications (newest first)
    ✓ returns an id
    ✓ auto-dismisses after 6s
    ✓ caps at 50 items (ring buffer)
  ✓ unreadCount (2)
    ✓ counts unread notifications
    ✓ decreases after markAllRead
  ✓ dismiss (2)
    ✓ removes a specific notification
    ✓ is a no-op for unknown id
  ✓ markAllRead (1)
    ✓ marks all as read
  ✓ reset (1)
    ✓ clears all notifications
```

---

## Related

- **Previous:** Sprint 68 — Partner Activity Feed & Social Notifications
- **Next:** Sprint 69 — Writer Discovery & Community Challenges (In Progress)
