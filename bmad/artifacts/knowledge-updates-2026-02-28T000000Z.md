# Knowledge Update — Syntactic Methodology

**Date:** 2026-02-28T00:00:00Z
**Source:** User-submitted text: "The Syntactic Methodology: An Architectural Framework for Modern Development"

---

Summary
-------

The submitted knowledge describes the "Syntactic Methodology": a high-level, declarative approach emphasizing that code is primarily for human readers. Key points:

- Declarative Purity: prefer describing desired state; runtime handles enactment.
- Functional Composability: modular, side-effect-free units resembling mathematical functions.
- Declarative Error Handling: use error-as-data (Options/Results) instead of imperative try/catch.
- Benefits: reduced cognitive load, local reasoning, safer large-scale refactors.

Roles Impacted (ranked)
------------------------

1. `references/developer.md` — add guidance for developer practices, API design, and README examples reflecting syntactic patterns.
2. `references/architect.md` — add an 'Architectural Foundations' subsection describing declarative system design and its trade-offs.
3. `references/documentation.md` — instruct docs authors to include runnable examples and migration notes when adopting syntactic patterns.
4. `references/pm.md` — (informational) add a short note describing implications for requirements and acceptance criteria.

SKILL.md metadata
-----------------

No new command triggers required. Recommendation: no change to `argument-hint` or frontmatter.

Proposed edits (snippets)
-------------------------

Below are suggested additions to the referenced files. The intent is to *append* small, explicit "Notes / Additions" subsections rather than replace existing content.

1) `references/developer.md` — append a `Syntactic Methodology` subsection under **Developer Principles** or near **Implement**.

Suggested snippet (append):

```markdown
### Syntactic Methodology (notes)

Adopt "Syntactic" patterns where appropriate: prefer declarative APIs that express desired state and transformations rather than imperative step-by-step code. Practical guidance:

- Prefer small, pure, composable functions (no hidden side effects) for core logic.
- Use explicit Result/Option types (or equivalent) to model errors as data and make error handling composable.
- Provide high-level transformation examples in the README's "Quick Start" and "Examples" sections to show the happy path declaratively.
- When adding APIs, prioritize ergonomics: one obvious way to do something, with sensible defaults.

When applying syntactic patterns that change data models or runtime behavior, include an integration test demonstrating the transformation and a short migration note.
```

2) `references/architect.md` — append to **Architectural Foundations** or **Cross-Cutting Concerns**.

Suggested snippet (append):

```markdown
### Syntactic / Declarative Architectural Considerations

The Syntactic Methodology emphasizes declarative system design and composition. Architects should:

- Evaluate whether a declarative surface (e.g., configuration-driven pipelines, domain-specific transforms, or pure functional modules) reduces coupling and improves local reasoning.
- Identify runtime or library support required to implement declarative intent (e.g., transformation engines, middleware that materializes declarative state into imperative operations).
- Document performance trade-offs and observability approaches for declarative layers (how to trace a high-level transformation through runtime effects).
- Ensure backward-compatibility strategies and migration paths when introducing declarative layers that replace imperative workflows.
```

3) `references/documentation.md` — append guidance to encourage documentation authors to include declarative examples and mapping from high-level intent to implementation.

Suggested snippet (append):

```markdown
### Documenting Declarative / Syntactic Patterns

When documenting features implemented with syntactic/declarative patterns:

- Provide a minimal "one-file" example showing the declarative API and the resulting behavior.
- Include an explanation: "What this declares" vs "what the runtime does".
- Add a troubleshooting section mapping common imperative error messages back to likely declarative misconfigurations.
- If the pattern alters data contracts or migrations, include a short "Migration" subsection and CI tests that validate the documented examples.
```

4) `references/pm.md` — optional small note under PRD or Non-Functional Requirements.

Suggested snippet (append):

```markdown
### Notes on Declarative / Syntactic Approaches

When the team adopts a declarative/syntactic approach, update acceptance criteria to include:

- A minimal integration example that demonstrates the declared behavior.
- Performance and observability expectations for the declarative layer.
- A migration plan if the approach changes data formats or runtime behaviors.
```

Validation & Safety
-------------------

- No code or DB schema changes are proposed in these snippets.
- If a future knowledge item requires schema changes or runtime libraries, the process will require a migration plan and explicit approval before applying edits.

Next steps (recommended)
------------------------

1. Please review the proposed snippets above. Reply with `approve` to apply these additions automatically, or request edits to wording/placement.
2. On approval I will: apply the small append-only edits to the referenced files and create a final changelog entry with the applied patch list.
3. If you prefer a different placement (e.g., insert inside a specific section), reply with the target file and approximate anchor line (or a short quote to match).

---

Produced by: `bmad-master add-knowledge` (draft proposals — no files modified)

---

Applied edits
-------------

The user approved the proposals. The following append-only edits were applied on 2026-02-28T00:00:00Z:

- ` .github/skills/bmad-master/references/developer.md` — appended `Syntactic Methodology (notes)` subsection.
- ` .github/skills/bmad-master/references/architect.md` — appended `Syntactic / Declarative Architectural Considerations` subsection.
- ` .github/skills/bmad-master/references/documentation.md` — appended `Documenting Declarative / Syntactic Patterns` subsection.
- ` .github/skills/bmad-master/references/pm.md` — appended `Notes on Declarative / Syntactic Approaches` subsection.

Changelog: these edits were applied as small append-only additions; no code, schema, or runtime changes were made.

