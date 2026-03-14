# Architecture Draft — Guest Mode & RC Stabilization

Generated: 2026-03-14
Project: Sive v3.1.0 (RC)

Goal
- Define system architecture and data flow to support optional authentication (guest mode) with minimal risk and optional DB persistence later.

High-level components
- Client (browser): UI banner/CTA for guest; conversion/signup modal; disables auth-only actions for guests.
- SvelteKit server: `hooks.server.ts` (session resolution, guest cookie creation), route guards, API endpoints (`/api/guest/*`).
- Auth subsystem: Better‑Auth (unchanged, `sveltekitCookies` last). Responsible for normal authenticated flows.
- Persistence layer: Drizzle + SQLite. For MVP, no new required tables; optional `guests` table in future.
- Background jobs / reconciliation: optional worker to finalize ownership transfers if conversion requires async work.
- Observability: metrics collection (Prometheus/StatsD) and logging for guest events.

Data flow (cookie-only MVP)
1. Incoming request → `hooks.server.ts` calls `auth.api.getSession(headers)`.
2. If session exists: `event.locals.user = user` (no change).
3. If session absent and `ALLOW_GUESTS=true`: check `guest_id` cookie. If missing, generate UUIDv4, set cookie (Secure, HttpOnly, SameSite=Lax, path=/, expires ~30d) and set `event.locals.guestId`.
4. Handlers & routes consult `event.locals.user` (may be null) and `event.locals.guestId` to allow read-only flows or return 401/403 for sensitive write operations.
5. When conversion requested, `POST /api/guest/convert` validates guest cookie and performs conversion: set auth cookie, optionally trigger ownership transfer job.

Optional persistent guest model (future)
- Add `guests` table (id UUID primary, created_at, last_seen, metadata JSON). 
- Add nullable `owner_guest_id` column to resource tables (documents, settings) to record guest ownership.
- Migration plan: create migration script via `drizzle-kit` (`npm run db:generate`), run `db:push` or `db:migrate`, update ORM types and run `npm run auth:schema` if needed.

Route guard strategy
- Three guard levels:
  - Public: accessible to anyone (guests OK).
  - Authenticated: require `event.locals.user`; return redirect/401 otherwise.
  - Mixed: allow guests but hide/disable sensitive UI actions; server returns 403 for write attempts.

Security & Anti-abuse
- Rate-limit by `guest_id` and IP for create/submit endpoints (configurable rules).  
- Add CAPTCHA for suspicious rates or anonymous bulk operations.  
- Log and emit metrics: `guests_created`, `guests_converted`, `guest_actions_blocked`, `guest_rate_limited`.

Deployment & Rollout
- Feature flag: `ALLOW_GUESTS` (env var) default `false`.
- Canary: enable for subset of hosts / internal env for 72h, monitor metrics and logs.  
- If persistence is added later, deploy migrations in a maintenance window and run reconciliation jobs.

Observability
- Add counters and histograms for guest cookie issuance, conversion latency, blocked events.  
- Alert on sudden spikes in `guests_created` or blocked events.

Acceptance & Rollback
- Fail-open behavior: if metrics or abuse escalate, set `ALLOW_GUESTS=false` to disable guest creation instantly.  
- Ensure conversion operations are idempotent and safe to retry.

Files to change (implementation checklist)
- `src/hooks.server.ts` — guest cookie logic + `event.locals.guestId` (MUST preserve `auth.api.getSession` behavior).  
- `src/lib/server/auth.ts` — verify plugin order preserved.  
- `src/routes/*` — adjust guards in `settings`, `profile`, `app`, and demo routes.  
- Add `src/routes/api/guest/convert/+server.ts` and `src/routes/api/guest/status/+server.ts`.
- Add tests: `src/routes/**` unit and `e2e/guest-flow.spec.ts` Playwright.

Notes
- This draft avoids destructive DB changes. Any migration to persist guests must be planned and reviewed.  
- Cookie expiration and privacy policy alignment should be validated with product/legal.
