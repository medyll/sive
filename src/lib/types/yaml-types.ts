/**
 * YAML File System - TypeScript Types
 * 
 * Type definitions for all YAML data structures used in the project.
 * These types ensure type-safe access to project data via MCP tools.
 */

/**
 * Base entity with ID
 */
export interface BaseEntity {
	id: string;
	created_at?: string;
	updated_at?: string;
}

/**
 * Character entity in the bible
 */
export interface Character extends BaseEntity {
	name: string;
	role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
	description: string;
	status: 'active' | 'inactive' | 'deceased' | 'unknown';
	traits?: string[];
	goals?: string[];
	relationships?: Relationship[];
	first_appearance?: string; // chapter reference
	last_appearance?: string; // chapter reference
}

/**
 * Relationship between characters
 */
export interface Relationship {
	with: string; // character ID or name
	type: string;
	description?: string;
}

/**
 * Object entity in the bible
 */
export interface StoryObject extends BaseEntity {
	name: string;
	description: string;
	significance: 'major' | 'minor' | 'background';
	location?: string;
	owner?: string;
	first_appearance?: string;
}

/**
 * Location entity in the bible
 */
export interface Location extends BaseEntity {
	name: string;
	description: string;
	type: 'interior' | 'exterior' | 'abstract';
	atmosphere?: string;
	significant_events?: string[];
	chapters?: string[];
}

/**
 * Bible.yaml root structure
 */
export interface Bible {
	characters: Character[];
	objects: StoryObject[];
	locations: Location[];
	last_updated: string;
}

/**
 * Timeline event
 */
export interface TimelineEvent extends BaseEntity {
	date: string;
	description: string;
	chapter_ref?: string;
	characters_involved?: string[];
	location?: string;
	event_type: 'major' | 'minor' | 'background';
}

/**
 * Timeline.yaml root structure
 */
export interface Timeline {
	events: TimelineEvent[];
	time_periods?: TimePeriod[];
}

/**
 * Time period for grouping events
 */
export interface TimePeriod extends BaseEntity {
	name: string;
	start_date: string;
	end_date: string;
	description: string;
}

/**
 * Narrative thread
 */
export interface NarrativeThread extends BaseEntity {
	title: string;
	description: string;
	status: 'open' | 'resolved' | 'abandoned';
	resolution?: string;
	chapters: string[];
	related_characters?: string[];
}

/**
 * Act structure
 */
export interface Act extends BaseEntity {
	number: number;
	title: string;
	description: string;
	chapters: string[];
	tension_target?: number; // 1-10 scale
}

/**
 * Structure.yaml root
 */
export interface Structure {
	acts: Act[];
	threads: NarrativeThread[];
	tension_curve?: TensionPoint[];
}

/**
 * Tension curve point
 */
export interface TensionPoint {
	chapter: string;
	level: number; // 1-10
	notes?: string;
}

/**
 * Theme entity
 */
export interface Theme extends BaseEntity {
	name: string;
	description: string;
	symbols?: string[];
	related_motifs?: string[];
}

/**
 * Motif with occurrences
 */
export interface Motif extends BaseEntity {
	id: string;
	name: string;
	description: string;
	theme_ref?: string;
	occurrences: MotifOccurrence[];
}

/**
 * Motif occurrence in a chapter
 */
export interface MotifOccurrence {
	chapter: string;
	notes?: string;
	context?: string;
}

/**
 * Themes.yaml root
 */
export interface Themes {
	themes: Theme[];
	motifs: Motif[];
}

/**
 * Narrator configuration
 */
export interface NarratorConfig {
	pov: 'first_person' | 'third_person_limited' | 'third_person_omniscient' | 'multiple';
	narrator_character?: string;
	reliability: 'reliable' | 'unreliable';
	tone: string;
	register: string;
	notes?: string;
}

/**
 * Narrator.yaml root
 */
export interface Narrator {
	config: NarratorConfig;
	character_voices?: CharacterVoice[];
}

/**
 * Character voice specification
 */
export interface CharacterVoice {
	character: string;
	speech_patterns?: string[];
	vocabulary?: string;
	tics?: string[];
	examples?: string[];
}

/**
 * Chapter YAML structure
 */
export interface ChapterMeta extends BaseEntity {
	title: string;
	number: number;
	act_ref?: string;
	pov_character?: string;
	location?: string;
	date?: string;
	word_count_target?: number;
	tension_level?: number;
	transitions?: string;
	notes?: string;
	status: 'draft' | 'revision' | 'complete';
}

/**
 * Version (Harden) structure
 */
export interface Version extends BaseEntity {
	label: string;
	message: string;
	created_at: string;
	author?: string;
	changes?: string[];
	parent_version?: string;
}

/**
 * Version index
 */
export interface VersionIndex {
	versions: Version[];
	last_updated?: string;
}

/**
 * Project configuration
 */
export interface ProjectConfig extends BaseEntity {
	title: string;
	author: string;
	genre: string[];
	logline: string;
	synopsis?: string;
	target_word_count?: number;
	language: string;
	created_at: string;
	updated_at: string;
}

/**
 * Union type for all YAML entities
 */
export type YamlEntity =
	| Bible
	| Timeline
	| Structure
	| Themes
	| Narrator
	| ChapterMeta
	| Version
	| VersionIndex
	| ProjectConfig;

/**
 * MCP tool result types
 */
export interface MCPReadResult<T = YamlEntity> {
	success: true;
	data: T;
}

export interface MCPErrorResult {
	success: false;
	error: string;
	tool: string;
}

export type MCPResult<T = YamlEntity> = MCPReadResult<T> | MCPErrorResult;

/**
 * Diff result from compare_versions
 */
export interface VersionDiff {
	added: string[];
	removed: string[];
	modified: string[];
}

/**
 * Chapter states extracted from content
 */
export interface ChapterStates {
	characters: string[];
	objects: string[];
	locations: string[];
}

/**
 * Search occurrence result
 */
export interface SearchOccurrence {
	chapter: string;
	line: number;
	context: string;
}
