# Product Requirements Document (PRD) — Sive v3.1.0 (RC)

**Status:** `ready_for_architecture` / Release Candidate  
**Version:** 3.1.0  
**Date:** 2026-03-14  
**Stack:** SvelteKit, Better-Auth, Drizzle ORM, Playwright

---

## 1. Purpose & Overview
Deliver a stable release candidate integrating the **Better-Auth** system with a flexible **guest-mode** onboarding flow. Focus on stability, E2E reliability, and frictionless user conversion.

## 2. Goals
* **Authentication Core:** Secure layer for registration, session management, and protected content.
* **Guest-Mode Flexibility:** Core flows available without mandatory authentication.
* **RC Stabilization:** Resolve E2E timeouts (S18-04) and ensure 95%+ pass rate.
* **Conversion Path:** Seamless transition from guest sessions to authenticated accounts.

## 3. Success Metrics

| Metric | Target |
| :--- | :--- |
| **E2E Stability** | 95%+ pass rate for smoke/regression tests. |
| **Guest Adoption** | 20% of new sessions using guest mode during canary. |
| **Auth Reliability** | <1% auth-related errors in staging. |
| **Abuse Control** | Rate-limited events below established threshold. |

---

## 4. Scope

### Auth MVP (Must-Have)
* **Providers:** Email/Password (local).
* **Session Management:** Persistent sessions via secure cookies (`SameSite`, `HttpOnly`, `Secure`).
* **Infrastructure:** Drizzle adapter and `BETTER_AUTH_SECRET` management.
* **UI/UX:** Login flows, server-side guards, and basic profile page.

### Guest Mode & RC Stabilization
* **Backend:** * Nullable `event.locals.user`.
    * Stable `guest_id` cookies for unauthenticated users.
    * Conversion endpoint to merge guest data into new accounts.
* **Frontend:** Guest banners/CTAs and conversion flow UI.
* **Performance:** Targeted fixes for Playwright E2E timeouts.

---

## 5. Constraints & Technical Requirements
* **Database:** Preserve existing schema. Initial guest implementation is **cookie-only**. Use `guests` table via Drizzle migrations only if persistence is required.
* **Plugin Ordering:** Keep `sveltekitCookies` last in `src/lib/server/auth.ts`.
* **Security:** * Protect write/permission endpoints (require auth).
    * Mandatory rate-limiting and CAPTCHA for high-risk endpoints.
* **Feature Flags:** Control via `ALLOW_GUESTS`.

---

## 6. Risks & Mitigations
* **Abuse/Spam:** Mitigated by rate-limiting and canary monitoring.
* **Data Ownership:** UI notification required before binding guest data to permanent accounts.
* **E2E Flakiness:** Resolution of S18-04 timeouts is mandatory before RC sign-off.

---

## 7. Milestones & Next Actions
1. **Core Guest Logic:** `guest_id` cookie + nullable `event.locals.user` (2 days).
2. **Conversion Flow:** Endpoint development and frontend CTA (2 days).
3. **Testing:** Unit/E2E tests for guest flows; full regression matrix (2 days).
4. **Canary Rollout:** `ALLOW_GUESTS=true` with 72h monitoring.

## 8. Dependencies
* **Drizzle CLI:** For potential migrations.
* **Playwright:** For E2E validation.
* **Env Vars:** `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID/SECRET`.