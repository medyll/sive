import { describe, it, expect } from 'vitest';

// Inline the formatRelative logic to test it independently
function formatRelative(ts: number, now: number): string {
	const diffMs = now - ts;
	const mins = Math.floor(diffMs / 60_000);
	if (mins < 1) return 'just now';
	if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
	const days = Math.floor(hrs / 24);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}

describe('SummaryPanel formatRelative', () => {
	const now = Date.now();

	it('returns "just now" for under 1 minute', () => {
		expect(formatRelative(now - 30_000, now)).toBe('just now');
	});

	it('returns singular "1 minute ago"', () => {
		expect(formatRelative(now - 65_000, now)).toBe('1 minute ago');
	});

	it('returns plural minutes', () => {
		expect(formatRelative(now - 5 * 60_000, now)).toBe('5 minutes ago');
	});

	it('returns singular hour', () => {
		expect(formatRelative(now - 61 * 60_000, now)).toBe('1 hour ago');
	});

	it('returns plural hours', () => {
		expect(formatRelative(now - 3 * 60 * 60_000, now)).toBe('3 hours ago');
	});

	it('returns singular day', () => {
		expect(formatRelative(now - 25 * 60 * 60_000, now)).toBe('1 day ago');
	});

	it('returns plural days', () => {
		expect(formatRelative(now - 3 * 24 * 60 * 60_000, now)).toBe('3 days ago');
	});
});
