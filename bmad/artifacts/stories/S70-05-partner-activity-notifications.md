# S70-05 — Partner Activity Notifications

**Status:** ✅ Done

## Goal

Emit `partner_activity` notifications when new activity events arrive from followed writing partners.

## Implementation

In `partnerFeedStore.svelte.ts`, when `getGroupedFeed()` is called:

1. Track the last known event count in localStorage (`sive:feed-lastEventCount`)
2. Compare current event count to last known count
3. If new events exist, emit a `partner_activity` notification:
   - Message: "{N} new activit{y/ies} from your writing partners"
   - Meta: `{ count: number }`
4. Update stored count after notification

## Acceptance Criteria

- [x] Notification fires only when new events detected
- [x] Message shows correct count of new activities
- [x] Uses `queueMicrotask` pattern for fire-and-forget emission
- [x] Persists event count to prevent duplicate notifications
- [x] Integrates with existing `notificationStore`

## Files Changed

- `src/lib/partnerFeedStore.svelte.ts` — Added notification emission logic

## Related

- S70-01: Notification Store foundation
- S68-01: Activity Event Store
- S68-02: Partner Activity Feed Component
