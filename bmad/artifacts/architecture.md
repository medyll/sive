# System Architecture — Sive v3.1.0 (Guest Mode & RC)

**Date:** 2026-03-14  
**Status:** Final Candidate  
**Goal:** Define system architecture and data flow to support optional authentication (guest mode) via cookies with optional future DB persistence.

---

## 1. High-Level Components
* **Client (Svelte):** UI banners/CTAs for guests, conversion/signup modal, conditional disabling of write-only actions.
* **SvelteKit Server:** `hooks.server.ts` for session resolution and guest cookie management; new `/api/guest/*` endpoints.
* **Auth Subsystem:** Better-Auth (unchanged). Manages authenticated sessions via `sveltekitCookies`.
* **Persistence:** Drizzle + SQLite. MVP requires no new tables; schema ready for future `guests` table.
* **Observability:** Prometheus/StatsD metrics for tracking guest creation and conversion events.

---

## 2. Data Flow (Cookie-only MVP)
1. **Interception:** `hooks.server.ts` calls `auth.api.getSession(headers)`.
2. **Session Exists:** `event.locals.user` is populated (standard flow).
3. **Session Absent + `ALLOW_GUESTS=true`:**
    * Check for `guest_id` cookie.
    * If missing: generate UUIDv4, set cookie (Secure, HttpOnly, SameSite=Lax, path=/, expires ~30d).
    * Assign to `event.locals.guestId`.
4. **Request Handling:** Route handlers check `locals.user` and `locals.guestId`. Sensitive write operations return `401/403` for guests.
5. **Conversion:** `POST /api/guest/convert` validates the guest cookie, performs user registration, and optionally triggers ownership transfer jobs.

---

## 3. Persistence & Evolution (Future)
* **Schema:** `guests` table (id UUID primary key, created_at, last_seen, metadata JSON).
* **Relations:** Nullable `owner_guest_id` column added to resource tables (documents, settings).
* **Migrations:** Use `drizzle-kit` for `db:generate` and `db:push/migrate`. Update ORM types and run `npm run auth:schema` if required.

---

## 4. Route Guard Strategy
* **Public:** Accessible to everyone (guests included).
* **Authenticated:** Requires `event.locals.user`; returns redirect/401 if missing.
* **Mixed:** Allows guests but restricts sensitive UI; server rejects mutations (POST/PATCH/DELETE) with 403 for guest IDs.

---

## 5. Security & Rollout
* **Anti-abuse:** Rate-limit by `guest_id` and IP. Implement CAPTCHA for suspicious anonymous traffic.
* **Deployment:** `ALLOW_GUESTS` environment variable (default `false`). 72h Canary rollout monitoring session error rates and guest creation spikes.
* **Rollback:** Instant disable via `ALLOW_GUESTS=false`. Conversion operations must remain idempotent and safe for retries.

---

## 6. Implementation Checklist
* [ ] `src/hooks.server.ts`: Guest cookie logic (must preserve `auth.api.getSession` behavior).
* [ ] `src/lib/server/auth.ts`: Verify plugin execution order.
* [ ] `src/routes/*`: Update guards in `settings`, `profile`, and `app`.
* [ ] `src/routes/api/guest/`: Add `convert` and `status` endpoints.
* [ ] `e2e/guest-flow.spec.ts`: Playwright E2E tests for the guest lifecycle.

---

## 7. Key Metrics
* `guests_created` (Counter)
* `guests_converted` (Counter)
* `guest_actions_blocked` (Counter)
* `conversion_latency` (Histogram)