import { expect, test } from '@playwright/test';

test.describe('App layout — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	// --- Layout load ---

	test('toolbar is visible with project label and action buttons', async ({ page }) => {
		await expect(page.locator('.project-label')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Focus' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Review' })).toBeVisible();
	});

	test('editor panel and AI panel are side-by-side', async ({ page }) => {
		await expect(page.locator('.panel.editor-panel')).toBeVisible();
		await expect(page.locator('.panel.ai-panel')).toBeVisible();
	});

	test('resize handle is visible between panels', async ({ page }) => {
		await expect(page.getByRole('separator', { name: 'Resize panels' })).toBeVisible();
	});

	// --- TabBar ---

	test('all four AI tabs are visible', async ({ page }) => {
		for (const tab of ['Suggestions', 'Coherence', 'Style', 'History']) {
			await expect(page.getByRole('button', { name: tab })).toBeVisible();
		}
	});

	test('clicking a tab activates it and shows its content panel', async ({ page }) => {
		await page.getByRole('button', { name: 'Coherence' }).click();
		await expect(page.getByRole('button', { name: 'Coherence' })).toHaveClass(/active/);
		await expect(page.getByRole('tabpanel', { name: 'Coherence' })).toBeVisible();
	});

	test('Suggestions tab panel is visible by default', async ({ page }) => {
		await expect(page.getByRole('tabpanel', { name: 'Suggestions' })).toBeVisible();
	});

	// --- Focus Mode via button ---

	test('Focus button hides the AI panel and resize handle', async ({ page }) => {
		await page.getByRole('button', { name: 'Focus' }).click();
		await expect(page.locator('.panel.ai-panel')).not.toBeVisible();
		await expect(page.getByRole('separator', { name: 'Resize panels' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Exit Focus' })).toBeVisible();
	});

	test('Exit Focus button restores the AI panel', async ({ page }) => {
		await page.getByRole('button', { name: 'Focus' }).click();
		await page.getByRole('button', { name: 'Exit Focus' }).click();
		await expect(page.locator('.panel.ai-panel')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Focus' })).toBeVisible();
	});

	test('Focus button has aria-pressed reflecting focus mode state', async ({ page }) => {
		const btn = page.getByRole('button', { name: 'Focus' });
		await expect(btn).toHaveAttribute('aria-pressed', 'false');
		await btn.click();
		await expect(page.getByRole('button', { name: 'Exit Focus' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	// --- Focus Mode via keyboard (dispatch directly to window to bypass browser interception) ---

	test('Ctrl+Shift+F keyboard shortcut toggles focus mode', async ({ page }) => {
		const dispatchShortcut = () =>
			page.evaluate(() => {
				window.dispatchEvent(
					new KeyboardEvent('keydown', { key: 'F', ctrlKey: true, shiftKey: true, bubbles: true })
				);
			});
		await dispatchShortcut();
		await expect(page.locator('.panel.ai-panel')).not.toBeVisible();
		await dispatchShortcut();
		await expect(page.locator('.panel.ai-panel')).toBeVisible();
	});

	// --- ChatBar overlay ---

	test('ChatBar overlay is open by default with an input', async ({ page }) => {
		await expect(page.locator('#chat-bar-content')).toBeVisible();
		await expect(page.getByPlaceholder('Type a command or question…')).toBeVisible();
	});

	test('ChatBar toggle button collapses and reopens the overlay', async ({ page }) => {
		const toggle = page.locator('.chat-toggle');
		// collapse
		await toggle.click();
		await expect(page.locator('#chat-bar-content')).not.toBeVisible();
		// reopen
		await toggle.click();
		await expect(page.locator('#chat-bar-content')).toBeVisible();
	});

	test('ChatBar toggle has correct aria-expanded attribute', async ({ page }) => {
		const toggle = page.locator('.chat-toggle');
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	});
});
