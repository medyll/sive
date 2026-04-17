# Discussion: S18-04 — Cross-role: E2E timeouts & environment (auto-opened)

Date: 2026-03-11

Context:

- Story: S18-04 — fix-e2e-timeout-failures (sprint-18)
- Trigger: Playwright E2E run produced widespread timeouts and environment warnings (see bmad/artifacts/tests/S18-04-e2e-failure-summary-2026-03-11.md)

Observed problems:

- Many Playwright tests fail with Test timeout (30000ms) and expect(...).toBeVisible failures.
- Environment warnings: "require is not defined" (possible CJS/ESM mismatch) and better-sqlite3 native binding missing (fallback to mock DB).

Cross-role impact:

- Backend / DevOps: native binary availability, server readiness, CJS/ESM bundling in browser/test env.
- QA / Test Engineers: flaky selectors, timing, need for traces/screenshots and test hardening.
- Developers: fix app code causing missing elements or mismatched roles/selectors.

Recommended immediate actions (auto-created by bmad-master next --auto):

1. Owner: engineering/qa — run reproduction locally with Playwright traces: `npx playwright test --trace=on --workers=1` and attach traces to this thread.
2. DevOps/Backend: ensure better-sqlite3 binary is available in CI and local dev, or provide deterministic mock for tests; investigate CJS/ESM "require is not defined" warnings.
3. QA: add Playwright web-server readiness probe or use Playwright's `webServer` option so tests wait for server readiness before running.
4. Devs: add `data-testid` attributes or more robust selectors for flaky elements; avoid ambiguous role selectors that match multiple elements.

Acceptance criteria:

- Playwright failing tests reproduce locally with traces attached.
- Webserver readiness verified and E2E run completes past previously failing points.
- better-sqlite3 issue resolved or reliable mock in place.
- Reduce flakiness: failing test list drops by >= 90% for the previously failing suite.

References:

- bmad/status.yaml — S18-04 entry (assigned)
- bmad/artifacts/tests/S18-04-e2e-failure-summary-2026-03-11.md

Thread owner: engineering/qa (auto-assigned)
