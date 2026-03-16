import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('S25 — Summary panel', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('Summary badge button is visible in toolbar', async ({ page }) => {
		const btn = page.getByRole('button', { name: /AI Summary|Summary/i });
		await expect(btn).toBeVisible({ timeout: 10000 });
	});

	test('clicking Summary button opens the summary panel', async ({ page }) => {
		await page.getByRole('button', { name: /AI Summary|Summary/i }).click();
		await expect(page.locator('.summary-panel')).toBeVisible({ timeout: 10000 });
	});

	test('summary panel has three length tabs', async ({ page }) => {
		await page.getByRole('button', { name: /AI Summary|Summary/i }).click();
		await expect(page.locator('.summary-panel .tab')).toHaveCount(3);
	});

	test('summary panel shows generated text (stub mode)', async ({ page }) => {
		await page.getByRole('button', { name: /AI Summary|Summary/i }).click();
		// Wait for streaming to complete — placeholder disappears and text appears
		await expect(page.locator('.summary-text')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('.summary-text')).not.toBeEmpty();
	});

	test('close button dismisses the summary panel', async ({ page }) => {
		await page.getByRole('button', { name: /AI Summary|Summary/i }).click();
		await expect(page.locator('.summary-panel')).toBeVisible({ timeout: 10000 });
		await page.getByRole('button', { name: 'Close summary panel' }).click();
		await expect(page.locator('.summary-panel')).not.toBeVisible();
	});

	test('Escape key dismisses the summary panel', async ({ page }) => {
		await page.getByRole('button', { name: /AI Summary|Summary/i }).click();
		await expect(page.locator('.summary-panel')).toBeVisible({ timeout: 10000 });
		await page.keyboard.press('Escape');
		await expect(page.locator('.summary-panel')).not.toBeVisible();
	});

	test('Ctrl+Alt+S keyboard shortcut opens summary panel', async ({ page }) => {
		await page.keyboard.press('Control+Alt+s');
		await expect(page.locator('.summary-panel')).toBeVisible({ timeout: 10000 });
	});
});

test.describe('S25 — Export with summary', () => {
	test.beforeEach(async ({ page }) => {
		// Pre-seed a summary in localStorage so the "Include summary" option appears
		await page.addInitScript(() => {
			const cache = {
				'': { medium: { text: 'A pre-generated summary.', ts: Date.now() } }
			};
			// We cannot know the docId ahead of time, so we verify the checkbox appears
			// after actually generating a summary in-app
		});
		await page.goto('/app');
	});

	test('Export menu shows "Include summary" option after summary is generated', async ({ page }) => {
		// Generate a summary first
		await page.getByRole('button', { name: /AI Summary|Summary/i }).click();
		await expect(page.locator('.summary-text')).toBeVisible({ timeout: 15000 });
		await page.keyboard.press('Escape');

		// Open export menu
		await page.getByRole('button', { name: /Export/i }).click();
		await expect(page.locator('.export-option')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.export-option')).toContainText('Include summary');
	});
});
