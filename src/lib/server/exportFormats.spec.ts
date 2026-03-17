import { describe, it, expect } from 'vitest';
import { buildEpubBytes, buildDocxBytes } from './exportFormats';

describe('buildEpubBytes', () => {
	it('returns a non-empty Uint8Array', () => {
		const bytes = buildEpubBytes('My Story', '# Chapter 1\n\nHello world.');
		expect(bytes).toBeInstanceOf(Uint8Array);
		expect(bytes.length).toBeGreaterThan(100);
	});

	it('starts with ZIP local file header signature (PK)', () => {
		const bytes = buildEpubBytes('Test', 'content');
		// ZIP magic: 0x50 0x4B 0x03 0x04
		expect(bytes[0]).toBe(0x50);
		expect(bytes[1]).toBe(0x4b);
	});

	it('handles empty content', () => {
		expect(() => buildEpubBytes('Empty', '')).not.toThrow();
	});

	it('escapes HTML in title', () => {
		const bytes = buildEpubBytes('<script>alert(1)</script>', 'safe');
		const text = new TextDecoder().decode(bytes);
		expect(text).not.toContain('<script>alert(1)</script>');
	});
});

describe('buildDocxBytes', () => {
	it('returns a non-empty Uint8Array', () => {
		const bytes = buildDocxBytes('Report', 'First paragraph.\n\nSecond paragraph.');
		expect(bytes).toBeInstanceOf(Uint8Array);
		expect(bytes.length).toBeGreaterThan(100);
	});

	it('starts with ZIP signature', () => {
		const bytes = buildDocxBytes('Test', 'hello');
		expect(bytes[0]).toBe(0x50);
		expect(bytes[1]).toBe(0x4b);
	});

	it('handles empty content', () => {
		expect(() => buildDocxBytes('Empty', '')).not.toThrow();
	});
});
