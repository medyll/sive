# S92-03 — Fix CSP Headers (Remove unsafe-inline/unsafe-eval)

**Sprint:** 92 — Security & Stabilité
**Priority:** 🔴 CRITIQUE
**Effort:** 30 min
**Assignee:** Dev

## Context

Audit finding: CSP in `src/lib/server/hooks.server.ts` uses `unsafe-inline` and `unsafe-eval`.
Risk: ⚠️ MEDIUM — enables XSS attack vectors.

Current CSP:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
```

## Acceptance Criteria

- [ ] `unsafe-eval` removed from `script-src`
- [ ] `unsafe-inline` replaced with nonces or hashes for script-src
- [ ] `unsafe-inline` removed from `style-src` (or hash-based)
- [ ] SvelteKit app still renders correctly
- [ ] 14 security header tests still pass

## Implementation

1. Check if SvelteKit/Vite inject inline scripts at build time
2. If yes → generate nonces per-request via SvelteKit handle hook
3. Pass nonce to `<svelte:head>` via `%sveltekit.nonce%`
4. Update `SECURITY_HEADERS.Content-Security-Policy` in hooks.server.ts

Reference: SvelteKit docs on CSP with nonces.

## Test

Run `src/lib/server/securityHeaders.spec.ts` — all 14 tests must pass.
Manual check: app loads, no CSP violations in browser console.
