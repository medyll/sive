import { test, expect } from './fixtures';

test.describe('Sprint 55 — Palette Command Handlers', () => {

	test('palette:newDocument creates a new document', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await page.getByRole('dialog').getByPlaceholder(/search/i).fill('new');
		await page.getByRole('option', { name: /new document/i }).click();
		await expect(page.locator('[data-testid="editor"]')).toBeVisible();
	});

	test('palette:toggleFocus toggles focus mode', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await page.getByRole('dialog').getByPlaceholder(/search/i).fill('focus');
		await page.getByRole('option', { name: /focus/i }).click();
		await expect(page.locator('body')).toHaveClass(/focus/);
	});

	test('palette:showShortcuts opens shortcuts help', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await page.getByRole('dialog').getByPlaceholder(/search/i).fill('shortcut');
		await page.getByRole('option', { name: /shortcut/i }).click();
		await expect(page.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeVisible();
	});

	test('palette:toggleTheme switches theme', async ({ page, goto }) => {
		await goto('/app');
		const html = page.locator('html');
		const before = await html.getAttribute('class');
		await page.keyboard.press('Control+k');
		await page.getByRole('dialog').getByPlaceholder(/search/i).fill('theme');
		await page.getByRole('option', { name: /theme/i }).click();
		const after = await html.getAttribute('class');
		expect(before).not.toEqual(after);
	});

	test('palette:summarize opens summary panel', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await page.getByRole('dialog').getByPlaceholder(/search/i).fill('summar');
		await page.getByRole('option', { name: /summar/i }).click();
		await expect(page.getByTestId('summary-panel')).toBeVisible();
	});
});
