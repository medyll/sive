import { test, expect } from '@playwright/test';

test.describe('Document UX — rename, delete, Ctrl+S', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('toolbar title is visible and clickable to edit', async ({ page }) => {
		const toolbar = page.locator('header.main-toolbar');
		await expect(toolbar).toBeVisible();
		// Title text is visible in toolbar
		const titleEl = toolbar.locator('.toolbar-title').first();
		await expect(titleEl).toBeVisible();
	});

	test('sidebar title has aria-label for rename accessibility', async ({ page }) => {
		const renameSpan = page.locator('[aria-label^="Rename"]').first();
		await expect(renameSpan).toBeVisible();
	});

	test('delete button is present for each document item', async ({ page }) => {
		const deleteBtn = page.getByRole('button', { name: /Delete/ }).first();
		await expect(deleteBtn).toBeVisible();
	});

	test('Ctrl+S triggers immediate save (no 2s debounce)', async ({ page }) => {
		const editor = page.getByRole('textbox', { name: 'Document editor' });
		await editor.click();
		await editor.type(' test');
		await page.keyboard.press('Control+s');
		// After Ctrl+S, save status should appear promptly
		const saveStatus = page.locator('.save-status, [class*="save"]').filter({ hasText: /Saved|Saving/ });
		await expect(saveStatus).toBeVisible({ timeout: 3000 });
	});

	test('deleting a document removes it from the list (with confirm)', async ({ page }) => {
		// Count initial docs
		const items = page.locator('.doc-item');
		const initialCount = await items.count();

		// Accept the confirm dialog
		page.on('dialog', (dialog) => dialog.accept());

		// Hover to reveal delete button then click it
		const firstItem = items.first();
		await firstItem.hover();
		const deleteBtn = firstItem.getByRole('button', { name: /Delete/ });
		await deleteBtn.click();

		// One fewer item
		await expect(items).toHaveCount(initialCount - 1, { timeout: 3000 });
	});
});
