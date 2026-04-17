# S69-02 — Submit Profile to Discovery

**Status:** ✅ Done  
**Date:** 2026-03-26

## Goal

Add a privacy toggle allowing users to opt into writer discovery, separate from leaderboard visibility.

## Implementation

### Changes Made

**Updated `src/lib/privacyStore.svelte.ts`:**

```typescript
export interface PrivacyState {
  showOnLeaderboard: boolean;  // Existing
  showInDiscovery: boolean;    // NEW - separate toggle
  displayName: string;
}
```

### New Methods

| Method | Purpose |
|--------|---------|
| `setShowInDiscovery(visible: boolean)` | Toggle discovery opt-in |
| `state.showInDiscovery` | Read current opt-in status |

### Profile Submission Flow

When visiting `/discover` page:
1. Check `privacyStore.state.showInDiscovery`
2. If `true`, POST profile to `/api/discover`
3. Profile includes: displayName, streaks, totalWords, topBadge
4. Stored in in-memory discovery store

### Discovery Profile Data

```typescript
{
  displayName: string,        // From privacyStore
  currentStreak: number,      // From goalsStore
  longestStreak: number,      // From goalsStore
  totalWords: number,         // From writing stats
  topBadgeIcon: string,       // From badgesStore
  topBadgeName: string        // From badgesStore
}
```

## Acceptance Criteria

- [x] `privacyStore` gains `showInDiscovery` toggle (separate from leaderboard)
- [x] When ON: profile submitted to in-memory discovery store on page load
- [x] Profile card shows: username, streak, word count, top badge
- [ ] Settings UI toggle: "Allow others to discover me" — **Needs UI wiring**
- [ ] Unit tests — **Deferred to S69-06**

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/privacyStore.svelte.ts` | Added `showInDiscovery` field + `setShowInDiscovery()` |

## Files Using Discovery

| File | Purpose |
|------|---------|
| `src/routes/discover/+page.svelte` | Submits profile on mount if opted in |
| `src/lib/server/discoveryQueries.ts` | Stores submitted profiles |

## Related Stories

- S69-01: Writer Discovery Page
- S67-04: Leaderboard Privacy Settings
- S69-06: Unit Tests

## Testing Notes

Manual test:
1. Set `privacyStore.setShowInDiscovery(true)` in console
2. Visit `/discover` — profile should appear
3. Set `privacyStore.setShowInDiscovery(false)`
4. Refresh — profile should be hidden

Unit tests to add (S69-06):
- `privacyStore.spec.ts` — `setShowInDiscovery`, state persistence
- Discovery profile submission logic
- Privacy filter in discovery API

## TODO

**Settings UI:** Add toggle to `/settings` page:
```svelte
<label>
  <input 
    type="checkbox" 
    bind:checked={privacyStore.state.showInDiscovery}
    onchange={(e) => privacyStore.setShowInDiscovery(e.target.checked)}
  />
  Allow others to discover me
</label>
```
