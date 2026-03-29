# Project File Structure

This document defines the standard file structure for Sive projects.

## Root Structure

```
{project-root}/
├── project.yaml           # Project metadata and configuration
├── bible.yaml             # Character, object, location bible
├── timeline.yaml          # Chronological timeline of events
├── structure.yaml         # Acts, narrative threads, tension curve
├── themes.yaml            # Themes and motifs
├── narrator.yaml          # POV and narrator configuration
├── chapters/              # Chapter files
│   ├── chapter_01.md
│   ├── chapter_01.yaml
│   ├── chapter_02.md
│   ├── chapter_02.yaml
│   └── ...
├── characters/            # Expanded character sheets
│   ├── character_name.yaml
│   └── ...
└── .harden/               # Version history
    ├── index.yaml
    ├── h001.yaml
    ├── h002.yaml
    └── ...
```

## File Specifications

### project.yaml

```yaml
id: string
title: string
author: string
genre: string[]
logline: string
synopsis: string (optional)
target_word_count: number (optional)
language: string (default: "en")
created_at: ISO8601
updated_at: ISO8601
```

### bible.yaml

```yaml
characters:
  - id: string
    name: string
    role: protagonist | antagonist | supporting | minor
    description: string
    status: active | inactive | deceased | unknown
    traits: string[] (optional)
    goals: string[] (optional)
    relationships:
      - with: string
        type: string
        description: string (optional)
    first_appearance: string (chapter ref, optional)
    last_appearance: string (chapter ref, optional)

objects:
  - id: string
    name: string
    description: string
    significance: major | minor | background
    location: string (optional)
    owner: string (optional)
    first_appearance: string (optional)

locations:
  - id: string
    name: string
    description: string
    type: interior | exterior | abstract
    atmosphere: string (optional)
    significant_events: string[] (optional)
    chapters: string[] (optional)

last_updated: ISO8601
```

### timeline.yaml

```yaml
events:
  - id: string
    date: string (ISO8601 or custom format)
    description: string
    chapter_ref: string (optional)
    characters_involved: string[] (optional)
    location: string (optional)
    event_type: major | minor | background

time_periods:
  - id: string
    name: string
    start_date: string
    end_date: string
    description: string
```

### structure.yaml

```yaml
acts:
  - id: string
    number: number
    title: string
    description: string
    chapters: string[]
    tension_target: number (1-10, optional)

threads:
  - id: string
    title: string
    description: string
    status: open | resolved | abandoned
    resolution: string (optional)
    chapters: string[]
    related_characters: string[] (optional)

tension_curve:
  - chapter: string
    level: number (1-10)
    notes: string (optional)
```

### themes.yaml

```yaml
themes:
  - id: string
    name: string
    description: string
    symbols: string[] (optional)
    related_motifs: string[] (optional)

motifs:
  - id: string
    name: string
    description: string
    theme_ref: string (optional)
    occurrences:
      - chapter: string
        notes: string (optional)
        context: string (optional)
```

### narrator.yaml

```yaml
config:
  pov: first_person | third_person_limited | third_person_omniscient | multiple
  narrator_character: string (optional)
  reliability: reliable | unreliable
  tone: string
  register: string
  notes: string (optional)

character_voices:
  - character: string
    speech_patterns: string[] (optional)
    vocabulary: string (optional)
    tics: string[] (optional)
    examples: string[] (optional)
```

### chapters/chapter_XX.md

Markdown file containing the chapter content.

### chapters/chapter_XX.yaml

```yaml
id: string
title: string
number: number
act_ref: string (optional)
pov_character: string (optional)
location: string (optional)
date: string (optional)
word_count_target: number (optional)
tension_level: number (1-10, optional)
transitions: string (optional, multi-line)
notes: string (optional)
status: draft | revision | complete
```

### characters/character_name.yaml

Extended character sheet (optional, for detailed character development).

```yaml
id: string
name: string
full_name: string (optional)
aliases: string[] (optional)
age: string (optional)
physical_description: string (optional)
personality: string (optional)
background: string (optional)
motivations: string (optional)
fears: string (optional)
secrets: string (optional)
arcs: string (optional)
relationships:
  - character: string
    type: string
    dynamics: string (optional)
notes: string (optional)
```

### .harden/index.yaml

```yaml
versions:
  - id: string (e.g., "h001")
    label: string
    message: string
    created_at: ISO8601
    author: string (optional)
    changes: string[] (optional)
    parent_version: string (optional)

last_updated: ISO8601
```

### .harden/hXXX.yaml

Complete project snapshot at version XXX.

```yaml
id: string
label: string
message: string
created_at: ISO8601
author: string
snapshot:
  bible: { ... }
  timeline: { ... }
  structure: { ... }
  themes: { ... }
  narrator: { ... }
  chapters:
    - id: string
      content: string
      meta: { ... }
```

## MCP Tool Coverage

All files are accessible via MCP tools:

| File | MCP Tool |
|------|----------|
| bible.yaml | `read_bible` |
| timeline.yaml | `read_timeline` |
| structure.yaml | `read_structure` |
| themes.yaml | `read_themes` |
| narrator.yaml | `read_narrator` |
| chapters/XX.md + .yaml | `read_chapter` |
| characters/XX.yaml | `read_character_sheet` |
| .harden/index.yaml | `read_version_index` |
| .harden/hXXX.yaml | `read_version` |

## Writing Operations

| Operation | MCP Tool |
|-----------|----------|
| Add transition | `write_transition` |
| Update status | `update_status` |
| Add timeline event | `add_timeline_event` |
| Add character | `add_character` |
| Update thread | `update_narrative_thread` |
| Add motif occurrence | `add_motif_occurrence` |
| Create version | `create_harden` |
| Restore version | `restore_version` |

## Analysis Operations

| Operation | MCP Tool |
|-----------|----------|
| Compare versions | `compare_versions` |
| Extract states | `extract_chapter_states` |
| Count words | `count_words` |
| Search occurrences | `search_occurrences` |
