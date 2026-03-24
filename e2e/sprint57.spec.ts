import { test, expect } from './fixtures';

test.describe('Sprint 57 — Editor Toolbar & Focus Mode Polish', () => {

	test('formatting toolbar is visible in editor', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.getByTestId('formatting-toolbar')).toBeVisible();
	});

	test('formatting toolbar has bold, italic, H1, H2 buttons', async ({ page, goto }) => {
		await goto('/app');
		const toolbar = page.getByTestId('formatting-toolbar');
		await expect(toolbar.getByTitle(/bold/i)).toBeVisible();
		await expect(toolbar.getByTitle(/italic/i)).toBeVisible();
		await expect(toolbar.getByTitle(/heading 1/i)).toBeVisible();
		await expect(toolbar.getByTitle(/heading 2/i)).toBeVisible();
	});

	test('focus mode hides main toolbar', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.locator('header.main-toolbar')).toBeVisible();
		await page.keyboard.press('Control+Shift+F');
		await expect(page.locator('header.main-toolbar')).toBeHidden();
		// Exit focus mode
		await page.keyboard.press('Control+Shift+F');
	});

	test('word count updates on typing', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('hello world test');
		const wordCount = page.getByTestId('word-count');
		await expect(wordCount).toHaveText(/3 words/);
	});

	test('char count shown in editor footer', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.getByTestId('char-count')).toBeVisible();
	});
});
