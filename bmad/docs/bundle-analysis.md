# Bundle Analysis — Sprint 77

**Date:** 2026-03-29  
**Build Command:** `npm run build`

---

## Bundle Size Summary

### Client Bundle (Production)

| Metric | Size |
|--------|------|
| Total JS (uncompressed) | ~350 KB |
| Total JS (gzipped) | ~115 KB |
| Largest chunk | 127 KB (node/2.DI4IO7d-.js) |
| Entry app.js | 6 KB / 2.2 KB gzip |

### Server Bundle

| Metric | Size |
|--------|------|
| Total JS (uncompressed) | ~1.5 MB |
| Total JS (gzipped) | ~380 KB |
| Largest chunk | 936 KB (demo/better-auth/login) |

---

## Top 10 Largest Client Chunks

| File | Size | Gzip | Purpose |
|------|------|------|---------|
| `nodes/2.DI4IO7d-.js` | 127 KB | 40 KB | Main page/editor |
| `chunks/DF5eihpz.js` | 52 KB | 20 KB | Svelte runtime |
| `chunks/IZuz8a9U.js` | 32 KB | 12 KB | Shared utilities |
| `nodes/19.3MvEoEiU.js` | 25 KB | 8 KB | Settings page |
| `nodes/0.C9M8Sm2a.js` | 14 KB | 6 KB | App shell |
| `nodes/17.B9i4R5HZ.js` | 10 KB | 3.5 KB | Challenges page |
| `nodes/14.ct9_1M8M.js` | 8 KB | 3 KB | Discover page |
| `nodes/8.BPiTXlmb.js` | 6 KB | 2.4 KB | Dashboard |
| `nodes/5.BMv7NoKC.js` | 6 KB | 2.5 KB | Leaderboard |
| `nodes/6.C5MBS5qm.js` | 5 KB | 2 KB | Profile |

---

## Optimization Opportunities

### High Priority

1. **Main editor chunk (127 KB)**
   - Split editor components lazily
   - Code split AI panel, toolbar, ghost text
   - Potential savings: 40-50 KB

2. **Settings page (25 KB)**
   - Lazy load settings page
   - Split preference sections
   - Potential savings: 15 KB

3. **Svelte runtime (52 KB)**
   - Already optimized, minimal gains possible

### Medium Priority

4. **Shared utilities (32 KB)**
   - Tree-shake unused functions
   - Move to dynamic imports
   - Potential savings: 10 KB

5. **Lazy load routes**
   - `/challenges`, `/discover`, `/leaderboard`, `/settings`
   - Potential savings: 30% initial load

### Low Priority

6. **CSS optimization**
   - Unused CSS in main page (`.main-toolbar button[aria-disabled="true"]`)
   - Potential savings: 1-2 KB

---

## Recommendations

### S77-02: Lazy Loading Routes

Implement for:
- `/challenges` (10 KB savings)
- `/discover` (8 KB savings)
- `/leaderboard` (10 KB savings)
- `/settings` (15 KB savings)

**Total estimated savings: 43 KB (12% reduction)**

### S77-03: Asset Optimization

- Favicon: Convert to SVG (current: PNG multiple sizes)
- SVG assets: Minify with SVGO
- **Estimated savings: 50% asset size**

### S77-04: API Caching

Cache headers for:
- `/api/challenges` — 5 min TTL
- `/api/discover` — 1 min TTL
- `/api/activity` — 30 sec TTL

---

## Build Warnings (To Fix)

### Svelte 5 Runes Issues

1. `src/routes/+page.svelte` — `data` reference in `$state`
2. `src/routes/dashboard/+page.svelte` — `data` reference
3. `src/routes/leaderboard/+page.svelte` — `state` variable name conflict
4. `src/lib/streakStore.svelte.ts` — closure reference

### Accessibility Issues

1. `src/routes/feed/+page.svelte` — `<nav>` with `role="tablist"`
2. `src/routes/leaderboard/+page.svelte` — same issue
3. `src/routes/settings/+page.svelte` — label without control
4. `src/lib/elements/NotificationBell.svelte` — click without keyboard
5. `src/lib/elements/GoalTemplateModal.svelte` — same issue

### CSS Issues

1. `src/routes/+page.svelte:1066` — Unused selector

---

## Target Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Initial bundle | ~100 KB | <70 KB |
| FCP | ~2.5s | <1.5s |
| TTI | ~4.2s | <3s |
| Lighthouse | ~75 | >90 |

---

## Next Steps

1. Fix Svelte 5 runes warnings (blocking build)
2. Implement lazy loading for routes
3. Optimize assets
4. Add API caching
5. Run Lighthouse audit
