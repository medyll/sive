// Inferred application-wide types derived from PROJECT.md
// Comments are in English as requested.

/**
 * Timeline and temporal structures describing the story backbone.
 */
export type TimeUnit = 'day' | 'week' | 'month' | 'year' | 'free';

/**
 * Types of timeline events used across the narrative.
 */
export type EventType = 'normal' | 'ellipse' | 'flash_back' | 'flash_forward';

/**
 * Single event item in the timeline (e.g. Day 1, turning points).
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
 */
export interface TimelineSchema {
  timeUnit: TimeUnit;
  events: TimelineEvent[];
  ellipses?: TimelineEllipse[];
}

// Bible / global reference objects

export type CharacterStatus = 'alive' | 'dead' | 'missing' | 'unknown';

/**
 * Physical attributes for a character. Fields are optional and free-form.
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

/**
 * Describes voice/profile attributes for a character's dialogue.
 * Used by stylistic analysis and text generation components.
 */

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
 */

export interface RelationEntry {
  characterA: string;
  characterB: string;
  type: string; // e.g. 'colleagues'
  history?: RelationHistoryEntry[];
}

/**
 * Narrator/focalization information for a chapter.
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
 */

export interface ChapterObjectState {
  id: string;
  status?: string;
  currentOwner?: string | null;
  notes?: string | null;
}

/**
 * Per-chapter snapshot of a vehicle's state.
 */

export interface ChapterVehicleState {
  id: string;
  status?: string;
  location?: string | null;
  notes?: string | null;
}

/**
 * Key chronological event inside a chapter (used for timeline linking).
 */

export interface ChapterKeyEvent {
  chronoIndex: number;
  description: string;
}

/**
 * Base type for transitions that affect global or chapter state.
 */

export type TransitionType = 'object_status' | 'relation_state' | string;

export interface TransitionBase {
  type: TransitionType;
}

/**
 * Transition describing an object status change (e.g. lost, destroyed).
 */

export interface ObjectStatusTransition extends TransitionBase {
  type: 'object_status';
  id: string; // object id
  newValue: string;
}

/**
 * Transition describing a relation state change between two characters.
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
 */

// Structure / acts
export interface ActSchema {
  id: string;
  label?: string;
  chapters?: string[];
  chronoIndexStart?: number;
  chronoIndexEnd?: number;
  goal?: string;
}

/**
 * Top-level narrative structure (acts, model name).
 */

export interface StructureSchema {
  model?: string; // e.g. 'three_acts'
  acts?: ActSchema[];
}

/**
 * Aggregated view of project files (bible, timeline, chapters, structure).
 * This type mirrors the on-disk project layout described in PROJECT.md.
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
}
