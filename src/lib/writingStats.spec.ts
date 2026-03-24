import { describe, it, expect } from 'vitest';
import {
	wordCount,
	sentenceCount,
	paragraphCount,
	readingTimeMinutes,
	fleschReadingEase,
	readabilityLabel
} from './writingStats';

describe('wordCount', () => {
	it('returns 0 for empty string', () => expect(wordCount('')).toBe(0));
	it('returns 0 for whitespace-only', () => expect(wordCount('   \n  ')).toBe(0));
	it('counts single word', () => expect(wordCount('hello')).toBe(1));
	it('counts multiple words', () => expect(wordCount('hello world foo')).toBe(3));
	it('handles extra whitespace', () => expect(wordCount('  a  b  c  ')).toBe(3));
});

describe('sentenceCount', () => {
	it('returns 0 for empty string', () => expect(sentenceCount('')).toBe(0));
	it('counts single sentence', () => expect(sentenceCount('Hello world.')).toBe(1));
	it('counts multiple sentences', () => expect(sentenceCount('Hello. World! How are you?')).toBe(3));
	it('defaults to 1 for text without punctuation', () => expect(sentenceCount('no punctuation here')).toBe(1));
});

describe('paragraphCount', () => {
	it('returns 0 for empty string', () => expect(paragraphCount('')).toBe(0));
	it('returns 1 for single paragraph', () => expect(paragraphCount('hello world')).toBe(1));
	it('counts double-newline separated paragraphs', () => {
		expect(paragraphCount('para one\n\npara two\n\npara three')).toBe(3);
	});
});

describe('readingTimeMinutes', () => {
	it('returns 1 for fewer than 200 words', () => {
		expect(readingTimeMinutes('word '.repeat(50).trim())).toBe(1);
	});
	it('returns 2 for ~400 words', () => {
		expect(readingTimeMinutes('word '.repeat(400).trim())).toBe(2);
	});
	it('returns 1 for empty text', () => expect(readingTimeMinutes('')).toBe(1));
});

describe('fleschReadingEase', () => {
	it('returns 100 for empty text', () => expect(fleschReadingEase('')).toBe(100));
	it('returns a score between 0 and 100', () => {
		const score = fleschReadingEase('The cat sat on the mat. It was a big cat.');
		expect(score).toBeGreaterThanOrEqual(0);
		expect(score).toBeLessThanOrEqual(100);
	});
	it('simple text scores higher than complex text', () => {
		const simple = fleschReadingEase('The cat sat. The dog ran.');
		const complex = fleschReadingEase('The implementation of multisyllabic terminological constructs substantially obfuscates comprehensibility.');
		expect(simple).toBeGreaterThan(complex);
	});
});

describe('readabilityLabel', () => {
	it('Very Easy for score >= 90', () => expect(readabilityLabel(95)).toBe('Very Easy'));
	it('Easy for score 80–89', () => expect(readabilityLabel(82)).toBe('Easy'));
	it('Standard for score 60–69', () => expect(readabilityLabel(65)).toBe('Standard'));
	it('Difficult for score 30–49', () => expect(readabilityLabel(40)).toBe('Difficult'));
	it('Very Difficult for score < 30', () => expect(readabilityLabel(10)).toBe('Very Difficult'));
});
