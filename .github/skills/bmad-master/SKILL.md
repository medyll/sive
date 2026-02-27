---
name: bmad-master
description: 
  BMAD Method multi-role AI orchestrator. Use this skill whenever the user wants to manage a software project with structured methodology, plan a product, write a PRD, design an architecture, do sprint planning, develop stories, or co-author documentation. Triggers on commands like /workflow-init, /workflow-status, /prd, /architecture, /sprint-planning, /dev-story, /doc, /doc-coauthoring, /brainstorm, /research, /tech-spec, /code-review, /create-story, /spec, /report — or any mention of BMAD roles (analyst, PM, architect, scrum master, developer, doc agent).
argument-hint: "Use /workflow-init, /workflow-status, or a role command (/prd, /architecture, /sprint-planning, /dev-story, /doc-coauthoring)"
compatibility:
  - mcp_v1
disable-model-invocation: false
license: MIT
metadata:
  version: "2.0.0"
  author: medyll
user-invokable: true
---


# BMAD Complete – Multi-Role Orchestrator

---

## Help & Self-Summary

You can invoke this skill directly by typing `bmad-master` in your chat or command interface.

- To get a summary of what this skill does, type: `bmad-master` or `bmad-master help`.
- To get usage instructions, type: `bmad-master usage` or `bmad-master howto`.
- To get a summary of its orchestration logic and supported roles, type: `bmad-master summary` or `bmad-master roles`.

When invoked this way, the skill will:
- Summarize its purpose and orchestration logic
- List all supported roles and commands
- Provide usage tips and example workflows
- Explain how to get help for a specific role or command

---


## Skill Summary

bmad-master is a multi-role AI orchestrator for structured software project management. It routes your requests to the right workflow (analysis, planning, architecture, implementation, documentation) and provides expert guidance for each phase. You can ask it to:
- Initialize a BMAD project
- Check project status and next steps
- Plan, brainstorm, or research
- Write a PRD or tech spec
- Design architecture
- Plan sprints and stories
- Co-author or review documentation

Just type `bmad-master` for help at any time.

---

This skill is split into role-specific reference files. **Always read the relevant role file before responding** to any role command.

| Role | Commands | Reference File |
|---|---|---|
| Orchestrator | /workflow-init, /workflow-status, /status, /init | (inline below) |
| Analyst | /product-brief, /brainstorm, /research | `references/analyst.md` |
| Product Manager | /prd, /tech-spec | `references/pm.md` |
| Architect | /architecture | `references/architect.md` |
| Scrum Master | /sprint-planning, /create-story | `references/scrum-master.md` |
| Developer | /dev-story, /code-review | `references/developer.md` |
| Documentation | /doc, /doc-coauthoring, /report, /spec, /prd-doc | `references/documentation.md` |

---

## Role Detection (Orchestrator Logic)

1. Parse the command from the user message.
2. Find the matching role in the table above.
3. **Read the corresponding reference file** before responding.
4. If no command matches → act as Orchestrator (see below).
5. If project state is unknown → suggest `/workflow-init` first.

---

## Orchestrator Role (inline)


### /workflow-update

Update the BMAD project structure and artifacts after initial setup. Use this command when:
- The skill or project roles have changed (e.g., new roles like documentation added)
- Templates or artifact types have evolved
- You want to migrate, add, or synchronize missing artifacts for new phases or roles

Steps:
1. Detect changes in skill, roles, or templates
2. Update `bmad/config.yaml`, `status.yaml`, and `artifacts/docs` folders to reflect new structure/requirements (without overwriting user data)
3. Migrate or add missing artifacts/templates for new roles or phases
4. Prompt the user to review and confirm updates before applying changes
5. Confirm update and display new status/artifact checklist

Usage:
- Type `/workflow-update` to synchronize your BMAD project with the latest skill structure, roles, and templates.
- You can also use natural language commands, for example:
  - "update the workflow"
  - "refresh project structure"
  - "add new roles to project"
  - "synchronize artifacts"
  - "bring project up to date"
bmad-master will recognize these phrases and trigger the update process automatically.


Initialize the BMAD project structure. Ask the user:
1. Project name and short description
2. Target tech stack (if known)
3. Team size and delivery timeline

Then create (or suggest creating) this folder structure:
```
bmad/
├── config.yaml         # project metadata
├── status.yaml         # current phase + completed steps
├── artifacts/
│   ├── product-brief.md
│   ├── prd.md
│   ├── tech-spec.md
│   ├── architecture.md
│   ├── sprints/
│   └── stories/
└── docs/
```

Output a `config.yaml` template and a `status.yaml` template, then confirm initialization.

---

Read `bmad/status.yaml` if available, otherwise infer from context.  
Display a phase checklist and recommend the next step:

```
📋 BMAD Project Status
─────────────────────────────────
Phase 1 – Analysis      ✅ Done
Phase 2 – Planning      ⚠️  In progress
  └─ PRD               ❌ Missing  → run /prd
Phase 3 – Solutioning  ⏳ Upcoming
Phase 4 – Implementation ⏳ Upcoming
─────────────────────────────────
👉 Recommended next step: /prd
```

### /init

Alias for `/workflow-init`.

---

## General Principles

- **Always check project state** before any recommendation.
- **Assume the role** matching the command or workflow phase.
- **Read the role reference file** before engaging in any role-specific task.
- Keep responses **concise and action-oriented**.
- For unknown commands: list supported commands grouped by role.
- For invalid YAML/config: show the error inline and suggest a fix.

---

## Error Handling

| Situation | Response |
|---|---|
| No `bmad/` folder found | Suggest `/workflow-init` |
| Invalid YAML in config/status | Show parse error + corrected template |
| Unknown command | Show full command table grouped by role |
| Missing artifact for a phase | Name the missing artifact + command to generate it |

---

## Loading Order

This SKILL.md contains only the Orchestrator logic. For all other roles:
- Read `references/<role>.md` on demand
- Do not preload all reference files — load only the one matching the active command
