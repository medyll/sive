# Sprint 59 — A11y Quick Findings

Observed warnings from local runs (vitest & Playwright build):

1) Redundant role 'article'
- Files: src/lib/elements/ReviewReport.svelte (multiple occurrences lines ~114,125,149,161,173)
- Issue: elements use `<article class="report-item" role="article">` — role="article" is redundant when using semantic <article>.
- Quick fix: remove `role="article"` attributes from those elements.

2) Click handlers on non-interactive elements
- Files: src/lib/elements/ShareModal.svelte
- Issue: visible, non-interactive elements have click handlers without keyboard equivalents.
- Quick fix: convert clickable divs to `<button type="button">` or add `on:keydown` handlers (Space/Enter) and `tabindex="0"` if keeping non-semantic element.

3) State referenced only at initialization
- Files: src/lib/elements/WritingStatsPanel.svelte
- Issue: `$state(content)` used to create `_stale` may capture initial value; prefer referencing inside closures or use derived/stateful patterns.
- Quick fix: review `$effect` usage and use `$state` inside effect or derive properly.

4) LightningCSS at-rule errors
- Files: global CSS / token files (preprocessor output)
- Issue: LightningCSS minifier doesn't support advanced `@function`, `color-mix`, `oklch` at-rules used in design tokens.
- Recommendation: defer large CSS parser changes; consider precompiling tokens or disabling LightningCSS minify for now.

Action items
- S59-03: implement quick fixes above (remove redundant roles, fix interactive semantics, adjust small state reference issue). Document deferred items for later.

Notes
- These are non-blocking for unit tests but may affect E2E and build-time warnings. Address quick items first to reduce noise.
