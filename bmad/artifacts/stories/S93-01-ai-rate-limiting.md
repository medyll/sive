# S93-01 — Rate Limiting on AI Endpoints

**Sprint:** 93 — Qualité & Performance
**Priority:** 🟡 MOYEN
**Effort:** 1h
**Assignee:** Dev

## Context

Audit: `/api/ai/*` has no specific rate limiting beyond global limits.
Risk: Cost explosion if AI endpoints abused. Stricter limits needed.

## Acceptance Criteria

- [ ] AI endpoints limited to 20 req/min per user
- [ ] Returns 429 with `Retry-After` header when exceeded
- [ ] Existing global rate limit unchanged

## Implementation

In `src/routes/api/ai/+server.ts` (and sub-routes):
- Apply `rateLimitMiddleware` with AI-specific config: 20/min per userId
- Reuse `src/lib/server/rateLimit.ts` token bucket with lower capacity

## Test

Unit test: 21 rapid AI requests → 21st returns 429.
