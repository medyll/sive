# S74-03 — Challenge API Endpoints

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 4-6 hours  
**Actual:** 2 hours

---

## Goal

Create REST API endpoints for challenge CRUD operations and participation (join, leave, progress).

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `src/routes/api/challenges/+server.ts` | List & create challenges |
| `src/routes/api/challenges/[id]/join/+server.ts` | Join challenge |
| `src/routes/api/challenges/[id]/leave/+server.ts` | Leave challenge |
| `src/routes/api/challenges/[id]/progress/+server.ts` | Get/update progress |

---

## API Endpoints

### GET /api/challenges

**Query Parameters:**
- `joined=true` — Filter to only joined challenges
- `creator=userId` — Filter by creator ID

**Response:**
```json
{
  "challenges": [
    {
      "id": "ch_123",
      "title": "NaNoWriMo",
      "description": "Write 50,000 words in November",
      "targetWords": 50000,
      "durationDays": 30,
      "creatorId": "user_456",
      "createdAt": 1711548123000,
      "endsAt": 1714140123000,
      "joined": true
    }
  ]
}
```

---

### POST /api/challenges

**Request Body:**
```json
{
  "title": "30-Day Sprint",
  "description": "Write every day for 30 days",
  "targetWords": 10000,
  "durationDays": 30
}
```

**Response:** `201 Created`
```json
{
  "challenge": {
    "id": "ch_123",
    "title": "30-Day Sprint",
    ...
  }
}
```

---

### POST /api/challenges/[id]/join

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Joined challenge successfully"
}
```

**Errors:**
- `400` — Already joined
- `400` — Challenge has ended
- `404` — Challenge not found

---

### POST /api/challenges/[id]/leave

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Left challenge successfully"
}
```

**Errors:**
- `400` — Not joined this challenge

---

### GET /api/challenges/[id]/progress

**Response:** `200 OK`
```json
{
  "challengeId": "ch_123",
  "wordsContributed": 5000,
  "targetWords": 10000,
  "percentage": 50,
  "joinedAt": 1711548123000
}
```

**Errors:**
- `404` — Not joined this challenge

---

### POST /api/challenges/[id]/progress

**Request Body:**
```json
{
  "words": 500
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "wordsContributed": 5500
}
```

**Errors:**
- `400` — Not joined this challenge
- `400` — Invalid word count

---

## Security

**Auth Required:**
- All endpoints require authenticated user (`locals.user`)
- Returns `401 Unauthorized` if not logged in

**Validation:**
- Title max 80 characters
- Description max 300 characters
- Words must be positive number
- Challenge must exist and be active

---

## Acceptance Criteria

- [x] `GET /api/challenges` — List active challenges
- [x] `POST /api/challenges` — Create challenge
- [x] `POST /api/challenges/:id/join` — Join challenge
- [x] `POST /api/challenges/:id/leave` — Leave challenge
- [x] `GET /api/challenges/:id/progress` — Get user progress
- [x] `POST /api/challenges/:id/progress` — Update progress
- [x] Auth required for all operations
- [x] Proper error handling (400, 401, 404)

---

## Related Stories

- S74-01: Database Schema for Challenges
- S74-05: Update Stores to Use API
- S69-03: Community Writing Challenge Store (client-side predecessor)

---

## Next Steps

1. Test endpoints manually or with E2E tests
2. Update `challengeStore` to use API instead of localStorage (S74-05)
3. Add rate limiting if needed

---

## Definition of Done

- [x] All 6 endpoints implemented
- [x] Auth middleware applied
- [x] Input validation
- [x] Error handling
- [x] Story documented
