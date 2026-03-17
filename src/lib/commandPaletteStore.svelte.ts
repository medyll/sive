/**
 * Command palette store — state, navigation, execution, recents
 */

import { searchCommands, getCommand, type Command } from './commandRegistry';

const STORAGE_KEY = 'sive:palette:recents';
const MAX_RECENTS = 5;

interface PaletteState {
	open: boolean;
	query: string;
	results: Command[];
	selectedIndex: number;
	recentIds: string[];
}

function loadRecents(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
	} catch {
		return [];
	}
}

function saveRecents(ids: string[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

let state = $state<PaletteState>({
	open: false,
	query: '',
	results: [],
	selectedIndex: 0,
	recentIds: loadRecents()
});

function computeResults(query: string): Command[] {
	if (!query.trim()) {
		// Show recent commands when empty
		const recents = state.recentIds
			.map((id) => getCommand(id))
			.filter((c): c is Command => c !== null && c !== undefined)
			.slice(0, MAX_RECENTS);
		return recents.length > 0 ? recents : searchCommands('');
	}
	return searchCommands(query);
}

export function openPalette(): void {
	state.open = true;
	state.query = '';
	state.results = computeResults('');
	state.selectedIndex = 0;
}

export function closePalette(): void {
	state.open = false;
	state.query = '';
	state.results = [];
	state.selectedIndex = 0;
}

export function togglePalette(): void {
	if (state.open) closePalette();
	else openPalette();
}

export function setQuery(q: string): void {
	state.query = q;
	state.results = computeResults(q);
	state.selectedIndex = 0;
}

export function selectNext(): void {
	if (state.results.length === 0) return;
	state.selectedIndex = (state.selectedIndex + 1) % state.results.length;
}

export function selectPrev(): void {
	if (state.results.length === 0) return;
	state.selectedIndex =
		(state.selectedIndex - 1 + state.results.length) % state.results.length;
}

export async function executeSelected(): Promise<void> {
	const cmd = state.results[state.selectedIndex];
	if (!cmd) return;

	// Add to recents (deduplicated, capped at MAX_RECENTS)
	const newRecents = [cmd.id, ...state.recentIds.filter((id) => id !== cmd.id)].slice(
		0,
		MAX_RECENTS
	);
	state.recentIds = newRecents;
	saveRecents(newRecents);

	closePalette();
	await cmd.action();
}

export function executeCommand(id: string): void {
	const cmd = getCommand(id);
	if (!cmd) return;
	closePalette();
	cmd.action();
}

export { state as paletteState };
