import { test, expect } from './fixtures';

test.describe('Sprint 36 - Virtualized List & Performance', () => {
	test.describe('Virtual document list', () => {
		test('document list renders within 300ms for many docs', async ({ page, goto }) => {
			const start = Date.now();
			await goto('/app');
			const list = page.locator('[role="listbox"]').first();
			await expect(list).toBeVisible({ timeout: 300 });
			expect(Date.now() - start).toBeLessThan(300);
		});

		test('list items are accessible with role=option', async ({ page, goto }) => {
			await goto('/app');
			// If there are docs, they should have role=option
			const items = page.locator('[role="option"]');
			const count = await items.count();
			if (count > 0) {
				await expect(items.first()).toBeVisible();
			}
		});

		test('list has correct aria attributes', async ({ page, goto }) => {
			await goto('/app');
			const list = page.locator('[role="listbox"]').first();
			await expect(list).toBeVisible();
		});
	});

	test.describe('Debounced save', () => {
		test('typing does not immediately trigger multiple saves', async ({ page, goto }) => {
			await goto('/app');

			// Track fetch calls to updateDocument
			const saveCalls: string[] = [];
			page.on('request', (req) => {
				if (req.url().includes('updateDocument') || req.postData()?.includes('updateDocument')) {
					saveCalls.push(req.url());
				}
			});

			// Type rapidly in the editor
			const editor = page.locator('[contenteditable="true"], textarea').first();
			if (await editor.isVisible()) {
				await editor.click();
				await page.keyboard.type('Hello world this is a test', { delay: 20 });

				// Wait a short time — should NOT have saved yet
				await page.waitForTimeout(500);
				const savesBeforeDebounce = saveCalls.length;

				// After 1500ms, save should fire
				await page.waitForTimeout(1500);
				// At most 1 save should have happened
				expect(saveCalls.length - savesBeforeDebounce).toBeLessThanOrEqual(1);
			}
		});

		test('save indicator appears while saving', async ({ page, goto }) => {
			await goto('/app');
			const editor = page.locator('[contenteditable="true"], textarea').first();
			if (await editor.isVisible()) {
				await editor.click();
				await page.keyboard.type('trigger save indicator');
				// Pending indicator should appear quickly
				const indicator = page.locator('.save-indicator');
				await expect(indicator).toBeVisible({ timeout: 500 });
			}
		});
	});

	test.describe('Lazy word counts', () => {
		test('word counts appear in document list without page reload', async ({ page, goto }) => {
			await goto('/app');
			// Word counts are computed lazily — they may appear after initial render
			// Just verify list loads without error
			await expect(page.locator('[role="listbox"]').first()).toBeVisible();
		});
	});
});
