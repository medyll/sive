import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { celebrationStore } from './celebrationStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('celebrationStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		celebrationStore.reset();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should celebrate a milestone', () => {
		const celebration = celebrationStore.celebrate({
			type: 'badge',
			title: '7-Day Streak!',
			message: 'You have achieved a 7-day writing streak!',
			icon: '🔥'
		});

		expect(celebration.id).toBeDefined();
		expect(celebration.timestamp).toBeDefined();
		expect(celebrationStore.state.current).toBe(celebration);
	});

	it('should add celebration to history', () => {
		celebrationStore.celebrate({
			type: 'badge',
			title: 'First Badge',
			message: 'You earned your first badge!',
			icon: '🏆'
		});

		const history = celebrationStore.getHistory();
		expect(history).toHaveLength(1);
	});

	it('should auto-clear current celebration after 4 seconds', () => {
		celebrationStore.celebrate({
			type: 'badge',
			title: 'Test',
			message: 'Testing',
			icon: '⭐'
		});

		expect(celebrationStore.state.current).toBeTruthy();

		vi.advanceTimersByTime(4000);

		expect(celebrationStore.state.current).toBeNull();
	});

	it('should preserve celebration if a new one is created', () => {
		const celebration1 = celebrationStore.celebrate({
			type: 'badge',
			title: 'First',
			message: 'First celebration',
			icon: '🎉'
		});

		vi.advanceTimersByTime(2000);

		const celebration2 = celebrationStore.celebrate({
			type: 'milestone',
			title: 'Second',
			message: 'Second celebration',
			icon: '✨'
		});

		expect(celebrationStore.state.current).toBe(celebration2);

		const history = celebrationStore.getHistory();
		expect(history).toHaveLength(2);
		expect(history[0]).toBe(celebration2);
		expect(history[1]).toBe(celebration1);
	});

	it('should limit history to MAX_HISTORY items', () => {
		for (let i = 0; i < 60; i++) {
			celebrationStore.celebrate({
				type: 'badge',
				title: `Badge ${i}`,
				message: `Badge ${i} earned`,
				icon: '⭐'
			});
		}

		const history = celebrationStore.getHistory(50);
		expect(history.length).toBeLessThanOrEqual(50);
	});

	it('should get limited history', () => {
		for (let i = 0; i < 20; i++) {
			celebrationStore.celebrate({
				type: 'badge',
				title: `Badge ${i}`,
				message: `Badge ${i} earned`,
				icon: '⭐'
			});
		}

		const history = celebrationStore.getHistory(5);
		expect(history).toHaveLength(5);
	});

	it('should clear current celebration', () => {
		celebrationStore.celebrate({
			type: 'badge',
			title: 'Test',
			message: 'Testing',
			icon: '🎉'
		});

		expect(celebrationStore.state.current).toBeTruthy();

		celebrationStore.clearCurrent();
		expect(celebrationStore.state.current).toBeNull();
	});

	it('should reset store', () => {
		celebrationStore.celebrate({
			type: 'badge',
			title: 'Test',
			message: 'Testing',
			icon: '🎉'
		});

		celebrationStore.reset();

		expect(celebrationStore.state.current).toBeNull();
		expect(celebrationStore.getHistory()).toHaveLength(0);
	});

	it('should support confetti and sound flags', () => {
		const celebration = celebrationStore.celebrate({
			type: 'badge',
			title: 'Big Achievement',
			message: 'Massive milestone!',
			icon: '👑',
			confetti: true,
			sound: true
		});

		expect(celebration.confetti).toBe(true);
		expect(celebration.sound).toBe(true);
	});

	it('should persist to localStorage on celebrate', () => {
		celebrationStore.celebrate({
			type: 'badge',
			title: 'Test',
			message: 'Testing',
			icon: '⭐'
		});

		expect(localStorage.setItem).toHaveBeenCalled();
	});
});
