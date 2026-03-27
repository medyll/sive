# S74-05 — Update Stores to Use API

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 4-6 hours  
**Actual:** 2.5 hours

---

## Goal

Refactor client stores to use database API instead of localStorage for challenges, discovery, and activity.

---

## Implementation

### Files Modified

| File | Changes |
|------|---------|
| `src/lib/server/discoveryQueries.ts` | Rewritten to use `/api/discover` |
| `src/lib/activityStore.svelte.ts` | Added API sync with localStorage fallback |
| `src/lib/challengeStore.svelte.ts` | Added API sync with localStorage fallback |

---

## Features

### discoveryQueries

**Functions:**
- `fetchDiscoveryProfiles()` — GET `/api/discover` with 1-minute cache
- `submitDiscoveryProfile(profile)` — POST `/api/discover`
- `removeDiscoveryProfile()` — DELETE `/api/discover`
- `__resetDiscovery()` — Clear cache (testing)

**Caching:**
- Profiles cached for 1 minute
- Returns cached data on API failure

---

### activityStore

**New Functions:**
- `emit(type, userId, displayName, payload)` — Optimistic update + API sync
- `refresh(limit)` — Fetch from API
- `getByUser(userId)` — Filter by user
- `getByType(type)` — Filter by type
- `getSince(timestamp)` — Filter by timestamp

**Sync Strategy:**
1. Add event to local state immediately (optimistic)
2. Save to localStorage
3. Sync to API in background (fire-and-forget)

---

### challengeStore

**Updated Functions:**
- `refresh()` — Fetch challenges from API
- `createChallenge()` — Optimistic update + API sync
- `join()` — Optimistic update + API sync
- `leave()` — Optimistic update + API sync
- `addWords()` — Optimistic update + API sync

**Sync Strategy:**
1. Update local state immediately (optimistic)
2. Save to localStorage
3. Sync to API in background (fire-and-forget)

**Fallback:**
- If API fails, localStorage data is used
- Deadline reminders still work offline

---

## Acceptance Criteria

- [x] `discoveryQueries` uses `/api/discover` endpoint
- [x] `activityStore` emits to `/api/activity`
- [x] `challengeStore` syncs to `/api/challenges`
- [x] Offline fallback to localStorage
- [x] Optimistic updates for better UX
- [x] Background sync doesn't block UI

---

## API Integration Pattern

```typescript
// Optimistic update pattern
async function doSomething() {
  // 1. Update local state immediately
  state = { ...state, ...changes };
  save(state);

  // 2. Sync to API in background
  apiCall().catch(console.error);
}
```

---

## Related Stories

- S74-01: Database Schema for Challenges
- S74-03: Challenge API Endpoints
- S74-04: Discovery API Endpoints
- S69: Writer Discovery & Community Challenges (original client-side implementation)

---

## Known Limitations

1. **No conflict resolution:** If same data modified on multiple devices, last write wins
2. **No retry logic:** Failed API calls are logged but not retried
3. **No offline queue:** Changes made offline sync on next page load only

---

## Definition of Done

- [x] discoveryQueries updated
- [x] activityStore updated
- [x] challengeStore updated
- [x] Optimistic updates implemented
- [x] localStorage fallback works
- [x] Story documented
