import { expect, test } from '@playwright/test';

// Simple visual / functional test for the suggestions-ready-badge mock
test('suggestions-ready-badge appears when entering Focus mode', async ({ page }) => {
	await page.goto('/demo/app');
	// ensure page loaded
	await expect(page.locator('text=AI-Assisted Writer')).toBeVisible();

	// toggle Focus mode
	const focusButton = page.getByRole('button', { name: /Focus|Exit Focus/ });
	await focusButton.click();

	// badge should appear
	const badge = page.locator('.suggestions-ready-badge');
	await expect(badge).toBeVisible();

	// exit focus mode and verify badge gone
	await focusButton.click();
	await expect(badge).not.toBeVisible();
});
