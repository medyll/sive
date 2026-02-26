# 📘 Design Document — AI-Assisted Writing Software
**Version 1.0 — Reference Document**  
Stack: Svelte + LiveKit · Philosophy: Cooper-esque rigour, multimodal efficiency, multi-user isolation

---

## 1. Interface Architecture (Layout)

### 1.1 Resizable Split-Screen

The panel is resizable by drag-and-drop. The default ratio is 55/45 (editor/suggestions) but the user can adjust freely — the preference is persisted per profile.

### 1.2 Focus Mode

A keyboard shortcut (e.g. `F11` or `Ctrl+Shift+F`) hides the right panel for a distraction-free writing session. When suggestions are ready during this mode, a discreet indicator (coloured dot in the margin) signals their availability without interrupting the flow.

### 1.3 Multi-Tab Right Panel

The right panel is organised into four contextual tabs. The active tab switches automatically based on the current action, but the user can navigate freely.

- **Suggestions** — AI proposal diff with selective validation
- **Coherence** — Narrative and physical inconsistency alerts
- **Style** — Stylistic analysis, language tics, metrics
- **History** — Snapshot timeline and navigation

### 1.4 Floating Chat Bar

Central floating bar for voice commands (LiveKit) and image uploads. Absolute positioning, collapsible.

### 1.5 AI Spinner

The spinner appears in the right panel as soon as an AI process is triggered (after a text modification or explicit action). It is not tied to user inactivity — a motionless author is thinking. The spinner is an **AI processing indicator**, not an idle indicator.

---

## 2. Coherence Engine & Pure Logic

### 2.1 Inconsistency Detector

Real-time monitoring of character and object states. Alerts are displayed in the **Coherence** tab of the right panel.

### 2.2 Physical Logic Calculator — Soft Alert Mode

Verification of the feasibility of journeys, durations and physical laws referenced in the narrative. Each signal is accompanied by an explicit **confidence level** (Low / Medium / High). The author remains sovereign: signals are suggestions, never blockers.

- Example: Paris–Lyon journey estimated at 2h by car vs 30 min in the narrative → **High** signal
- Example: character wearing a winter coat in midsummer → **Medium** signal (may be intentional)

### 2.3 Ultra-Granular Categorisation Engine

Continuous tracking of ages, clothing, vehicle types and narrative chronology via the current chapter's YAML file.

---

## 3. Stylistic Mastery & Voice

### 3.1 Ingestion-Based Profiling

Learning the author's style from source files (`.md` / YAML). Profiles are stored per user and versioned.

### 3.2 Style Settings — Sliders

Slider interface to control the tone and rhythm of AI suggestions:

- **Cynicism** — from neutral to sharp
- **Syntactic complexity** — from simple to elaborate
- **Rhythm** — from staccato to flowing
- **Narrative density** — from detailed scene to temporal ellipsis

> Narrative density is often more immediately actionable than abstract sliders: it directly drives the description/action ratio in generated suggestions.

### 3.3 Flow Analysis

Detection of language tics, lexical repetitions and adherence to the author's metric. Results displayed in the **Style** tab.

### 3.4 Targeted Passage Analysis

**"Analyse this passage"** button available on any text selection. Launches a targeted stylistic analysis without continuous monitoring, preserving performance and avoiding alert fatigue.

### 3.5 Text-to-Speech

Rhythm testing via various synthesis voices (LiveKit). Allows detection of sentences that "catch" on the ear.

---

## 4. Intelligence & Data

### 4.1 Hybrid AI

Flexible routing architecture between local and cloud models:

- **Local** — Ollama (full privacy, offline mode)
- **Cloud** — Gemini, OpenAI and others via LiveKit agents

Model selection is configurable per user and can be defined by task type (coherence → local, long generation → cloud).

### 4.2 Web Search (Fact-checking)

DuckDuckGo / Wikipedia integration for on-demand factual verification. No automatic calls without explicit user action.

### 4.3 File System

#### General Structure

```
mybook/
├── bible.yaml                  ← characters, locations, objects, relations, voices
├── timeline.yaml               ← canonical event order + flash-backs/forwards
├── structure.yaml              ← acts, tension curve, narrative threads
├── themes.yaml                 ← recurring themes, motifs, symbols
├── narrator.yaml               ← point of view, focalization, narrative voice
├── characters/                 ← expanded character sheets (optional)
│   ├── jean_dupont.yaml
│   └── marie_chen.yaml
└── chapters/
    ├── chapter_01/
    │   ├── chapter_01.md       ← narrative text
    │   └── chapter_01.yaml     ← local states + transitions + POV + active threads
    ├── chapter_07/
    │   ├── chapter_07.md
    │   └── chapter_07.yaml
    └── ...
```

`bible.yaml` is the permanent reference. Chapter YAMLs are only local instantiations of it. The coherence engine (section 2) cross-references both levels to detect contradictions. Variable template support (`{{name}}`, `{{location}}`, etc.) for cross-project consistency.

---

#### Schema `timeline.yaml`

The temporal backbone of the narrative. All other files reference it via `story_date` and `chrono_index`. Also manages temporal figures (ellipses, flash-backs, flash-forwards).

```yaml
# timeline.yaml

time_unit: day   # day | week | month | year | free

events:
  - index: 1
    story_date: "Day 1"
    label: Story begins
    type: normal             # normal | ellipse | flash_back | flash_forward
    chapter_ref: chapter_01
    notes: Jean arrives at the Bastille precinct

  - index: 2
    story_date: "Day 3"
    label: First crime scene
    type: normal
    chapter_ref: chapter_01
    notes: ~

  - index: 15
    story_date: "Day 47"
    label: Martin's death
    type: normal
    chapter_ref: chapter_04
    notes: Turning point — Jean relapses

  - index: 16
    story_date: "15 years before Day 1"
    label: Jean's wife's accident
    type: flash_back
    chapter_ref: chapter_05
    story_anchor: "Day 47"    # the narrative moment from which this flash-back is triggered
    notes: Explains Jean's guilt

  - index: 99
    story_date: "Night of the storm"
    label: Jean saves Marie
    type: normal
    chapter_ref: chapter_07
    notes: ~

ellipses:
  - between_index: [2, 15]
    story_duration: "44 days"
    summary: Routine investigation, Jean stays sober
    chapter_ref: ~           # unnarrated ellipse
```

---

#### Schema `bible.yaml`

Global source of truth — characters, locations, objects, vehicles, relations, voices.

```yaml
# bible.yaml

characters:
  - id: jean_dupont
    name: Jean Dupont
    age_story_start: 42
    birth_date_story: "20 years before Day 1"
    gender: male
    physical_description:
      height: 6ft
      eyes: brown
      hair: grey, short
      distinguishing_marks: scar above left eyebrow
    character_traits: [taciturn, loyal, impulsive]
    occupation: police inspector
    initial_status: alive       # alive | dead | missing | unknown
    first_appears: chapter_01
    voice:
      register: dry-casual      # formal | standard | casual | slang
      tics: ["Yeah", "That's just how it is"]
      syntax: short sentences, few adjectives
      tone: ironic by default, direct under pressure
      notes: Never says "I love you" — shows it through actions
    notes: former alcoholic, sober for 5 years at Day 1

locations:
  - id: bastille_precinct
    name: Bastille Police Precinct
    city: Paris
    district: 11th arrondissement
    description: 1970s building, damp basement
    initial_status: active      # active | destroyed | abandoned | unknown
    first_appears: chapter_01
    notes: ~

objects:
  - id: jean_revolver
    name: Smith & Wesson Revolver
    initial_owner: jean_dupont
    description: .38 calibre, scratched black grip
    initial_status: in possession  # in possession | lost | destroyed | stolen
    first_appears: chapter_02
    symbolism: extension of Jean's authority, loss = loss of control
    notes: ~

vehicles:
  - id: jean_peugeot
    name: Grey Peugeot 308
    initial_owner: jean_dupont
    plate: AB-123-CD
    initial_status: in service
    first_appears: chapter_01
    notes: ~

relations:
  - character_a: jean_dupont
    character_b: marie_chen
    type: colleagues
    history:
      - story_date: "Day 1"
        chrono_index: 1
        state: neutral
        notes: First meeting at the precinct
      - story_date: "Day 47"
        chrono_index: 15
        state: tense
        notes: Marie discovers Jean's alcoholism
      - story_date: "Night of the storm"
        chrono_index: 99
        state: trust
        notes: Jean saves her life
```

---

#### Schema `chapter_XX.yaml`

Local chapter state — what happens, active POV, narrative threads involved, and lasting transitions to the bible.

```yaml
# chapter_07.yaml

chapter_ref: chapter_07
story_date_start: "Night of the storm"
story_date_end: "Next morning"
chrono_index_start: 99
chrono_index_end: 100
temporal_type: normal        # normal | flash_back | flash_forward | ellipse

summary: Jean saves Marie during the storm. Their relationship shifts.

narrator:
  pov: jean_dupont            # id of the focalized character
  focalization: internal      # internal | external | omniscient
  person: third               # first | third

narrative_threads:
  active: [main_investigation_thread, jean_marie_relationship_thread]
  opened_here: []             # threads launched in this chapter
  closed_here: []             # threads resolved in this chapter

tension:
  level: 8                    # 1 (rest) to 10 (climax)
  type: action                # action | revelation | dialogue | introspection

states:
  characters:
    - id: jean_dupont
      status: alive
      current_age: 42
      outfit: black raincoat, unarmed
      location: Seine riverbank
      notes: Relapses tonight

    - id: marie_chen
      status: alive
      outfit: white lab coat under overcoat
      location: Seine riverbank
      notes: Slightly injured, left arm

  objects:
    - id: jean_revolver
      status: lost
      current_owner: ~
      notes: Fell into the Seine during the scene

  vehicles:
    - id: jean_peugeot
      status: in service
      location: Seine riverbank, parked on side street
      notes: ~

key_events:
  - chrono_index: 99
    description: Jean pushes Marie out of the path of an oncoming car
  - chrono_index: 100
    description: Jean finds the bottle in his glove compartment

transitions:
  - type: object_status
    id: jean_revolver
    new_value: lost
  - type: relation_state
    character_a: jean_dupont
    character_b: marie_chen
    new_value: trust
    story_date: "Night of the storm"
    chrono_index: 99
```

---

#### Schema `characters/jean_dupont.yaml` *(optional)*

Expanded sheet for main characters, beyond the bible entry.

```yaml
# characters/jean_dupont.yaml

id: jean_dupont
bible_ref: true   # source of truth remains bible.yaml

biography:
  childhood: Northern suburb, father was a gendarme
  training: Lyon Police Academy, class of 2003
  key_events:
    - story_date: "15 years before Day 1"
      description: Wife's death, car accident
    - story_date: "5 years before Day 1"
      description: Rehab, successful

psychology:
  fears: losing control, being abandoned
  motivations: redemption, justice
  contradictions: preaches loyalty but lies by omission

voice:
  register: dry-casual
  tics: ["Yeah", "That's just how it is"]
  syntax: short sentences, few adjectives
  tone: ironic by default, direct under pressure
  dialogue_examples:
    - context: under pressure
      example: "Yeah. It's done."
    - context: rare emotional moment
      example: "You deserve better than this."
  notes: Never says 'I love you' — shows it through actions

narrative_arc:
  start: Broken man running on autopilot
  evolution: His relationship with Marie forces him to reopen old wounds
  end: ~   # to be defined
```

---

#### Schema `structure.yaml`

Global dramatic architecture of the narrative — acts, tension curve, narrative threads.

```yaml
# structure.yaml

model: three_acts   # three_acts | five_acts | heroes_journey | free

acts:
  - id: act_1
    label: Exposition
    chapters: [chapter_01, chapter_02, chapter_03]
    chrono_index_start: 1
    chrono_index_end: 15
    goal: Establish Jean, the investigation, the relationship with Marie
    pivot_event: "Martin's death — Jean relapses"

  - id: act_2
    label: Confrontation
    chapters: [chapter_04, chapter_05, chapter_06, chapter_07]
    chrono_index_start: 15
    chrono_index_end: 99
    goal: Investigation escalates, Jean-Marie relationship deepens
    pivot_event: "Jean saves Marie — everything changes"

  - id: act_3
    label: Resolution
    chapters: [chapter_08, chapter_09]
    chrono_index_start: 99
    chrono_index_end: ~   # to be defined
    goal: Resolution of the investigation and Jean's personal arc
    pivot_event: ~

narrative_threads:
  - id: main_investigation_thread
    label: The investigation into Martin's murder
    type: main
    status: open           # open | resolved | abandoned
    opened_at: chapter_01
    resolved_at: ~         # to be defined
    active_chapters: [chapter_01, chapter_02, chapter_03, chapter_04, chapter_07]
    notes: Plot driver thread

  - id: jean_marie_relationship_thread
    label: The relationship between Jean and Marie
    type: secondary
    status: open
    opened_at: chapter_01
    resolved_at: ~
    active_chapters: [chapter_01, chapter_03, chapter_07]
    notes: Central emotional thread

  - id: jean_alcoholism_thread
    label: Jean's relapse
    type: secondary
    status: open
    opened_at: chapter_04
    resolved_at: ~
    active_chapters: [chapter_04, chapter_07]
    notes: Opened by Martin's death

tension_curve:
  # Target tension level per chapter (1-10)
  # Allows the AI to detect rhythmic imbalances
  - chapter_ref: chapter_01
    target_level: 3
  - chapter_ref: chapter_02
    target_level: 4
  - chapter_ref: chapter_03
    target_level: 5
  - chapter_ref: chapter_04
    target_level: 7
  - chapter_ref: chapter_07
    target_level: 8
```

---

#### Schema `themes.yaml`

Recurring themes, motifs and symbols. Allows the AI to understand the author's deeper intentions and verify their consistency in the text.

```yaml
# themes.yaml

themes:
  - id: theme_redemption
    label: Redemption
    description: Jean seeks to atone for past mistakes — alcohol, his wife's death
    characters_involved: [jean_dupont]
    associated_motifs: [motif_water, motif_alcohol]
    notes: Central theme — must be visible in Jean's arc

  - id: theme_trust
    label: Trust and betrayal
    description: Who deserves Jean's trust? Can he trust himself?
    characters_involved: [jean_dupont, marie_chen]
    associated_motifs: [motif_revolver]
    notes: ~

motifs:
  - id: motif_water
    label: Water
    description: Purification, dissolution, danger. The Seine as boundary between control and surrender.
    occurrences:
      - chapter_ref: chapter_07
        notes: Revolver lost in the Seine — Jean "unburdening" himself
    notes: To be reinforced in final chapters

  - id: motif_alcohol
    label: Alcohol
    description: Symbol of Jean's escape and failure
    occurrences:
      - chapter_ref: chapter_04
        notes: Jean relapses after Martin's death
      - chapter_ref: chapter_07
        notes: The bottle in the glove compartment

  - id: motif_revolver
    label: The revolver
    description: Extension of Jean's authority and control. Its loss symbolises a rupture.
    occurrences:
      - chapter_ref: chapter_07
        notes: Lost in the Seine

symbols:
  - id: symbol_seine
    label: The Seine
    meaning: Boundary between the old Jean and the new
    notes: ~
```

---

#### Schema `narrator.yaml`

Point of view, focalization and global narrative voice of the story.

```yaml
# narrator.yaml

type: heterodiegetic    # homodiegetic (narrator=character) | heterodiegetic (external narrator)
default_focalization: internal   # internal | external | omniscient
default_person: third            # first | third
default_focalizer: jean_dupont   # default POV character

narrative_voice:
  tone: sober, slightly ironic
  style: short sentences, police realism
  emotional_distance: close   # close | neutral | distant
  notes: Narrative voice mirrors Jean's register — sober, efficient

pov_exceptions:
  # Chapters where the POV deviates from default
  - chapter_ref: chapter_05
    focalizer: marie_chen
    focalization: internal
    notes: Chapter from Marie's point of view — deliberate exception

rules:
  - Stay in Jean's internal focalization unless explicitly noted as an exception
  - Never reveal information Jean cannot know
  - Flash-backs remain in the internal focalization of the relevant character
```

### 4.4 Edition Simulator

Real-time estimated page count based on target format: Pocket, A5, Royal.

---

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

## 6. Versioning & Validation

The versioning system allows the author to lock key milestones of their manuscript and return to them at any time. A **Harden** is a versioning snapshot — the equivalent of a named commit. It captures the complete state of the project at a given moment: narrative text, bible, timeline, character sheets.

### 6.1 Harden — Creating a Version

The author triggers a Harden via a dedicated button in the main toolbar. A description message is required before confirming — it can be entered manually or **auto-generated by the AI**, which analyses the diff since the previous version to propose a change summary (e.g. "Rewrote chapter 3, added Martin's death, updated Jean↔Marie relationship"). The author can accept, edit or replace the proposal. The Harden copies all project files into an isolated versioned folder.

Physical version structure:

```
mybook/
└── .harden/
    ├── index.yaml                 ← registry of all versions
    ├── h001_incipit/
    │   ├── meta.yaml              ← timestamp, message, statistics
    │   ├── bible.yaml
    │   ├── timeline.yaml
    │   ├── characters/
    │   └── chapters/
    │       ├── chapter_01/
    │       │   ├── chapter_01.md
    │       │   └── chapter_01.yaml
    │       └── ...
    └── h002_end_act_1/
        ├── meta.yaml
        └── ...
```

`index.yaml` schema — version registry:

```yaml
# .harden/index.yaml

snapshots:
  - id: h001
    label: incipit
    timestamp: 2024-03-15T14:32:00
    author: Jean-Michel
    message: "First draft of the first 3 chapters"
    word_count: 8450
    chapters_included: [chapter_01, chapter_02, chapter_03]

  - id: h002
    label: end_act_1
    timestamp: 2024-04-02T09:15:00
    author: Jean-Michel
    message: "Act 1 complete, Martin's death confirmed"
    word_count: 21300
    chapters_included: [chapter_01, chapter_02, chapter_03, chapter_04]
```

`meta.yaml` schema — version detail:

```yaml
# .harden/h002_end_act_1/meta.yaml

id: h002
label: end_act_1
timestamp: 2024-04-02T09:15:00
author: Jean-Michel
message: "Act 1 complete, Martin's death confirmed"
word_count: 21300
chapter_count: 4

diff_from_previous:
  chapters_modified: [chapter_02, chapter_03]
  chapters_added: [chapter_04]
  chapters_removed: []
  characters_modified: [jean_dupont]
  objects_modified: []
  relations_modified: [jean_dupont↔marie_chen]
  word_delta: +12850
```

### 6.2 Timeline — Navigating Versions

Visual interface as a chronological timeline. Each Harden appears as a point on the timeline with its label and message. The author can navigate between versions and restore any previous version in one click.

The timeline reads `index.yaml` to build the display. The `diff_from_previous` in `meta.yaml` is pre-calculated at Harden creation for instant display.

### 6.3 Visual Diff Between Two Versions

Side-by-side comparison of two Hardens selected on the timeline. Modified passages are highlighted with additions (green) and deletions (red), on both the narrative text (.md) and structured data (.yaml).

### 6.4 Selective Validation of AI Suggestions

Injection of right-panel proposals into the left editor, passage by passage. The author accepts or rejects each proposal independently. Distinct from versioning — selective validation operates on the current draft, before any Harden.

---

## 7. Review Mode

Review Mode is an **AI audit** session on existing text. The AI proposes no direct modifications and does not touch the text.

### 7.1 Principle

The author switches to Review Mode from the main toolbar. The AI processes the selected text (passage, chapter or entire volume) and produces a structured report.

### 7.2 Report Contents

- Detected inconsistencies — characters, objects, timeline
- Language tics — lexical and syntactic repetitions
- Rhythm curve — tension/rest alternation across the chapter
- Narrative density — ellipsis vs detailed scene distribution
- Stylistic signals — deviations from the ingested style profile

### 7.3 Output Format

The report is exportable as `.md` or `.pdf`. No modifications are made to the source text in this mode.

---

## 8. Multi-User Administration & Authentication

### 8.1 Deployment Model

| Criterion | Desktop *(recommended V1)* | Shared Server *(V2+)* |
|---|---|---|
| File isolation | OS directories per profile — trivial | Docker volumes per user |
| API keys | Stored locally, encrypted | Never in plaintext — vault required |
| Authentication | Simple local login or OAuth | OAuth + MFA recommended |
| AI privacy | Ollama 100% local possible | Cloud requests logged — to be documented |

### 8.2 Onboarding — Silent User Creation

Onboarding is designed to be as accessible as possible. No classic registration form. The user is guided by a minimal conversational sequence.

**Step 1 — Name**
Simple text field: *"What should we call you?"*. No strict validation — a first name, a pseudonym, anything goes. The account is silently created on confirmation.

**Step 2 — Security (optional)**
*"Do you want to protect your space?"* Three options presented equally:
- No password *(direct access, recommended for solo use)*
- Password *(simple field, confirmation)*
- Connect via an existing account *(OAuth)*

**Step 3 — OAuth (if chosen)**
Provider selection from those available. The list is extensible.

### 8.3 Supported Authentication Methods

| Method | Description | Availability |
|---|---|---|
| None | Direct access without password | V1 |
| Local password | bcrypt hash, stored locally | V1 |
| Google OAuth | Sign in with Google account | V1 |
| GitHub OAuth | Sign in with GitHub account | V1 |
| Apple Sign In | Sign in with Apple ID | V1 |
| Discord OAuth | Sign in with Discord | V2 |
| Microsoft OAuth | Sign in with Microsoft account | V2 |

### 8.4 Total Isolation

Each user has personal directories with independent configurations, style profiles, version histories and their own API keys.

### 8.5 Censorship Mode — Beta Reader Export

Manuscript export with automatic masking of spoilers or YAML notes marked as confidential. Mechanism based on explicit tags in the source text:

```
{{spoiler}} masked content {{/spoiler}}
```

Replaced by blanks or neutral placeholders on export. Works on continuous narrative text, not only on structured fields.

---

## 9. Layout — Semantic Interface Description

Structural description of the interface as semantic pseudo-HTML. Tags are utility layout elements — they carry no style, only structure and functional responsibilities.

**Conventions:**
- `<row>` — horizontal container
- `<column>` — vertical container
- `<panel>` — delimited area with a functional role
- `<toolbar>` — fixed horizontal toolbar
- `<text-zone>` — text input or display area
- `<chat-bubble>` — AI or user message bubble
- `<tab-bar>` — tab bar
- `<tab>` — individual tab
- `<overlay>` — floating element positioned above the layout
- `<spinner>` — loading indicator
- `<timeline>` — chronological timeline
- `<diff-view>` — side-by-side diff display
- `<badge>` — discreet indicator (dot)
- `<resize-handle>` — resize handle between two panels

```html
<!-- [main-screen] : MAIN SCREEN — Writing Mode -->
<column id="app-root" full-height>

  <!-- [main-toolbar] : Fixed top main toolbar -->
  <toolbar id="main-toolbar" position="top">
    <!-- Active project name + chapter -->
    <text label="active_project / current_chapter" />

    <!-- Global actions -->
    <button action="focus-mode"  label="Focus" />         <!-- hides right panel -->
    <button action="review-mode" label="Review" />
    <button action="harden"      label="💾 New version" /> <!-- triggers versioning -->
    <button action="settings"    label="⚙" />
  </toolbar>

  <!-- [main-body] : Main body — resizable split -->
  <row id="main-body" flex>

    <!--[left-panel] LEFT PANEL — Editor -->
    <panel id="editor-panel" default-width="55%" resizable>
      <text-zone
        id="main-editor"
        role="main editor for the current chapter"
        multiline
        spellcheck
        autosave
        <!-- Narrative .md text is edited here -->
        <!-- Modifications trigger the AI spinner on the right -->
      />
    </panel>

    <!-- [resize-handle] : Resize handle between the two panels -->
    <resize-handle id="split-handle" axis="horizontal" />

    <!-- [right-panel] : RIGHT PANEL — AI & Tools -->
    <panel id="ai-panel" default-width="45%" resizable collapsible>

      <!-- [right-panel-tab-bar] : Right panel tab bar -->
      <tab-bar id="ai-tabs">
        <tab id="tab-suggestions" label="Suggestions" default-active />
        <tab id="tab-coherence"   label="Coherence" />
        <tab id="tab-style"       label="Style" />
        <tab id="tab-history"     label="History" />
      </tab-bar>

      <!-- [ai-spinner] : AI Spinner — visible during processing, in the right panel -->
      <spinner
        id="ai-spinner"
        position="top-right-of-panel"
        visible-when="ai-processing"
        <!-- Appears as soon as an AI process is running -->
        <!-- Disappears when the result is displayed -->
      />

      <!-- [tab-content-suggestions] Suggestions tab content -->
      <panel id="tab-content-suggestions" visible-when="tab-suggestions-active">
        <!-- List of AI proposals as a diff -->
        <diff-view
          id="suggestions-diff"
          left="original text"
          right="AI proposal"
          <!-- Each proposal can be independently accepted or rejected -->
        />
        <row id="suggestion-actions">
          <button action="accept-suggestion" label="Accept" />
          <button action="reject-suggestion" label="Reject" />
          <button action="accept-all"        label="Accept all" />
        </row>
      </panel>

      <!-- [tab-content-coherence] : Coherence tab content -->
      <panel id="tab-content-coherence" visible-when="tab-coherence-active">
        <!-- List of alerts produced by skill_coherence -->
        <!-- Each alert: concerned entity + discrepancy type + confidence level -->
        <column id="coherence-alerts">
          <chat-bubble
            role="coherence-alert"
            fields="[entity, discrepancy_type, confidence, note]"
            <!-- Low = grey | Medium = orange | High = red -->
          />
          <!-- One bubble per detected alert -->
        </column>
      </panel>

      <!-- [tab-content-style] : Style tab content -->
      <panel id="tab-content-style" visible-when="tab-style-active">
        <button action="analyse-passage" label="Analyse this passage" />
        <!-- skill_style results on the current selection -->
        <column id="style-results">
          <chat-bubble role="style-signal" fields="[location, signal, suggestion]" />
        </column>
      </panel>

      <!-- [tab-content-history] : History tab content -->
      <panel id="tab-content-history" visible-when="tab-history-active">
        <!-- [harden-timeline] Harden version timeline -->
        <timeline
          id="harden-timeline"
          source="index.yaml"
          <!-- Each point = a Harden with label + message + date -->
          <!-- Click on a point = preview that version -->
        />
        <!-- [diff-controls] -->
        <row id="diff-controls">
          <text label="Compare:" />
          <select id="version-a" source="harden-list" />
          <text label="↔" />
          <select id="version-b" source="harden-list" />
          <button action="launch-diff" label="View differences" />
        </row>
        <!-- [diff-view] : Visual diff between two selected versions -->
        <diff-view id="version-diff" visible-when="diff-launched" />
      </panel>

    </panel>
  </row>

  <!-- [chat-bar] : OVERLAY — Floating chat bar (voice commands + image upload) -->
  <overlay id="chat-bar" position="bottom-center" draggable collapsible>
    <row>
      <button action="toggle-voice" icon="mic"   label="Voice" />  <!-- LiveKit -->
      <text-zone id="chat-input" role="text or voice command to AI" inline />
      <button action="upload-image" icon="image" label="Image" />
      <button action="send"         icon="send"  label="Send" />
    </row>
  </overlay>

  <!-- [suggestions-ready-badge] : BADGE — Discreet indicator in Focus Mode (right panel hidden) -->
  <badge
    id="suggestions-ready-badge"
    position="right-edge-of-editor"
    visible-when="focus-mode AND suggestions-available"
    <!-- Coloured dot indicating AI suggestions are ready -->
    <!-- Only visible when the right panel is hidden -->
  />

</column>


<!--  [onboarding-screen] : ONBOARDING SCREEN — First launch -->
<column id="onboarding-screen" centered>

  <!-- [step-name] : Step 1 — Name -->
  <panel id="step-name" visible-when="step === 1">
    <text-zone
      id="input-name"
      role="first name or pseudonym input"
      placeholder="What should we call you?"
      <!-- Loose validation — any non-empty string -->
    />
    <button action="next-step" label="Continue →" />
  </panel>

  <!-- [step-security] : Step 2 — Security choice -->
  <panel id="step-security" visible-when="step === 2">
    <text label="Do you want to protect your space?" />
    <column id="security-options">
      <button action="no-password"  label="Direct access — no password" />
      <button action="set-password" label="Create a password" />
      <button action="use-oauth"    label="Sign in with an existing account" />
    </column>
  </panel>

  <!-- [step-password] Step 2b — Password entry (if password chosen) -->
  <panel id="step-password" visible-when="step === 2b">
    <text-zone id="input-password"  role="password input"        type="password" placeholder="Password" />
    <text-zone id="input-password2" role="password confirmation" type="password" placeholder="Confirm" />
    <button action="confirm-password" label="Confirm" />
  </panel>

  <!-- [step-oauth] : Step 2c — OAuth provider choice (if OAuth chosen) -->
  <panel id="step-oauth" visible-when="step === 2c">
    <text label="Choose a provider:" />
    <column id="oauth-providers">
      <button action="oauth-google"  label="Continue with Google" />
      <button action="oauth-github"  label="Continue with GitHub" />
      <button action="oauth-apple"   label="Continue with Apple" />
      <!-- extensible: oauth-discord, oauth-microsoft, etc. -->
    </column>
  </panel>

</column>


<!-- [review-screen] :REVIEW MODE SCREEN -->
<column id="review-screen">
  <!--  [toolbar] -->
  <toolbar id="review-toolbar" position="top">
    <text label="Review Mode" />
    <select id="scope-selector" options="[selected passage, current chapter, entire volume]" />
    <button action="launch-review" label="Run analysis" />
    <button action="exit-review"   label="← Back to writing" />
    <button action="export-report" label="Export report" />  <!-- .md or .pdf -->
  </toolbar>
  <!--  [review-body] -->  
  <row id="review-body">

    <!-- [review-text] : Read-only text with highlights -->
    <panel id="review-text" width="55%">
      <text-zone
        id="text-readonly"
        role="narrative text in read-only mode"
        readonly
        <!-- Flagged passages are highlighted -->
        <!-- Click on a highlight = scroll to the corresponding alert -->
      />
    </panel>

    <!-- [review-report] : Structured audit report -->
    <panel id="review-report" width="45%">
      <!-- [report-sections] -->
      <column id="report-sections">
        <!-- [report-inconsistencies] -->
        <panel id="report-inconsistencies">
          <text label="Inconsistencies" role="section-header" />
          <chat-bubble role="report-item" fields="[entity, description, confidence]" />
        </panel>
        <!-- [report-pov] -->  
        <panel id="report-pov">
          <text label="Point of View" role="section-header" />
          <chat-bubble role="report-item" fields="[location, detected_deviation]" />
        </panel>
        <!-- [report-threads] -->
        <panel id="report-threads">
          <text label="Narrative Threads" role="section-header" />
          <chat-bubble role="report-item" fields="[thread_id, status, note]" />
        </panel>
        <!-- [report-tension] -->
        <panel id="report-tension">
          <text label="Tension Curve" role="section-header" />
          <!-- Line chart: actual tension vs target tension -->
          <chart type="line" series="[actual_tension, target_tension]" />
        </panel>
        <!-- [report-themes] -->
        <panel id="report-themes">
          <text label="Themes & Motifs" role="section-header" />
          <chat-bubble role="report-item" fields="[motif_id, presence, consistency]" />
        </panel>
        <!-- [report-voices] -->
        <panel id="report-voices">
          <text label="Character Voices" role="section-header" />
          <chat-bubble role="report-item" fields="[character_id, register_deviation, example]" />
        </panel>
        <!-- [report-style] -->
        <panel id="report-style">
          <text label="Style & Rhythm" role="section-header" />
          <chat-bubble role="report-item" fields="[signal_type, location, suggestion]" />
        </panel>

      </column>
    </panel>

  </row>

</column>
```

---

## Appendix — Prioritisation Recommendation

All features below constitute the complete V1 scope. The recommendation is to tackle them in the following order to deliver value at each stage and validate key assumptions before attacking the most complex modules.

| Priority | Feature | Rationale |
|---|---|---|
| 1 | Resizable split editor + Focus Mode | UX foundation — nothing else works without this |
| 2 | Multi-tab right panel + AI Spinner | Feedback interface structure |
| 3 | Versioning (Harden) + Timeline + Visual diff | Author confidence — safety net before everything else |
| 4 | Review Mode (AI report) | Strong differentiator, manageable complexity |
| 5 | Style profiling + Sliders (incl. Density) | Core AI value — depends on profiling |
| 6 | Coherence engine + Physical logic | Requires false positive rate validation |
| 7 | Censorship mode / beta reader export | After YAML format stabilisation |
| 8 | Multi-user + Total isolation | In parallel once file architecture is stable |

---

*— End of document v1.0 —*
