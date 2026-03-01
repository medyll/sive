import { expect, test } from '@playwright/test';

test.describe('Suggestions tab — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('Suggestions tab button is visible and active by default', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Suggestions', exact: true })).toBeVisible();
	});

	test('"Generate suggestions" button is visible', async ({ page }) => {
		await expect(page.locator('.btn-suggest')).toBeVisible();
	});

	test('clicking Generate shows "Generating…" loading state', async ({ page }) => {
		await page.locator('.btn-suggest').click();
		await expect(page.locator('.btn-suggest')).toHaveText('Generating…');
	});

	test('after generation, 3 suggestion cards appear', async ({ page }) => {
		await page.locator('.btn-suggest').click();
		await expect(page.locator('article.suggestion-item')).toHaveCount(3, { timeout: 5000 });
	});

	test('suggestion cards show type badge and diff content', async ({ page }) => {
		await page.locator('.btn-suggest').click();
		const firstCard = page.locator('article.suggestion-item').first();
		await expect(firstCard).toBeVisible({ timeout: 5000 });
		await expect(firstCard.locator('.suggestion-badge')).toBeVisible();
		await expect(firstCard.locator('.suggestion-diff')).toBeVisible();
	});

	test('Accept and Reject buttons are visible on each card', async ({ page }) => {
		await page.locator('.btn-suggest').click();
		const firstCard = page.locator('article.suggestion-item').first();
		await expect(firstCard).toBeVisible({ timeout: 5000 });
		await expect(firstCard.getByRole('button', { name: 'Accept suggestion' })).toBeVisible();
		await expect(firstCard.getByRole('button', { name: 'Reject suggestion' })).toBeVisible();
	});

	test('clicking Reject removes that card from the list', async ({ page }) => {
		await page.locator('.btn-suggest').click();
		await expect(page.locator('article.suggestion-item')).toHaveCount(3, { timeout: 5000 });
		await page.locator('article.suggestion-item').first().getByRole('button', { name: 'Reject suggestion' }).click();
		await expect(page.locator('article.suggestion-item')).toHaveCount(2);
	});

	test('"Accept all" button removes all cards', async ({ page }) => {
		await page.locator('.btn-suggest').click();
		await expect(page.locator('article.suggestion-item')).toHaveCount(3, { timeout: 5000 });
		await page.locator('.btn-accept-all').click();
		await expect(page.locator('article.suggestion-item')).toHaveCount(0);
	});
});
