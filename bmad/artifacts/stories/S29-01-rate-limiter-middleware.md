---
id: S29-01
sprint: 29
title: rate-limiter-middleware
status: done
---

# S29-01 — Rate Limiter Middleware

## Goal
Create token bucket rate limiter: 100 req/min per user, 300 req/min per IP, with 429 response and whitelist.

## Acceptance Criteria
- [ ] Token bucket algorithm: 100/min per user, 300/min per IP
- [ ] Returns 429 with Retry-After header
- [ ] Localhost/internal IPs whitelisted

## Notes
src/lib/server/rateLimit.ts. In-memory or Redis.
