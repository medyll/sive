/**
 * YAML Store - Svelte 5 Reactive Store
 * 
 * Manages YAML project data with reactive updates.
 * Integrates with MCP tools for data fetching.
 */

import { executeMCPTool } from '$lib/server/mcp/tools';
import type {
	Bible,
	Timeline,
	Structure,
	Themes,
	Narrator,
	ChapterMeta,
	VersionIndex,
	Character,
	TimelineEvent,
	NarrativeThread,
	Theme,
	Motif
} from '$lib/types/yaml-types';

/**
 * YAML Store state
 */
interface YamlStoreState {
	// Project data
	bible: Bible | null;
	timeline: Timeline | null;
	structure: Structure | null;
	themes: Themes | null;
	narrator: Narrator | null;
	
	// Current chapter
	currentChapter: ChapterMeta | null;
	currentChapterContent: string | null;
	
	// Versions
	versionIndex: VersionIndex | null;
	
	// Loading states
	loading: boolean;
	error: string | null;
	
	// Project context
	projectId: string | null;
}

/**
 * Create YAML store with Svelte 5 runes
 */
export function createYamlStore() {
	let state = $state<YamlStoreState>({
		bible: null,
		timeline: null,
		structure: null,
		themes: null,
		narrator: null,
		currentChapter: null,
		currentChapterContent: null,
		versionIndex: null,
		loading: false,
		error: null,
		projectId: null
	});

	/**
	 * Set project context
	 */
	function setProject(projectId: string) {
		state.projectId = projectId;
		state.error = null;
	}

	/**
	 * Load all project YAML files
	 */
	async function loadAll() {
		if (!state.projectId) {
			state.error = 'No project selected';
			return;
		}

		state.loading = true;
		state.error = null;

		try {
			await Promise.all([
				loadBible(),
				loadTimeline(),
				loadStructure(),
				loadThemes(),
				loadNarrator(),
				loadVersionIndex()
			]);
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to load project data';
		} finally {
			state.loading = false;
		}
	}

	/**
	 * Load bible.yaml
	 */
	async function loadBible() {
		if (!state.projectId) return;

		try {
			const result = await executeMCPTool<string, Bible>('read_bible', state.projectId);
			state.bible = result;
		} catch (err) {
			console.error('Failed to load bible:', err);
			throw err;
		}
	}

	/**
	 * Load timeline.yaml
	 */
	async function loadTimeline() {
		if (!state.projectId) return;

		try {
			const result = await executeMCPTool<string, Timeline>('read_timeline', state.projectId);
			state.timeline = result;
		} catch (err) {
			console.error('Failed to load timeline:', err);
			throw err;
		}
	}

	/**
	 * Load structure.yaml
	 */
	async function loadStructure() {
		if (!state.projectId) return;

		try {
			const result = await executeMCPTool<string, Structure>('read_structure', state.projectId);
			state.structure = result;
		} catch (err) {
			console.error('Failed to load structure:', err);
			throw err;
		}
	}

	/**
	 * Load themes.yaml
	 */
	async function loadThemes() {
		if (!state.projectId) return;

		try {
			const result = await executeMCPTool<string, Themes>('read_themes', state.projectId);
			state.themes = result;
		} catch (err) {
			console.error('Failed to load themes:', err);
			throw err;
		}
	}

	/**
	 * Load narrator.yaml
	 */
	async function loadNarrator() {
		if (!state.projectId) return;

		try {
			const result = await executeMCPTool<string, Narrator>('read_narrator', state.projectId);
			state.narrator = result;
		} catch (err) {
			console.error('Failed to load narrator:', err);
			throw err;
		}
	}

	/**
	 * Load version index
	 */
	async function loadVersionIndex() {
		if (!state.projectId) return;

		try {
			const result = await executeMCPTool<string, VersionIndex>('read_version_index', state.projectId);
			state.versionIndex = result;
		} catch (err) {
			console.error('Failed to load version index:', err);
			throw err;
		}
	}

	/**
	 * Load a specific chapter
	 */
	async function loadChapter(chapterId: string) {
		if (!state.projectId) return;

		state.loading = true;

		try {
			const result = await executeMCPTool<[string, string], { md: string; yaml: ChapterMeta }>(
				'read_chapter',
				state.projectId,
				chapterId
			);
			state.currentChapter = result.yaml;
			state.currentChapterContent = result.md;
		} catch (err) {
			console.error('Failed to load chapter:', err);
			state.error = err instanceof Error ? err.message : 'Failed to load chapter';
			throw err;
		} finally {
			state.loading = false;
		}
	}

	/**
	 * Update a character in the bible
	 */
	async function updateCharacter(characterId: string, updates: Partial<Character>) {
		if (!state.projectId) return;

		try {
			if (updates.status) {
				await executeMCPTool('update_status', state.projectId, characterId, 'character', updates.status);
				// Reload bible to get updated data
				await loadBible();
			}
		} catch (err) {
			console.error('Failed to update character:', err);
			throw err;
		}
	}

	/**
	 * Add a timeline event
	 */
	async function addTimelineEvent(event: Omit<TimelineEvent, 'id'>) {
		if (!state.projectId) return;

		try {
			await executeMCPTool('add_timeline_event', state.projectId, event);
			await loadTimeline();
		} catch (err) {
			console.error('Failed to add timeline event:', err);
			throw err;
		}
	}

	/**
	 * Update a narrative thread
	 */
	async function updateThread(threadId: string, updates: { status?: string; resolution?: string }) {
		if (!state.projectId) return;

		try {
			await executeMCPTool('update_narrative_thread', state.projectId, threadId, updates);
			await loadStructure();
		} catch (err) {
			console.error('Failed to update thread:', err);
			throw err;
		}
	}

	/**
	 * Create a new Harden (version)
	 */
	async function createHarden(label: string, message: string): Promise<string> {
		if (!state.projectId) {
			throw new Error('No project selected');
		}

		try {
			const versionId = await executeMCPTool<[string, string, string], string>(
				'create_harden',
				state.projectId,
				label,
				message
			);
			await loadVersionIndex();
			return versionId;
		} catch (err) {
			console.error('Failed to create harden:', err);
			throw err;
		}
	}

	/**
	 * Get characters from bible
	 */
	function getCharacters(): Character[] {
		return state.bible?.characters || [];
	}

	/**
	 * Get timeline events
	 */
	function getTimelineEvents(): TimelineEvent[] {
		return state.timeline?.events || [];
	}

	/**
	 * Get narrative threads
	 */
	function getThreads(): NarrativeThread[] {
		return state.structure?.threads || [];
	}

	/**
	 * Get themes
	 */
	function getThemes(): Theme[] {
		return state.themes?.themes || [];
	}

	/**
	 * Get motifs
	 */
	function getMotifs(): Motif[] {
		return state.themes?.motifs || [];
	}

	/**
	 * Clear all data
	 */
	function clear() {
		state = {
			bible: null,
			timeline: null,
			structure: null,
			themes: null,
			narrator: null,
			currentChapter: null,
			currentChapterContent: null,
			versionIndex: null,
			loading: false,
			error: null,
			projectId: null
		};
	}

	return {
		// State (reactive)
		get bible() { return state.bible; },
		get timeline() { return state.timeline; },
		get structure() { return state.structure; },
		get themes() { return state.themes; },
		get narrator() { return state.narrator; },
		get currentChapter() { return state.currentChapter; },
		get currentChapterContent() { return state.currentChapterContent; },
		get versionIndex() { return state.versionIndex; },
		get loading() { return state.loading; },
		get error() { return state.error; },
		get projectId() { return state.projectId; },

		// Actions
		setProject,
		loadAll,
		loadBible,
		loadTimeline,
		loadStructure,
		loadThemes,
		loadNarrator,
		loadVersionIndex,
		loadChapter,
		updateCharacter,
		addTimelineEvent,
		updateThread,
		createHarden,
		getCharacters,
		getTimelineEvents,
		getThreads,
		getThemes,
		getMotifs,
		clear
	};
}

/**
 * Default store instance
 */
export const yamlStore = createYamlStore();
