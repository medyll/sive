import { expect, test } from '@playwright/test';

test.describe('Style tab — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('Style tab button is visible in the AI panel', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Style' })).toBeVisible();
	});

	test('clicking Style tab shows the style sliders panel', async ({ page }) => {
		await page.getByRole('button', { name: 'Style' }).click();
		await expect(page.locator('[role="region"][aria-label="Style settings"]')).toBeVisible();
	});

	test('all 4 slider labels are visible', async ({ page }) => {
		await page.getByRole('button', { name: 'Style' }).click();
		await expect(page.getByText('Cynicism')).toBeVisible();
		await expect(page.getByText('Syntactic complexity')).toBeVisible();
		await expect(page.getByText('Rhythm')).toBeVisible();
		await expect(page.getByText('Narrative density')).toBeVisible();
	});

	test('Analyse this passage button is visible', async ({ page }) => {
		await page.getByRole('button', { name: 'Style' }).click();
		await expect(page.locator('.btn-analyse')).toBeVisible();
	});

	test('clicking Analyse shows "Analysing…" loading state', async ({ page }) => {
		await page.getByRole('button', { name: 'Style' }).click();
		await page.locator('.btn-analyse').click();
		await expect(page.locator('.btn-analyse')).toHaveText('Analysing…');
	});

	test('after analysis, 3 result cards are visible', async ({ page }) => {
		await page.getByRole('button', { name: 'Style' }).click();
		await page.locator('.btn-analyse').click();
		await expect(page.locator('article.style-signal')).toHaveCount(3, { timeout: 5000 });
	});

	test('result cards contain location, signal, and suggestion text', async ({ page }) => {
		await page.getByRole('button', { name: 'Style' }).click();
		await page.locator('.btn-analyse').click();
		const firstCard = page.locator('article.style-signal').first();
		await expect(firstCard).toBeVisible({ timeout: 5000 });
		await expect(firstCard.locator('.signal-location')).toBeVisible();
		await expect(firstCard.locator('.signal-badge')).toBeVisible();
		await expect(firstCard.locator('.signal-suggestion')).toBeVisible();
	});
});
