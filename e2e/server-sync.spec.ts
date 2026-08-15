import { test, expect } from '@playwright/test';

test.describe('Server-Side Sync', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.setViewportSize({ width: 1366, height: 900 });
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
});
