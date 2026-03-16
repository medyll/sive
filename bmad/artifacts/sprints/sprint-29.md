# Sprint 29 — API Rate Limiting & Security Hardening

**Status:** planned
**Focus:** Implement per-user and per-IP rate limiting on write endpoints + enhance security headers.
**Dates:** 2026-03-17

---

## Stories

### S29-01: Rate limiter middleware
Create `src/lib/server/rateLimit.ts`:
- Token bucket algorithm: 100 req/min per user, 300 req/min per IP.
- Track usage in memory (or Redis if available).
- Return `429 Too Many Requests` with `Retry-After` header.
- Whitelist localhost/internal IPs.

### S29-02: Apply rate limiting to write endpoints
Wire rate limiter to:
- `POST /app` (saveDocument, deleteDocument, duplicateDocument)
- `POST /api/ai/stream` (chat requests)
- `POST /api/ai/summary` (summary generation)
- `POST /api/export/pdf` (PDF rendering)
- Exclude GET endpoints (reads are cheaper).

### S29-03: Security headers & CSP
Add to `src/app.html` / middleware:
- `Content-Security-Policy`: img-src, script-src, style-src whitelisting.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `Referrer-Policy: strict-origin-when-cross-origin`

### S29-04: Input validation & sanitization
Enhance validation on:
- Document titles (max 255 chars, no null bytes)
- Content payloads (max 1MB)
- AI prompts (max 5000 chars, no injection patterns)
- API responses (validate shape before sending to client)

### S29-05: Unit tests
- Rate limiter token bucket logic (refill, depletion, whitelist)
- CSP header generation
- Input validation edge cases

### S29-06: E2E tests
- Trigger 429 by exceeding rate limit
- Verify `Retry-After` header present
- Confirm security headers in responses
- Test input validation rejection
