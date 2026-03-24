import { test, expect } from './fixtures';

test.describe('Sprint 54 — Dark Mode Polish', () => {

	test('CommandPalette visible in dark mode', async ({ page, goto }) => {
		await goto('/settings');
		await page.locator('input[type="radio"][value="dark"]').check();
		await page.getByRole('button', { name: /save/i }).click();
		await goto('/app');
		await page.keyboard.press('Control+k');
		await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
	});

	test('NotificationBell panel visible in dark mode', async ({ page, goto }) => {
		await goto('/settings');
		await page.locator('input[type="radio"][value="dark"]').check();
		await page.getByRole('button', { name: /save/i }).click();
		await goto('/app');
		await page.getByRole('button', { name: /notifications/i }).click();
		await expect(page.getByRole('dialog', { name: /notifications/i })).toBeVisible();
	});

	test('App layout uses dark background in dark mode', async ({ page, goto }) => {
		await goto('/settings');
		await page.locator('input[type="radio"][value="dark"]').check();
		await page.getByRole('button', { name: /save/i }).click();
		await goto('/app');
		const html = page.locator('html');
		await expect(html).toHaveClass(/dark/);
	});
});
