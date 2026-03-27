/**
 * ghostTextStore.spec.ts — Unit tests for ghost text completions
 * 
 * S73-06: Unit Tests — AI Features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ghostTextStore } from './ghostTextStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('ghostTextStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ghostTextStore.reset();
	});

	describe('show', () => {
		it('shows ghost text with given text and cursor position', () => {
			ghostTextStore.show('Hello world', 10);
			
			expect(ghostTextStore.isVisible).toBe(true);
			expect(ghostTextStore.state.text).toBe('Hello world');
			expect(ghostTextStore.state.cursorPosition).toBe(10);
		});

		it('sets remainingText to full text initially', () => {
			ghostTextStore.show('Test completion', 5);
			
			expect(ghostTextStore.state.remainingText).toBe('Test completion');
			expect(ghostTextStore.state.acceptedWords).toEqual([]);
		});

		it('persists to localStorage', () => {
			ghostTextStore.show('Test', 0);
			
			expect(localStorage.setItem).toHaveBeenCalled();
		});
	});

	describe('hide', () => {
		it('hides ghost text', () => {
			ghostTextStore.show('Test', 0);
			ghostTextStore.hide();
			
			expect(ghostTextStore.isVisible).toBe(false);
			expect(ghostTextStore.state.text).toBe('');
		});

		it('clears accepted words', () => {
			ghostTextStore.show('One two three', 0);
			ghostTextStore.acceptNextWord();
			ghostTextStore.hide();
			
			expect(ghostTextStore.state.acceptedWords).toEqual([]);
		});
	});

	describe('acceptNextWord', () => {
		it('accepts first word of ghost text', () => {
			ghostTextStore.show('Hello world test', 0);
			
			const word = ghostTextStore.acceptNextWord();
			
			expect(word).toBe('Hello');
			expect(ghostTextStore.state.acceptedWords).toEqual(['Hello']);
		});

		it('updates remainingText after accepting word', () => {
			ghostTextStore.show('Hello world test', 0);
			
			ghostTextStore.acceptNextWord();
			
			expect(ghostTextStore.state.remainingText).toBe('world test');
		});

		it('accepts second word on second call', () => {
			ghostTextStore.show('Hello world test', 0);
			
			ghostTextStore.acceptNextWord();
			const secondWord = ghostTextStore.acceptNextWord();
			
			expect(secondWord).toBe('world');
			expect(ghostTextStore.state.acceptedWords).toEqual(['Hello', 'world']);
		});

		it('hides ghost text when all words accepted', () => {
			ghostTextStore.show('Single', 0);
			
			ghostTextStore.acceptNextWord();
			
			expect(ghostTextStore.isVisible).toBe(false);
		});

		it('returns null when no ghost text visible', () => {
			const result = ghostTextStore.acceptNextWord();
			
			expect(result).toBeNull();
		});
	});

	describe('acceptAll', () => {
		it('accepts all ghost text at once', () => {
			ghostTextStore.show('Complete this text', 0);
			
			const text = ghostTextStore.acceptAll();
			
			expect(text).toBe('Complete this text');
			expect(ghostTextStore.isVisible).toBe(false);
		});

		it('returns null when no ghost text visible', () => {
			const result = ghostTextStore.acceptAll();
			
			expect(result).toBeNull();
		});

		it('hides ghost text after accepting', () => {
			ghostTextStore.show('Test', 0);
			ghostTextStore.acceptAll();
			
			expect(ghostTextStore.isVisible).toBe(false);
		});
	});

	describe('displayText', () => {
		it('shows full text initially', () => {
			ghostTextStore.show('Full text here', 0);
			
			expect(ghostTextStore.displayText).toBe('Full text here');
		});

		it('shows remaining text after partial accept', () => {
			ghostTextStore.show('One two three four', 0);
			ghostTextStore.acceptNextWord();
			
			expect(ghostTextStore.displayText).toBe('two three four');
		});
	});

	describe('acceptedCount', () => {
		it('starts at 0', () => {
			ghostTextStore.show('Test', 0);
			
			expect(ghostTextStore.acceptedCount).toBe(0);
		});

		it('increments with each word accepted', () => {
			ghostTextStore.show('One two three', 0);
			
			ghostTextStore.acceptNextWord();
			expect(ghostTextStore.acceptedCount).toBe(1);
			
			ghostTextStore.acceptNextWord();
			expect(ghostTextStore.acceptedCount).toBe(2);
		});
	});

	describe('reset', () => {
		it('resets to default state', () => {
			ghostTextStore.show('Test', 5);
			ghostTextStore.acceptNextWord();
			ghostTextStore.reset();
			
			expect(ghostTextStore.isVisible).toBe(false);
			expect(ghostTextStore.state.text).toBe('');
			expect(ghostTextStore.state.cursorPosition).toBe(0);
			expect(ghostTextStore.state.acceptedWords).toEqual([]);
		});
	});

	describe('isVisible derived', () => {
		it('is true when ghost text shown', () => {
			ghostTextStore.show('Test', 0);
			expect(ghostTextStore.isVisible).toBe(true);
		});

		it('is false when ghost text hidden', () => {
			ghostTextStore.show('Test', 0);
			ghostTextStore.hide();
			expect(ghostTextStore.isVisible).toBe(false);
		});
	});
});
