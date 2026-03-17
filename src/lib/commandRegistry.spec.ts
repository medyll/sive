import { describe, it, expect, beforeEach } from 'vitest';
import {
	registerCommand,
	unregisterCommand,
	searchCommands,
	getAllCommands,
	type Command
} from './commandRegistry';

function makeCmd(id: string, label: string, keywords: string[] = []): Command {
	return { id, label, keywords, category: 'navigation', action: () => {} };
}

beforeEach(() => {
	// Clear registry between tests by unregistering test commands
	['test:a', 'test:b', 'test:c', 'test:fuzzy'].forEach(unregisterCommand);
});

describe('registerCommand / unregisterCommand', () => {
	it('registers a command', () => {
		registerCommand(makeCmd('test:a', 'Alpha'));
		expect(getAllCommands().some((c) => c.id === 'test:a')).toBe(true);
	});

	it('unregisters a command', () => {
		registerCommand(makeCmd('test:a', 'Alpha'));
		unregisterCommand('test:a');
		expect(getAllCommands().some((c) => c.id === 'test:a')).toBe(false);
	});

	it('overwrites on duplicate id', () => {
		registerCommand(makeCmd('test:a', 'First'));
		registerCommand(makeCmd('test:a', 'Second'));
		const found = getAllCommands().filter((c) => c.id === 'test:a');
		expect(found.length).toBe(1);
		expect(found[0].label).toBe('Second');
	});
});

describe('searchCommands', () => {
	beforeEach(() => {
		registerCommand(makeCmd('test:a', 'New Document', ['create', 'file']));
		registerCommand(makeCmd('test:b', 'Open Settings', ['preferences', 'config']));
		registerCommand(makeCmd('test:c', 'Export PDF', ['download', 'pdf']));
		registerCommand(makeCmd('test:fuzzy', 'Dashboard Analytics', ['stats']));
	});

	it('returns all commands on empty query', () => {
		const results = searchCommands('');
		expect(results.length).toBeGreaterThan(0);
	});

	it('finds by exact label prefix', () => {
		const results = searchCommands('New');
		expect(results.some((c) => c.id === 'test:a')).toBe(true);
	});

	it('finds by label substring', () => {
		const results = searchCommands('document');
		expect(results.some((c) => c.id === 'test:a')).toBe(true);
	});

	it('finds by keyword', () => {
		const results = searchCommands('preferences');
		expect(results.some((c) => c.id === 'test:b')).toBe(true);
	});

	it('fuzzy matches across label chars', () => {
		const results = searchCommands('dshbd');
		expect(results.some((c) => c.id === 'test:fuzzy')).toBe(true);
	});

	it('ranks prefix matches first', () => {
		const results = searchCommands('Export');
		expect(results[0].id).toBe('test:c');
	});

	it('returns empty array for no match', () => {
		const results = searchCommands('zzznomatch999');
		const testOnly = results.filter((c) => c.id.startsWith('test:'));
		expect(testOnly.length).toBe(0);
	});

	it('is case-insensitive', () => {
		const lower = searchCommands('new document');
		const upper = searchCommands('NEW DOCUMENT');
		expect(lower.some((c) => c.id === 'test:a')).toBe(true);
		expect(upper.some((c) => c.id === 'test:a')).toBe(true);
	});
});
