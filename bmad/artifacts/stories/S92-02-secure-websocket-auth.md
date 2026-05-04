# S92-02 — Secure WebSocket Endpoint

**Sprint:** 92 — Security & Stabilité
**Priority:** 🔴 CRITIQUE
**Effort:** 2h
**Assignee:** Dev

## Context

Audit finding: `/api/ws` accepts connections without session validation.
Risk: ⚠️ HIGH — unauthenticated users can connect to collaboration WebSocket.
File: `src/routes/api/ws/+server.ts`

## Acceptance Criteria

- [ ] Session validated before WebSocket upgrade accepted
- [ ] Unauthenticated connections rejected with 401
- [ ] Rate limiting applied to WS messages
- [ ] E2E test: unauthorized WS connection returns 401

## Implementation

In `src/routes/api/ws/+server.ts`:
1. Extract session from request headers/cookies using Better-Auth
2. If no valid session → reject with `Response(null, { status: 401 })`
3. Apply existing rate limiter from `src/lib/server/rateLimit.ts` to WS messages

## Test

E2E test: attempt WS connection without auth → expect 401.
E2E test: connect with valid session → expect upgrade success.
