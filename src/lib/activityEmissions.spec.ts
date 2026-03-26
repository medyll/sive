/**
 * S68-05 — Verify activity events are emitted from existing stores
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { activityStore } from './activityStore.svelte';
import { goalsStore } from './writingGoalsStore.svelte';

global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('S68-05: Activity Emissions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		activityStore.reset();
		goalsStore.reset();
	});

	describe('writingGoalsStore → goal_completed', () => {
		it('should emit goal_completed when daily target first crossed', async () => {
			goalsStore.setDailyTarget(100);
			expect(activityStore.count).toBe(0);

			goalsStore.recordWords(100); // Exactly hits target

			// queueMicrotask fires after current task
			await new Promise((r) => queueMicrotask(r));

			const events = activityStore.getByType('goal_completed');
			expect(events).toHaveLength(1);
			expect(events[0].payload.words).toBe(100);
		});

		it('should NOT emit goal_completed when target already met', async () => {
			goalsStore.setDailyTarget(100);
			goalsStore.recordWords(150); // First hit
			await new Promise((r) => queueMicrotask(r));

			const countAfterFirst = activityStore.count;

			goalsStore.recordWords(200); // Target already met — no new event
			await new Promise((r) => queueMicrotask(r));

			expect(activityStore.count).toBe(countAfterFirst); // No duplicate
		});

		it('should NOT emit when target not yet met', async () => {
			goalsStore.setDailyTarget(500);
			goalsStore.recordWords(100);
			await new Promise((r) => queueMicrotask(r));

			expect(activityStore.getByType('goal_completed')).toHaveLength(0);
		});
	});
});
