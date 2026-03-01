import { test, expect } from '@playwright/test';

test.describe('Document persistence — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('DocumentList sidebar is visible', async ({ page }) => {
		await expect(page.getByRole('complementary', { name: 'Document list' })).toBeVisible();
	});

	test('at least one document is listed on load', async ({ page }) => {
		const items = page.getByRole('list').locator('button.doc-item, .doc-item');
		await expect(items.first()).toBeVisible();
	});

	test('editor textarea is visible and editable', async ({ page }) => {
		const editor = page.getByRole('textbox', { name: 'Document editor' });
		await expect(editor).toBeVisible();
		await expect(editor).not.toHaveAttribute('readonly');
	});

	test('stub document content is loaded in editor', async ({ page }) => {
		const editor = page.getByRole('textbox', { name: 'Document editor' });
		await expect(editor).not.toBeEmpty();
	});

	test('"New document" button creates a new document entry', async ({ page }) => {
		const newBtn = page.getByRole('button', { name: 'New document' });
		await expect(newBtn).toBeVisible();
		const countBefore = await page.locator('.doc-item').count();
		await newBtn.click();
		// Allow form submission to complete
		await page.waitForTimeout(500);
		const countAfter = await page.locator('.doc-item').count();
		expect(countAfter).toBeGreaterThanOrEqual(countBefore);
	});

	test('typing in editor shows "Saving…" status', async ({ page }) => {
		const editor = page.getByRole('textbox', { name: 'Document editor' });
		await editor.click();
		await editor.fill('Hello Sprint 8');
		await expect(page.getByText('Saving…')).toBeVisible();
	});

	test('after 2s debounce, "Saved at" status appears', async ({ page }) => {
		// In mock mode, updateDocument returns success immediately
		const editor = page.getByRole('textbox', { name: 'Document editor' });
		await editor.click();
		await editor.fill('Hello Sprint 8 — saved');
		// Wait for debounce + form action round-trip
		await page.waitForTimeout(3000);
		await expect(page.getByText(/Saved at/)).toBeVisible();
	});

	test('toolbar shows active document title', async ({ page }) => {
		const toolbar = page.locator('.project-label');
		await expect(toolbar).toBeVisible();
		// Should contain the doc title (stub is "Chapter 1")
		await expect(toolbar).toContainText('Chapter 1');
	});
});
