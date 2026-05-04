# S93-03 — Add /health Endpoint

**Sprint:** 93 — Qualité & Performance
**Priority:** 🟡 MOYEN
**Effort:** 1h
**Assignee:** Dev

## Context

Audit: No health check endpoint for DevOps/monitoring.

## Acceptance Criteria

- [ ] `GET /health` returns 200 + JSON status
- [ ] Response includes: `{ status: "ok", version, db: "ok"|"error", uptime }`
- [ ] DB connectivity checked (simple query)
- [ ] Returns 503 if DB unreachable

## Implementation

Create `src/routes/api/health/+server.ts`:
```typescript
export const GET = async ({ locals }) => {
  // check DB with simple select
  // return { status, version, db, uptime }
}
```

## Test

Unit test: GET /health → 200 with `{ status: "ok" }`.
Unit test: DB down → 503 with `{ status: "error", db: "error" }`.
