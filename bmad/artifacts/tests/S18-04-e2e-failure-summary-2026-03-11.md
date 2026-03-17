# S18-04 — E2E Failure Investigation (summary)

Date: 2026-03-11

Summary:
- Playwright E2E run (2026-03-10) failed with widespread timeouts and locator assertion failures.
- Environment warnings observed: "require is not defined" and better-sqlite3 native binding failed (running with a mocked DB).

Top error-context files (most recent):
- D:\boulot\dev\node\sive\test-results\harden-Harden-flow-—-app-c-80265-rences-shows-the-diff-panel\error-context.md
- D:\boulot\dev\node\sive\test-results\harden-Harden-flow-—-app-V-d31bd--both-versions-are-selected\error-context.md
- D:\boulot\dev\node\sive\test-results\review-mode-Review-Mode-—--1b4fc-tton-triggers-loading-state\error-context.md
- D:\boulot\dev\node\sive\test-results\harden-Harden-flow-—-app-d-f0f64--are-visible-in-History-tab\error-context.md
- D:\boulot\dev\node\sive\test-results\app-layout-App-layout-—-ap-567bd-ect-aria-expanded-attribute\error-context.md
- D:\boulot\dev\node\sive\test-results\suggestions-tab-Suggestion-a3650-ll-button-removes-all-cards\error-context.md
- D:\boulot\dev\node\sive\test-results\style-tab-Style-tab-—-app--77965--signal-and-suggestion-text\error-context.md
- D:\boulot\dev\node\sive\test-results\ux-polish-UX-Polish-Export-94bc0-int-before-running-analysis\error-context.md
- D:\boulot\dev\node\sive\test-results\review-mode-Review-Mode-—--0c4e7-urns-to-false-after-exiting\error-context.md
- D:\boulot\dev\node\sive\test-results\coherence-tab-Coherence-ta-af531-alerts-have-a-red-ish-badge\error-context.md

Recommended next steps:
1. Reproduce failing tests locally with Playwright traces: `npx playwright test --trace=on --workers=1` and collect traces/screenshots for failing tests.
2. Ensure webserver readiness before running E2E (use Playwright web-server option or a readiness probe).
3. Investigate and fix "require is not defined" (CJS/ESM mismatch or build step including require in browser context).
4. Provide stable better-sqlite3 binary in CI or implement a deterministic mock used by tests.
5. Harden selectors (avoid non-unique role selectors), add data-testids for flaky elements, and increase specific timeouts where warranted.

Artifacts produced:
- test-results/ (existing Playwright artifacts)
- This summary: bmad/artifacts/tests/S18-04-e2e-failure-summary-2026-03-11.md

Recommendation: assign to a backend/devops engineer for native binary / server readiness fixes and a QA engineer to repro and harden tests.
