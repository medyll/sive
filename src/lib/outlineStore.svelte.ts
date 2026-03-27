/**
 * outlineStore — AI-generated document outlines
 *
 * Stores outline sections and subsections for document structure.
 */

const STORAGE_KEY = 'sive:outline';

export interface OutlineSection {
	id: string;
	title: string;
	level: number; // 1 = main section, 2 = subsection, etc.
	content?: string;
	children?: OutlineSection[];
}

export interface OutlineState {
	sections: OutlineSection[];
	documentId: string | null;
	generatedAt: string | null;
	isLoading: boolean;
	error: string | null;
}

const DEFAULT: OutlineState = {
	sections: [],
	documentId: null,
	generatedAt: null,
	isLoading: false,
	error: null
};

function load(): OutlineState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(state: OutlineState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function createOutlineStore() {
	let state = $state<OutlineState>(load());

	/**
	 * Set loading state
	 */
	function setLoading(loading: boolean): void {
		state.isLoading = loading;
		if (loading) {
			state.error = null;
		}
		save(state);
	}

	/**
	 * Set outline sections
	 */
	function setSections(sections: OutlineSection[], documentId: string): void {
		state = {
			sections,
			documentId,
			generatedAt: new Date().toISOString(),
			isLoading: false,
			error: null
		};
		save(state);
	}

	/**
	 * Set error state
	 */
	function setError(error: string): void {
		state.isLoading = false;
		state.error = error;
		save(state);
	}

	/**
	 * Clear outline
	 */
	function clear(): void {
		state = { ...DEFAULT };
		save(state);
	}

	/**
	 * Insert outline at cursor position in document
	 */
	function insertAtCursor(content: string): string {
		const outlineText = state.sections
			.map((section) => {
				const prefix = section.level === 1 ? '# ' : section.level === 2 ? '## ' : '### ';
				return `${prefix}${section.title}`;
			})
			.join('\n\n');

		return outlineText + '\n\n' + content;
	}

	/**
	 * Navigate to section (scroll to heading)
	 */
	function scrollToSection(sectionTitle: string): void {
		// Find heading element and scroll into view
		const heading = document.querySelector(`[data-outline-section="${sectionTitle}"]`);
		if (heading) {
			heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	/**
	 * Get flat list of all sections (for navigation)
	 */
	const flatSections = $derived(
		state.sections.flatMap((section) => [section, ...(section.children ?? [])])
	);

	/**
	 * Get section count
	 */
	const sectionCount = $derived(state.sections.length);

	function reset(): void {
		state = { ...DEFAULT };
		save(state);
	}

	return {
		get state() { return state; },
		get sections() { return state.sections; },
		get flatSections() { return flatSections; },
		get sectionCount() { return sectionCount; },
		get isLoading() { return state.isLoading; },
		get error() { return state.error; },
		setLoading,
		setSections,
		setError,
		clear,
		insertAtCursor,
		scrollToSection,
		reset
	};
}

export const outlineStore = createOutlineStore();
