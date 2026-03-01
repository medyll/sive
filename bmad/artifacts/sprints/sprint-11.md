# Sprint 11 — Auth Hardening

**Status:** ✅ Done  
**Goal:** Secure the `/app` route behind real auth (when available), upgrade the login page to Svelte 5, add signup, profile and sign-out flows, and surface user identity in the toolbar.

---

## Stories

| ID | Title | Status |
|----|-------|--------|
| S11-01 | Route guard on `/app` (redirect to `/auth` when `!isMock && !user`) | ✅ Done |
| S11-02 | Login page — Svelte 5 runes, SvelteKit form actions, GitHub OAuth button | ✅ Done |
| S11-03 | Signup page at `/auth/signup` — email + password + name | ✅ Done |
| S11-04 | Profile page at `/profile` — display name/email, sign-out action | ✅ Done |
| S11-05 | Toolbar user badge — circular avatar with initials, link to `/profile` | ✅ Done |
| S11-06 | Unit tests — guard redirect, user passthrough, profile load | ✅ Done |
| S11-07 | E2E tests — auth pages render, mock mode notice, form error on submit | ✅ Done |

---

## Key decisions

- **`isMock` guard**: route guard checks `isMock` first; in dev (no DB) `/app` stays accessible as guest. Real redirect only fires when `isMock=false` (production build with real SQLite).
- **GitHub OAuth**: button triggers `?/github` form action → `auth.api.signInSocial({ provider: 'github' })` → redirect to GitHub; returns 503 in mock mode.
- **Profile sign-out**: calls `auth.api.signOut()` best-effort then redirects to `/auth`.
- **User badge**: shows first 2 chars of `name` or `email`, fallback "G" for guest. Rendered as `<a href="/profile">` link.

---

## Test coverage

- **Unit**: 110 tests (6 new — guard redirect, user passthrough, profile page load)
- **E2E**: 6 new tests in `e2e/auth-flow.spec.ts`

---

## Files created / modified

### Created
- `src/routes/auth/+page.server.ts` — login + github form actions
- `src/routes/auth/signup/+page.svelte` — signup form
- `src/routes/auth/signup/+page.server.ts` — signup action
- `src/routes/profile/+page.svelte` — profile display + sign-out
- `src/routes/profile/+page.server.ts` — profile load + signOut action
- `src/routes/app/page.server.guard.spec.ts` — route guard unit tests
- `src/routes/profile/page.server.spec.ts` — profile page unit tests
- `e2e/auth-flow.spec.ts` — 6 auth E2E tests

### Modified
- `src/routes/app/+page.server.ts` — added route guard + user in return value
- `src/routes/app/+page.svelte` — added user badge in toolbar
- `src/routes/auth/+page.svelte` — full rewrite to Svelte 5 with form actions
- `src/routes/app/page.server.spec.ts` — added 2 user-passthrough tests
