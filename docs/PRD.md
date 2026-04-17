# PRD — AI-Assisted Writing Software (Initial)

## Purpose
Deliver an editor-focused AI-assisted writing product that provides high-quality suggestions, coherence checks, stylistic analysis, and multi-user isolation for collaborative writing sessions.

## Objectives
- Provide contextual AI suggestions without disrupting author flow.
- Detect narrative inconsistencies (temporal, character, object state).
- Offer style and voice analysis tuned to the author's profile.
- Support local and cloud model routing for privacy and scale.

## MVP Scope (Level 1)
- Core editor with resizable split panel (editor + suggestions).
- Suggestions tab: inline AI proposals with accept/ignore.
- Coherence tab: basic inconsistency detector across chapter YAML and bible.
- Style tab: simple metrics and one-click passage analysis.
- Authentication (server-side) and local SQLite persistence for settings and simple profiles.

## Tech Stack
- Frontend: Svelte 5 + SvelteKit
- Language: TypeScript
- DB: SQLite via better-sqlite3 + Drizzle ORM
- Auth: better-auth (server-side) wired in `src/lib/server/auth.ts`
- Dev tooling: Vite, pnpm, Vitest (unit), Playwright (E2E)

## Architecture Notes
- Hybrid AI routing (local Ollama for private/coherence tasks; cloud for long generation).
- Project data model organized around `bible.yaml`, `timeline.yaml`, `chapters/` and `characters/` folders; coherence engine cross-references these.

## Constraints & Assumptions
- Must preserve Drizzle schema and migrations workflow.
- Maintain `better-auth` plugin ordering invariants.
- Offline-first privacy option via local model (Ollama) is desirable.

## Success Metrics
- Time-to-first-suggestion < 2s for short suggestions.
- Reduction in detected narrative inconsistencies per document iteration.
- Adoption: 3 pilot authors within first month.

## Milestones (suggested)
1. Project scaffolding, auth, DB, basic editor + suggestions (4 wks)
2. Coherence engine MVP, chapter/bible plumbing (6 wks)
3. Style profiles, TTS integration, hybrid model routing (6 wks)

## Next Steps
- Confirm MVP feature list and priority.
- Wire `bmad-master` workflows to generate PRD artifacts and track progress.
- Create initial issues/tasks and schedule first sprint.
