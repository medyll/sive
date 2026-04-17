# S74-02 — Database Schema for Discovery & Activity

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 2-3 hours  
**Actual:** 1 hour

---

## Goal

Create database tables for writer discovery and activity events to enable server-side persistence and cross-device sync.

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/server/db/schema/discovery.ts` | Discovery & activity schema definitions |
| `drizzle/0003_hard_spectrum.sql` | Migration SQL (included with S74-01) |

---

## Database Schema

### writer_discovery Table

```sql
CREATE TABLE writer_discovery (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  total_words INTEGER DEFAULT 0 NOT NULL,
  top_badge_icon TEXT DEFAULT '✍️',
  top_badge_name TEXT DEFAULT 'Writer',
  opted_in INTEGER DEFAULT 0 NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_discovery_opted_in ON writer_discovery (opted_in);
```

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT | Reference to users.id (PK) |
| display_name | TEXT | Public display name |
| current_streak | INTEGER | Current day streak |
| longest_streak | INTEGER | Best streak achieved |
| total_words | INTEGER | Lifetime word count |
| top_badge_icon | TEXT | Badge emoji |
| top_badge_name | TEXT | Badge name |
| opted_in | INTEGER | 0 = hidden, 1 = discoverable |
| updated_at | INTEGER | Last update timestamp |

**Index:** `idx_discovery_opted_in` — Fast filtering for discovery listings

---

### activity_events Table

```sql
CREATE TABLE activity_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  payload TEXT
);

CREATE INDEX idx_activity_user ON activity_events (user_id);
CREATE INDEX idx_activity_timestamp ON activity_events (timestamp);
CREATE INDEX idx_activity_type ON activity_events (type);
```

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique event ID (auto-generated) |
| type | TEXT | Event type (badge_earned, streak_milestone, etc.) |
| user_id | TEXT | User who performed action |
| display_name | TEXT | Username at time of event |
| timestamp | INTEGER | Event timestamp |
| payload | TEXT | JSON string with event details |

**Indexes:**
- `idx_activity_user` — Fast lookup by user
- `idx_activity_timestamp` — Fast time-based queries
- `idx_activity_type` — Fast filtering by event type

**Event Types:**
- `badge_earned` — User earned a badge
- `streak_milestone` — User hit streak milestone
- `challenge_progress` — User hit challenge milestone
- `goal_completed` — User completed daily goal
- `leaderboard_entry` — User entered leaderboard

---

## Type Inference

```typescript
// Full discovery profile
export type WriterDiscovery = typeof writerDiscovery.$inferSelect;

// For inserting new discovery profile
export type NewWriterDiscovery = typeof writerDiscovery.$inferInsert;

// Full activity event
export type ActivityEvent = typeof activityEvents.$inferSelect;

// For inserting new event
export type NewActivityEvent = typeof activityEvents.$inferInsert;
```

---

## Migration

**File:** `drizzle/0003_hard_spectrum.sql` (same as S74-01)

**To Apply:**
```bash
npm run db:push
# or
npm run db:studio  # Run SQL manually
```

---

## Integration with Existing Schema

```typescript
// src/lib/server/db/schema.ts
export * from './schema/discovery';
```

Usage:
```typescript
import { writerDiscovery, activityEvents } from '$lib/server/db/schema';
```

---

## Acceptance Criteria

- [x] `writer_discovery` table schema created
- [x] `activity_events` table schema created
- [x] Indexes for performance (opted_in, user, timestamp, type)
- [x] TypeScript types generated via Drizzle
- [x] Migration file generated
- [x] Schema exported from main schema file

---

## Related Stories

- S74-01: Database Schema for Challenges
- S74-04: Discovery API Endpoints
- S69-01: Writer Discovery Page (client-side predecessor)
- S68-01: Activity Event Store (client-side predecessor)

---

## Next Steps

1. Run migration to create tables in database
2. Create Discovery API endpoints (S74-04)
3. Create Activity API endpoint (S74-04)
4. Update discoveryQueries and activityStore to use API

---

## Definition of Done

- [x] Schema file created with proper types
- [x] Migration generated
- [x] Schema exported from main file
- [x] Story documented
