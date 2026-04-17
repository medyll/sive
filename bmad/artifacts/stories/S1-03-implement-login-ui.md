# Story S1-03 – Implement Login UI + Server Flow

**Epic:** Auth
**Sprint:** 1
**Points:** 2
**Priority:** Must

## User Story
As a user, I want to sign in with email and password so that I can access my protected content.

## Acceptance Criteria
- Sign-in page exists with email and password fields
- Client posts credentials to server endpoint and receives session cookie
- Invalid credentials show an accessible error message
- Successful login redirects to user dashboard

## Technical Notes
- Implement UI in `src/routes/auth/+page.svelte` and server handler in `src/routes/auth/+server.ts`
- Use `auth.api.signInEmail` (better-auth) on the server to authenticate
- Ensure CSRF and cookie settings follow security guidelines

## Definition of Done
- UI implemented and accessible
- Server flow integrates with Better-Auth and returns session
- Unit tests for server handler present
