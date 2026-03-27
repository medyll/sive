# S74-01 — Database Schema for Challenges

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 2-3 hours  
**Actual:** 1 hour

---

## Goal

Create database tables for challenges and challenge participants to enable server-side persistence.

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/server/db/schema/challenges.ts` | Challenge schema definitions |
| `drizzle/0003_hard_spectrum.sql` | Migration SQL |

---

## Database Schema

### challenges Table

```sql
CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  target_words INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  creator_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL
);
```

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique challenge ID (auto-generated) |
| title | TEXT | Challenge title (max 80 chars) |
| description | TEXT | Challenge description (max 300 chars) |
| target_words | INTEGER | Word count goal |
| duration_days | INTEGER | Challenge duration in days |
| creator_id | TEXT | User ID of creator |
| created_at | INTEGER | Creation timestamp |
| ends_at | INTEGER | Challenge end timestamp |

---

### challenge_participants Table

```sql
CREATE TABLE challenge_participants (
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  words_contributed INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (challenge_id, user_id)
);
```

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| challenge_id | TEXT | Reference to challenges.id |
| user_id | TEXT | Reference to users.id |
| joined_at | INTEGER | Join timestamp |
| words_contributed | INTEGER | Words written during challenge |

**Composite Primary Key:** `(challenge_id, user_id)` — Prevents duplicate joins

---

## Type Inference

Drizzle ORM automatically generates TypeScript types:

```typescript
// Full challenge with all fields
export type Challenge = typeof challenges.$inferSelect;

// For inserting new challenges (no id, created_at, ends_at)
export type NewChallenge = typeof challenges.$inferInsert;

// Participant with all fields
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;

// For inserting new participants
export type NewChallengeParticipant = typeof challengeParticipants.$inferInsert;
```

---

## Migration

**File:** `drizzle/0003_hard_spectrum.sql`

**To Apply:**
```bash
# Option 1: Run migration (if drizzle-kit migrate works)
npm run db:migrate

# Option 2: Push schema directly
npm run db:push

# Option 3: Run SQL manually in Drizzle Studio
npm run db:studio
```

---

## Integration with Existing Schema

The schema is exported from main schema file:

```typescript
// src/lib/server/db/schema.ts
export * from './schema/challenges';
```

Usage:
```typescript
import { challenges, challengeParticipants } from '$lib/server/db/schema';
```

---

## Acceptance Criteria

- [x] `challenges` table schema created
- [x] `challenge_participants` table schema created
- [x] Composite primary key for participants (prevents duplicates)
- [x] TypeScript types generated via Drizzle
- [x] Migration file generated
- [x] Schema exported from main schema file

---

## Related Stories

- S74-02: Database Schema for Discovery & Activity
- S74-03: Challenge API Endpoints
- S69-03: Community Writing Challenge Store (client-side predecessor)

---

## Next Steps

1. Run migration to create tables in database
2. Create Challenge API endpoints (S74-03)
3. Update challengeStore to use API instead of localStorage

---

## Definition of Done

- [x] Schema file created with proper types
- [x] Migration generated
- [x] Schema exported from main file
- [x] Story documented
