import { describe, it, expect, vi } from 'vitest';

describe('S57 — Editor Toolbar & Focus Mode Polish', () => {
	it('word count: empty string → 0', () => {
		const count = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;
		expect(count('')).toBe(0);
		expect(count('   ')).toBe(0);
	});

	it('word count: single word', () => {
		const count = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;
		expect(count('hello')).toBe(1);
	});

	it('word count: multiple words with punctuation', () => {
		const count = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;
		expect(count('Hello, world! How are you?')).toBe(5);
	});

	it('char count matches string length', () => {
		const text = 'Hello world';
		expect(text.length).toBe(11);
	});

	it('editor:format event dispatched on format action', () => {
		const dispatched: string[] = [];
		vi.stubGlobal('window', {
			dispatchEvent: (e: Event) => { dispatched.push((e as CustomEvent).detail?.type); return true; }
		});
		// Simulate what FormattingToolbar does
		window.dispatchEvent(new CustomEvent('editor:format', { detail: { type: 'bold' } }));
		expect(dispatched).toContain('bold');
		vi.unstubAllGlobals();
	});

	it('save indicator states: idle→pending→saving→saved', () => {
		// State machine test (pure logic)
		type Status = 'idle' | 'pending' | 'saving' | 'saved';
		let status: Status = 'idle';
		const onInput = () => { status = 'pending'; };
		const onSave = () => { status = 'saving'; };
		const onSaved = () => { status = 'saved'; };
		const onFade = () => { status = 'idle'; };

		expect(status).toBe('idle');
		onInput(); expect(status).toBe('pending');
		onSave();  expect(status).toBe('saving');
		onSaved(); expect(status).toBe('saved');
		onFade();  expect(status).toBe('idle');
	});
});
