/**
 * Pure writing statistics utilities — no Svelte dependencies.
 */

export function wordCount(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

export function sentenceCount(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	const matches = trimmed.match(/[^.!?]*[.!?]+/g);
	return matches ? matches.length : 1;
}

export function paragraphCount(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length || 1;
}

export function readingTimeMinutes(text: string): number {
	const words = wordCount(text);
	return Math.max(1, Math.round(words / 200));
}

/**
 * Flesch Reading Ease score (0–100).
 * Higher = easier to read.
 */
export function fleschReadingEase(text: string): number {
	const words = wordCount(text);
	const sentences = sentenceCount(text);
	if (words === 0 || sentences === 0) return 100;

	// Approximate syllable count: count vowel groups per word
	const syllables = text
		.toLowerCase()
		.split(/\s+/)
		.reduce((sum, word) => {
			const cleaned = word.replace(/[^a-z]/g, '');
			if (!cleaned) return sum;
			const count = (cleaned.match(/[aeiouy]+/g) ?? []).length;
			return sum + Math.max(1, count);
		}, 0);

	const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
	return Math.min(100, Math.max(0, Math.round(score)));
}

export function readabilityLabel(score: number): string {
	if (score >= 90) return 'Very Easy';
	if (score >= 80) return 'Easy';
	if (score >= 70) return 'Fairly Easy';
	if (score >= 60) return 'Standard';
	if (score >= 50) return 'Fairly Difficult';
	if (score >= 30) return 'Difficult';
	return 'Very Difficult';
}
