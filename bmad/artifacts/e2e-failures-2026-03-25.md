E2E focused run failures — 2026-03-25

Summary:
- Ran focused Playwright specs against detached preview (PW_SKIP_WEB_SERVER=1).
- Many tests passed, but a set of failures remain across auth, app-layout (focus mode), and document-persistence toolbar expectations.

Top failing tests (examples):
- e2e/app-layout.spec.ts — Focus/Exit Focus behavior (Exit Focus button not found / AI panel visibility mismatches)
- e2e/auth-flow.spec.ts & e2e/auth-login.spec.ts — Auth pages not rendering expected form elements (getByLabel 'Email' missing)
- e2e/document-persistence.spec.ts — toolbar active document title not present in some runs

Artifacts produced by Playwright:
- trace-output/ (Playwright traces, screenshots, error-context.md files)
- trace-output/*.trace (raw traces)
- trace-output/*/error-context.md (per-failure page snapshots)

What was tried already:
- Suppressed PWA install prompt via e2e/storageState.json (sive:pwa:* keys)
- Reverted global suppression of onboarding tour (removed 'sive:tour:completed' from storageState.json) since it broke onboarding tests
- Increased Playwright timeouts in playwright.config.ts (actionTimeout -> 20s; navigationTimeout -> 30s; global timeout -> 60s)
- Launched preview detached and re-ran focused specs

Immediate next steps (recommendation):
1. Inspect trace-output/*/error-context.md for the top 5 failing tests to determine whether overlays or auth redirection cause missing elements.
2. If missing elements are caused by feature flags or localStorage, add keys selectively via fixtures (not global storageState) to avoid breaking tests that assert the presence of onboarding.
3. Investigate why /auth route does not render the expected form in Playwright runs (compare server logs and SSR output). Ensure preview uses the same DB and env (MOCK env) as tests expect.
4. Once root causes are identified, apply surgical fixes: tweak fixtures, adjust selectors or timing in tests where reasonable, or add stable test-only flags in app code guarded by e2e env var.

Generated-by: Copilot CLI (automated test stabilization run)
