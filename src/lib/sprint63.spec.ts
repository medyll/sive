import { describe, it, expect } from 'vitest';
import type { OutlineNode } from './outlineStore.svelte';

/**
 * Sprint 63 — AI Outline Generator
 * Tests parseOutline logic inline (no $state import to avoid browser-pool hang).
 */

function parseOutline(markdown: string): OutlineNode[] {
	const lines = markdown.split('\n').map((l) => l.trim()).filter(Boolean);
	const roots: OutlineNode[] = [];
	const stack: OutlineNode[] = [];

	for (const line of lines) {
		const match = line.match(/^(#{2,4})\s+(.+)/);
		if (!match) continue;
		const level = match[1].length;
		const text = match[2].trim();
		const node: OutlineNode = { level, text, children: [] };

		while (stack.length > 0 && stack[stack.length - 1].level >= level) {
			stack.pop();
		}

		if (stack.length === 0) {
			roots.push(node);
		} else {
			stack[stack.length - 1].children.push(node);
		}
		stack.push(node);
	}

	return roots;
}

describe('Sprint 63 — outlineStore.parseOutline', () => {
	it('returns empty array for empty string', () => {
		expect(parseOutline('')).toHaveLength(0);
	});

	it('returns empty array for text without headings', () => {
		expect(parseOutline('just some text\nno headings here')).toHaveLength(0);
	});

	it('parses a single h2 heading', () => {
		const result = parseOutline('## Introduction');
		expect(result).toHaveLength(1);
		expect(result[0].level).toBe(2);
		expect(result[0].text).toBe('Introduction');
		expect(result[0].children).toHaveLength(0);
	});

	it('parses multiple h2 headings as siblings', () => {
		const md = '## Part One\n## Part Two\n## Part Three';
		const result = parseOutline(md);
		expect(result).toHaveLength(3);
		expect(result.map((n) => n.text)).toEqual(['Part One', 'Part Two', 'Part Three']);
	});

	it('nests h3 under h2', () => {
		const md = '## Introduction\n### Background\n### Context';
		const result = parseOutline(md);
		expect(result).toHaveLength(1);
		expect(result[0].children).toHaveLength(2);
		expect(result[0].children[0].text).toBe('Background');
	});

	it('nests h4 under h3 under h2', () => {
		const md = '## Main\n### Section\n#### Detail';
		const result = parseOutline(md);
		expect(result[0].children[0].children[0].text).toBe('Detail');
		expect(result[0].children[0].children[0].level).toBe(4);
	});

	it('handles multiple h2 sections each with h3 children', () => {
		const md = [
			'## Part One',
			'### Chapter 1',
			'### Chapter 2',
			'## Part Two',
			'### Chapter 3'
		].join('\n');
		const result = parseOutline(md);
		expect(result).toHaveLength(2);
		expect(result[0].children).toHaveLength(2);
		expect(result[1].children).toHaveLength(1);
	});

	it('ignores h1 headings (single #)', () => {
		const md = '# Title\n## Section\n### Subsection';
		const result = parseOutline(md);
		expect(result).toHaveLength(1);
		expect(result[0].level).toBe(2);
	});

	it('ignores lines that are not headings', () => {
		const md = '## Section\nsome paragraph text\n### Sub';
		const result = parseOutline(md);
		expect(result[0].children).toHaveLength(1);
		expect(result[0].children[0].text).toBe('Sub');
	});

	it('node text strips leading/trailing whitespace', () => {
		const result = parseOutline('##  My Heading  ');
		expect(result[0].text).toBe('My Heading');
	});
});
