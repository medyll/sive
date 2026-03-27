/**
 * Debug test for component test infrastructure investigation
 * S72-01: Investigate Test Infrastructure Root Cause
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import BadgeDisplay from '$lib/elements/BadgeDisplay.svelte';
import { badgesStore } from '$lib/badgesStore.svelte';
import { goalsStore } from '$lib/writingGoalsStore.svelte';
import { streakStore } from '$lib/streakStore.svelte';

describe('S72-01: Debug Component Tests', () => {
	beforeEach(() => {
		badgesStore.reset();
		goalsStore.reset();
		streakStore.reset();
	});

	it('DEBUG: Check page object availability', async () => {
		// Test 1: Check if page object exists
		console.log('page object:', typeof page);
		expect(page).toBeDefined();
		
		// Test 2: Check page methods
		console.log('page.getByText:', typeof page.getByText);
		expect(typeof page.getByText).toBe('function');
	});

	it('DEBUG: Check render output', async () => {
		// Test render function
		const result = render(BadgeDisplay);
		console.log('render result:', result);
		console.log('render result keys:', Object.keys(result || {}));
		
		// Check what's available
		expect(result).toBeDefined();
	});

	it('DEBUG: Check page.container after render', async () => {
		render(BadgeDisplay);
		
		// Wait a bit for Svelte reactivity
		await new Promise(r => setTimeout(r, 100));
		
		console.log('page.container:', page.container);
		console.log('page.container type:', typeof page.container);
		
		// Try alternative access
		if (page.container) {
			await expect.element(page.container).toBeVisible();
		} else {
			console.log('page.container is undefined - checking alternatives...');
		}
	});

	it('DEBUG: Try page.getByText directly', async () => {
		render(BadgeDisplay);
		
		await new Promise(r => setTimeout(r, 100));
		
		// Try to find text directly
		const badgesText = page.getByText('Badges Earned');
		console.log('getByText result:', badgesText);
		
		if (badgesText) {
			try {
				await expect.element(badgesText).toBeVisible();
				console.log('Element found and visible!');
			} catch (e) {
				console.log('Element visible check failed:', e);
			}
		} else {
			console.log('getByText returned null/undefined');
		}
	});

	it('DEBUG: Check if simple text exists', async () => {
		render(BadgeDisplay);
		
		await new Promise(r => setTimeout(r, 100));
		
		// Try to find any text
		const allText = page.getByText(/./);
		console.log('Any text found:', allText);
	});
});
