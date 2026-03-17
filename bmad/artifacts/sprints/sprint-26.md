# Sprint 26 — Auto-summary on Save & Print Polish

**Status:** done
**Focus:** Wire auto-summary-on-save from Settings, show summary timestamp in panel, and add a clean print stylesheet.
**Dates:** 2026-03-16

---

## Stories

### S26-01: `autoSummary` setting in Settings page
Add an `autoSummary` boolean toggle (off by default) to the Settings page.
- Persisted in `localStorage` under the existing `settings` key.
- Label: "Auto-generate summary on save".

### S26-02: Auto-summary trigger on save
In `+page.svelte`, after `handleSave` succeeds, check the `autoSummary` setting.
- If on: call `/api/ai/summary` in the background (fire-and-forget) for the saved doc, caching the medium-length summary.
- A small "Updating summary…" toast appears and resolves silently.
- Read setting from `localStorage` at call time (no reactive binding needed).

### S26-03: Print stylesheet
Add `@media print` rules to `src/lib/styles/theme.css`:
- Hide toolbar, sidebar, chat overlay, AI panel, resize handle, toast, badges.
- Show only the editor content at full width.
- Format headings and body text cleanly.
- If a summary is prepended (export-with-summary pattern), style the summary preface visually distinct.

### S26-04: Summary panel timestamp
In `SummaryPanel.svelte`, show "Last updated: X minutes ago" below the summary text when a cached entry exists.
- Use a reactive `$derived` that formats the stored `ts` relative to now.
- Update every minute via `setInterval` inside `$effect`.

### S26-05: Unit tests
- `src/lib/elements/SummaryPanel.timestamp.spec.ts` — timestamp display logic.
- Update `src/routes/settings/page.server.spec.ts` or add `settings.autoSummary.spec.ts` — verify toggle persists in localStorage.

### S26-06: E2E tests
`e2e/sprint26.spec.ts`:
- Toggle auto-summary on in Settings → save a document → verify summary cache is populated.
- Verify print styles hide the toolbar (`@media print` is hard to test directly; verify CSS rule exists via page.evaluate).
- Verify summary panel shows "Last updated" after a summary is generated.
