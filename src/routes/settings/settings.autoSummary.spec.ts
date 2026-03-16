import { describe, it, expect, beforeEach } from 'vitest';

// Test the settings persistence logic directly (no DOM needed)
const STORAGE_KEY = 'settings';

function loadSettings(storage: Record<string, string>) {
	try {
		return JSON.parse(storage[STORAGE_KEY] ?? '{}');
	} catch {
		return {};
	}
}

function saveSettings(storage: Record<string, string>, prefs: object) {
	storage[STORAGE_KEY] = JSON.stringify(prefs);
}

describe('settings autoSummary persistence', () => {
	let storage: Record<string, string>;

	beforeEach(() => {
		storage = {};
	});

	it('defaults autoSummary to false when no settings saved', () => {
		const prefs = loadSettings(storage);
		expect(prefs.autoSummary ?? false).toBe(false);
	});

	it('persists autoSummary: true', () => {
		saveSettings(storage, { theme: 'light', fontSize: 'medium', autosave: 30, autoSummary: true });
		const prefs = loadSettings(storage);
		expect(prefs.autoSummary).toBe(true);
	});

	it('persists autoSummary: false explicitly', () => {
		saveSettings(storage, { autoSummary: false });
		const prefs = loadSettings(storage);
		expect(prefs.autoSummary).toBe(false);
	});

	it('round-trips all settings together', () => {
		const original = { theme: 'dark', fontSize: 'large', autosave: 60, autoSummary: true };
		saveSettings(storage, original);
		const loaded = loadSettings(storage);
		expect(loaded).toEqual(original);
	});
});
