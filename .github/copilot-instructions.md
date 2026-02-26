# Copilot instructions for this repository

Summary
- This project is an AI-assisted writing application (Svelte + LiveKit) described in `PROJECT.md`.
- Key on-disk content model: the narrative workspace is a `mybook/` tree with `bible.yaml`, `timeline.yaml`, per-chapter folders (`chapters/chapter_01/chapter_01.md` + `chapter_01.yaml`). See `PROJECT.md` for full schemas.

What to prioritize
- Preserve YAML schemas and field semantics (`bible.yaml`, `timeline.yaml`, `chapter_XX.yaml`). Changes to keys like `chrono_index`, `story_date`, or `first_appears` must be deliberate and discussed.
- When making suggestions that modify story data, prefer adding migration steps that update both the chapter YAML and `bible.yaml` references.

Architecture notes (quick)
- Frontend: Svelte UI (editor, resizable panels, AI suggestion panel). LiveKit used for voice/TS features.
- Intelligence routing: hybrid model strategy (local Ollama for coherence checks; cloud models like Gemini/OpenAI for long generations). Model selection is task-specific and configurable per user (see `PROJECT.md` section 4).
- Fact-checking: on-demand web queries (DuckDuckGo / Wikipedia). No automatic background searches.

Patterns & conventions the agent should follow
- Small, targeted edits: prefer editing YAML metadata files for story state and use the MD files for narrative text. Example: to mark an object as lost, update `chapters/chapter_07/chapter_07.yaml` transitions and the `bible.yaml` object entry.
- Use `chrono_index` and `story_date` when inserting or moving events so cross-references remain consistent.
- When updating UI text or behaviour, reference the UX descriptions in `PROJECT.md` (split-screen ratio, focus mode behaviour, spinner semantics) and avoid changing UX defaults without justification.

Developer workflows
- No package.json was detected in the repo root. Confirm with the maintainer the exact build/dev commands. Common Svelte/Node commands we expect (only use if a `package.json` appears):
  - Install: `npm install`
  - Dev server: `npm run dev`
  - Build: `npm run build`
- Tests: Project currently has no discoverable test harness. If adding tests, follow minimal, focused tests per module and include npm script entries.

Integration points to watch
- LiveKit: voice + TTS integration — exercise caution when changing audio flow or latency assumptions.
- Ollama / Local models: used for privacy-sensitive coherence checks — note configuration points and do not hardcode cloud-only fallbacks.
- Web fact-checking: queries are explicit; never introduce automatic background lookups.

When you are unsure
- If a requested change touches narrative data (YAML) and the effect on `bible.yaml` or `timeline.yaml` is unclear, leave a clear TODO in the change and request human review.
- If build/test commands are missing (no `package.json`), ask the repo owner before assuming a workflow.

References
- Primary design doc: [PROJECT.md](PROJECT.md)
- Story data examples: `mybook/bible.yaml`, `mybook/timeline.yaml`, `mybook/chapters/chapter_01/chapter_01.yaml` (see `PROJECT.md` for schemas)

If any section is unclear or you want examples of PR text/messages, tell me which part to expand.
