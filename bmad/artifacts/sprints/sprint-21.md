# Sprint 21 — Error Boundaries & Resilience

**Duration:** 2026-03-17 → 2026-03-31
**Capacity:** 18 story points

## Sprint Goal

Harden the app against network failures and unexpected errors: add an offline banner, give every AI fetch an AbortController so in-flight requests can be cancelled, wire error toasts on real API failures (instead of silently falling back to stubs), add a `+error.svelte` SvelteKit boundary for unhandled route errors, and add a `warning` toast type.

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---|---|---|
| S21-01 | Resilience | Offline/online network banner | 3 | Must |
| S21-02 | Resilience | AI fetch cancel (AbortController) with Cancel button | 3 | Must |
| S21-03 | Resilience | Toast `warning` type + error toasts on AI failures | 2 | Must |
| S21-04 | Resilience | `+error.svelte` route error boundary | 2 | Must |
| S21-05 | Resilience | Retry helper utility + retry on save failure | 3 | Should |
| S21-06 | QA | Unit tests for S21-01 → S21-05 | 5 | Must |

**Total:** 18 points

## Definition of Done

- [ ] Offline banner appears at top of app page when `navigator.onLine` is false or `offline` event fires; disappears on `online` event
- [ ] Each AI action (analyse/coherence/suggestions) can be cancelled mid-flight; button toggles to "Cancel" while in-flight
- [ ] `toastStore` exposes `.warning()` method; AI fetch errors show a warning toast instead of silently stubbing
- [ ] `src/routes/+error.svelte` renders a friendly error page with message and "Go back" link
- [ ] `retryFetch` utility retries up to 3× with exponential back-off; used in document save path
- [ ] Unit tests cover all new behaviour (offline detection, abort, warning toast, retry logic)

## Implementation Notes

- S21-01: `OfflineBanner.svelte` uses `$effect` to attach `window.addEventListener('online'/'offline')`; initial state from `navigator.onLine`; rendered in `+layout.svelte`
- S21-02: one `AbortController` per action in `AIPanel.svelte`; cancel stores abort & resets state; button label reactive
- S21-03: extend `toastStore` with `warning` type (amber); in catch blocks call `toastStore.warning('AI request failed — showing cached results')`
- S21-04: minimal `+error.svelte` with `$page.error.message` + back link; no new deps
- S21-05: `src/lib/retryFetch.ts` — wraps `fetch`, retries on network errors / 5xx, max 3 attempts, delays 300/600/1200 ms
