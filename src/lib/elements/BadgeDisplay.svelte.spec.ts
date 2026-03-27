import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BadgeDisplay from './BadgeDisplay.svelte';
import { badgesStore } from '$lib/badgesStore.svelte';
import { goalsStore } from '$lib/writingGoalsStore.svelte';
import { streakStore } from '$lib/streakStore.svelte';

describe('BadgeDisplay', () => {
	beforeEach(() => {
		badgesStore.reset();
		goalsStore.reset();
		streakStore.reset();
	});

	it('renders badge display component', () => {
		const { container } = render(BadgeDisplay);
		expect(container.querySelector('.badge-display')).not.toBeNull();
	});

	it('displays Next Badges section in non-compact mode', () => {
		const { container } = render(BadgeDisplay, { props: { compact: false } });
		
		expect(container.querySelector('.progress-section')).not.toBeNull();
		expect(container.querySelector('.section-label')).not.toBeNull();
	});

	it('hides Next Badges section in compact mode', () => {
		const { container } = render(BadgeDisplay, { props: { compact: true } });
		
		// In compact mode, progress section is hidden
		expect(container.querySelector('.progress-section')).toBeNull();
	});

	it('has progress-item elements', () => {
		const { container } = render(BadgeDisplay, { props: { compact: false } });
		
		const items = container.querySelectorAll('.progress-item');
		expect(items.length).toBeGreaterThan(0);
	});

	it('renders without errors with default props', () => {
		const { container } = render(BadgeDisplay);
		
		expect(container.querySelector('.badge-display')).not.toBeNull();
	});

	it('displays progress bar with correct width style', () => {
		const { container } = render(BadgeDisplay);
		
		const progressBarFill = container.querySelector('.progress-bar-fill');
		expect(progressBarFill).not.toBeNull();
		expect(progressBarFill?.getAttribute('style')).toContain('width:');
	});

	it('displays progress text with days', () => {
		const { container } = render(BadgeDisplay);
		
		const progressText = container.querySelector('.progress-text');
		expect(progressText).not.toBeNull();
		expect(progressText?.textContent).toContain('days');
	});

	it('displays streak badge progress', () => {
		const { container } = render(BadgeDisplay);
		
		// Should show "One Week Wonder" streak badge
		const streakBadge = container.querySelector('.progress-label');
		expect(streakBadge).not.toBeNull();
		expect(streakBadge?.textContent).toContain('Week');
	});

	it('displays words badge progress', () => {
		const { container } = render(BadgeDisplay);
		
		// Check that there are multiple progress badges (streak + words)
		const progressLabels = container.querySelectorAll('.progress-label');
		expect(progressLabels.length).toBeGreaterThanOrEqual(2);
	});

	it('has progress-bar-container elements', () => {
		const { container } = render(BadgeDisplay);
		
		const containers = container.querySelectorAll('.progress-bar-container');
		expect(containers.length).toBeGreaterThan(0);
	});

	it('has section-label with "Next Badges" text', () => {
		const { container } = render(BadgeDisplay, { props: { compact: false } });
		
		const label = container.querySelector('.section-label');
		expect(label?.textContent).toBe('Next Badges');
	});
});
