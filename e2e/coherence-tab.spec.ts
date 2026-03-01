import { expect, test } from '@playwright/test';

test.describe('Coherence tab — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('Coherence tab button is visible', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Coherence' })).toBeVisible();
	});

	test('clicking Coherence tab shows the coherence panel', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence' }).click();
		await expect(page.locator('#tab-content-coherence')).toBeVisible();
	});

	test('"Run coherence check" button is visible', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence' }).click();
		await expect(page.locator('.btn-coherence')).toBeVisible();
	});

	test('clicking Run shows "Checking…" loading state', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence' }).click();
		await page.locator('.btn-coherence').click();
		await expect(page.locator('.btn-coherence')).toHaveText('Checking…');
	});

	test('after check, 5 alert cards are visible', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence' }).click();
		await page.locator('.btn-coherence').click();
		await expect(page.locator('article.coherence-alert')).toHaveCount(5, { timeout: 5000 });
	});

	test('alert cards have entity, discrepancy type, and confidence badge', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence' }).click();
		await page.locator('.btn-coherence').click();
		const firstCard = page.locator('article.coherence-alert').first();
		await expect(firstCard).toBeVisible({ timeout: 5000 });
		await expect(firstCard.locator('.alert-entity')).toBeVisible();
		await expect(firstCard.locator('.alert-confidence')).toBeVisible();
		await expect(firstCard.locator('.alert-type')).toBeVisible();
		await expect(firstCard.locator('.alert-note')).toBeVisible();
	});

	test('High confidence alerts have a red-ish badge', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence' }).click();
		await page.locator('.btn-coherence').click();
		await expect(page.locator('article.coherence-alert').first()).toBeVisible({ timeout: 5000 });
		const highBadge = page.locator('.alert-confidence').first();
		const style = await highBadge.getAttribute('style');
		expect(style).toContain('background-color');
	});
});
