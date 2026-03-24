import { test, expect } from './fixtures';

test.describe('Sprint 53 — Dark Mode', () => {

	test('Settings page has dark/light theme radio buttons', async ({ page, goto }) => {
		await goto('/settings');
		await expect(page.locator('input[type="radio"][value="dark"]')).toBeVisible();
		await expect(page.locator('input[type="radio"][value="light"]')).toBeVisible();
	});

	test('Selecting dark and saving adds .dark class to <html>', async ({ page, goto }) => {
		await goto('/settings');
		await page.locator('input[type="radio"][value="dark"]').check();
		await page.getByRole('button', { name: /save/i }).click();
		await expect(page.locator('html')).toHaveClass(/dark/);
	});

	test('Selecting light and saving removes .dark class', async ({ page, goto }) => {
		await goto('/settings');
		// Set dark first
		await page.locator('input[type="radio"][value="dark"]').check();
		await page.getByRole('button', { name: /save/i }).click();
		// Switch back to light
		await page.locator('input[type="radio"][value="light"]').check();
		await page.getByRole('button', { name: /save/i }).click();
		await expect(page.locator('html')).not.toHaveClass(/dark/);
	});

	test('Dark theme persists after page reload', async ({ page, goto }) => {
		await goto('/settings');
		await page.locator('input[type="radio"][value="dark"]').check();
		await page.getByRole('button', { name: /save/i }).click();
		await goto('/app');
		await expect(page.locator('html')).toHaveClass(/dark/);
	});
});
