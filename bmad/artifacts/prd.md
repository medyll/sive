 # Product Requirements Document (PRD)

 Consolidated PRD — merged draft added on 2026-03-14

 ---

 ## Original PRD (Auth MVP)

 Status: ready_for_architecture

 Overview
 --------
 Deliver a minimal, secure authentication system and foundational content pages so users can register, sign in, and manage their content in the MVP.

 Goal
 ----
 Provide a reliable authentication layer (Better-Auth + Drizzle) enabling user accounts, session management, and protected content pages for the MVP.

 MVP Scope (Must)
 -----------------
 - User sign-up and email/password login (local provider)
 - Session management (persistent sessions, secure cookies)
 - Login UI + server flow and basic user profile page
 - Database schema for users and sessions (drizzle schema)
 - Better-Auth integration using drizzleAdapter

 Scope (Should / Could)
 -----------------------
 - OAuth provider support (GitHub) — Should
 - Passwordless / magic link — Could

 Non-functional Requirements
 ---------------------------
 - Secure cookies (SameSite, HttpOnly, Secure) and encrypted secret (BETTER_AUTH_SECRET)
 - Unit test coverage for auth logic and adapter
 - E2E smoke test for login flow

 Acceptance Criteria
 -------------------
 - Users can register and log in on a fresh dev setup following README instructions
 - Sessions persist across browser restarts (where applicable)
 - Protected routes return 401/redirect for unauthenticated users
 - Unit tests for core auth functions pass in CI
 - E2E test covers sign-up, login, and logout

 Success Metrics
 ---------------
 - Auth flow passes CI E2E smoke test on every commit
 - <1% auth-related errors in initial staging usage

 Dependencies
 ------------
 - auth:data-model (missing — implement in `src/lib/server/db/schema.ts`)
 - Env vars: BETTER_AUTH_SECRET, optional provider secrets (GITHUB_CLIENT_ID/SECRET)

 Next Steps
 ----------
 1. Run `/architecture` to design the auth data model and document plugin order in `src/lib/server/auth.ts` (recommended).
 2. After architecture is finalized, run `/sprint-planning` to create sprint stories for implementation.

 Annexes & References
 --------------------
 - Architecture placeholder: `bmad/artifacts/architecture.md`
 - Tech spec: `bmad/artifacts/tech-spec.md`
 - Auth implementation notes: `src/lib/server/auth.ts`

 ---

 ## Draft additions (guest-mode & RC stabilization)

 Project: Sive — release v3.1.0 (RC)
 Generated: 2026-03-14
 Source: repository scan and `bmad/status.yaml`

 ## Purpose

 Enable a safe, usable release candidate focusing on stability, final integration tests, and guest-mode flexibility for onboarding. This PRD covers product goals, success metrics, scope, constraints, risks, and next milestones.

 ## Goals

 - Stabilize release candidate (Sprint 18) and fix outstanding E2E timeouts (S18-04).
 - Make authentication optional for core flows (guest mode) while protecting sensitive actions.
 - Ensure conversion path from guest → authenticated account.

 ## Success Metrics

 - E2E smoke/regression passing at 95%+ for RC.
 - Guest-mode adoption: 20% of new sessions as guests during canary.
 - Abuse signals (rate-limited events) remain below threshold (TBD).

 ## Scope (MVP)

 - Backend: make `event.locals.user` nullable; emit a stable `guest_id` cookie when unauthenticated. Protect write/permission endpoints to require explicit auth. Add conversion endpoint to merge guest data with a created account.
 - Frontend: show guest-mode UI affordance (banner/CTA) and clear conversion flow.
 - Tests: unit tests for hooks and guards; Playwright E2E for guest flows and conversion; add rate-limit tests.

 ## Constraints

 - Preserve existing DB schema unless explicitly approved; initial approach must be cookie-only (no migration). If persistence is required, add `guests` table via Drizzle migrations.
 - Keep Better‑Auth plugin ordering intact (`sveltekitCookies` last).

 ## Risks & Mitigations

 - Abuse/spam: enable rate-limiting and CAPTCHA for high-risk endpoints. Monitor and rollback via feature flag `ALLOW_GUESTS`.
 - Data ownership confusion: implement a clear conversion flow and notify users before binding data to accounts.

 ## Milestones / Next Actions

 1. Implement minimal guest cookie + nullable `event.locals.user` (no DB changes) — engineering (ETA: 2 days).
 2. Add conversion endpoint + frontend CTA (ETA: 2 days).
 3. Add unit + E2E tests for guest flows; run full test matrix (ETA: 2 days).
 4. Canary rollout with `ALLOW_GUESTS=true`, monitor metrics 72h.

 ---

 Merged and saved. Original content backed up in `bmad/artifacts/prd.previous.md`.
