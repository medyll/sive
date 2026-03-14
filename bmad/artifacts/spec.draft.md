# Product Specification (Draft)

Project: Sive — Guest Mode & RC stabilization
Generated: 2026-03-14
Source: repository scan, `bmad/status.yaml`, engineering constraints

## Overview

This document specifies the implementation details for making authentication optional (guest mode) while preserving security, data ownership, and the ability to convert guest data to authenticated accounts. It targets the minimal safe rollout (cookie-only guest id) as the initial implementation to avoid DB migrations.

## Non-goals

- Persisting a dedicated `guests` table in this first iteration (deferred).  
- Removing Better‑Auth or reordering its plugins.

## Requirements

1. Functional
  - R1: When a request has no authenticated session, create/ensure a `guest_id` cookie (stable UUID) and set `event.locals.user` to `null`.
  - R2: Non-sensitive read-only routes must work for guests; write or sensitive actions must require authentication and return `401/403` for guests.
  - R3: Provide an endpoint to convert/merge guest data into a new or existing user account using verification (email/token). Conversion should be transactional.
  - R4: Feature flag `ALLOW_GUESTS` to enable/disable guest behavior at runtime.

2. Non-functional
  - N1: No DB schema changes required for MVP (cookie-only).  
  - N2: Production must include per-guest and per-IP rate limiting for high-risk endpoints.  
  - N3: Add instrumentation (metrics) for guest creations, conversions, and blocked attempts.

## API & Server Behavior

Hook changes
- File: `src/hooks.server.ts`
  - On each request: call `auth.api.getSession({ headers })` as today. If session present, set `event.locals.session`/`event.locals.user` unchanged.
  - If session absent and `ALLOW_GUESTS=true`: check for `guest_id` cookie. If absent, generate UUIDv4, set cookie with Secure, HttpOnly, SameSite=lax, and attach `event.locals.guestId`.
  - Ensure `event.locals.user` is explicitly `null` when unauthenticated.

New endpoints
- `POST /api/guest/convert` (server)
  - Body: { email, password (or oauth flow), guest_id, verification_token }
  - Behavior: validate guest_id matches cookie, create user (or link existing after verification), reassign guest-owned resources to user_id within a DB transaction (if resources are DB-backed). For cookie-only MVP, set auth cookie and mark conversion event for later reconciliation.
  - Responses: 200 on success, 400/401 on verification failure.

- `GET /api/guest/status`
  - Returns minimal info: { guestId, canConvert: boolean }

Route guards
- Update routes that `throw redirect(302, '/auth')` to instead behave depending on `ALLOW_GUESTS` and route sensitivity:  
  - If sensitive: return `throw redirect(302, '/auth')` (no change).  
  - If non-sensitive: allow guest access but hide or disable UI actions that require auth.

## Frontend behavior

- Show a persistent but unobtrusive banner/indicator when in guest mode: "You are using Sive as a guest — save your work by creating an account." Include CTA to start conversion.  
- When guest performs an action that requires auth (save/share/profile), the UI shows a modal explaining limitations and offers conversion/signup flow.

## Data ownership and merge strategy

- MVP cookie-only: resources created while guest will carry `guest_id` metadata (in-memory/temporary or stored in existing tables in a `owner_guest_id` optional column if already present). If DB persistence is needed, a migration plan must be created.
- Conversion process must reconcile and transfer ownership atomically where possible; if not possible in MVP, surface a background job to finalize transfer and show progress to user.

## Security & Abuse Controls

- Rate limit high-risk endpoints by `guest_id` and IP (e.g., 60/min for create operations).  
- Add optional CAPTCHA on suspicious flows (many creations in short time).  
- Monitor metrics: guests_created, guests_converted, guests_blocked, conversions_failed.

## Testing Requirements

- Unit tests
  - Hooks: cookie creation, `event.locals` values when session present/absent.  
  - Route guards: endpoints return expected status for guest vs user.

- E2E (Playwright)
  - Guest session: open app, create a document as guest, verify document appears in doc list and banner is visible.  
  - Conversion: convert guest into account, verify document now owned by account.  
  - Negative: attempt protected action as guest and assert block/redirect.

## Rollout Plan

1. Implement cookie-only guest hook behavior behind `ALLOW_GUESTS=false` default.  
2. Run internal integration tests, then enable `ALLOW_GUESTS=true` in canary.  
3. Monitor metrics 72 hours, evaluate abuse signals.  
4. If acceptable, enable globally and schedule DB persistence in a follow-up sprint (if desired).

## Acceptance Criteria

- Hook sets `guest_id` cookie for unauthenticated requests when feature flag enabled.  
- At least one non-sensitive route is usable without auth.  
- Conversion endpoint exists and returns success for basic conversion flow (end-to-end).  
- Unit & E2E tests cover guest creation and conversion.

## Implementation Notes / File checklist

- `src/hooks.server.ts` — modify to set `event.locals.guestId` and cookie logic.  
- `src/lib/server/auth.ts` — ensure plugin ordering remains unchanged.  
- `src/routes/*` — update route guards for `settings`, `profile`, `app`, and demo routes as per spec.  
- `bmad/artifacts/prd.draft.md` — PRD already created.  
- Add tests under `src/routes/**` and `e2e/**`.

---
This is a draft spec. I created it as `bmad/artifacts/spec.draft.md` to avoid overwriting any existing artifact. Next step: create the architecture artifact (`bmad/artifacts/architecture.draft.md`) or implement the minimal CLI to run `bmad plan` commands. Which should I do next?
