import { test, expect } from './fixtures';

test.describe('Sprint 35 - Document Templates', () => {
	test.describe('Template picker', () => {
		test('opens template picker via command palette', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('template');
			await expect(page.getByText(/New from Template/i)).toBeVisible();
		});

		test('built-in templates are visible in picker', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('New from Template');
			await page.keyboard.press('Enter');
			const dialog = page.getByRole('dialog', { name: /template picker/i });
			await expect(dialog).toBeVisible({ timeout: 3000 });
			await expect(page.getByText('Short Story')).toBeVisible();
			await expect(page.getByText('Blog Post')).toBeVisible();
		});

		test('picker has Built-in and My Templates tabs', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('New from Template');
			await page.keyboard.press('Enter');
			await expect(page.getByRole('tab', { name: /built-in/i })).toBeVisible();
			await expect(page.getByRole('tab', { name: /my templates/i })).toBeVisible();
		});

		test('selecting a template opens confirm dialog', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('New from Template');
			await page.keyboard.press('Enter');
			await page.getByText('Use this template').first().click();
			await expect(page.getByRole('dialog', { name: /confirm template/i })).toBeVisible();
		});

		test('My Templates tab shows empty state message', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('New from Template');
			await page.keyboard.press('Enter');
			await page.getByRole('tab', { name: /my templates/i }).click();
			await expect(page.getByText(/save your first template/i)).toBeVisible();
		});

		test('Escape closes the template picker', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('New from Template');
			await page.keyboard.press('Enter');
			const dialog = page.getByRole('dialog', { name: /template picker/i });
			await expect(dialog).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(dialog).not.toBeVisible();
		});
	});

	test.describe('Template categories and cards', () => {
		test('template cards show name and description', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('New from Template');
			await page.keyboard.press('Enter');
			// Short Story card should show description
			await expect(page.getByText(/three-act structure/i)).toBeVisible();
		});

		test('template cards show category badge', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('New from Template');
			await page.keyboard.press('Enter');
			await expect(page.locator('.badge-fiction').first()).toBeVisible();
		});
	});

	test.describe('Save as template', () => {
		test('Save as Template command is in palette', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').fill('Save as Template');
			await expect(page.getByText(/Save as Template/i)).toBeVisible();
		});
	});
});
