/**
 * Theme, Motif, Symbol types for themes.yaml
 * See bmad/references/project/5-ai-architecture-mcp-skills.md > themes.yaml
 */
export interface Theme {
  id: string;
  label: string;
  description?: string;
  charactersInvolved?: string[];
  associatedMotifs?: string[];
  notes?: string;
}

export interface Motif {
  id: string;
  label: string;
  description?: string;
  occurrences?: Array<{
    chapterRef: string;
    notes?: string;
  }>;
  notes?: string;
}

export interface Symbol {
  id: string;
  label: string;
  meaning?: string;
  notes?: string;
}

/**
 * Narrative thread type for structure.yaml
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Structure > narrative_threads
 */
export interface NarrativeThread {
  id: string;
  label: string;
  type: 'main' | 'secondary' | string;
  status: 'open' | 'resolved' | 'abandoned' | string;
  openedAt: string;
  resolvedAt?: string;
  activeChapters?: string[];
  notes?: string;
}

// Application-wide types derived from bmad/references/PROJECT.md
// Each type/interface is linked to its corresponding concept or section in bmad/references/PROJECT.md for traceability.
// Comments are in English as requested.

/**
 * Timeline and temporal structures describing the story backbone.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Timeline
 */
export type TimeUnit = 'day' | 'week' | 'month' | 'year' | 'free';

/**
 * Types of timeline events used across the narrative.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Timeline Events
 */
export type EventType = 'normal' | 'ellipse' | 'flash_back' | 'flash_forward';

/**
 * Single event item in the timeline (e.g. Day 1, turning points).
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Timeline Events
 */
export interface TimelineEvent {
  index: number;
  /** human-friendly date label (e.g. "Day 1") */
  storyDate: string;
  label: string;
  type: EventType;
  /** optional chapter reference like "chapter_01" */
  chapterRef?: string;
  notes?: string | null;
  /** anchor used for flashbacks (e.g. "Day 47") */
  storyAnchor?: string;
}

/**
 * Ellipses represent summarized time ranges between two events.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Timeline Ellipses
 */
export interface TimelineEllipse {
  betweenIndex: [number, number];
  /** human readable duration (e.g. "44 days") */
  storyDuration: string;
  summary?: string | null;
  chapterRef?: string | null;
}

/**
 * Complete timeline schema containing events and optional ellipses.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Timeline Schema
 */
export interface TimelineSchema {
  timeUnit: TimeUnit;
  events: TimelineEvent[];
  ellipses?: TimelineEllipse[];
}

// Bible / global reference objects
// See bmad/references/project/2-coherence-engine-pure-logic.md > Bible (Characters, Locations, Objects, Vehicles)

export type CharacterStatus = 'alive' | 'dead' | 'missing' | 'unknown';

/**
 * Physical attributes for a character. Fields are optional and free-form.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Characters
 */
export interface PhysicalDescription {
  height?: string;
  eyes?: string;
  hair?: string;
  distinguishingMarks?: string;
  [key: string]: unknown;
}

export interface VoiceSchema {
  register?: string; // e.g. 'dry-casual'
  tics?: string[];
  syntax?: string; // descriptive syntax notes
  tone?: string; // e.g. 'ironic by default'
  notes?: string;
}
// See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Characters > Voice/Profile

/**
 * Describes voice/profile attributes for a character's dialogue.
 * Used by stylistic analysis and text generation components.
 * See bmad/references/project/3-stylistic-mastery-voice.md > Dialogue & Voice
 */

// See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Characters
export interface CharacterEntry {
  id: string;
  name: string;
  /** age at story start */
  ageStoryStart?: number;
  /** descriptive birth date relative to story (free text) */
  birthDateStory?: string;
  gender?: string;
  physicalDescription?: PhysicalDescription;
  characterTraits?: string[];
  occupation?: string;
  initialStatus?: CharacterStatus;
  /** chapter id where character first appears */
  firstAppears?: string;
  voice?: VoiceSchema;
  notes?: string | null;
}

/**
 * Location entry in the global bible. Represents places referenced
 * by id across chapters and timeline events.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Locations
 */

export type LocationStatus = 'active' | 'destroyed' | 'abandoned' | 'unknown';

export interface LocationEntry {
  id: string;
  name: string;
  city?: string;
  district?: string;
  description?: string;
  initialStatus?: LocationStatus;
  firstAppears?: string;
  notes?: string | null;
}

/**
 * Represents an object from the bible (props, symbolic items).
 * Tracks ownership and narrative role.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Objects
 */

export type ObjectStatus = 'in possession' | 'lost' | 'destroyed' | 'stolen' | string;

export interface ObjectEntry {
  id: string;
  name: string;
  /** character id who initially owns this object */
  initialOwner?: string;
  description?: string;
  initialStatus?: ObjectStatus;
  firstAppears?: string;
  symbolism?: string | null;
  notes?: string | null;
}

/**
 * Vehicle entry from the bible. Minimal fields for identification.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Vehicles
 */

export interface VehicleEntry {
  id: string;
  name: string;
  initialOwner?: string;
  plate?: string;
  initialStatus?: string;
  firstAppears?: string;
  notes?: string | null;
}

/**
 * Single history record for a relation between two characters.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Relations
 */

// Relations and history entries
export interface RelationHistoryEntry {
  /** story date string for this history step */
  storyDate?: string;
  /** chronological index in the timeline */
  chronoIndex?: number;
  state?: string; // e.g. 'neutral', 'tense', 'trust'
  notes?: string | null;
}

/**
 * Relation between two characters; may include a time-ordered history.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Bible > Relations
 */

export interface RelationEntry {
  characterA: string;
  characterB: string;
  type: string; // e.g. 'colleagues'
  history?: RelationHistoryEntry[];
}

/**
 * Narrator/focalization information for a chapter.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Narrator/Focalization
 */

// Chapter-local state schemas

export type TemporalType = 'normal' | 'flash_back' | 'flash_forward' | 'ellipse';

export interface NarratorSchema {
  pov?: string; // id of focalized character
  focalization?: 'internal' | 'external' | 'omniscient';
  person?: 'first' | 'third';
}

/**
 * Per-chapter snapshot of a character's state.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Character State
 */

export interface ChapterCharacterState {
  id: string;
  status?: CharacterStatus;
  /** current age during this chapter */
  currentAge?: number;
  outfit?: string;
  location?: string; // location id or free text
  notes?: string | null;
}

/**
 * Per-chapter snapshot of an object's state.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Object State
 */

export interface ChapterObjectState {
  id: string;
  status?: string;
  currentOwner?: string | null;
  notes?: string | null;
}

/**
 * Per-chapter snapshot of a vehicle's state.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Vehicle State
 */

export interface ChapterVehicleState {
  id: string;
  status?: string;
  location?: string | null;
  notes?: string | null;
}

/**
 * Key chronological event inside a chapter (used for timeline linking).
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Key Events
 */

export interface ChapterKeyEvent {
  chronoIndex: number;
  description: string;
}

/**
 * Base type for transitions that affect global or chapter state.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Transitions
 */

export type TransitionType = 'object_status' | 'relation_state' | string;

export interface TransitionBase {
  type: TransitionType;
}

/**
 * Transition describing an object status change (e.g. lost, destroyed).
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Transitions
 */

export interface ObjectStatusTransition extends TransitionBase {
  type: 'object_status';
  id: string; // object id
  newValue: string;
}

/**
 * Transition describing a relation state change between two characters.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Transitions
 */

export interface RelationStateTransition extends TransitionBase {
  type: 'relation_state';
  characterA: string;
  characterB: string;
  newValue: string;
  storyDate?: string;
  chronoIndex?: number;
}

/**
 * Full schema for a chapter file, representing local state, events,
 * narrator info and transitions applied to the bible.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Chapters > Chapter Schema
 */

export type ChapterTransition = ObjectStatusTransition | RelationStateTransition | TransitionBase;

export interface ChapterSchema {
  chapterRef: string;
  storyDateStart?: string;
  storyDateEnd?: string;
  chronoIndexStart?: number;
  chronoIndexEnd?: number;
  temporalType?: TemporalType;
  summary?: string;
  narrator?: NarratorSchema;
  narrativeThreads?: {
    active?: string[];
    openedHere?: string[];
    closedHere?: string[];
  };
  tension?: {
    level?: number; // 1-10
    type?: string; // action | revelation | dialogue | introspection
  };
  states?: {
    characters?: ChapterCharacterState[];
    objects?: ChapterObjectState[];
    vehicles?: ChapterVehicleState[];
  };
  keyEvents?: ChapterKeyEvent[];
  transitions?: ChapterTransition[];
}

/**
 * Act/structure entry used by the global story structure file.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Structure > Acts
 */

// Structure / acts
export interface ActSchema {
  id: string;
  label?: string;
  chapters?: string[];
  chronoIndexStart?: number;
  chronoIndexEnd?: number;
  goal?: string;
  pivotEvent?: string; // See bmad/references/PROJECT.md > structure.yaml > acts > pivot_event
}

/**
 * Top-level narrative structure (acts, model name).
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Structure
 */

export interface StructureSchema {
  model?: string; // e.g. 'three_acts'
  acts?: ActSchema[];
  narrativeThreads?: NarrativeThread[];
  tensionCurve?: Array<{
    chapterRef: string;
    targetLevel: number;
  }>;
}

/**
 * Aggregated view of project files (bible, timeline, chapters, structure).
 * This type mirrors the on-disk project layout described in bmad/references/project/2-coherence-engine-pure-logic.md.
 * See bmad/references/project/2-coherence-engine-pure-logic.md > Project File Layout
 */

// Top-level project schema — partial view combining the pieces above
export interface ProjectFileTree {
  bible?: {
    characters?: CharacterEntry[];
    locations?: LocationEntry[];
    objects?: ObjectEntry[];
    vehicles?: VehicleEntry[];
    relations?: RelationEntry[];
  };
  timeline?: TimelineSchema;
  chapters?: Record<string, ChapterSchema>;
  structure?: StructureSchema;
  themes?: Theme[];
  motifs?: Motif[];
  symbols?: Symbol[];
}

/**
 * POV exceptions and narration rules for narrator.yaml
 * See bmad/references/project/2-coherence-engine-pure-logic.md > narrator.yaml
 */
export interface PovException {
  chapterRef: string;
  focalizer: string;
  focalization: 'internal' | 'external' | 'omniscient';
  notes?: string;
}

export interface NarrationRule {
  rule: string;
}

/**
 * Detailed character sheet (optional, for characters/jean_dupont.yaml)
 * See bmad/references/project/2-coherence-engine-pure-logic.md > characters/jean_dupont.yaml
 */
export interface CharacterBiography {
  childhood?: string;
  training?: string;
  keyEvents?: Array<{
    storyDate: string;
    description: string;
  }>;
}

export interface CharacterPsychology {
  fears?: string[];
  motivations?: string[];
  contradictions?: string[];
}

export interface CharacterDialogueExample {
  context: string;
  example: string;
}

export interface CharacterNarrativeArc {
  start?: string;
  evolution?: string;
  end?: string;
}

export interface CharacterSheet {
  id: string;
  bibleRef?: boolean;
  biography?: CharacterBiography;
  psychology?: CharacterPsychology;
  voice?: VoiceSchema & {
    dialogueExamples?: CharacterDialogueExample[];
  };
  narrativeArc?: CharacterNarrativeArc;
}
