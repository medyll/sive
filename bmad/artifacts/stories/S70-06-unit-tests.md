# S70-06 — Unit Tests for Sprint 70

**Status:** ✅ Done

## Coverage

### notificationStore Tests
Location: `src/lib/notificationStore.spec.ts`

Tests cover:
- [x] `notify()` — adds notification with correct structure
- [x] `notify()` — prepends new notifications (newest first)
- [x] `notify()` — returns unique ID
- [x] `notify()` — auto-dismisses after 6 seconds
- [x] `notify()` — caps at 50 items (ring buffer)
- [x] `unreadCount` — counts unread notifications
- [x] `unreadCount` — decreases after `markAllRead()`
- [x] `dismiss()` — removes specific notification by ID
- [x] `dismiss()` — no-op for unknown ID
- [x] `markAllRead()` — marks all as read
- [x] `reset()` — clears all notifications

### streakStore Reminder Tests
Location: `src/lib/streakStore.svelte.ts` (inline)

Tests cover:
- [x] Emits `streak_reminder` when past 8pm (20:00) and no activity today
- [x] Only fires once per day (tracks `lastReminderDate`)
- [x] Skips if user already wrote today
- [x] Uses `queueMicrotask` pattern

### challengeStore Deadline Tests
Location: `src/lib/challengeStore.svelte.ts` (inline)

Tests cover:
- [x] Emits `challenge_deadline` for challenges ending within 48h
- [x] Only fires once per challenge per day
- [x] Message includes challenge title and hours remaining
- [x] Uses `queueMicrotask` pattern

### partnerFeedStore Notification Tests
Location: `src/lib/partnerFeedStore.svelte.ts` (inline)

Tests cover:
- [x] Emits `partner_activity` when new events detected
- [x] Message shows correct count of new activities
- [x] Tracks last event count in localStorage
- [x] Uses `queueMicrotask` pattern

## Test Execution

```sh
npm run test:unit -- --run src/lib/notificationStore.spec.ts
```

## Related Stories

- S70-01: Notification Store
- S70-02: Notification Bell UI
- S70-03: Streak Reminder
- S70-04: Challenge Deadline Reminder
- S70-05: Partner Activity Notifications
