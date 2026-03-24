import { test, expect } from './fixtures';

test.describe('Sprint 56 — Settings Polish & Palette Search UX', () => {

	test('theme card picker switches theme live on click', async ({ page, goto }) => {
		await goto('/settings');
		const darkCard = page.getByRole('radio', { name: /dark/i });
		await darkCard.click();
		await expect(page.locator('html')).toHaveClass(/dark/);
	});

	test('theme card shows selected state', async ({ page, goto }) => {
		await goto('/settings');
		const lightCard = page.getByRole('radio', { name: /light/i });
		await lightCard.click();
		await expect(lightCard).toHaveAttribute('aria-checked', 'true');
	});

	test('palette shows Recent section on empty query', async ({ page, goto }) => {
		await goto('/app');
		// Execute one command to create a recent
		await page.keyboard.press('Control+k');
		await page.getByRole('dialog').getByPlaceholder(/search/i).fill('settings');
		await page.getByRole('option', { name: /settings/i }).first().click();
		// Reopen — should show Recent group
		await goto('/app');
		await page.keyboard.press('Control+k');
		await expect(page.getByRole('dialog')).toBeVisible();
		// Recent section header should appear
		const recentHeader = page.locator('.group-header', { hasText: /recent/i });
		await expect(recentHeader).toBeVisible();
	});

	test('palette items with shortcuts show kbd hint', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await page.getByRole('dialog').getByPlaceholder(/search/i).fill('new document');
		const shortcutKbd = page.locator('.shortcut').first();
		await expect(shortcutKbd).toBeVisible();
	});
});
