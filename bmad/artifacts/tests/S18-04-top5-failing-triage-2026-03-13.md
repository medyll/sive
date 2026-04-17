Triage: Top 5 failing E2E tests (Playwright rerun 2026-03-13)

Summary:
- Run produced 91 failing tests. Common failure modes: locator timeouts (click/fill/hover), expect.toBeVisible failures, element(s) not found, page.waitForURL timeouts, toHaveAttribute failures.

Top 5 failure clusters (for investigation):
1) Auth/login flow timeouts — selectors not visible / page.waitForURL timeout.
2) Dashboard UI elements not present/visible (toolbar buttons, document list) causing many toBeVisible failures.
3) Form interactions timing out (locator.fill / click) — likely server readiness or hydration issues.
4) Role/selector collisions causing strict-mode duplicates and failures.
5) Attribute/expectation mismatches (toHaveAttribute / toContain) likely due to different server-side mock state.

Recommended artefacts to collect next:
- Playwright traces/screenshots for one failing test from each cluster (collect 5 traces).
- The corresponding test files and failing assertion lines.
- Server preview logs showing DB/auth initialization.

Suggested next steps:
1. Extract traces for representative failing tests and attach to bmad/artifacts/tests/.
2. Re-run a single failing test with trace to produce an inspectable trace.
3. Fix server readiness/auth DB initialization (ensure in-memory DB or proper mock) and re-run.
4. Create stories for each cluster with reproduction steps and attach traces.

Notes:
- Currently built server falls back to mocked auth/DB in many runs; ensure deterministic DB for preview to reduce flakiness.
- Some Svelte warnings about non-reactive $state may indicate UI timing/hydration differences but are lower priority than auth/DB.
