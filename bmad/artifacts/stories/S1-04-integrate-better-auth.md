# Story S1-04 – Integrate Better-Auth Adapter & DB Migrations

**Epic:** Auth
**Sprint:** 1
**Points:** 3
**Priority:** Must

## User Story
As a developer, I want Better-Auth integrated with Drizzle so that the app can persist users, sessions, and provider accounts.

## Acceptance Criteria
- Drizzle adapter configured in `src/lib/server/auth.ts`
- Migrations generated from `src/lib/server/db/*` schema and applied
- Local dev flow documented for `DATABASE_URL` and migration commands

## Technical Notes
- Run `npm run db:generate` then `npm run db:migrate` (drizzle-kit)
- Provide fallback mock DB for local UI work when native bindings absent

## Definition of Done
- Adapter wired and migrations applied in test environment
- README updated with migration steps
