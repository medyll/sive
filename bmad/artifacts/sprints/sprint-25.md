# Sprint 25 — AI-assisted Document Summaries

**Status:** planned
**Focus:** Add one-click AI-assisted document summarisation and export/print polish.
**Dates:** 2026-03-17 → 2026-03-31

---

## Stories

### S25-01: `summaryBadge` toolbar action
Add a small `📄 Summary` badge in the document toolbar that triggers an async summarisation job for the active document.
- UI: badge opens a compact panel with the generated summary (3 sizes: short/medium/long).
- Keyboard: `Ctrl+Alt+S` opens the summary panel.
- Settings: user can toggle `auto-summary-on-save` (off by default).

### S25-02: `api/ai/summary` streaming endpoint
Implement `/api/ai/summary` server endpoint that accepts `docId` and `length` and returns a streaming SSE/NDJSON summary from the AI service.
- Accept `ctx` param with base64 document excerpt (up to 2000 chars).
- Fall back to mock response in dev.
- Ensure rate-limits and simple retry logic on the client.

### S25-03: Summary store + cache
Add a `summaries` store in the client that caches recent summaries per `docId` and `length` for 24 hours.
- Expire stale entries.
- Provide `refreshSummary(docId, length)` to force regeneration.

### S25-04: Export/Print polish
Improve PDF export and print stylesheet to include the generated summary as an optional preface.
- Add `Include summary` checkbox in export modal.
- Ensure print stylesheet hides interactive elements and formats headings.

### S25-05: Unit tests
- `src/lib/server/ai/summary.spec.ts` — server parsing, mock fallback.
- `src/lib/elements/SummaryPanel.spec.ts` — UI behaviour, caching, keyboard shortcut.

### S25-06: E2E tests
- `e2e/sprint25.spec.ts` — generate a summary for a doc, verify it appears in UI; export with summary included and verify PDF contains summary text.

---

## Acceptance Criteria
- Users can generate and view summaries without page reloads.
- Summaries are cached and refreshable.
- Export modal includes the summary when selected and produced PDFs render cleanly.
