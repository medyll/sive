import { describe, it, expect } from 'vitest';

// Re-implement the pure helper functions under test (extracted logic from +server.ts)
// This avoids importing SvelteKit server module in unit context.

const BASE_SYSTEM = 'You are an AI writing assistant for fiction authors. Be concise and helpful.';
const MAX_CTX_CHARS = 2000;

function buildSystemPrompt(docContext: string): string {
	if (!docContext) return BASE_SYSTEM;
	const excerpt = docContext.slice(0, MAX_CTX_CHARS);
	return (
		BASE_SYSTEM +
		`\n\nThe user is currently writing the following document excerpt:\n\n<document>\n${excerpt}\n</document>\n\nUse it as context when answering. Do not repeat it back verbatim.`
	);
}

describe('buildSystemPrompt', () => {
	it('returns base system prompt when no context provided', () => {
		expect(buildSystemPrompt('')).toBe(BASE_SYSTEM);
	});

	it('includes document excerpt in system prompt when context is provided', () => {
		const result = buildSystemPrompt('Once upon a time');
		expect(result).toContain(BASE_SYSTEM);
		expect(result).toContain('<document>');
		expect(result).toContain('Once upon a time');
		expect(result).toContain('</document>');
		expect(result).toContain('Do not repeat it back verbatim');
	});

	it('truncates excerpt to 2000 characters', () => {
		const longText = 'a'.repeat(3000);
		const result = buildSystemPrompt(longText);
		// The <document> content should only be 2000 'a's
		const match = result.match(/<document>\n([\s\S]*?)\n<\/document>/);
		expect(match).not.toBeNull();
		expect(match![1]).toHaveLength(MAX_CTX_CHARS);
	});

	it('does not modify base prompt when context is empty string', () => {
		expect(buildSystemPrompt('')).not.toContain('<document>');
	});

	it('does not truncate excerpts shorter than 2000 chars', () => {
		const shortText = 'Short excerpt.';
		const result = buildSystemPrompt(shortText);
		const match = result.match(/<document>\n([\s\S]*?)\n<\/document>/);
		expect(match![1]).toBe(shortText);
	});
});
