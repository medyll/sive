# Sprint 13 - Goals

This sprint focuses on implementing a Settings page, onboarding/first-run checklist, and persistence and tests for preferences.

Todos

- s13-01: Settings page skeleton — Create settings UI at /settings with theme toggle, font size, and autosave interval. Use localStorage and toast feedback. Files: src/routes/settings/+page.svelte (in_progress)
- s13-02: Onboarding modal / first-run checklist — Create first-run onboarding modal that guides users through key features; store seen flag in localStorage. Files: src/lib/elements/Onboarding.svelte (pending)
- s13-03: Preferences persistence server — Add server action to persist user preferences when logged in and load on session (pending)
- s13-04: Profile → Settings link — Add link in Profile page and toolbar to open Settings page (pending)
- s13-05: Unit tests for settings & onboarding — Write unit tests (pending)
- s13-06: E2E onboarding flow — Playwright tests (pending)

Notes

- s13-01 is currently in progress. The settings UI should be saved to localStorage and surface toast feedback on save.
- Keep server persistence behind auth; load preferences into session on login.
