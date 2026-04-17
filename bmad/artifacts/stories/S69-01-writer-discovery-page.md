# S69-01 — Writer Discovery Page

**Status:** ✅ Done  
**Date:** 2026-03-26

## Goal

Create a page where writers can discover and follow other writers who have opted into discovery.

## Implementation

### Files Created

- `src/routes/discover/+page.svelte` — Discovery page UI
- `src/routes/api/discover/+server.ts` — API endpoints (GET/POST/DELETE)
- `src/lib/server/discoveryQueries.ts` — In-memory discovery store
- `src/lib/elements/WriterCard.svelte` — Writer card component

### Features

- **Search Bar:** Client-side filter by username
- **Writer Grid:** Cards showing avatar, username, streak, total words, top badge
- **Follow Button:** One-click follow/unfollow with toast notifications
- **Empty State:** Helpful message when no writers opted in
- **Privacy-Aware:** Only shows users with `showInDiscovery: true`

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/discover` | List all opted-in profiles |
| POST | `/api/discover` | Submit/update current user profile |
| DELETE | `/api/discover` | Remove current user from discovery |

### Discovery Profile Schema

```typescript
interface DiscoveryProfile {
  userId: string;
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  topBadgeIcon: string;
  topBadgeName: string;
  submittedAt: string;
}
```

## Acceptance Criteria

- [x] Route `/discover` showing public profiles opted into discovery
- [x] Grid of writer cards: avatar emoji, @username, current streak, badges earned
- [x] Search by username (client-side filter)
- [x] Privacy-aware: only shows users with `showInDiscovery: true`
- [x] Follow button directly on each card
- [x] Empty state if no writers have opted in
- [ ] Unit tests — **Deferred to S69-06**

## Files Created

| File | Purpose |
|------|---------|
| `src/routes/discover/+page.svelte` | Discovery page UI |
| `src/routes/api/discover/+server.ts` | API endpoints |
| `src/lib/server/discoveryQueries.ts` | In-memory store |
| `src/lib/elements/WriterCard.svelte` | Card component |

## Related Stories

- S69-02: Submit Profile to Discovery (privacyStore toggle)
- S66-03: Accountability Partners (Follow Feature)
- S67-04: Leaderboard Privacy Settings

## Testing Notes

Manual test:
1. Enable "Allow others to discover me" in Settings
2. Visit `/discover` — should see your profile
3. Search by username — should filter results
4. Click Follow — should show toast notification
5. Check partnersStore — user should be added

Unit tests to add (S69-06):
- `discoveryQueries.spec.ts` — submit, list, remove functions
- API endpoint tests — GET/POST/DELETE handlers
- WriterCard component tests — follow toggle, display
