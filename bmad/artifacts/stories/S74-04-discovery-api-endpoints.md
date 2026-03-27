# S74-04 — Discovery API Endpoints

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 3-4 hours  
**Actual:** 1.5 hours

---

## Goal

Create REST API endpoints for writer discovery and activity feed.

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `src/routes/api/discover/+server.ts` | Discovery CRUD (list, opt-in, opt-out) |
| `src/routes/api/activity/+server.ts` | Activity feed (list, emit) |

---

## API Endpoints

### GET /api/discover

**Response:** `200 OK`
```json
{
  "profiles": [
    {
      "userId": "user_123",
      "displayName": "@writer123",
      "currentStreak": 14,
      "longestStreak": 30,
      "totalWords": 50000,
      "topBadgeIcon": "✍️",
      "topBadgeName": "Writer",
      "optedIn": 1
    }
  ]
}
```

**Notes:**
- Only returns profiles with `optedIn = 1`
- Sorted by `currentStreak` descending

---

### POST /api/discover

**Request Body:**
```json
{
  "displayName": "@writer123",
  "currentStreak": 14,
  "longestStreak": 30,
  "totalWords": 50000,
  "topBadgeIcon": "✍️",
  "topBadgeName": "Writer"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Profile created"
}
```

**Notes:**
- Creates new profile or updates existing
- Sets `optedIn = 1`

---

### DELETE /api/discover

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Opted out of discovery"
}
```

**Notes:**
- Sets `optedIn = 0` (doesn't delete profile)

---

### GET /api/activity

**Query Parameters:**
- `limit` — Number of events (default: 50, max: 100)
- `userId` — Filter by user
- `type` — Filter by event type
- `since` — Get events since timestamp

**Response:** `200 OK`
```json
{
  "events": [
    {
      "id": "act_123",
      "type": "badge_earned",
      "userId": "user_456",
      "displayName": "@writer456",
      "timestamp": 1711548123000,
      "payload": "{\"badgeName\":\"Novelist\"}"
    }
  ]
}
```

---

### POST /api/activity

**Request Body:**
```json
{
  "type": "badge_earned",
  "displayName": "@writer123",
  "payload": {"badgeName": "Novelist"}
}
```

**Response:** `201 Created`
```json
{
  "event": {
    "id": "act_123",
    "type": "badge_earned",
    "userId": "user_123",
    "displayName": "@writer123",
    "timestamp": 1711548123000,
    "payload": "{\"badgeName\":\"Novelist\"}"
  }
}
```

**Event Types:**
- `badge_earned`
- `streak_milestone`
- `challenge_progress`
- `goal_completed`
- `leaderboard_entry`

---

## Security

**Auth Required:**
- POST endpoints require authenticated user
- GET endpoints are public (read-only)

**Validation:**
- Display name max 30 characters
- Event type required
- Payload stored as JSON string

---

## Acceptance Criteria

- [x] `GET /api/discover` — List opted-in writers
- [x] `POST /api/discover` — Opt-in to discovery
- [x] `DELETE /api/discover` — Opt-out of discovery
- [x] `GET /api/activity` — Get activity feed
- [x] `POST /api/activity` — Emit activity event
- [x] Auth required for write operations
- [x] Proper error handling

---

## Related Stories

- S74-02: Database Schema for Discovery & Activity
- S74-05: Update Stores to Use API
- S69-01: Writer Discovery Page (client-side predecessor)
- S68-01: Activity Event Store (client-side predecessor)

---

## Definition of Done

- [x] All 5 endpoints implemented
- [x] Auth middleware applied
- [x] Input validation
- [x] Error handling
- [x] Story documented
