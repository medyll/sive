import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseSlashCommand, filterSlashCommands, getRecentTemplates, addRecentTemplate } from './slashCommands';

describe('S58 — Slash Commands & Template Recents', () => {
	describe('parseSlashCommand', () => {
		it('returns null for empty string', () => {
			expect(parseSlashCommand('')).toBeNull();
		});

		it('returns null when no slash present', () => {
			expect(parseSlashCommand('hello world')).toBeNull();
		});

		it('detects /bold at start of text', () => {
			const result = parseSlashCommand('/bold');
			expect(result).not.toBeNull();
			expect(result?.command).toBe('bold');
		});

		it('detects /h1 with trailing text', () => {
			const result = parseSlashCommand('/h1');
			expect(result?.command).toBe('h1');
		});

		it('ignores slash in middle of word (e.g. http://)', () => {
			expect(parseSlashCommand('go to http://example.com')).toBeNull();
		});

		it('detects slash after whitespace', () => {
			const result = parseSlashCommand('some text /italic');
			expect(result?.command).toBe('italic');
		});
	});

	describe('filterSlashCommands', () => {
		it('returns all commands for empty query', () => {
			expect(filterSlashCommands('').length).toBeGreaterThan(0);
		});

		it('filters by prefix', () => {
			const results = filterSlashCommands('h');
			expect(results.some(c => c.id === 'h1')).toBe(true);
			expect(results.some(c => c.id === 'h2')).toBe(true);
			expect(results.some(c => c.id === 'bold')).toBe(false);
		});

		it('exact match returns single result', () => {
			const results = filterSlashCommands('bold');
			expect(results[0].id).toBe('bold');
		});
	});

	describe('recently used templates', () => {
		beforeEach(() => {
			const store: Record<string, string> = {};
			vi.stubGlobal('localStorage', {
				getItem: (k: string) => store[k] ?? null,
				setItem: (k: string, v: string) => { store[k] = v; },
				removeItem: (k: string) => { delete store[k]; }
			});
		});

		it('returns empty array initially', () => {
			expect(getRecentTemplates()).toEqual([]);
		});

		it('adds a template id', () => {
			addRecentTemplate('tpl-1');
			expect(getRecentTemplates()).toContain('tpl-1');
		});

		it('deduplicates on re-add (moves to front)', () => {
			addRecentTemplate('tpl-1');
			addRecentTemplate('tpl-2');
			addRecentTemplate('tpl-1');
			const recents = getRecentTemplates();
			expect(recents[0]).toBe('tpl-1');
			expect(recents.filter(r => r === 'tpl-1').length).toBe(1);
		});

		it('caps at 3 entries', () => {
			addRecentTemplate('a');
			addRecentTemplate('b');
			addRecentTemplate('c');
			addRecentTemplate('d');
			expect(getRecentTemplates().length).toBe(3);
		});
	});
});
