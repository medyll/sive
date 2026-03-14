# Product Requirements Document (Draft)

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

## Dependencies

- Drizzle CLI for migrations (if persistence chosen): `npm run db:generate`, `npm run db:migrate`.
- Playwright for E2E: `npm run test:e2e`.

## Ownership

- Owner: engineering/qa (as recorded in `bmad/status.yaml` S18-04)

---
This is a draft. I did not overwrite existing artifacts; if `bmad/artifacts/prd.md` exists we will leave it and create a versioned draft instead. Next: generate `spec.md` or implement the minimal CLI to drive `bmad plan` commands. Which should I do next?
