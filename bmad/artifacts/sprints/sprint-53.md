# Sprint 53 — Dark Mode

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Wire the dark/light theme radio in Settings to a real CSS class on `<html>`, persist the preference, and apply consistent dark-mode CSS variables across the app.

---

## Stories

### S53-01: Apply theme class to `<html>` from settings
**File:** `src/routes/+layout.svelte`
Wire the `theme` setting (localStorage key `settings.theme`) to `document.documentElement.classList`. On mount and on change, set `class="dark"` or remove it.

### S53-02: Dark mode CSS variables in layout.css
**File:** `src/routes/layout.css` (or global CSS)
Add `html.dark { --color-background: #1a1a1a; --color-surface: #242424; --color-text: #e5e7eb; --color-border: #374151; --color-primary: #818cf8; ... }` covering all CSS vars used in the app.

### S53-03: Wire settings theme save to live update
**File:** `src/routes/settings/+page.svelte`
After saving, immediately dispatch a `theme:change` CustomEvent so `+layout.svelte` updates without reload.

### S53-04: Dark mode for editor & AI panel
Verify `EditorPanel` and `AIPanel` use CSS vars (not hardcoded colors). Fix any hardcoded `#fff` / `#1a1a1a` values that break dark mode.

### S53-05: Unit tests — themeStore
Create `src/lib/themeStore.svelte.ts` with `getTheme()` / `setTheme()` helpers. Write unit tests.

### S53-06: E2E smoke — dark mode toggle
- Settings page: switch to dark → save → app has `.dark` class
- Switch back to light → `.dark` class removed
