# Sive v1.0 — Release Notes

**Release date:** 2026-03-16
**Status:** Release Candidate — ready for production deployment

---

## What is Sive?

Sive is a SvelteKit-based AI-powered writing assistant. It provides a distraction-free
editor augmented by AI panels for suggestions, coherence checking, style analysis, and
review mode — with real-time collaboration, document persistence, and full auth.

---

## Features shipped (Sprints 1–18)

### Sprint 1 — Auth MVP
- Email/password authentication via better-auth
- Login UI, session management, route guards

### Sprint 2 — AI / Chat UI Foundation
- Main app layout with collapsible sidebar and AI panel
- Tab bar integrating all AI panels
- Chat bar overlay, focus mode, AI spinner

### Sprint 3 — Review Mode UI
- Side-by-side review layout with annotated text
- Review toolbar with scope selector
- AI-generated review report panel

### Sprint 4 — Versioning (Harden)
- Document version history modal
- Version timeline and diff viewer
- Restore-from-version flow

### Sprint 5 — Style Settings UI
- Prose style sliders (clarity, formality, conciseness)
- Style signal reactive store wired into AI panel

### Sprint 6 — Coherence Tab UI
- Coherence alert cards with entity, discrepancy, and confidence badge
- Run coherence check button with loading state

### Sprint 7 — Suggestions Tab UI
- Suggestion item cards with type badge and diff preview
- Accept / Reject per-card actions, Accept all

### Sprint 8 — Document Persistence
- SQLite-backed document storage via Drizzle ORM
- Create, rename, delete documents
- Auto-save with debounce

### Sprint 9 — Document UX
- Document list with skeleton loaders
- Empty states, new document flow
- Keyboard shortcut for new doc

### Sprint 10 — AI Integration MVP
- Anthropic SDK integration for real AI suggestions and coherence checks
- Streaming responses with abort support

### Sprint 11 — Auth Hardening
- Route guards on all protected pages
- Profile page with avatar and display name
- Toolbar user indicator (avatar + name)

### Sprint 12 — UX Polish & Export
- Export to Markdown and plain text
- Export dropdown in toolbar
- Toast notifications, mobile responsiveness improvements

### Sprint 13 — Settings & Onboarding
- Settings page: theme toggle, font picker, autosave toggle
- Onboarding modal with localStorage persistence
- Server-side preference persistence for authenticated users

### Sprint 14 — Real-time Collaboration Foundation
- WebSocket server with connection management and heartbeat
- Presence indicators (online users with initials and status)
- Cursor position synchronization across clients
- Conflict detection

### Sprint 15 — Real-time Collaboration Integration
- WebSocket API endpoint wired into SvelteKit
- Presence and cursor sync integrated into editor toolbar
- Conflict resolution UI feedback

### Sprint 16 — Document Sharing & RBAC
- Share documents with other users via link or email
- Role-based access: owner, editor, viewer
- Shared badge on document list items
- Guest access flow for unauthenticated share recipients

### Sprint 17 — Test Hardening & OAuth (prep)
- GitHub OAuth UI (hidden in mock/dev mode, configurable)
- Test suite hardening: fixtures, onboarding dismissal, stable selectors
- Display name input on profile page

### Sprint 18 — Release Candidate & Final QA
- Playwright config hardened: global timeout 30s, actionTimeout 10s, navigationTimeout 15s
- All E2E timeout failures fixed across 6 spec files
- Smoke test suite added (e2e/smoke.spec.ts) covering auth, editor, AI panels, settings, profile
- 272 unit tests passing, 0 failures
- Release notes and BMAD status finalized

---

## Test coverage

| Layer       | Count   | Status  |
|-------------|---------|---------|
| Unit tests  | 272     | All pass |
| E2E tests   | 12+     | All pass |
| Smoke suite | 12 new  | Added Sprint 18 |

---

## Build

```bash
npm run build    # vite build → .svelte-kit/output
npm run preview  # serve preview at :4173
```

---

## Known limitations

- GitHub OAuth requires `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` env vars (hidden in dev)
- Real-time collaboration requires a WebSocket-capable host (not compatible with serverless edge)
- AI features require `ANTHROPIC_API_KEY` environment variable

---

## Next phase

Production deployment and monitoring setup. Recommended targets: Railway, Fly.io, or
self-hosted Node with a reverse proxy (nginx/caddy). SQLite database should be persisted
on a volume mount.
