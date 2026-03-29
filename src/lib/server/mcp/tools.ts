/**
 * MCP Tools Foundation — Read/Write Operations
 * 
 * Core MCP (Model Context Protocol) tools for AI access to project data.
 * These tools provide atomic read/write operations on the project file system.
 * 
 * @module mcp/tools
 */

import { readFileSync, existsSync, readdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

// Project root for MCP operations (configured via env)
const PROJECT_ROOT = process.env.MCP_PROJECT_ROOT || './projects';

/**
 * Read operations — atomic file reads
 */

/**
 * Loads the complete bible.yaml
 * @param projectId - The project identifier
 * @returns Bible content as string
 */
export function readBible(projectId: string): string {
	const path = join(PROJECT_ROOT, projectId, 'bible.yaml');
	if (!existsSync(path)) {
		throw new Error(`bible.yaml not found for project: ${projectId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Loads the timeline.yaml
 * @param projectId - The project identifier
 * @returns Timeline content as string
 */
export function readTimeline(projectId: string): string {
	const path = join(PROJECT_ROOT, projectId, 'timeline.yaml');
	if (!existsSync(path)) {
		throw new Error(`timeline.yaml not found for project: ${projectId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Loads the structure.yaml (acts, threads, tension curve)
 * @param projectId - The project identifier
 * @returns Structure content as string
 */
export function readStructure(projectId: string): string {
	const path = join(PROJECT_ROOT, projectId, 'structure.yaml');
	if (!existsSync(path)) {
		throw new Error(`structure.yaml not found for project: ${projectId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Loads the themes.yaml
 * @param projectId - The project identifier
 * @returns Themes content as string
 */
export function readThemes(projectId: string): string {
	const path = join(PROJECT_ROOT, projectId, 'themes.yaml');
	if (!existsSync(path)) {
		throw new Error(`themes.yaml not found for project: ${projectId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Loads the narrator.yaml
 * @param projectId - The project identifier
 * @returns Narrator content as string
 */
export function readNarrator(projectId: string): string {
	const path = join(PROJECT_ROOT, projectId, 'narrator.yaml');
	if (!existsSync(path)) {
		throw new Error(`narrator.yaml not found for project: ${projectId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Loads a chapter's .md + .yaml
 * @param projectId - The project identifier
 * @param chapterId - The chapter identifier (e.g., 'chapter_01')
 * @returns Chapter content with metadata
 */
export function readChapter(projectId: string, chapterId: string): { md: string; yaml: string } {
	const basePath = join(PROJECT_ROOT, projectId, 'chapters', chapterId);
	const mdPath = `${basePath}.md`;
	const yamlPath = `${basePath}.yaml`;

	if (!existsSync(mdPath)) {
		throw new Error(`Chapter markdown not found: ${chapterId}`);
	}

	const md = readFileSync(mdPath, 'utf-8');
	const yaml = existsSync(yamlPath) ? readFileSync(yamlPath, 'utf-8') : '';

	return { md, yaml };
}

/**
 * Loads a character's expanded sheet
 * @param projectId - The project identifier
 * @param characterId - The character identifier
 * @returns Character sheet content as string
 */
export function readCharacterSheet(projectId: string, characterId: string): string {
	const path = join(PROJECT_ROOT, projectId, 'characters', `${characterId}.yaml`);
	if (!existsSync(path)) {
		throw new Error(`Character sheet not found: ${characterId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Returns the ordered list of project chapters
 * @param projectId - The project identifier
 * @returns Array of chapter IDs in order
 */
export function listChapters(projectId: string): string[] {
	const chaptersDir = join(PROJECT_ROOT, projectId, 'chapters');
	if (!existsSync(chaptersDir)) {
		throw new Error(`Chapters directory not found for project: ${projectId}`);
	}

	const files = readdirSync(chaptersDir);
	return files
		.filter((f) => f.endsWith('.md') || f.endsWith('.yaml'))
		.map((f) => f.replace(/\.(md|yaml)$/, ''))
		.filter((name, index, arr) => arr.indexOf(name) === index) // dedupe
		.sort();
}

/**
 * Loads a complete archived Harden (version)
 * @param projectId - The project identifier
 * @param versionId - The version identifier (e.g., 'h001')
 * @returns Version content
 */
export function readVersion(projectId: string, versionId: string): string {
	const path = join(PROJECT_ROOT, projectId, '.harden', `${versionId}.yaml`);
	if (!existsSync(path)) {
		throw new Error(`Version not found: ${versionId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Loads the version index from .harden/index.yaml
 * @param projectId - The project identifier
 * @returns Version index content as string
 */
export function readVersionIndex(projectId: string): string {
	const path = join(PROJECT_ROOT, projectId, '.harden', 'index.yaml');
	if (!existsSync(path)) {
		throw new Error(`Version index not found for project: ${projectId}`);
	}
	return readFileSync(path, 'utf-8');
}

/**
 * Write operations — atomic file writes
 */

/**
 * Adds a transition to a chapter's .yaml
 * @param projectId - The project identifier
 * @param chapterId - The chapter identifier
 * @param transition - Transition data to add
 */
export function writeTransition(projectId: string, chapterId: string, transition: string): void {
	const yamlPath = join(PROJECT_ROOT, projectId, 'chapters', `${chapterId}.yaml`);
	
	if (!existsSync(yamlPath)) {
		// Create new yaml file with transition
		const content = `transition: |\n  ${transition.replace(/\n/g, '\n  ')}`;
		writeFileSync(yamlPath, content, 'utf-8');
	} else {
		// Append transition to existing file
		appendFileSync(yamlPath, `\ntransition: |\n  ${transition.replace(/\n/g, '\n  ')}`, 'utf-8');
	}
}

/**
 * Updates a status in bible.yaml
 * @param projectId - The project identifier
 * @param entityId - Entity identifier (character, object, etc.)
 * @param entityType - Type of entity ('character', 'object', 'location')
 * @param value - New status value
 */
export function updateStatus(
	projectId: string,
	entityId: string,
	entityType: string,
	value: string
): void {
	const biblePath = join(PROJECT_ROOT, projectId, 'bible.yaml');
	
	if (!existsSync(biblePath)) {
		throw new Error(`bible.yaml not found for project: ${projectId}`);
	}

	const content = readFileSync(biblePath, 'utf-8');
	
	// Simple status update - in production, use proper YAML parsing
	const statusPattern = new RegExp(
		`(${entityType}s?:\\s*\\n\\s*-\\s*name:\\s*${entityId}\\s*\\n\\s*status:\\s*).*`,
		'm'
	);
	
	if (statusPattern.test(content)) {
		const updated = content.replace(statusPattern, `$1${value}`);
		writeFileSync(biblePath, updated, 'utf-8');
	} else {
		throw new Error(`Entity ${entityId} not found in bible.yaml`);
	}
}

/**
 * Adds an event to timeline.yaml
 * @param projectId - The project identifier
 * @param event - Event data with date, description, etc.
 */
export function addTimelineEvent(projectId: string, event: { date: string; description: string; chapterRef?: string }): void {
	const timelinePath = join(PROJECT_ROOT, projectId, 'timeline.yaml');
	
	const eventYaml = `
- date: ${event.date}
  description: ${event.description}${event.chapterRef ? `\n  chapter_ref: ${event.chapterRef}` : ''}`;

	if (!existsSync(timelinePath)) {
		writeFileSync(timelinePath, `events:${eventYaml}`, 'utf-8');
	} else {
		appendFileSync(timelinePath, eventYaml, 'utf-8');
	}
}

/**
 * Adds a character entry to bible.yaml
 * @param projectId - The project identifier
 * @param character - Character data
 */
export function addCharacter(
	projectId: string,
	character: { name: string; role?: string; description?: string; status?: string }
): void {
	const biblePath = join(PROJECT_ROOT, projectId, 'bible.yaml');
	
	const charYaml = `
- name: ${character.name}
  role: ${character.role || 'supporting'}
  description: ${character.description || ''}
  status: ${character.status || 'active'}`;

	if (!existsSync(biblePath)) {
		writeFileSync(biblePath, `characters:${charYaml}`, 'utf-8');
	} else {
		const content = readFileSync(biblePath, 'utf-8');
		if (content.includes('characters:')) {
			appendFileSync(biblePath, charYaml, 'utf-8');
		} else {
			appendFileSync(biblePath, `\ncharacters:${charYaml}`, 'utf-8');
		}
	}
}

/**
 * Updates a narrative thread's state in structure.yaml
 * @param projectId - The project identifier
 * @param threadId - Thread identifier
 * @param data - New thread data
 */
export function updateNarrativeThread(
	projectId: string,
	threadId: string,
	data: { status?: string; resolution?: string; chapters?: string[] }
): void {
	const structurePath = join(PROJECT_ROOT, projectId, 'structure.yaml');
	
	if (!existsSync(structurePath)) {
		throw new Error(`structure.yaml not found for project: ${projectId}`);
	}

	const content = readFileSync(structurePath, 'utf-8');
	
	// Simple update - in production, use proper YAML parsing
	let updated = content;
	
	if (data.status) {
		const statusPattern = new RegExp(
			`(threads?:\\s*\\n\\s*-\\s*id:\\s*${threadId}\\s*\\n\\s*status:\\s*).*`,
			'm'
		);
		updated = updated.replace(statusPattern, `$1${data.status}`);
	}
	
	if (data.resolution) {
		const resolutionPattern = new RegExp(
			`(threads?:\\s*\\n\\s*-\\s*id:\\s*${threadId}\\s*\\n\\s*resolution:\\s*).*`,
			'm'
		);
		updated = updated.replace(resolutionPattern, `$1${data.resolution}`);
	}
	
	writeFileSync(structurePath, updated, 'utf-8');
}

/**
 * Records a motif occurrence in themes.yaml
 * @param projectId - The project identifier
 * @param motifId - Motif identifier
 * @param chapterRef - Chapter reference
 * @param notes - Optional notes about the occurrence
 */
export function addMotifOccurrence(
	projectId: string,
	motifId: string,
	chapterRef: string,
	notes?: string
): void {
	const themesPath = join(PROJECT_ROOT, projectId, 'themes.yaml');
	
	const occurrenceYaml = `
    - chapter: ${chapterRef}
      notes: ${notes || ''}`;

	if (!existsSync(themesPath)) {
		writeFileSync(themesPath, `themes:\n  - id: ${motifId}\n    occurrences:${occurrenceYaml}`, 'utf-8');
	} else {
		const content = readFileSync(themesPath, 'utf-8');
		
		// Try to append to existing motif
		const motifPattern = new RegExp(`(id:\\s*${motifId}\\s*\\n\\s*occurrences:)`, 'm');
		
		if (motifPattern.test(content)) {
			const updated = content.replace(motifPattern, `$1${occurrenceYaml}`);
			writeFileSync(themesPath, updated, 'utf-8');
		} else {
			// Add new motif with occurrence
			appendFileSync(themesPath, `\n- id: ${motifId}\n  occurrences:${occurrenceYaml}`, 'utf-8');
		}
	}
}

/**
 * Utility: Parse YAML content into JSON
 * @param yamlContent - YAML string
 * @returns Parsed object
 */
export function parseYaml<T>(yamlContent: string): T {
		const lines = yamlContent.split('\n');
		const result: Record<string, unknown> = {};
		
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith('#')) {
				const [key, ...valueParts] = trimmed.split(':');
				if (key && valueParts.length > 0) {
					result[key.trim()] = valueParts.join(':').trim();
				}
			}
		}
		
		return result as T;
	} catch (err) {
		throw new Error(`Failed to parse YAML: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
}

/**
 * Analysis operations — diff, state extraction, word count, search
 */

/**
 * Calculates the diff between two versions
 * @param projectId - The project identifier
 * @param versionA - First version ID
 * @param versionB - Second version ID
 * @returns Diff result with changes
 */
export function compareVersions(
	projectId: string,
	versionA: string,
	versionB: string
): { added: string[]; removed: string[]; modified: string[] } {
	const versionAPath = join(PROJECT_ROOT, projectId, '.harden', `${versionA}.yaml`);
	const versionBPath = join(PROJECT_ROOT, projectId, '.harden', `${versionB}.yaml`);

	if (!existsSync(versionAPath)) {
		throw new Error(`Version not found: ${versionA}`);
	}
	if (!existsSync(versionBPath)) {
		throw new Error(`Version not found: ${versionB}`);
	}

	const contentA = readFileSync(versionAPath, 'utf-8');
	const contentB = readFileSync(versionBPath, 'utf-8');

	// Simple line-by-line diff - in production, use a proper diff library
	const linesA = contentA.split('\n');
	const linesB = contentB.split('\n');

	const added = linesB.filter((line) => !linesA.includes(line));
	const removed = linesA.filter((line) => !linesB.includes(line));
	const modified: string[] = [];

	// Detect modified lines (same index, different content)
	linesA.forEach((lineA, index) => {
		if (index < linesB.length && lineA !== linesB[index] && !removed.includes(lineA)) {
			modified.push(`Line ${index + 1}: "${lineA.substring(0, 50)}..." → "${linesB[index].substring(0, 50)}..."`);
		}
	});

	return { added, removed, modified };
}

/**
 * Extracts all character/object states from a chapter
 * @param projectId - The project identifier
 * @param chapterId - The chapter identifier
 * @returns Extracted states
 */
export function extractChapterStates(
	projectId: string,
	chapterId: string
): { characters: string[]; objects: string[]; locations: string[] } {
	const { md, yaml } = readChapter(projectId, chapterId);

	// Simple extraction - in production, use proper parsing
	const characters: string[] = [];
	const objects: string[] = [];
	const locations: string[] = [];

	// Extract from markdown content (naive approach - look for capitalized words)
	const wordRegex = /\b[A-Z][a-z]+\b/g;
	const words = md.match(wordRegex) || [];

	// Count word occurrences (potential entities)
	const wordCount: Record<string, number> = {};
	words.forEach((word) => {
		wordCount[word] = (wordCount[word] || 0) + 1;
	});

	// Filter to likely character names (appear multiple times)
	Object.entries(wordCount)
		.filter(([_, count]) => count >= 2)
		.forEach(([word]) => {
			// Heuristic: characters are often mentioned 3+ times
			if (wordCount[word] >= 3) {
				characters.push(word);
			} else if (wordCount[word] >= 2) {
				objects.push(word);
			}
		});

	// Extract locations from chapter YAML if present
	if (yaml) {
		const locationMatch = yaml.match(/location:\s*(.+)/i);
		if (locationMatch) {
			locations.push(locationMatch[1].trim());
		}
	}

	return { characters, objects, locations };
}

/**
 * Counts words in the specified scope
 * @param projectId - The project identifier
 * @param scope - Scope: 'chapter', 'volume', 'project'
 * @param chapterId - Optional chapter ID for chapter scope
 * @returns Word count
 */
export function countWords(
	projectId: string,
	scope: 'chapter' | 'volume' | 'project',
	chapterId?: string
): number {
	if (scope === 'chapter' && !chapterId) {
		throw new Error('chapterId required for chapter scope');
	}

	let totalWords = 0;

	if (scope === 'chapter') {
		const { md } = readChapter(projectId, chapterId!);
		totalWords = md.trim().split(/\s+/).length;
	} else if (scope === 'project') {
		const chapters = listChapters(projectId);
		for (const chapter of chapters) {
			const { md } = readChapter(projectId, chapter);
			totalWords += md.trim().split(/\s+/).length;
		}
	}

	return totalWords;
}

/**
 * Finds all occurrences of a term in the project
 * @param projectId - The project identifier
 * @param term - Term to search for
 * @param scope - Optional scope: 'chapter', 'project'
 * @returns Array of occurrences with context
 */
export function searchOccurrences(
	projectId: string,
	term: string,
	scope: 'chapter' | 'project' = 'project'
): Array<{ chapter: string; line: number; context: string }> {
	const occurrences: Array<{ chapter: string; line: number; context: string }> = [];

	const chapters = scope === 'chapter' 
		? [listChapters(projectId)[0]] 
		: listChapters(projectId);

	for (const chapter of chapters) {
		const { md } = readChapter(projectId, chapter);
		const lines = md.split('\n');

		lines.forEach((line, index) => {
			if (line.toLowerCase().includes(term.toLowerCase())) {
				occurrences.push({
					chapter,
					line: index + 1,
					context: line.trim().substring(0, 100)
				});
			}
		});
	}

	return occurrences;
}

/**
 * Versioning operations — create, restore, manage Hardens
 */

/**
 * Triggers a versioning snapshot (Harden)
 * @param projectId - The project identifier
 * @param label - Version label
 * @param message - Commit message
 * @returns New version ID
 */
export function createHarden(projectId: string, label: string, message: string): string {
	const hardenDir = join(PROJECT_ROOT, projectId, '.harden');
	
	if (!existsSync(hardenDir)) {
		throw new Error(`Harden directory not found for project: ${projectId}`);
	}

	// Generate new version ID (e.g., h001, h002)
	const indexContent = readVersionIndex(projectId);
	const index = parseYaml<{ versions: Array<{ id: string }> }>(indexContent);
	const versionCount = index.versions?.length || 0;
	const newVersionId = `h${String(versionCount + 1).padStart(3, '0')}`;

	// Create version file
	const versionPath = join(hardenDir, `${newVersionId}.yaml`);
	const versionData = `id: ${newVersionId}
label: ${label}
message: ${message}
created_at: ${new Date().toISOString()}
`;
	writeFileSync(versionPath, versionData, 'utf-8');

	// Update index
	const newIndex = `\n- id: ${newVersionId}
  label: ${label}
  message: ${message}
  created_at: ${new Date().toISOString()}`;
	appendFileSync(join(hardenDir, 'index.yaml'), newIndex, 'utf-8');

	return newVersionId;
}

/**
 * Restores a Harden as the current version
 * @param projectId - The project identifier
 * @param versionId - Version ID to restore
 */
export function restoreVersion(projectId: string, versionId: string): void {
	const versionPath = join(PROJECT_ROOT, projectId, '.harden', `${versionId}.yaml`);
	
	if (!existsSync(versionPath)) {
		throw new Error(`Version not found: ${versionId}`);
	}

	// In production, this would restore the project state from the version
	// For MVP, we just verify the version exists
	console.log(`[MCP] Restoring version ${versionId} for project ${projectId}`);
}

/**
 * Tool registry — maps tool names to implementations
 * Used by the Skill Engine to resolve tool calls
 */
export const MCP_TOOLS = {
	// Read operations
	read_bible: readBible,
	read_timeline: readTimeline,
	read_structure: readStructure,
	read_themes: readThemes,
	read_narrator: readNarrator,
	read_chapter: readChapter,
	read_character_sheet: readCharacterSheet,
	list_chapters: listChapters,
	read_version: readVersion,
	read_version_index: readVersionIndex,
	
	// Write operations
	write_transition: writeTransition,
	update_status: updateStatus,
	add_timeline_event: addTimelineEvent,
	add_character: addCharacter,
	update_narrative_thread: updateNarrativeThread,
	add_motif_occurrence: addMotifOccurrence,
	
	// Analysis operations
	compare_versions: compareVersions,
	extract_chapter_states: extractChapterStates,
	count_words: countWords,
	search_occurrences: searchOccurrences,
	
	// Versioning operations
	create_harden: createHarden,
	restore_version: restoreVersion,
	
	// Utilities
	parse_yaml: parseYaml
} as const;

/**
 * Type definition for MCP tool functions
 */
export type MCPToolFunction = (...args: unknown[]) => unknown;

/**
 * Type definition for MCP tool registry
 */
export type MCPToolRegistry = typeof MCP_TOOLS;

/**
 * Execute an MCP tool by name
 * @param toolName - Name of the tool to execute
 * @param args - Arguments to pass to the tool
 * @returns Tool execution result
 */
export function executeMCPTool<K extends keyof MCPToolRegistry>(
	toolName: K,
	...args: Parameters<MCPToolRegistry[K]>
): ReturnType<MCPToolRegistry[K]> {
	const tool = MCP_TOOLS[toolName];
	if (!tool) {
		throw new Error(`Unknown MCP tool: ${String(toolName)}`);
	}
	return tool(...args);
}
