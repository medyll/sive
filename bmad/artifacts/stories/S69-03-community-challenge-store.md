# S69-03 — Community Writing Challenge Store

**Status:** ✅ Done  
**Date:** 2026-03-26

## Goal

Create a store for managing community writing challenges with join/leave and progress tracking.

## Implementation

### Files Created

- `src/lib/challengeStore.svelte.ts` — Challenge CRUD + progress
- `src/lib/challengeStore.spec.ts` — 11 unit tests (all passing)

### Challenge Schema

```typescript
interface Challenge {
  id: string;
  title: string;           // Max 80 chars
  description: string;     // Max 300 chars
  targetWords: number;     // Goal word count
  durationDays: number;    // Challenge length
  createdAt: string;       // ISO timestamp
  endsAt: string;          // ISO timestamp
  creatorId: string;       // Who created it
}

interface ChallengeProgress {
  challengeId: string;
  joinedAt: string;
  wordsContributed: number;  // Tracked during challenge
}
```

### Store Methods

| Method | Purpose |
|--------|---------|
| `createChallenge(title, description, targetWords, durationDays, creatorId)` | Create new challenge |
| `join(challengeId)` | Join a challenge |
| `leave(challengeId)` | Leave a challenge |
| `addWords(challengeId, words)` | Add words to progress |
| `isJoined(challengeId)` | Check if joined |
| `getProgress(challengeId)` | Get progress object |
| `getActive()` | Get non-expired challenges |
| `reset()` | Clear all state |

### Features

- **Auto-expiry:** `getActive()` filters expired challenges
- **Progress tracking:** `wordsContributed` accumulates on write
- **Deadline reminders:** Notifies at 48h, 24h, etc. before end
- **localStorage persistence:** Survives page refresh
- **Idempotent join:** Duplicate joins don't create duplicates

### Deadline Reminder Logic

```typescript
// Fires once per day for challenges ending within 48h
if (msLeft > 0 && msLeft <= 48 * 3_600_000 && !alreadyReminded.has(id)) {
  notificationStore.notify(
    'challenge_deadline',
    `⏰ Challenge "${challenge.title}" ends in ${hrsLeft}h — keep writing!`,
    { challengeId: id }
  );
}
```

## Acceptance Criteria

- [x] Challenge model with all required fields
- [x] Create challenge (title, word goal, duration)
- [x] Join/leave challenge
- [x] Track personal contribution (words written during challenge period)
- [ ] Max 5 active challenges per user — **Not implemented (deferred)**
- [x] Persisted to localStorage
- [x] Unit tests — **11/11 passing** ✅

## Test Coverage

**challengeStore.spec.ts** — 11 tests:

```
✓ createChallenge (3)
  ✓ adds a challenge to available
  ✓ trims title to 80 chars
  ✓ sets endsAt based on durationDays
✓ join / leave (4)
  ✓ joins a challenge
  ✓ is idempotent — joining twice does not duplicate
  ✓ initializes progress on join
  ✓ leaves a challenge
✓ addWords (2)
  ✓ increments wordsContributed
  ✓ is a no-op if not joined
✓ getActive (1)
  ✓ returns only non-expired challenges
✓ reset (1)
  ✓ clears all state
```

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/challengeStore.svelte.ts` | Challenge store |
| `src/lib/challengeStore.spec.ts` | Unit tests |

## Related Stories

- S69-04: Challenge UI (Create & Join)
- S69-05: Wire Challenge Progress to Writing Activity
- S70-04: Challenge Deadline Reminder

## Testing Notes

Manual test:
1. Call `challengeStore.createChallenge("Test", "Description", 10000, 30)`
2. Call `challengeStore.join(challengeId)`
3. Call `challengeStore.addWords(challengeId, 500)`
4. Check `challengeStore.getProgress(challengeId)` — should show 500 words
5. Call `challengeStore.leave(challengeId)` — progress should be removed

## Known Limitations

1. **No 5-challenge cap:** Users can join unlimited challenges (deferred)
2. **Client-side only:** Challenges not synced across devices
3. **No participant count:** Can't see how many others joined
