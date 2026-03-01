import { test, expect } from '@playwright/test';

test.describe('AI Integration — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('Suggestions tab: "Generate suggestions" button is present', async ({ page }) => {
		// Suggestions tab is active by default
		const btn = page.getByRole('button', { name: 'Generate suggestions', exact: true });
		await expect(btn).toBeVisible();
	});

	test('Suggestions tab: clicking button shows results or loading state', async ({ page }) => {
		await page.getByRole('button', { name: 'Generate suggestions', exact: true }).click();
		// Should show either "Generating…" (loading) or suggestion cards (results)
		const generating = page.getByRole('button', { name: 'Generating…' });
		const suggestions = page.locator('.suggestions-list, [aria-label="AI suggestions"]');
		await expect(generating.or(suggestions)).toBeVisible({ timeout: 10000 });
	});

	test('Coherence tab: "Run coherence check" button is present', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Run coherence check' })).toBeVisible();
	});

	test('Style tab: "Analyse this passage" button is present', async ({ page }) => {
		await page.getByRole('button', { name: 'Style', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Analyse this passage' })).toBeVisible();
	});

	test('ChatBar is visible with input and Send button', async ({ page }) => {
		await expect(page.getByRole('textbox', { name: 'Chat input' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
	});

	test('ChatBar: typing and sending shows user message bubble', async ({ page }) => {
		const input = page.getByRole('textbox', { name: 'Chat input' });
		await input.fill('Hello AI');
		await page.getByRole('button', { name: 'Send' }).click();
		// Input should clear
		await expect(input).toHaveValue('');
		// User bubble should appear
		await expect(page.getByText('Hello AI')).toBeVisible({ timeout: 5000 });
	});
});
