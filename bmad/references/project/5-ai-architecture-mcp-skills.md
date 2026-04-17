<!-- 5-ai-architecture-mcp-skills.md -->

## 5. AI Architecture — MCP & Skills

### 5.1 General Philosophy

The app's AI operates on two complementary layers:

- **MCP (Model Context Protocol)** — the **action** layer: the AI can read and write project files, trigger analyses, compare versions. It is the wiring between AI and data model.
- **Skills** — the **cognition** layer: structured recipes that define how the AI reasons to accomplish a specific task (detect an inconsistency, generate a version description, analyse a style).

Both are complementary. Skills define *what to do*, MCP tools define *how to access the data*. A robust, consistent data model (bible, timeline, chapters) makes MCP commands directly derivable — if YAML schemas are well defined, MCP tools write themselves almost mechanically.

> **Key principle:** the more stable and normalised the data model, the easier the MCP command list is to maintain and extend.

---

### 5.2 Internal MCP Tools

List of MCP commands exposed to the AI model. Each tool corresponds to an atomic action on the project file system.

#### Read

| Tool | Description |
|---|---|
| `read_bible` | Loads the complete `bible.yaml` |
| `read_timeline` | Loads `timeline.yaml` |
| `read_structure` | Loads `structure.yaml` (acts, threads, tension curve) |
| `read_themes` | Loads `themes.yaml` |
| `read_narrator` | Loads `narrator.yaml` |
| `read_chapter(id)` | Loads a chapter's `.md` + `.yaml` |
| `read_character_sheet(id)` | Loads an expanded character sheet |
| `list_chapters` | Returns the ordered list of project chapters |
| `read_version(id)` | Loads a complete archived Harden |

#### Write

| Tool | Description |
|---|---|
| `write_transition(chapter_id, transition)` | Adds a transition to a chapter's `.yaml` |
| `update_status(entity_id, type, value)` | Updates a status in `bible.yaml` |
| `add_timeline_event(event)` | Adds an event to `timeline.yaml` |
| `add_character(data)` | Adds a character entry to `bible.yaml` |
| `update_narrative_thread(id, data)` | Updates a thread's state in `structure.yaml` |
| `add_motif_occurrence(motif_id, chapter_ref, notes)` | Records a motif occurrence in `themes.yaml` |

#### Analysis

| Tool | Description |
|---|---|
| `compare_versions(id_a, id_b)` | Calculates the diff between two Hardens |
| `extract_chapter_states(id)` | Extracts all character/object states in a chapter |
| `count_words(scope)` | Counts words (chapter, volume, whole project) |
| `search_occurrences(term, scope)` | Finds all occurrences of a term in the project |

#### Versioning

| Tool | Description |
|---|---|
| `create_harden(label, message)` | Triggers a versioning snapshot |
| `restore_version(id)` | Restores a Harden as the current version |
| `read_version_index` | Loads the `.harden/` `index.yaml` |

---

### 5.3 Skills

Skills are configuration files that define AI behaviour for each business task. They combine a structured prompt and a sequence of MCP tools to call.

#### Skill examples

**`skill_coherence.yaml`** — inconsistency detection

```yaml
id: skill_coherence
description: Detects inconsistencies between a chapter and the bible, structure and narrator
trigger: chapter_modified | explicit_request
steps:
  - tool: read_bible
  - tool: read_timeline
  - tool: read_structure
  - tool: read_narrator
  - tool: read_chapter
    params: {id: "{{current_chapter}}"}
  - tool: extract_chapter_states
    params: {id: "{{current_chapter}}"}
  - prompt: |
      Compare chapter states against the bible, timeline, structure and narrator.
      Check:
      - Character/object/location status consistency
      - Timeline compliance (flash-backs correctly anchored, coherent ellipses)
      - POV compliance as declared in narrator.yaml
      - Active narrative threads correctly referenced in structure.yaml
      - Tension level consistent with the target curve
      Flag each discrepancy with a confidence level (Low / Medium / High).
      Never block — suggest only.
```

**`skill_version_description.yaml`** — version message generation

```yaml
id: skill_version_description
description: Auto-generates a Harden commit message
trigger: harden_button
steps:
  - tool: read_version_index
  - tool: compare_versions
    params: {id_a: "{{last_version}}", id_b: "current"}
  - prompt: |
      Based on the diff, generate a concise version message (1-2 sentences).
      Mention modified chapters, affected characters, key events.
      Example: "Rewrote chapter 3, added Martin's death, updated Jean↔Marie relationship."
```

**`skill_review.yaml`** — audit report

```yaml
id: skill_review
description: Produces a complete audit report on a given scope
trigger: review_mode
steps:
  - tool: read_bible
  - tool: read_timeline
  - tool: read_structure
  - tool: read_themes
  - tool: read_narrator
  - tool: read_chapter
    params: {id: "{{scope}}"}
  - prompt: |
      Analyse the narrative text and produce a structured report:
      1. Inconsistencies (characters, objects, timeline, flash-backs)
      2. POV and focalization compliance
      3. Unresolved open narrative threads
      4. Tension curve consistency vs structure.yaml target
      5. Theme and motif presence and consistency (themes.yaml)
      6. Character voices — compliance with declared register and tics
      7. Language tics and lexical repetitions
      8. Narrative density (ellipsis vs detailed scene)
      No text modifications. Report only.
```

**`skill_style.yaml`** — targeted passage analysis

```yaml
id: skill_style
description: Stylistic analysis of a selected passage
trigger: analyse_passage_button | text_selection
steps:
  - tool: read_character_sheet
    params: {id: "{{active_narrator}}"}
  - prompt: |
      Analyse the selected passage according to the ingested style profile.
      Flag: language tics, repetitions, rhythm breaks, narrative density.
      Format: list of signals with location and improvement suggestion.
```

---

### 5.4 Maintenance and Evolution

The MCP tool and skill list is versioned with the software project. Adding a new feature always follows the same process:

1. Ensure the data model (YAML) covers the necessary data
2. Create or adapt the corresponding atomic MCP tool
3. Register the required app commands in the Command Bus
4. Write or update the skill that orchestrates MCP tools + commands
5. Reference the skill in the relevant UI trigger

> A robust data model makes this maintenance lightweight — MCP tools are simple reads/writes of well-defined files. The Command Bus ensures skills can drive the UI without direct coupling.

---

### 5.5 Command Bus — App Control by Skills

The Command Bus is the communication channel between skills and the application engine. It allows skills to emit named commands that trigger actions in the UI or business modules, without skills needing to know the app's internal implementation.

#### Architecture

```
┌─────────────────────────────────────────────────────┐
│                      SKILL                          │
│  steps:                                             │
│    - tool: read_bible          (MCP → files)        │
│    - prompt: "Analyse..."      (AI → result)        │
│    - command: coherence.push_alert  (Bus → app)     │
│    - command: ui.open_tab           (Bus → app)     │
└────────────────────┬────────────────────────────────┘
                     │ emits CommandEvent
                     ▼
┌─────────────────────────────────────────────────────┐
│                  COMMAND BUS                        │
│  - receives CommandEvents emitted by skills         │
│  - routes to the registered app module              │
│  - returns optional result to the skill             │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
       ▼              ▼              ▼
   UI Module     Business Module  File Module
  (open_tab,    (harden.trigger, (editor.inject,
   scroll_to,    timeline.        suggestions.
   highlight)    refresh)         push_diff)
```

#### Command format in a skill

```yaml
# In any skill, a command step takes the form:
- command: <module>.<action>
  params:
    key: value
    key: "{{context_variable}}"  # variable from a previous step
  on_error: ignore | abort | notify  # behaviour if the command fails
```

#### Command Registry — UI

| Command | Params | Description |
|---|---|---|
| `ui.open_tab` | `tab: string` | Opens a right panel tab |
| `ui.scroll_to` | `anchor: string` | Scrolls the editor to a position |
| `ui.highlight_range` | `start, end, color` | Highlights a passage in the editor |
| `ui.show_notification` | `message, level` | Displays a non-blocking notification |
| `ui.show_modal` | `title, content, actions` | Displays a confirmation modal |
| `ui.set_spinner` | `visible: bool` | Controls the AI spinner in the right panel |
| `ui.focus_editor` | — | Returns focus to the main editor |
| `ui.toggle_focus_mode` | `active: bool` | Enables/disables Focus Mode |

#### Command Registry — Editor

| Command | Params | Description |
|---|---|---|
| `editor.inject_text` | `position, text` | Injects text at a position |
| `editor.replace_range` | `start, end, text` | Replaces a passage |
| `editor.get_selection` | — | Returns the selected text |
| `editor.get_full_text` | — | Returns the full chapter text |

#### Command Registry — Suggestions

| Command | Params | Description |
|---|---|---|
| `suggestions.push_diff` | `original, proposal` | Pushes a diff to the Suggestions tab |
| `suggestions.clear` | — | Clears the current suggestion list |

#### Command Registry — Coherence

| Command | Params | Description |
|---|---|---|
| `coherence.push_alert` | `entity, discrepancy_type, confidence, note` | Adds an alert to the Coherence tab |
| `coherence.clear` | — | Clears current alerts |

#### Command Registry — Style

| Command | Params | Description |
|---|---|---|
| `style.push_signal` | `location, signal, suggestion` | Adds a signal to the Style tab |
| `style.clear` | — | Clears current signals |

#### Command Registry — Versioning

| Command | Params | Description |
|---|---|---|
| `harden.trigger` | `label, message` | Triggers a versioning snapshot |
| `timeline.refresh` | — | Refreshes the version timeline |
| `timeline.highlight_version` | `id` | Highlights a version on the timeline |

#### Command Registry — Review

| Command | Params | Description |
|---|---|---|
| `review.push_report` | `report` | Pushes the structured report to the review screen |
| `review.highlight_passage` | `start, end, report_section` | Links a text highlight to a report section |

#### Command Registry — Generic

| Command | Params | Description |
|---|---|---|
| `app.export_file` | `content, format, name` | Exports a file (.md, .pdf, .yaml) |
| `app.navigate_to` | `screen` | Changes screen (editor, review, onboarding…) |
| `app.reload_project` | — | Reloads project files into memory |
| `app.run_skill` | `skill_id, params` | Triggers another skill (composition) |

---

#### Skills updated with commands

**`skill_coherence.yaml`** — complete with commands

```yaml
id: skill_coherence
description: Detects inconsistencies and pushes them to the UI
trigger: chapter_modified | explicit_request
steps:
  - command: ui.set_spinner
    params: {visible: true}
  - tool: read_bible
  - tool: read_timeline
  - tool: read_structure
  - tool: read_narrator
  - tool: read_chapter
    params: {id: "{{current_chapter}}"}
  - tool: extract_chapter_states
    params: {id: "{{current_chapter}}"}
  - prompt: |
      Compare chapter states against bible, timeline, structure and narrator.
      Return a JSON list of alerts: [{entity, discrepancy_type, confidence, note}]
  - command: coherence.clear
  - command: coherence.push_alert
    params: {alerts: "{{prompt_result}}"}
    on_error: ignore
  - command: ui.open_tab
    params: {tab: "coherence"}
  - command: ui.set_spinner
    params: {visible: false}
```

**`skill_version_description.yaml`** — complete with commands

```yaml
id: skill_version_description
description: Generates the version message and triggers the Harden
trigger: harden_button
steps:
  - command: ui.set_spinner
    params: {visible: true}
  - tool: read_version_index
  - tool: compare_versions
    params: {id_a: "{{last_version}}", id_b: "current"}
  - prompt: |
      Generate a concise version message (1-2 sentences) based on the diff.
      Return the message only, no formatting.
  - command: ui.show_modal
    params:
      title: "New version"
      content: "{{prompt_result}}"
      actions: [confirm, edit, cancel]
  - command: harden.trigger
    params: {message: "{{modal_result}}"}
    on_error: notify
  - command: timeline.refresh
  - command: ui.set_spinner
    params: {visible: false}
```

**`skill_review.yaml`** — complete with commands

```yaml
id: skill_review
description: Produces an audit report and switches to the review screen
trigger: review_mode
steps:
  - command: ui.set_spinner
    params: {visible: true}
  - tool: read_bible
  - tool: read_timeline
  - tool: read_structure
  - tool: read_themes
  - tool: read_narrator
  - tool: read_chapter
    params: {id: "{{scope}}"}
  - prompt: |
      Analyse the text and produce a structured JSON report with sections:
      inconsistencies, pov, narrative_threads, tension, themes, voices, style.
      No text modifications.
  - command: app.navigate_to
    params: {screen: "review"}
  - command: review.push_report
    params: {report: "{{prompt_result}}"}
  - command: review.highlight_passage
    params: {passages: "{{flagged_passages}}"}
  - command: ui.set_spinner
    params: {visible: false}
```

---

### 5.6 Skill Engine — Context Management and Execution

The Skill Engine is the app module that executes skills. Its primary role is to maintain the **execution context** between steps — MCP keeping no state between tool calls, the Engine accumulates results and makes them available to subsequent steps via `{{...}}` variables.

#### Skill execution cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        SKILL ENGINE                             │
│                                                                 │
│  1. INIT          Loads the skill YAML                          │
│                   Initialises context: {                        │
│                     current_chapter, scope,                     │
│                     last_version, user_id, ...                  │
│                   }                                             │
│                                                                 │
│  2. FOR EACH STEP:                                              │
│                                                                 │
│     if type == tool                                             │
│       → MCP tool call                                           │
│       → result stored in context["result_<tool>"]              │
│                                                                 │
│     if type == prompt                                           │
│       → builds final prompt:                                    │
│           prompt_template + serialised context                  │
│       → AI model call (Ollama or cloud)                         │
│       → result stored in context["prompt_result"]              │
│                                                                 │
│     if type == command                                          │
│       → resolves params ({{variable}} substitution)            │
│       → emits CommandEvent to the Command Bus                   │
│       → optional result stored in context["<command>"]         │
│                                                                 │
│     if on_error == abort → stops execution                      │
│     if on_error == notify → ui.show_notification + continue     │
│     if on_error == ignore → continues silently                  │
│                                                                 │
│  3. END           Clears the context                            │
│                   Logs execution (skill_id, duration, errors)   │
└─────────────────────────────────────────────────────────────────┘
```

#### Execution context schema

The context is a mutable JSON object, passed and enriched at each step. `{{...}}` variables in skills are resolved by substitution from this context.

```json
{
  "skill_id": "skill_coherence",
  "trigger": "chapter_modified",

  "input": {
    "current_chapter": "chapter_07",
    "scope": "chapter",
    "user_id": "jean_michel",
    "last_version": "h002"
  },

  "results": {
    "result_read_bible":      { /* bible.yaml content */ },
    "result_read_timeline":   { /* timeline.yaml content */ },
    "result_read_chapter":    { /* chapter_07 content */ },
    "prompt_result":          [ /* JSON alert list */ ],
    "modal_result":           "Act 1 done — Jean relapses",
    "flagged_passages":       [ /* start/end ranges */ ]
  },

  "meta": {
    "started_at": "2024-04-02T09:15:00",
    "current_step": 6,
    "total_steps": 9,
    "errors": []
  }
}
```

#### Variable resolution

Any `{{variable}}` value in a skill is resolved in the following priority order:

```
1. context.input.*            — skill input parameters
2. context.results.*          — previous step results
3. app.state.*                — global app state (open chapter, active user…)
4. literal default value       — if defined in the skill
5. error → on_error           — if no value found
```

#### AI prompt construction

Before each `prompt` step, the Engine automatically serialises the relevant context and prepends it to the skill prompt. The AI always receives the data it needs without the skill having to repeat it manually.

```
[AUTOMATICALLY INJECTED CONTEXT]
bible.yaml : { ... }
timeline.yaml : { ... }
chapter_07.yaml : { ... }
chapter_07.md text: "..."

[SKILL PROMPT]
Compare chapter states against the bible...
```

> The injected context is intelligently truncated if the model's context window is limited — data closest to the current chapter takes priority.

#### AI model management

The Engine routes each `prompt` step to the right model based on user configuration and task type:

```yaml
# user config — model routing
routing:
  coherence:    ollama/mistral   # local — sensitive data
  style:        ollama/mistral   # local
  review:       cloud/gemini     # cloud — long task
  suggestions:  cloud/openai     # cloud — max quality
  fallback:     ollama/mistral   # if cloud unavailable
```

#### Skill composition

A skill can trigger another skill via `app.run_skill`. The Engine creates an isolated sub-context, executes it, and merges the result into the parent context.

```yaml
# Example: skill that chains two skills
steps:
  - command: app.run_skill
    params:
      skill_id: skill_coherence
      input: {current_chapter: "{{current_chapter}}"}
  - command: app.run_skill
    params:
      skill_id: skill_style
      input: {scope: "{{current_chapter}}"}
  - command: ui.open_tab
    params: {tab: "coherence"}
```

#### Execution log file

Each skill run is logged for debugging and continuous improvement.

```yaml
# .skills_log/2024-04-02_skill_coherence.yaml
skill_id: skill_coherence
trigger: chapter_modified
input: {current_chapter: chapter_07}
started_at: "2024-04-02T09:15:00"
finished_at: "2024-04-02T09:15:04"
duration_ms: 4120
total_steps: 9
alerts_generated: 3
errors: []
model_used: ollama/mistral
```

---
