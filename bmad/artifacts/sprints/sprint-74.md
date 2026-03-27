# Sprint 74 Planning — Server-Side Sync

**Status:** Planning  
**Target Date:** 2026-03-29  
**Planned Stories:** 6  
**Estimated Effort:** 2-3 days

---

## Sprint Goal

Migrate client-side features (challenges, discovery, activity feed) from localStorage to database-backed persistence for multi-device sync and data durability.

---

## Context

**Current State (Client-Side Only):**
- ✅ `challengeStore` — localStorage persistence
- ✅ `discoveryQueries` — In-memory only (lost on refresh)
- ✅ `activityStore` — localStorage ring buffer
- ✅ `partnersStore` — localStorage persistence

**Problems:**
- Data lost when clearing browser data
- No sync across devices
- Discovery profiles disappear on refresh
- Challenge progress not shared across sessions
- No backup/recovery

**Foundation Available:**
- ✅ Better-Auth with user sessions
- ✅ Drizzle ORM + SQLite database
- ✅ `user_preferences` table (pattern for user data)
- ✅ `documents` and `document_shares` tables (relational pattern)

---

## Stories

### S74-01: Database Schema for Challenges

**Goal:** Create database tables for challenges and challenge progress.

**Acceptance Criteria:**
- [ ] `challenges` table: id, title, description, targetWords, durationDays, creatorId, createdAt, endsAt
- [ ] `challenge_participants` table: challengeId, userId, joinedAt, wordsContributed
- [ ] Drizzle schema files created
- [ ] Migration files generated
- [ ] Schema documented

**Files to Create:**
- `src/lib/server/db/schema/challenges.ts` — Challenge schema
- `drizzle/migrations/create_challenges.sql` — Migration

**Estimated Time:** 2-3 hours

---

### S74-02: Database Schema for Discovery & Activity

**Goal:** Create database tables for writer discovery and activity feed.

**Acceptance Criteria:**
- [ ] `writer_discovery` table: userId, displayName, currentStreak, longestStreak, totalWords, topBadge, optedIn
- [ ] `activity_events` table: id, type, userId, displayName, timestamp, payload (JSON)
- [ ] Drizzle schema files created
- [ ] Migration files generated
- [ ] Indexes for performance (userId, timestamp)

**Files to Create:**
- `src/lib/server/db/schema/discovery.ts` — Discovery & activity schema
- `drizzle/migrations/create_discovery.sql` — Migration

**Estimated Time:** 2-3 hours

---

### S74-03: Challenge API Endpoints

**Goal:** Create REST API for challenge CRUD and participation.

**Acceptance Criteria:**
- [ ] `GET /api/challenges` — List active challenges
- [ ] `POST /api/challenges` — Create challenge
- [ ] `POST /api/challenges/:id/join` — Join challenge
- [ ] `POST /api/challenges/:id/leave` — Leave challenge
- [ ] `POST /api/challenges/:id/progress` — Update progress
- [ ] `GET /api/challenges/:id/progress` — Get user progress
- [ ] Auth required for write operations
- [ ] Rate limiting on write endpoints

**Files to Create:**
- `src/routes/api/challenges/+server.ts` — List/create
- `src/routes/api/challenges/[id]/join/+server.ts` — Join
- `src/routes/api/challenges/[id]/leave/+server.ts` — Leave
- `src/routes/api/challenges/[id]/progress/+server.ts` — Progress

**Estimated Time:** 4-6 hours

---

### S74-04: Discovery API Endpoints

**Goal:** Create REST API for writer discovery and activity feed.

**Acceptance Criteria:**
- [ ] `GET /api/discover` — List opted-in writers (replace in-memory)
- [ ] `POST /api/discover` — Opt-in to discovery
- [ ] `DELETE /api/discover` — Opt-out of discovery
- [ ] `GET /api/activity` — Get activity feed
- [ ] `POST /api/activity` — Emit activity event
- [ ] Auth required for write operations

**Files to Create:**
- `src/routes/api/discover/+server.ts` — Rewrite with DB
- `src/routes/api/activity/+server.ts` — Activity feed

**Estimated Time:** 3-4 hours

---

### S74-05: Update Stores to Use API

**Goal:** Refactor client stores to use database API instead of localStorage.

**Acceptance Criteria:**
- [ ] `challengeStore` fetches from `/api/challenges`
- [ ] `challengeStore` syncs progress to `/api/challenges/:id/progress`
- [ ] `discoveryQueries` uses `/api/discover` endpoint
- [ ] `activityStore` emits to `/api/activity`
- [ ] Offline fallback to localStorage
- [ ] Background sync when online

**Files to Modify:**
- `src/lib/challengeStore.svelte.ts` — API integration
- `src/lib/server/discoveryQueries.ts` — API integration
- `src/lib/activityStore.svelte.ts` — API integration

**Estimated Time:** 4-6 hours

---

### S74-06: Unit Tests — Server-Side Sync

**Goal:** Comprehensive test coverage for new API endpoints.

**Acceptance Criteria:**
- [ ] Challenge API tests (CRUD, join, leave, progress)
- [ ] Discovery API tests (opt-in, opt-out, list)
- [ ] Activity API tests (emit, list, filter)
- [ ] Auth tests (unauthorized access blocked)
- [ ] Rate limit tests
- [ ] 80%+ coverage for new code

**Files to Create:**
- `src/routes/api/challenges/challenges.spec.ts`
- `src/routes/api/discover/discover.spec.ts`
- `src/routes/api/activity/activity.spec.ts`

**Estimated Time:** 3-4 hours

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Schema changes break existing data | Run migrations in dev first, backup DB |
| API endpoints slow | Add database indexes, cache frequently accessed data |
| Offline users lose functionality | Fallback to localStorage, sync when online |
| Rate limits too aggressive | Start conservative, adjust based on usage |
| Auth edge cases (guest users) | Handle gracefully, return appropriate errors |

---

## Dependencies

- ✅ S69: Challenge Store (existing logic to migrate)
- ✅ S69: Discovery Queries (existing logic to migrate)
- ✅ S68: Activity Store (existing logic to migrate)
- ✅ S11: Better-Auth (auth middleware available)
- ✅ S17: Rate Limiting (middleware available)

---

## Success Metrics

- ✅ Challenges persist across browser sessions
- ✅ Discovery profiles survive page refresh
- ✅ Activity feed loads from database
- ✅ Multi-device sync works (same user, different browsers)
- ✅ API response time <200ms for all endpoints
- ✅ 80%+ test coverage

---

## Alternative: Test Hardening Continuation

If server-side sync blocked by infrastructure:

### Sprint 74B — Remaining Placeholder Tests

**Stories:**
- S74B-01: Fix ShareGoalsModal Tests (5 tests)
- S74B-02: Fix WeeklyHistoryPanel Tests (6 tests)
- S74B-03: Fix Svelte Build Warnings (a11y, state, css)
- S74B-04: Create Test Patterns Documentation

---

## Recommendation

**Proceed with Server-Side Sync (S74)** because:
1. Critical for production readiness
2. Enables multi-device users
3. Prevents data loss complaints
4. Builds on existing auth/DB infrastructure
5. Can pivot to tests if DB issues arise

---

**Created:** 2026-03-28  
**Planning Role:** PM  
**Review:** Ready for dev
