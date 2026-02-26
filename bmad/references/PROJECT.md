 # 📘 Design Document — AI-Assisted Writing Software
 **Version 1.0 — Reference Document**  
 Stack: Svelte + LiveKit · Philosophy: Cooper-esque rigour, multimodal efficiency, multi-user isolation

---


## Software Architecture

- **Primary stack:** Svelte 5 + SvelteKit with Vite for bundling and dev server (scripts: `dev`, `build`, `preview`).
- **Language:** TypeScript (see `tsconfig.json`).
- **Runtime / modules:** Node.js in ESM mode (`type: "module"` in `package.json`).
- **Authentication:** `better-auth` on the server — configured in `src/lib/server/auth.ts` and wired in `src/hooks.server.ts`.
- **Database:** SQLite using `better-sqlite3` and Drizzle ORM (`drizzle-orm` + `drizzle-kit`). Schema and migrations are managed with `db:generate`, `db:push`, `db:migrate`, `db:studio`; primary schema file: `src/lib/server/db/schema.ts`.
- **Testing:** Unit tests with `vitest` (`test:unit`) and E2E tests with Playwright (`test:e2e`).
- **Code style & linting:** Prettier + ESLint (Svelte/Tailwind plugins) — scripts `lint` and `format`.
- **Styling / UI tooling:** Tailwind CSS and related plugins; `mdsvex` is available for markdown-style components.
- **Developer tooling:** `@sveltejs/adapter-auto`, `@sveltejs/vite-plugin-svelte`, and other devDependencies listed in `package.json`.
- **Recommended package manager:** `pnpm` (workspace + `pnpm-lock.yaml` present).

**Important notes / procedures:**
- Any schema changes must be accompanied by the appropriate `drizzle-kit` commands to regenerate migrations and types.
- `better-auth` integration relies on server-side initialization invariants — keep plugin ordering and related setup in `src/lib/server/auth.ts` unchanged unless verified.


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

Global source of truth — characters, locations, objects, vehicles, relations.

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
