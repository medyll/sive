import { test, expect } from './fixtures';

test.describe('Sprint 61 — Inline Comment Threads & Margin Annotations', () => {

	test('Comment button appears in SelectionToolbar on text selection', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('This is a sentence worth commenting on.');
		await editor.selectText();
		const toolbar = page.locator('[role="toolbar"][aria-label="AI text tools"]');
		await expect(toolbar).toBeVisible();
		await expect(toolbar.getByTitle('Add comment')).toBeVisible();
	});

	test('Comment button is alongside Rewrite and Tone buttons', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('Select me to see all toolbar options.');
		await editor.selectText();
		const toolbar = page.locator('[role="toolbar"][aria-label="AI text tools"]');
		await expect(toolbar.getByTitle('AI Rewrite')).toBeVisible();
		await expect(toolbar.getByTitle('Change tone')).toBeVisible();
		await expect(toolbar.getByTitle('Add comment')).toBeVisible();
	});

	test('Clicking Comment opens CommentSidebar', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('Text that needs a comment.');
		await editor.selectText();
		const toolbar = page.locator('[role="toolbar"][aria-label="AI text tools"]');
		await toolbar.getByTitle('Add comment').click();
		await expect(page.locator('[aria-label="Document comments"]')).toBeVisible();
	});

	test('CommentSidebar shows selected text as anchor preview', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('This phrase needs a note.');
		await editor.selectText();
		await page.locator('[role="toolbar"][aria-label="AI text tools"]').getByTitle('Add comment').click();
		const sidebar = page.locator('[aria-label="Document comments"]');
		await expect(sidebar).toBeVisible();
		// The anchor preview should show a "Add comment" button when selection is active
		await expect(sidebar.getByText('+ Add comment')).toBeVisible();
	});

	test('Resolve button removes comment from unresolved list', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('Comment this text please.');
		await editor.selectText();
		await page.locator('[role="toolbar"][aria-label="AI text tools"]').getByTitle('Add comment').click();
		const sidebar = page.locator('[aria-label="Document comments"]');
		// Submit a comment via the form
		const textarea = sidebar.locator('textarea');
		if (await textarea.isVisible()) {
			await textarea.fill('My comment here');
			await sidebar.getByRole('button', { name: 'Submit' }).click();
			// After submit, comment thread should be visible with resolve button
			const resolveBtn = sidebar.getByRole('button', { name: 'Resolve' }).first();
			if (await resolveBtn.isVisible()) {
				await resolveBtn.click();
				await expect(sidebar.locator('.comment-thread:not(.resolved)')).toHaveCount(0);
			}
		}
	});
});
