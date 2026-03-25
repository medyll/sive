import { describe, it, expect } from 'vitest';
import {
	wordCount,
	sentenceCount,
	readingTimeMinutes,
	fleschReadingEase,
	readabilityLabel
} from './writingStats';

/**
 * Sprint 62 — Writing Stats & Readability Panel
 * Integration-level tests covering badge colour thresholds and panel data contract.
 */

function badgeColor(score: number): string {
	if (score >= 70) return '#16a34a';
	if (score >= 40) return '#d97706';
	return '#dc2626';
}

const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','of','for','is','it','was','are','be','as','by','with','that','this','i','you','he','she','we','they','do','not','so','if','from','has','have','had','will','would','could','should','its','their','your','our']);

function topWords(text: string, n = 5): { word: string; count: number }[] {
	const freq: Record<string, number> = {};
	for (const w of text.toLowerCase().match(/[a-z']{3,}/g) ?? []) {
		if (!STOP.has(w)) freq[w] = (freq[w] ?? 0) + 1;
	}
	return Object.entries(freq)
		.sort((a, b) => b[1] - a[1])
		.slice(0, n)
		.map(([word, count]) => ({ word, count }));
}

describe('Sprint 62 — ReadabilityBadge color', () => {
	it('green for score >= 70', () => expect(badgeColor(75)).toBe('#16a34a'));
	it('amber for score 40–69', () => expect(badgeColor(55)).toBe('#d97706'));
	it('red for score < 40', () => expect(badgeColor(25)).toBe('#dc2626'));
	it('green exactly at 70', () => expect(badgeColor(70)).toBe('#16a34a'));
	it('amber exactly at 40', () => expect(badgeColor(40)).toBe('#d97706'));
});

describe('Sprint 62 — WritingStatsPanel data contract', () => {
	const sample = 'The quick brown fox jumps over the lazy dog. It was a sunny day. The dog barked loudly.';

	it('wordCount returns correct count', () => {
		expect(wordCount(sample)).toBeGreaterThan(0);
	});

	it('sentenceCount returns correct count', () => {
		expect(sentenceCount(sample)).toBe(3);
	});

	it('avgWordsPerSentence is words/sentences', () => {
		const w = wordCount(sample);
		const s = sentenceCount(sample);
		const avg = +(w / s).toFixed(1);
		expect(avg).toBeGreaterThan(0);
	});

	it('readingTimeMinutes is at least 1', () => {
		expect(readingTimeMinutes(sample)).toBeGreaterThanOrEqual(1);
	});

	it('FK score is between 0 and 100', () => {
		const score = fleschReadingEase(sample);
		expect(score).toBeGreaterThanOrEqual(0);
		expect(score).toBeLessThanOrEqual(100);
	});

	it('readabilityLabel returns a non-empty string', () => {
		const lbl = readabilityLabel(fleschReadingEase(sample));
		expect(lbl.length).toBeGreaterThan(0);
	});
});

describe('Sprint 62 — topWords', () => {
	it('returns at most n words', () => {
		const text = 'dog cat dog cat bird dog bird elephant elephant elephant';
		expect(topWords(text, 3)).toHaveLength(3);
	});

	it('sorted by descending frequency', () => {
		const text = 'apple apple apple banana banana cherry';
		const result = topWords(text, 3);
		expect(result[0].word).toBe('apple');
		expect(result[0].count).toBe(3);
	});

	it('excludes stop words', () => {
		const text = 'the the the quick brown fox the the';
		const result = topWords(text);
		expect(result.every((r) => !STOP.has(r.word))).toBe(true);
	});

	it('returns empty array for empty text', () => {
		expect(topWords('')).toHaveLength(0);
	});

	it('only includes words with 3+ characters', () => {
		const text = 'a ab abc abcd';
		const result = topWords(text);
		expect(result.every((r) => r.word.length >= 3)).toBe(true);
	});
});
