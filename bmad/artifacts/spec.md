# Product Specification (SPEC) — Guest Mode & RC Stabilization

**Project:** Sive  
**Version:** 3.1.0 (RC)  
**Date:** 2026-03-14  
**Status:** Canonical Spec

---

## 1. Overview
Implementation details for optional authentication (**guest mode**). Enables non-authenticated access to core features while maintaining security and providing a conversion path to permanent accounts. Initial phase is **stateless (cookie-only)** to avoid DB migrations.

## 2. Requirements

### Functional Requirements
* **R1:** Generate/validate a stable UUID `guest_id` cookie if no session exists.
* **R2:** Enable read-only access for guests; write/sensitive actions must return `401/403`.
* **R3:** Transactional endpoint to merge guest data into a user account upon registration.
* **R4:** Runtime control via `ALLOW_GUESTS` feature flag.

### Non-Functional Requirements
* **N1:** No DB schema changes for MVP (cookie-based tracking).
* **N2:** Rate limiting per `guest_id` and IP for high-risk endpoints.
* **N3:** Instrumentation for creation, conversion, and block rates.

---

## 3. API & Server Behavior

### Hook Logic (`src/hooks.server.ts`)
1. Call `auth.api.getSession({ headers })`.
2. If session is **null** and `ALLOW_GUESTS` is **true**:
    * Check for `guest_id` cookie.
    * If missing: generate UUIDv4 and set cookie (`Secure`, `HttpOnly`, `SameSite=Lax`).
    * Set `event.locals.guestId`.
3. Force `event.locals.user = null` for all guest requests.

### New Endpoints
* **`POST /api/guest/convert`**:
    * **Payload:** `{ email, password, guest_id, verification_token }`.
    * **Logic:** Validate cookie integrity, create user, reassign guest resources within a DB transaction.
* **`GET /api/guest/status`**:
    * **Response:** `{ guestId, canConvert: boolean }`.

### Route Guards
* **Non-sensitive:** Access allowed; UI components toggled via `event.locals.user` check.
* **Sensitive:** Redirect to `/auth` remains mandatory.

---

## 4. Frontend Behavior
* **Banner:** Display `You are using Sive as a guest — save your work by creating an account.`
* **Auth Wall:** Show explanatory modal/CTA when guests trigger protected actions.

## 5. Security & Abuse Controls
* **Throttling:** 60 req/min for write operations per `guest_id`.
* **Validation:** CAPTCHA/email verification required for account conversion.
* **Metrics:** Track `guests_created`, `guests_converted`, and `conversions_failed`.

---

## 6. Testing Requirements

### Unit Tests
* **Hooks:** Cookie generation and `event.locals` population.
* **Guards:** Status code verification for restricted vs. open routes.

### E2E (Playwright)
* **Guest Flow:** Verify content creation and persistence via cookie.
* **Conversion:** Execute guest-to-account migration; verify resource ownership transfer.
* **Negative:** Verify `401/302` on `/settings` or `/profile`.

---

## 7. Rollout Plan
1. Deploy hook logic with `ALLOW_GUESTS=false`.
2. Activate flag in **canary**; monitor for 72h.
3. Analyze abuse signals and conversion metrics.
4. Global activation and scheduled DB persistence (Sprint 19).

---

## 8. File Checklist
* [ ] `src/hooks.server.ts` — Guest ID logic.
* [ ] `src/lib/server/auth.ts` — Plugin ordering check.
* [ ] `src/routes/api/guest/*` — Conversion endpoints.
* [ ] `e2e/*.spec.ts` — Playwright coverage.