 # 📘 Project Reference Document — Sive : AI-Assisted Writing Software
 **Version 1.0 — Reference Document**  
 Stack: Svelte + LiveKit · Philosophy: awareness, multimodal efficiency, multi-user isolation, refactoring.



## Software Architecture

- **Keywords:** Svelte 5, SvelteKit, svelte-5, runes, TypeScript, Node.js (ESM), better-auth, SQLite, Drizzle ORM, Vitest, Playwright, Tailwind, mdsvex, pnpm
- **Role:** Provides an overview of the application's stack, authentication, database, testing, and developer tooling used across the project.
- **Link:** [0-software-architecture.md](./project/0-software-architecture.md)

## 1. Interface Architecture (Layout)

- **Keywords:** resizable split-screen, focus mode, multi-tab right panel, suggestions, coherence, style, history, floating chat bar, AI spinner, selective validation
- **Role:** Defines the editor UI layout and UX patterns; guides frontend implementation and user interaction flows
- **Link:** [1-interface-architecture.md](./project/1-interface-architecture.md)

## 2. Coherence Engine & Pure Logic

- **Keywords:** inconsistency detector, physical logic calculator, confidence levels, soft alerts, YAML cross-reference, real-time monitoring, categorisation
- **Role:** Specifies the consistency-checking logic and alerts; drives backend/AI checks and Coherence tab signals
- **Link:** [2-coherence-engine-pure-logic.md](./project/2-coherence-engine-pure-logic.md)

## 3. Stylistic Mastery & Voice

- **Keywords:** ingestion-based profiling, style sliders (tone/rhythm/density), narrative density, flow analysis, passage analysis, text-to-speech, style profiles
- **Role:** Describes style ingestion, profiling and UI controls; feeds the style engine and suggestion tuning
- **Link:** [3-stylistic-mastery-voice.md](./project/3-stylistic-mastery-voice.md)

## 4. Intelligence & Data

- **Keywords:**  bible.yaml, timeline.yaml, chapter YAMLs, templates, project filesystem schema, hybrid AI routing (local/cloud), Ollama, Gemini/OpenAI, web fact-check (DuckDuckGo/Wikipedia),
- **Role:** Defines project data schemas, types.ts, types generation, file layouts and model routing policies used by MCP and data-consuming components. use this file to generate typings and types.ts files.

- **Link:** [4-intelligence-data.md](./project/4-intelligence-data.md)

## 5. AI Architecture — MCP & Skills

- **Keywords:** MCP (tools), Skills (recipes), tool categories (read/write/analyse/version), command bus, skill engine, execution context, model routing, skill composition, logs
- **Role:** Documents MCP tools, skills and Command Bus — the orchestration layer for AI-driven actions and app integration
- **Link:** [5-ai-architecture-mcp-skills.md](./project/5-ai-architecture-mcp-skills.md)

## 6. Versioning & Validation

- **Keywords:** Harden snapshots, .harden/index.yaml, meta.yaml, visual timeline, visual diff, AI-generated messages, selective validation, snapshot restore
- **Role:** Defines snapshot/version formats and UI behaviours for author safety, diffs and restores in the editing workflow
- **Link:** [6-versioning-validation.md](./project/6-versioning-validation.md)

## 7. Review Mode

- **Keywords:** read-only audit, structured report, inconsistencies, language tics, tension/rhythm analysis, narrative density, export (.md/.pdf)
- **Role:** Specifies the read-only audit workflow and report outputs used during review sessions and exports
- **Link:** [7-review-mode.md](./project/7-review-mode.md)

## 8. Multi-User Administration & Authentication

- **Keywords:** deployment models (desktop/server), file isolation per profile, OAuth + MFA, local bcrypt, silent onboarding, API key handling, censorship/export masking
- **Role:** Describes deployment, onboarding, auth methods and per-user isolation guarantees for multi-user setups
- **Link:** [8-multi-user-administration-authentication.md](./project/8-multi-user-administration-authentication.md)

## 9. Layout — Semantic Interface Description

- **Keywords:** placeholder / empty, semantic UI spec expected, panels/tabs/commands (intent)
- **Role:** Placeholder for a formal semantic UI specification that will map UI elements to commands and data hooks
- **Link:** [9-layout-semantic-interface-description.md](./project/9-layout-semantic-interface-description.md)

## Appendix — Prioritization Recommendation

- **Keywords:** prioritized roadmap, UX foundation first, timeline/versioning, review mode, style profiling, coherence engine, censorship, multi-user isolation
- **Role:** Provides the recommended development prioritization and rationale to sequence implementation and validation
- **Link:** [10-appendix-prioritization-recommendation.md](./project/10-appendix-prioritization-recommendation.md)


