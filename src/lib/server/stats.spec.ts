import { describe, it, expect } from 'vitest';
import {
	countWords, countSentences, countParagraphs,
	readingTimeMinutes, computeDocStats, computeUserStats
} from './stats';

describe('countWords', () => {
	it('returns 0 for empty string', () => expect(countWords('')).toBe(0));
	it('returns 0 for whitespace-only', () => expect(countWords('   \n\t  ')).toBe(0));
	it('counts single word', () => expect(countWords('hello')).toBe(1));
	it('counts multiple words', () => expect(countWords('the quick brown fox')).toBe(4));
	it('handles multiple spaces', () => expect(countWords('a  b   c')).toBe(3));
	it('handles newlines as separators', () => expect(countWords('line one\nline two')).toBe(4));
	it('handles tabs', () => expect(countWords('word\tword')).toBe(2));
	it('ignores leading/trailing whitespace', () => expect(countWords('  hello world  ')).toBe(2));
	it('counts words with punctuation attached', () => expect(countWords('Hello, world!')).toBe(2));
});

describe('countSentences', () => {
	it('returns 0 for empty string', () => expect(countSentences('')).toBe(0));
	it('counts single sentence with period', () => expect(countSentences('Hello world.')).toBe(1));
	it('counts multiple sentences', () => expect(countSentences('Hello. World. Goodbye.')).toBe(3));
	it('counts question marks', () => expect(countSentences('How? Why? When?')).toBe(3));
	it('counts exclamation marks', () => expect(countSentences('Stop! Look! Listen!')).toBe(3));
	it('handles text without terminal punctuation', () => expect(countSentences('no period')).toBe(1));
	it('handles mixed punctuation', () => expect(countSentences('Yes! Is it? Yes.')).toBe(3));
});

describe('countParagraphs', () => {
	it('returns 0 for empty string', () => expect(countParagraphs('')).toBe(0));
	it('counts single paragraph', () => expect(countParagraphs('Just one paragraph.')).toBe(1));
	it('counts two paragraphs', () => expect(countParagraphs('Para one.\n\nPara two.')).toBe(2));
	it('ignores extra blank lines', () => expect(countParagraphs('A\n\n\n\nB')).toBe(2));
	it('trims whitespace-only paragraphs', () => expect(countParagraphs('\n\nReal content\n\n')).toBe(1));
});

describe('readingTimeMinutes', () => {
	it('returns 1 for empty string', () => expect(readingTimeMinutes('')).toBe(0));
	it('returns 1 for short text', () => expect(readingTimeMinutes('word '.repeat(50))).toBe(1));
	it('returns correct minutes for 400 words', () => expect(readingTimeMinutes('word '.repeat(400))).toBe(2));
	it('rounds up', () => expect(readingTimeMinutes('word '.repeat(201))).toBe(2));
});

describe('computeDocStats', () => {
	it('computes all stats for a document', () => {
		const doc = {
			id: 'd1',
			title: 'Test',
			content: 'Hello world.\n\nSecond paragraph here.'
		};
		const stats = computeDocStats(doc);
		expect(stats.wordCount).toBe(5);
		expect(stats.charCount).toBe(doc.content.length);
		expect(stats.sentenceCount).toBe(2);
		expect(stats.paragraphCount).toBe(2);
		expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
	});
});

describe('computeUserStats', () => {
	it('returns zero stats for empty doc list', () => {
		const stats = computeUserStats([]);
		expect(stats.totalWords).toBe(0);
		expect(stats.totalDocs).toBe(0);
		expect(stats.longestDoc).toBeNull();
		expect(stats.currentStreak).toBe(0);
	});

	it('sums words across all docs', () => {
		const docs = [
			{ id: '1', title: 'A', content: 'one two three', updated_at: Date.now() },
			{ id: '2', title: 'B', content: 'four five', updated_at: Date.now() }
		];
		const stats = computeUserStats(docs);
		expect(stats.totalWords).toBe(5);
		expect(stats.totalDocs).toBe(2);
	});

	it('identifies the longest document', () => {
		const docs = [
			{ id: '1', title: 'Short', content: 'one two', updated_at: Date.now() },
			{ id: '2', title: 'Long', content: 'one two three four five six', updated_at: Date.now() }
		];
		const stats = computeUserStats(docs);
		expect(stats.longestDoc?.id).toBe('2');
		expect(stats.longestDoc?.words).toBe(6);
	});

	it('computes correct avgWordsPerDoc', () => {
		const docs = [
			{ id: '1', title: 'A', content: 'one two three four', updated_at: Date.now() },
			{ id: '2', title: 'B', content: 'five six', updated_at: Date.now() }
		];
		const stats = computeUserStats(docs);
		expect(stats.avgWordsPerDoc).toBe(3); // (4+2)/2
	});

	it('seeds 30 days in activityByDay', () => {
		const docs = [{ id: '1', title: 'A', content: 'text', updated_at: Date.now() }];
		const stats = computeUserStats(docs);
		expect(Object.keys(stats.activityByDay).length).toBe(30);
	});

	it('computes non-zero streak when editing today', () => {
		const docs = [{ id: '1', title: 'A', content: 'hello world', updated_at: Date.now() }];
		const stats = computeUserStats(docs);
		expect(stats.currentStreak).toBeGreaterThanOrEqual(1);
	});

	it('computes readingTimeMinutes for whole corpus', () => {
		const docs = [{ id: '1', title: 'A', content: 'word '.repeat(400), updated_at: Date.now() }];
		const stats = computeUserStats(docs);
		expect(stats.readingTimeMinutes).toBe(2);
	});
});
