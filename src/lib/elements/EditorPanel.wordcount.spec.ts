/**
 * S19-01: Word count logic unit tests.
 * Tests the countWords helper in isolation (extracted logic matches EditorPanel implementation).
 */
import { describe, it, expect } from 'vitest';

function countWords(text: string): number {
	return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

describe('countWords', () => {
	it('returns 0 for empty string', () => {
		expect(countWords('')).toBe(0);
	});

	it('returns 0 for whitespace-only string', () => {
		expect(countWords('   \n\t  ')).toBe(0);
	});

	it('counts single word', () => {
		expect(countWords('hello')).toBe(1);
	});

	it('counts multiple words separated by single spaces', () => {
		expect(countWords('one two three')).toBe(3);
	});

	it('counts words separated by multiple spaces', () => {
		expect(countWords('one   two   three')).toBe(3);
	});

	it('counts words separated by newlines', () => {
		expect(countWords('line one\nline two\nline three')).toBe(6);
	});

	it('handles leading/trailing whitespace', () => {
		expect(countWords('  hello world  ')).toBe(2);
	});

	it('handles tabs as whitespace', () => {
		expect(countWords('a\tb\tc')).toBe(3);
	});

	it('counts a realistic paragraph correctly', () => {
		const text = 'The morning light filtered through the dusty blinds as Martin set his coffee cup on the table.';
		expect(countWords(text)).toBe(17);
	});
});
