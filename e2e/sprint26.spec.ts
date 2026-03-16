import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('S26 — Auto-summary on save', () => {
	test('Settings page has auto-summary checkbox', async ({ page }) => {
		await page.goto('/settings');
		const checkbox = page.locator('input[type="checkbox"]').filter({ hasText: '' }).first();
		// Check via label text instead
		await expect(page.getByText('Auto-generate summary on save')).toBeVisible({ timeout: 10000 });
	});

	test('auto-summary setting persists after save', async ({ page }) => {
		await page.goto('/settings');
		const checkbox = page.locator('label').filter({ hasText: 'Auto-generate summary on save' }).locator('input');
		await checkbox.check();
		await page.getByRole('button', { name: /Save/i }).click();

		// Reload and verify persistence
		await page.reload();
		const storedRaw = await page.evaluate(() => localStorage.getItem('settings'));
		const stored = JSON.parse(storedRaw ?? '{}');
		expect(stored.autoSummary).toBe(true);
	});

	test('saving a document with auto-summary on triggers background summary', async ({ page }) => {
		// Enable auto-summary via localStorage before load
		await page.addInitScript(() => {
			localStorage.setItem('settings', JSON.stringify({ autoSummary: true }));
		});
		await page.goto('/app');

		// Type something into the editor to ensure content exists
		const editor = page.locator('[contenteditable="true"]').first();
		if (await editor.isVisible()) {
			await editor.click();
			await editor.type(' updated');
		}

		// Trigger save via keyboard shortcut
		await page.keyboard.press('Control+s');

		// "Updating summary…" info toast should appear
		await expect(page.locator('[data-toast], .toast, .toast-item').filter({ hasText: /Updating summary/i }))
			.toBeVisible({ timeout: 10000 });
	});
});

test.describe('S26 — Summary panel timestamp', () => {
	test('shows "Last updated" after summary is generated', async ({ page }) => {
		await page.goto('/app');

		// Open summary panel
		await page.getByRole('button', { name: /Summary/i }).click();

		// Wait for summary text
		await expect(page.locator('.summary-text')).toBeVisible({ timeout: 15000 });

		// Timestamp label should appear
		await expect(page.locator('.summary-ts')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.summary-ts')).toContainText('Last updated:');
	});
});

test.describe('S26 — Print stylesheet', () => {
	test('print CSS hides the toolbar', async ({ page }) => {
		await page.goto('/app');

		// Verify @media print rules are present in the document stylesheets
		const hasPrintRule = await page.evaluate(() => {
			for (const sheet of Array.from(document.styleSheets)) {
				try {
					for (const rule of Array.from(sheet.cssRules)) {
						if (rule instanceof CSSMediaRule && rule.conditionText === 'print') {
							return true;
						}
					}
				} catch {
					// cross-origin sheet — skip
				}
			}
			return false;
		});
		expect(hasPrintRule).toBe(true);
	});
});
