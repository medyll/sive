Title: ApplyTo - Frontend (Svelte)

Purpose
- Enforce repository frontend conventions for Svelte v5 components and routes.

Match
- Files: src/routes/**, src/lib/**, **/*.svelte

Rules
- Enforce Svelte v5 runes (`$state`, `$effect`, `$props`) for reactive state.
- Disallow side-effects at module scope; prefer `$effect` or lifecycle runes.
- Prefer `import type` for TypeScript-only imports.
- Formatting: follow Prettier settings (tabs, single quotes, print width 100).
- Tailwind classes: use `prettier-plugin-tailwindcss` ordering.

When to request human review
- Large UI refactors that change global layout or routing.

Checks/automation suggestions
- Run `npm run check` and `npm run test:unit` for changed files.
- Optionally add a pre-commit or CI lint step to enforce these rules.
