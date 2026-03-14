# Architecture Document — Merged Draft

Merged on: 2026-03-14
Source: `bmad/artifacts/architecture.draft.md` merged conceptually with existing architecture document.

NOTE: This is a non-destructive merged version. The original `architecture.md` remains unchanged; confirm to replace.

## Summary

This merged architecture describes a cookie-only guest-mode MVP with optional future persistence. Key components: client, SvelteKit server hooks, Better-Auth (unchanged), Drizzle persistence, background reconciliation worker, and observability.

## Data flow (cookie-only MVP)

1. Incoming request → `hooks.server.ts` calls `auth.api.getSession(headers)`.
2. If session exists: `event.locals.user = user`.
3. If session absent and `ALLOW_GUESTS=true`: ensure `guest_id` cookie (UUIDv4) set with Secure, HttpOnly, SameSite=Lax and attach to `event.locals.guestId`.
4. Routes consult `event.locals.user` and `event.locals.guestId`; sensitive writes return 401/403 for guests.
5. Conversion endpoint validates guest and sets auth cookie; optionally triggers ownership transfer job.

## Persistence (optional)

- Future `guests` table and `owner_guest_id` columns for resources; migrations via Drizzle Kit.

## Security

- Rate limiting by `guest_id` and IP, CAPTCHA for suspicious flows, and metrics for guest events.

## Rollout and Observability

- Feature flag `ALLOW_GUESTS` default `false`. Canary rollout, monitor guests_created, guests_converted, guests_blocked.

## Files to change

- `src/hooks.server.ts`, `src/lib/server/auth.ts`, route guards under `src/routes/*`, add `src/routes/api/guest/*` endpoints, and tests under `e2e/`.

---

If you confirm, I will replace `bmad/artifacts/architecture.md` with this merged version and keep the original as `architecture.previous.md`.