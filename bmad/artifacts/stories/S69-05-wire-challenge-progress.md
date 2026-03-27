# S69-05 — Wire Challenge Progress to Writing Activity

**Status:** ✅ Done  
**Date:** 2026-03-27

## Goal

Automatically track writing progress toward joined challenges and emit milestone activity events.

## Implementation

### Changes Made

1. **Updated `activityStore.svelte.ts`**
   - Added `'challenge_progress'` to `ActivityType` union

2. **Updated `writingGoalsStore.svelte.ts`**
   - Modified `recordWords()` to:
     - Track previous challenge progress before adding words
     - Calculate percentage completion (prevPct, newPct)
     - Detect milestone crossings (25%, 50%, 75%, 100%)
     - Emit `challenge_progress` activity event for each milestone crossed

### Milestone Detection Logic

```typescript
const milestones = [25, 50, 75, 100];
for (const milestone of milestones) {
  if (prevPct < milestone && newPct >= milestone) {
    activityStore.emit('challenge_progress', 'self', 'me', {
      challengeId: id,
      challengeTitle: challenge.title,
      milestone,
      wordsContributed: newProgress.wordsContributed,
      targetWords: challenge.targetWords
    });
  }
}
```

## Acceptance Criteria

- [x] When user writes (`recordWords`), update active challenge contributions
- [x] Challenge progress = words written since challenge start date
- [x] Emit `challenge_progress` activity event when 25%, 50%, 75%, 100% milestones hit
- [x] Only emit when milestone is crossed (not on every word)
- [x] Uses `queueMicrotask` pattern for fire-and-forget emission
- [x] Type-safe: `challenge_progress` added to `ActivityType`

## Files Changed

| File | Changes |
|------|---------|
| `src/lib/activityStore.svelte.ts` | Added `challenge_progress` type |
| `src/lib/writingGoalsStore.svelte.ts` | Milestone detection + event emission |

## Integration Points

- **challengeStore** — Reads `state.joined`, calls `addWords()`, gets progress
- **activityStore** — Emits `challenge_progress` events for feed display
- **ChallengeCard.svelte** — Shows live progress bar (already implemented)

## Example Event Payload

```typescript
{
  type: 'challenge_progress',
  userId: 'self',
  displayName: 'me',
  payload: {
    challengeId: 'ch_1711548123_abc12',
    challengeTitle: 'NaNoWriMo Sprint',
    milestone: 50,
    wordsContributed: 25000,
    targetWords: 50000
  }
}
```

## Related Stories

- S69-03: Community Writing Challenge Store
- S69-04: Challenge UI (Create & Join)
- S68-01: Activity Event Store
- S68-05: Emit Activity Events from Existing Stores

## Testing Notes

Manual test scenario:
1. Create challenge with 10,000 word target
2. Join the challenge
3. Write words in sessions (e.g., 2,500 → 5,000 → 7,500 → 10,000)
4. Check activityStore for `challenge_progress` events at each milestone
5. Verify ChallengeCard progress bar updates

Unit tests to add (S69-06):
- Milestone emission at 25%, 50%, 75%, 100%
- No duplicate emissions on same milestone
- Multiple challenges tracked independently
