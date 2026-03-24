/**
 * Command registry for the Cmd+K palette
 * Commands are registered statically at startup and dynamically per context
 */

export type CommandCategory = 'navigation' | 'document' | 'ai' | 'settings' | 'view';

export interface Command {
	id: string;
	label: string;
	keywords: string[];
	category: CommandCategory;
	icon?: string;
	shortcut?: string;
	action: () => void | Promise<void>;
}

const registry = new Map<string, Command>();

export function registerCommand(cmd: Command): void {
	registry.set(cmd.id, cmd);
}

export function unregisterCommand(id: string): void {
	registry.delete(id);
}

export function getCommand(id: string): Command | undefined {
	return registry.get(id);
}

export function getAllCommands(): Command[] {
	return Array.from(registry.values());
}

/** Simple fuzzy match: every char in query appears in order in target */
function fuzzyMatch(query: string, target: string): boolean {
	const q = query.toLowerCase();
	const t = target.toLowerCase();
	let qi = 0;
	for (let ti = 0; ti < t.length && qi < q.length; ti++) {
		if (t[ti] === q[qi]) qi++;
	}
	return qi === q.length;
}

/** Score: lower is better. Exact prefix > contains > fuzzy */
function score(query: string, text: string): number {
	const q = query.toLowerCase();
	const t = text.toLowerCase();
	if (t.startsWith(q)) return 0;
	if (t.includes(q)) return 1;
	if (fuzzyMatch(q, t)) return 2;
	return 99;
}

export function searchCommands(query: string): Command[] {
	const all = getAllCommands();
	if (!query.trim()) return all;

	return all
		.map((cmd) => {
			const labelScore = score(query, cmd.label);
			const keywordScore = Math.min(...cmd.keywords.map((k) => score(query, k)));
			const best = Math.min(labelScore, keywordScore);
			return { cmd, score: best };
		})
		.filter((r) => r.score < 99)
		.sort((a, b) => a.score - b.score || a.cmd.label.localeCompare(b.cmd.label))
		.map((r) => r.cmd);
}

// ── Static command registrations ──────────────────────────────────────────

export function registerStaticCommands(navigate: (path: string) => void) {
	const cmds: Command[] = [
		// Navigation
		{
			id: 'nav:app',
			label: 'Go to Editor',
			keywords: ['editor', 'app', 'home', 'write'],
			category: 'navigation',
			icon: '✏️',
			action: () => navigate('/app')
		},
		{
			id: 'nav:dashboard',
			label: 'Go to Dashboard',
			keywords: ['dashboard', 'stats', 'analytics', 'writing'],
			category: 'navigation',
			icon: '📊',
			action: () => navigate('/dashboard')
		},
		{
			id: 'nav:settings',
			label: 'Go to Settings',
			keywords: ['settings', 'preferences', 'config'],
			category: 'navigation',
			icon: '⚙️',
			shortcut: 'Cmd+,',
			action: () => navigate('/settings')
		},
		{
			id: 'nav:profile',
			label: 'Go to Profile',
			keywords: ['profile', 'account', 'user'],
			category: 'navigation',
			icon: '👤',
			action: () => navigate('/profile')
		},

		// Document actions
		{
			id: 'doc:new',
			label: 'New Document',
			keywords: ['new', 'create', 'document', 'file'],
			category: 'document',
			icon: '📄',
			shortcut: 'Cmd+N',
			action: () => window.dispatchEvent(new CustomEvent('palette:newDocument'))
		},
		{
			id: 'doc:new:template',
			label: 'New from Template',
			keywords: ['template', 'new', 'starter', 'story', 'blog', 'essay'],
			category: 'document',
			icon: '📋',
			action: () => window.dispatchEvent(new CustomEvent('palette:newFromTemplate'))
		},
		{
			id: 'doc:save:template',
			label: 'Save as Template',
			keywords: ['template', 'save', 'custom'],
			category: 'document',
			icon: '💾',
			action: () => window.dispatchEvent(new CustomEvent('palette:saveAsTemplate'))
		},
		{
			id: 'doc:export:pdf',
			label: 'Export as PDF',
			keywords: ['export', 'pdf', 'download', 'print'],
			category: 'document',
			icon: '📑',
			action: () => window.dispatchEvent(new CustomEvent('palette:exportPDF'))
		},
		{
			id: 'doc:export:markdown',
			label: 'Export as Markdown',
			keywords: ['export', 'markdown', 'md', 'download'],
			category: 'document',
			icon: '📝',
			action: () => window.dispatchEvent(new CustomEvent('palette:exportMarkdown'))
		},
		{
			id: 'doc:duplicate',
			label: 'Duplicate Document',
			keywords: ['duplicate', 'copy', 'clone'],
			category: 'document',
			icon: '⧉',
			action: () => window.dispatchEvent(new CustomEvent('palette:duplicateDocument'))
		},
		{
			id: 'doc:delete',
			label: 'Delete Document',
			keywords: ['delete', 'remove', 'trash'],
			category: 'document',
			icon: '🗑️',
			action: () => window.dispatchEvent(new CustomEvent('palette:deleteDocument'))
		},

		// AI actions
		{
			id: 'ai:summarize',
			label: 'Summarize Document',
			keywords: ['summarize', 'summary', 'ai', 'tldr'],
			category: 'ai',
			icon: '✨',
			action: () => window.dispatchEvent(new CustomEvent('palette:summarize'))
		},
		{
			id: 'ai:chat',
			label: 'Open AI Chat',
			keywords: ['chat', 'ai', 'ask', 'assistant'],
			category: 'ai',
			icon: '💬',
			action: () => window.dispatchEvent(new CustomEvent('palette:openAIChat'))
		},
		{
			id: 'ai:suggest',
			label: 'Get AI Writing Suggestion',
			keywords: ['suggest', 'autocomplete', 'complete', 'ai', 'ghost'],
			category: 'ai',
			icon: '🔮',
			action: () => window.dispatchEvent(new CustomEvent('palette:aiSuggest'))
		},

		// View / settings
		{
			id: 'view:focus',
			label: 'Toggle Focus Mode',
			keywords: ['focus', 'distraction', 'fullscreen', 'zen'],
			category: 'view',
			icon: '🎯',
			shortcut: 'Cmd+Shift+F',
			action: () => window.dispatchEvent(new CustomEvent('palette:toggleFocus'))
		},
		{
			id: 'view:shortcuts',
			label: 'Keyboard Shortcuts',
			keywords: ['shortcuts', 'keyboard', 'hotkeys', 'help'],
			category: 'view',
			icon: '⌨️',
			shortcut: '?',
			action: () => window.dispatchEvent(new CustomEvent('palette:showShortcuts'))
		},
		{
			id: 'view:theme',
			label: 'Toggle Dark Mode',
			keywords: ['dark', 'light', 'theme', 'mode'],
			category: 'view',
			icon: '🌙',
			action: () => window.dispatchEvent(new CustomEvent('palette:toggleTheme'))
		},
		{
			id: 'doc:search',
			label: 'Search Documents',
			keywords: ['search', 'find', 'filter', 'documents', 'list'],
			category: 'document',
			icon: '🔍',
			shortcut: 'Ctrl+Shift+F',
			action: () => window.dispatchEvent(new CustomEvent('palette:focusSearch'))
		}
	];

	for (const cmd of cmds) registerCommand(cmd);
}
