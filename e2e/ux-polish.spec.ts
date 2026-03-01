import { test, expect } from '@playwright/test';

test.describe('UX Polish & Export', () => {
	test('export button renders in toolbar', async ({ page }) => {
		await page.goto('/app');
		await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
	});

	test('export dropdown shows Markdown and Plain text options', async ({ page }) => {
		await page.goto('/app');
		await page.getByRole('button', { name: /Export/i }).click();
		await expect(page.getByRole('menuitem', { name: /Markdown/i })).toBeVisible();
		await expect(page.getByRole('menuitem', { name: /Plain text/i })).toBeVisible();
	});

	test('export dropdown closes when clicking Markdown', async ({ page }) => {
		await page.goto('/app');
		await page.getByRole('button', { name: /Export/i }).click();
		// Trigger download — don't assert file, just that it doesn't throw
		const [download] = await Promise.all([
			page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
			page.getByRole('menuitem', { name: /Markdown/i }).click()
		]);
		// Menu should close
		await expect(page.locator('.export-menu')).not.toBeVisible();
	});

	test('sidebar toggle button is visible', async ({ page }) => {
		await page.goto('/app');
		await expect(page.getByRole('button', { name: /Hide sidebar/i })).toBeVisible();
	});

	test('sidebar toggles on button click', async ({ page }) => {
		await page.goto('/app');
		// Sidebar initially visible
		await expect(page.locator('.doc-list')).toBeVisible();
		// Hide sidebar
		await page.getByRole('button', { name: 'Hide sidebar' }).click();
		await expect(page.locator('.doc-list')).not.toBeVisible();
		// Show sidebar
		await page.getByRole('button', { name: 'Show sidebar' }).click();
		await expect(page.locator('.doc-list')).toBeVisible();
	});

	test('AI tab shows empty state hint before running analysis', async ({ page }) => {
		await page.goto('/app');
		// Coherence tab
		await page.getByRole('button', { name: 'Coherence', exact: true }).click();
		await expect(page.locator('.tab-empty')).toBeVisible();
		// Style tab
		await page.getByRole('button', { name: 'Style', exact: true }).click();
		await expect(page.locator('.tab-empty')).toBeVisible();
	});
});
