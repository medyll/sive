import { test, expect } from './fixtures';

test.describe('Sprint 63 — AI Outline Generator', () => {

	test('Outline tab visible in AI panel', async ({ page, goto }) => {
		await goto('/app');
		const aiPanel = page.getByRole('tabpanel', { name: /ai/i }).or(page.locator('.ai-panel'));
		await expect(page.getByRole('tab', { name: 'Outline' })).toBeVisible();
	});

	test('Clicking Outline tab shows OutlinePanel', async ({ page, goto }) => {
		await goto('/app');
		await page.getByRole('tab', { name: 'Outline' }).click();
		await expect(page.getByTestId('outline-panel')).toBeVisible();
	});

	test('OutlinePanel shows topic input and generate button', async ({ page, goto }) => {
		await goto('/app');
		await page.getByRole('tab', { name: 'Outline' }).click();
		await expect(page.locator('.topic-input')).toBeVisible();
		await expect(page.getByTestId('outline-generate-btn')).toBeVisible();
	});

	test('Entering a topic enables generate button', async ({ page, goto }) => {
		await goto('/app');
		await page.getByRole('tab', { name: 'Outline' }).click();
		const btn = page.getByTestId('outline-generate-btn');
		await expect(btn).toBeDisabled();
		await page.locator('.topic-input').fill('A mystery novel');
		await expect(btn).toBeEnabled();
	});

	test('Generate button produces outline tree', async ({ page, goto }) => {
		await goto('/app');
		await page.getByRole('tab', { name: 'Outline' }).click();
		await page.locator('.topic-input').fill('A short story');
		await page.getByTestId('outline-generate-btn').click();
		await expect(page.getByTestId('outline-tree')).toBeVisible({ timeout: 10000 });
	});

	test('"From doc" button visible when editor has content', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('Once upon a time there was a great adventure waiting to begin.');
		await page.getByRole('tab', { name: 'Outline' }).click();
		await expect(page.getByTestId('outline-from-doc-btn')).toBeVisible();
	});
});
