import { expect, test } from '@playwright/test';

test.describe('Review Mode — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('clicking Review button enters review mode', async ({ page }) => {
		await page.getByRole('button', { name: 'Review' }).click();
		await expect(page.locator('.review-screen')).toBeVisible();
		await expect(page.locator('.panel.editor-panel')).not.toBeVisible();
	});

	test('Review button has aria-pressed=true when review mode is active', async ({ page }) => {
		const btn = page.getByRole('button', { name: 'Review' });
		await expect(btn).toHaveAttribute('aria-pressed', 'false');
		await btn.click();
		await expect(page.getByRole('button', { name: 'Review' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	test('review screen shows toolbar, text panel and report panel', async ({ page }) => {
		await page.getByRole('button', { name: 'Review' }).click();
		await expect(page.locator('.review-toolbar')).toBeVisible();
		await expect(page.locator('.review-text')).toBeVisible();
		await expect(page.locator('.review-report')).toBeVisible();
	});

	test('scope selector is visible with default value', async ({ page }) => {
		await page.getByRole('button', { name: 'Review' }).click();
		const select = page.getByRole('combobox', { name: /scope/i });
		await expect(select).toBeVisible();
		await expect(select).toHaveValue('current chapter');
	});

	test('clicking Back to writing exits review mode', async ({ page }) => {
		await page.getByRole('button', { name: 'Review' }).click();
		await expect(page.locator('.review-screen')).toBeVisible();
		await page.getByRole('button', { name: 'Back to writing' }).click();
		await expect(page.locator('.review-screen')).not.toBeVisible();
		await expect(page.locator('.panel.editor-panel')).toBeVisible();
	});

	test('Review button aria-pressed returns to false after exiting', async ({ page }) => {
		await page.getByRole('button', { name: 'Review' }).click();
		await page.getByRole('button', { name: 'Back to writing' }).click();
		await expect(page.getByRole('button', { name: 'Review' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	});

	test('Run analysis button triggers loading state', async ({ page }) => {
		await page.getByRole('button', { name: 'Review' }).click();
		const runBtn = page.locator('.btn-run');
		await runBtn.click();
		// Immediately after click, button becomes busy before the 2s stub finishes
		await expect(runBtn).toHaveAttribute('aria-busy', 'true');
	});
});
