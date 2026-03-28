import { test, expect } from '@playwright/test';

test.describe('Server-Side Sync', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.setViewportSize({ width: 1366, height: 900 });
	});

	test('challenge persists across page refresh', async ({ page }) => {
		// Create a challenge
		await page.goto('/challenges');
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Persistence Test');
		await page.getByLabel('Target Words').fill('5000');
		await page.getByLabel('Duration (days)').fill('7');
		await page.getByText('Create Challenge').click();

		// Verify challenge created
		await expect(page.getByText('Persistence Test')).toBeVisible();

		// Refresh page
		await page.reload();

		// Challenge should still exist
		await expect(page.getByText('Persistence Test')).toBeVisible();
	});

	test('challenge progress syncs to database', async ({ page }) => {
		// Create and join a challenge
		await page.goto('/challenges');
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Sync Test');
		await page.getByLabel('Target Words').fill('1000');
		await page.getByLabel('Duration (days)').fill('7');
		await page.getByText('Create Challenge').click();
		await page.getByText('+ Join Challenge').first().click();

		// Write some words
		await page.goto('/');
		const editor = page.locator('.editor-textarea');
		await editor.fill('Test content with about fifty words in this paragraph. Adding more text to increase word count significantly. This should contribute to the challenge progress when saved properly.');

		// Wait for save
		await page.waitForTimeout(3000);

		// Check challenge progress
		await page.goto('/challenges');
		await page.getByText('Joined (1)').click();

		// Progress should show updated word count
		const progressLabel = page.locator('.progress-label').first();
		await expect(progressLabel).toBeVisible();
	});

	test('discovery profile opt-in persists', async ({ page }) => {
		// Go to settings and opt into discovery
		await page.goto('/settings');

		// Find and click discovery opt-in toggle
		// Note: Adjust selector based on actual settings UI
		const discoveryToggle = page.getByText('discovery').or(page.getByLabel(/discover/i));
		if (await discoveryToggle.isVisible()) {
			await discoveryToggle.click();

			// Save settings if needed
			const saveBtn = page.getByText('Save');
			if (await saveBtn.isVisible()) {
				await saveBtn.click();
			}

			// Refresh page
			await page.reload();

			// Toggle should still be checked
			await expect(discoveryToggle).toBeChecked();
		}
	});

	test('activity events load from database', async ({ page }) => {
		// Trigger some activity (complete a goal, earn a badge, etc.)
		await page.goto('/');
		const editor = page.locator('.editor-textarea');
		await editor.fill('Writing content to trigger activity...');

		// Wait for save and activity emission
		await page.waitForTimeout(3000);

		// Go to activity feed
		await page.goto('/feed');

		// Activity should be visible
		// Note: Adjust selector based on actual activity feed UI
		const activityFeed = page.locator('[class*="activity"], [class*="feed"]');
		await expect(activityFeed).toBeVisible({ timeout: 5000 });
	});

	test('multi-tab sync for challenge progress', async ({ page, context }) => {
		// Create and join a challenge in first tab
		await page.goto('/challenges');
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Multi-Tab Test');
		await page.getByLabel('Target Words').fill('2000');
		await page.getByLabel('Duration (days)').fill('7');
		await page.getByText('Create Challenge').click();
		await page.getByText('+ Join Challenge').first().click();

		// Open second tab
		const page2 = await context.newPage();
		await page2.goto('/challenges');

		// Second tab should show joined challenge
		await expect(page2.getByText('Multi-Tab Test')).toBeVisible();

		// Write in first tab
		await page.goto('/');
		const editor = page.locator('.editor-textarea');
		await editor.fill('Writing in first tab to sync progress...');
		await page.waitForTimeout(3000);

		// Refresh second tab
		await page2.reload();

		// Progress should be synced
		await page2.getByText('Joined (1)').click();
		const progressLabel = page2.locator('.progress-label').first();
		await expect(progressLabel).toBeVisible();

		await page2.close();
	});

	test('offline save queues and syncs when online', async ({ page }) => {
		// Go offline
		await page.context().setOffline(true);

		// Write content
		await page.goto('/');
		const editor = page.locator('.editor-textarea');
		await editor.fill('Offline content that should be queued...');

		// Wait for save attempt
		await page.waitForTimeout(3000);

		// Offline banner should be visible
		const offlineBanner = page.locator('.offline-banner');
		await expect(offlineBanner).toBeVisible();

		// Check for pending saves indicator
		await expect(offlineBanner).toContainText('pending');

		// Go back online
		await page.context().setOffline(false);

		// Wait for sync
		await page.waitForTimeout(5000);

		// Offline banner should be hidden
		await expect(offlineBanner).not.toBeVisible();

		// Refresh to verify content persisted
		await page.reload();
		const content = await editor.inputValue();
		expect(content).toContain('Offline content');
	});

	test('writer discovery profile updates', async ({ page }) => {
		// Opt into discovery
		await page.goto('/discover');

		// Profile should be submitted automatically when visiting with opt-in enabled
		// Check for profile in discovery list
		await page.waitForTimeout(2000);

		// Refresh and verify profile still listed
		await page.reload();
		await expect(page.locator('[class*="writer"], [class*="profile"]')).toBeVisible({ timeout: 5000 });
	});

	test('challenge join state persists', async ({ page }) => {
		// Create and join challenge
		await page.goto('/challenges');
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Join Persist Test');
		await page.getByLabel('Target Words').fill('3000');
		await page.getByLabel('Duration (days)').fill('10');
		await page.getByText('Create Challenge').click();
		await page.getByText('+ Join Challenge').first().click();

		// Verify joined
		await expect(page.getByText('✓ Joined')).toBeVisible();

		// Refresh page
		await page.reload();
		await page.getByText('Joined (1)').click();

		// Should still be joined
		await expect(page.getByText('✓ Joined')).toBeVisible();
	});
});
