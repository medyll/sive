import { test, expect } from './fixtures';

test.describe('Sprint 60 — AI Rewrite & Tone Tools', () => {

	test('SelectionToolbar appears when text is selected in editor', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('Hello world, this is a test sentence.');
		await editor.selectText();
		await expect(page.locator('[role="toolbar"][aria-label="AI text tools"]')).toBeVisible();
	});

	test('SelectionToolbar hidden when no text is selected', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('Some text here.');
		// Click without selecting — deselect
		await editor.click();
		await expect(page.locator('[role="toolbar"][aria-label="AI text tools"]')).toBeHidden();
	});

	test('Rewrite button triggers ghost text suggestion', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('This sentence needs rewriting.');
		await editor.selectText();
		const toolbar = page.locator('[role="toolbar"][aria-label="AI text tools"]');
		await expect(toolbar).toBeVisible();
		await toolbar.getByTitle('AI Rewrite').click();
		// Ghost text hint area should appear
		await expect(page.getByTestId('ghost-hint')).toBeVisible({ timeout: 5000 });
	});

	test('Tone button opens submenu with 4 tone options', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('This is a test sentence for tone adjustment.');
		await editor.selectText();
		const toolbar = page.locator('[role="toolbar"][aria-label="AI text tools"]');
		await expect(toolbar).toBeVisible();
		await toolbar.getByTitle('Change tone').click();
		const toneMenu = page.locator('[role="menu"]');
		await expect(toneMenu).toBeVisible();
		await expect(toneMenu.getByRole('menuitem', { name: 'Formal' })).toBeVisible();
		await expect(toneMenu.getByRole('menuitem', { name: 'Casual' })).toBeVisible();
		await expect(toneMenu.getByRole('menuitem', { name: 'Concise' })).toBeVisible();
		await expect(toneMenu.getByRole('menuitem', { name: 'Expand' })).toBeVisible();
	});

	test('Selecting a tone triggers ghost text suggestion', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('We need to fix this problem quickly.');
		await editor.selectText();
		const toolbar = page.locator('[role="toolbar"][aria-label="AI text tools"]');
		await toolbar.getByTitle('Change tone').click();
		await page.locator('[role="menu"]').getByRole('menuitem', { name: 'Formal' }).click();
		await expect(page.getByTestId('ghost-hint')).toBeVisible({ timeout: 5000 });
	});

	test('Escape dismisses SelectionToolbar', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('Escape should dismiss this toolbar.');
		await editor.selectText();
		await expect(page.locator('[role="toolbar"][aria-label="AI text tools"]')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.locator('[role="toolbar"][aria-label="AI text tools"]')).toBeHidden();
	});
});
