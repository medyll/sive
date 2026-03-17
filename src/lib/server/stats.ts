/**
 * Writing statistics computation engine
 */

export interface DocStats {
	id: string;
	title: string;
	wordCount: number;
	charCount: number;
	sentenceCount: number;
	paragraphCount: number;
	readingTimeMinutes: number;
}

export interface DayActivity {
	date: string; // YYYY-MM-DD
	wordsEstimate: number;
}

export interface UserStats {
	totalWords: number;
	totalDocs: number;
	totalChars: number;
	avgWordsPerDoc: number;
	longestDoc: { id: string; title: string; words: number } | null;
	mostRecentEdit: number; // timestamp ms
	activityByDay: Record<string, number>; // YYYY-MM-DD → wordsEstimate
	currentStreak: number; // consecutive days with ≥1 edit
	longestStreak: number;
	readingTimeMinutes: number; // total corpus
}

const WORDS_PER_MINUTE = 200;
const ACTIVITY_WINDOW_DAYS = 30;

export function countWords(text: string): number {
	if (!text || !text.trim()) return 0;
	return text.trim().split(/\s+/).filter((t) => t.length > 0).length;
}

export function countSentences(text: string): number {
	if (!text || !text.trim()) return 0;
	const matches = text.match(/[^.!?]*[.!?]+/g);
	return matches ? matches.length : (text.trim().length > 0 ? 1 : 0);
}

export function countParagraphs(text: string): number {
	if (!text || !text.trim()) return 0;
	return text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0).length;
}

export function readingTimeMinutes(text: string): number {
	return Math.ceil(countWords(text) / WORDS_PER_MINUTE);
}

export function computeDocStats(doc: { id: string; title: string; content: string }): DocStats {
	const { id, title, content } = doc;
	return {
		id,
		title,
		wordCount: countWords(content),
		charCount: content.length,
		sentenceCount: countSentences(content),
		paragraphCount: countParagraphs(content),
		readingTimeMinutes: readingTimeMinutes(content)
	};
}

function toDateKey(ts: number): string {
	return new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD
}

function buildActivityWindow(
	docs: Array<{ updated_at?: number; wordCount: number }>
): Record<string, number> {
	const window: Record<string, number> = {};

	// Seed last 30 days with 0
	const now = Date.now();
	for (let i = 0; i < ACTIVITY_WINDOW_DAYS; i++) {
		const key = toDateKey(now - i * 86_400_000);
		window[key] = 0;
	}

	// Estimate words added per day from doc edit timestamps
	for (const doc of docs) {
		if (!doc.updated_at) continue;
		const key = toDateKey(doc.updated_at);
		if (key in window) {
			// Rough estimate: each edit session added ~average doc words
			window[key] = (window[key] || 0) + Math.round(doc.wordCount / 3);
		}
	}

	return window;
}

function computeStreaks(activity: Record<string, number>): {
	current: number;
	longest: number;
} {
	const today = toDateKey(Date.now());
	const sortedDays = Object.keys(activity).sort().reverse(); // newest first

	let current = 0;
	let longest = 0;
	let streak = 0;
	let expectingDate = today;

	for (const day of sortedDays) {
		if (day > today) continue;

		if (day === expectingDate && activity[day] > 0) {
			streak++;
			const prev = new Date(day);
			prev.setDate(prev.getDate() - 1);
			expectingDate = toDateKey(prev.getTime());
		} else if (activity[day] > 0 && day < expectingDate) {
			// Gap found — streak broken
			if (current === 0) current = streak; // lock in current before reset
			streak = 1;
			const prev = new Date(day);
			prev.setDate(prev.getDate() - 1);
			expectingDate = toDateKey(prev.getTime());
		} else {
			if (current === 0 && streak > 0) current = streak;
			streak = 0;
		}

		longest = Math.max(longest, streak);
	}

	if (current === 0) current = streak;
	longest = Math.max(longest, current);

	return { current, longest };
}

export function computeUserStats(
	docs: Array<{ id: string; title: string; content: string; updated_at?: number }>
): UserStats {
	if (docs.length === 0) {
		return {
			totalWords: 0,
			totalDocs: 0,
			totalChars: 0,
			avgWordsPerDoc: 0,
			longestDoc: null,
			mostRecentEdit: 0,
			activityByDay: buildActivityWindow([]),
			currentStreak: 0,
			longestStreak: 0,
			readingTimeMinutes: 0
		};
	}

	const docStats = docs.map(computeDocStats);
	const withMeta = docs.map((d, i) => ({ ...d, wordCount: docStats[i].wordCount }));

	const totalWords = docStats.reduce((s, d) => s + d.wordCount, 0);
	const totalChars = docStats.reduce((s, d) => s + d.charCount, 0);
	const avgWordsPerDoc = Math.round(totalWords / docs.length);

	const longestDocStat = [...docStats].sort((a, b) => b.wordCount - a.wordCount)[0];
	const longestDoc = longestDocStat
		? { id: longestDocStat.id, title: longestDocStat.title, words: longestDocStat.wordCount }
		: null;

	const mostRecentEdit = Math.max(...docs.map((d) => d.updated_at ?? 0));

	const activityByDay = buildActivityWindow(withMeta);
	const { current, longest } = computeStreaks(activityByDay);

	return {
		totalWords,
		totalDocs: docs.length,
		totalChars,
		avgWordsPerDoc,
		longestDoc,
		mostRecentEdit,
		activityByDay,
		currentStreak: current,
		longestStreak: longest,
		readingTimeMinutes: Math.ceil(totalWords / WORDS_PER_MINUTE)
	};
}
