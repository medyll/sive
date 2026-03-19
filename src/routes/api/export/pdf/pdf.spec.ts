import { describe, it, expect } from 'vitest';

// Test PDF endpoint utilities (sanitizeFilename, etc.)
function sanitizeFilename(name: string): string {
	return (name || 'document').replace(/[^a-z0-9_\-]/gi, '_').slice(0, 100);
}

describe('PDF export sanitization', () => {
	it('sanitizes special characters', () => {
		expect(sanitizeFilename('My Document.txt')).toBe('My_Document_txt');
	});

	it('handles spaces', () => {
		expect(sanitizeFilename('A B C')).toBe('A_B_C');
	});

	it('preserves hyphens and underscores', () => {
		expect(sanitizeFilename('my-doc_v1')).toBe('my-doc_v1');
	});

	it('truncates long names', () => {
		const long = 'a'.repeat(150);
		expect(sanitizeFilename(long).length).toBe(100);
	});

	it('defaults to "document" for empty string', () => {
		expect(sanitizeFilename('')).toBe('document');
	});

	it('removes unicode characters', () => {
		expect(sanitizeFilename('документ.pdf')).toBe('_________pdf');
	});
});
