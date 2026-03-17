import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('S27 — PDF export', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('PDF option appears in export menu', async ({ page }) => {
		await page.getByRole('button', { name: /Export/i }).click();
		await expect(page.locator('.export-menu button').filter({ hasText: /PDF/i }))
			.toBeVisible({ timeout: 10000 });
	});

	test('clicking PDF triggers download', async ({ page, context }) => {
		// Intercept download promise
		const downloadPromise = context.waitForEvent('download');

		await page.getByRole('button', { name: /Export/i }).click();
		const pdfBtn = page.locator('.export-menu button').filter({ hasText: /PDF/i }).first();
		await pdfBtn.click();

		// Wait for download event
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.pdf$/);
	});

	test('PDF button shows loading state while rendering', async ({ page }) => {
		// Mock fetch to delay the response
		await page.route('/api/export/pdf', async (route) => {
			await new Promise((r) => setTimeout(r, 300));
			route.continue();
		});

		await page.getByRole('button', { name: /Export/i }).click();
		const pdfBtn = page.locator('.export-menu button').filter({ hasText: /PDF/i }).first();
		await pdfBtn.click();

		// Loading state should appear
		await expect(page.locator('.export-menu button').filter({ hasText: /Rendering PDF/i }))
			.toBeVisible({ timeout: 5000 });
	});
});

test.describe('S27 — Mobile UX', () => {
	test('toolbar buttons are touch-friendly on mobile (44px+)', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/app');

		const exportBtn = page.getByRole('button', { name: /Export/i });
		const bbox = await exportBtn.boundingBox();
		if (bbox) {
			expect(bbox.height).toBeGreaterThanOrEqual(44);
			expect(bbox.width).toBeGreaterThanOrEqual(44);
		}
	});

	test('export menu positions intelligently on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 568 });
		await page.goto('/app');

		await page.getByRole('button', { name: /Export/i }).click();
		const menu = page.locator('.export-menu');
		await expect(menu).toBeVisible({ timeout: 10000 });

		// Verify menu does not overflow viewport
		const bbox = await menu.boundingBox();
		if (bbox) {
			expect(bbox.x).toBeGreaterThanOrEqual(0);
			expect(bbox.x + bbox.width).toBeLessThanOrEqual(320);
		}
	});

	test('summary panel repositions on mobile (bottom-left)', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/app');

		await page.getByRole('button', { name: /Summary/i }).click();
		await expect(page.locator('.summary-panel')).toBeVisible({ timeout: 15000 });

		// Verify panel is visible and doesn't overflow
		const bbox = await page.locator('.summary-panel').boundingBox();
		if (bbox) {
			expect(bbox.width).toBeLessThanOrEqual(375);
		}
	});
});
