import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	openPalette, closePalette, togglePalette,
	setQuery, selectNext, selectPrev,
	executeSelected, paletteState
} from './commandPaletteStore.svelte';
import { registerCommand, unregisterCommand } from './commandRegistry';

beforeEach(() => {
	closePalette();
	unregisterCommand('palette:test:1');
	unregisterCommand('palette:test:2');
	unregisterCommand('palette:test:3');
	if (typeof window !== 'undefined') localStorage.clear();
});

describe('open / close / toggle', () => {
	it('opens palette', () => {
		openPalette();
		expect(paletteState.open).toBe(true);
	});

	it('closes palette', () => {
		openPalette();
		closePalette();
		expect(paletteState.open).toBe(false);
	});

	it('toggle: closed → opens', () => {
		closePalette();
		togglePalette();
		expect(paletteState.open).toBe(true);
	});

	it('toggle: open → closes', () => {
		openPalette();
		togglePalette();
		expect(paletteState.open).toBe(false);
	});

	it('resets query on open', () => {
		setQuery('something');
		closePalette();
		openPalette();
		expect(paletteState.query).toBe('');
	});

	it('resets selectedIndex on open', () => {
		openPalette();
		selectNext();
		closePalette();
		openPalette();
		expect(paletteState.selectedIndex).toBe(0);
	});
});

describe('setQuery', () => {
	it('updates query state', () => {
		openPalette();
		setQuery('test');
		expect(paletteState.query).toBe('test');
	});

	it('resets selectedIndex to 0', () => {
		openPalette();
		selectNext();
		setQuery('new query');
		expect(paletteState.selectedIndex).toBe(0);
	});
});

describe('keyboard navigation', () => {
	beforeEach(() => {
		registerCommand({ id: 'palette:test:1', label: 'Alpha', keywords: [], category: 'navigation', action: () => {} });
		registerCommand({ id: 'palette:test:2', label: 'Beta', keywords: [], category: 'navigation', action: () => {} });
		registerCommand({ id: 'palette:test:3', label: 'Gamma', keywords: [], category: 'navigation', action: () => {} });
		openPalette();
	});

	it('selectNext increments index', () => {
		expect(paletteState.selectedIndex).toBe(0);
		selectNext();
		expect(paletteState.selectedIndex).toBe(1);
	});

	it('selectNext wraps around', () => {
		const len = paletteState.results.length;
		for (let i = 0; i < len; i++) selectNext();
		expect(paletteState.selectedIndex).toBe(0);
	});

	it('selectPrev wraps to end', () => {
		selectPrev();
		expect(paletteState.selectedIndex).toBe(paletteState.results.length - 1);
	});
});

describe('executeSelected', () => {
	it('runs the selected command action', async () => {
		const ran = vi.fn();
		registerCommand({ id: 'palette:test:1', label: 'Test', keywords: [], category: 'navigation', action: ran });
		openPalette();
		setQuery('Test');
		paletteState.selectedIndex = 0;
		await executeSelected();
		expect(ran).toHaveBeenCalled();
	});

	it('closes palette after execution', async () => {
		const ran = vi.fn();
		registerCommand({ id: 'palette:test:1', label: 'Test', keywords: [], category: 'navigation', action: ran });
		openPalette();
		setQuery('Test');
		await executeSelected();
		expect(paletteState.open).toBe(false);
	});

	it('adds executed command to recents', async () => {
		registerCommand({ id: 'palette:test:1', label: 'Test', keywords: [], category: 'navigation', action: () => {} });
		openPalette();
		setQuery('Test');
		await executeSelected();
		expect(paletteState.recentIds).toContain('palette:test:1');
	});

	it('caps recents at 5', async () => {
		for (let i = 1; i <= 7; i++) {
			registerCommand({ id: `palette:test:${i}`, label: `Cmd${i}`, keywords: [], category: 'navigation', action: () => {} });
			openPalette();
			setQuery(`Cmd${i}`);
			await executeSelected();
		}
		expect(paletteState.recentIds.length).toBeLessThanOrEqual(5);
	});

	it('deduplicates recents', async () => {
		registerCommand({ id: 'palette:test:1', label: 'Test', keywords: [], category: 'navigation', action: () => {} });
		openPalette(); setQuery('Test'); await executeSelected();
		openPalette(); setQuery('Test'); await executeSelected();
		const count = paletteState.recentIds.filter((id) => id === 'palette:test:1').length;
		expect(count).toBe(1);
	});
});
