<!-- 4-intelligence-data.md -->

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
- **TYPES** this general structure is used to generate the types for the application components.
The types are stored in the file '[text](../../../src/lib/types/types.ts)'

> Note: The corresponding TypeScript definitions for these on-disk YAML schemas are maintained in
> [src/lib/types/types.ts](../../../src/lib/types/types.ts). Keep the YAML schema (this document)
> as the source of truth for on-disk files; when you change the YAML layout, update the TypeScript
> types accordingly (or run your types generation workflow) so the codebase remains consistent.

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
