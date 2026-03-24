/**
 * Slash command utilities for the editor
 */

export interface SlashCommand {
	id: string;
	label: string;
	icon: string;
	keywords: string[];
	format: string; // maps to FormatType or special
}

export const SLASH_COMMANDS: SlashCommand[] = [
	{ id: 'bold',    label: 'Bold',      icon: 'B',  keywords: ['bold', 'b'],    format: 'bold' },
	{ id: 'italic',  label: 'Italic',    icon: 'I',  keywords: ['italic', 'i'],  format: 'italic' },
	{ id: 'h1',      label: 'Heading 1', icon: 'H1', keywords: ['h1', 'heading', 'title'],  format: 'h1' },
	{ id: 'h2',      label: 'Heading 2', icon: 'H2', keywords: ['h2', 'subheading', 'sub'], format: 'h2' },
	{ id: 'bullet',  label: 'Bullet list', icon: '•', keywords: ['bullet', 'list', 'ul'],   format: 'bullet' },
	{ id: 'divider', label: 'Divider',   icon: '—',  keywords: ['divider', 'hr', 'line'],   format: 'divider' },
];

export interface ParsedSlash {
	command: string;
	query: string;
	startIndex: number;
}

/**
 * Parse a slash command from text at cursor position.
 * Returns null if no active slash command detected.
 * Only triggers when `/` is at the start of a line or after whitespace.
 */
export function parseSlashCommand(text: string, cursorPos?: number): ParsedSlash | null {
	const t = cursorPos !== undefined ? text.slice(0, cursorPos) : text;
	// Find the last `/` that is at start or after whitespace
	const match = t.match(/(^|[\s\n])(\/(\w*))$/);
	if (!match) return null;
	const slashToken = match[2]; // e.g. "/bold"
	const query = match[3];     // e.g. "bold"
	const startIndex = t.lastIndexOf(slashToken);
	return { command: query, query, startIndex };
}

/** Filter commands by query string */
export function filterSlashCommands(query: string): SlashCommand[] {
	if (!query) return SLASH_COMMANDS;
	const q = query.toLowerCase();
	return SLASH_COMMANDS.filter(
		(c) => c.id.startsWith(q) || c.keywords.some((k) => k.startsWith(q))
	);
}

// ── Recently used templates ─────────────────────────────────────────────────
const RECENTS_KEY = 'sive:templates:recents';
const MAX_TEMPLATE_RECENTS = 3;

export function getRecentTemplates(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
	} catch { return []; }
}

export function addRecentTemplate(id: string): void {
	if (typeof localStorage === 'undefined') return;
	const recents = [id, ...getRecentTemplates().filter((r) => r !== id)].slice(0, MAX_TEMPLATE_RECENTS);
	localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
}
