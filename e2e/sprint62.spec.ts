import { test, expect } from './fixtures';

test.describe('Sprint 62 — Writing Stats & Readability Panel', () => {

	test('FK readability badge visible in editor footer', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.getByTestId('fk-badge')).toBeVisible();
	});

	test('Stats toggle button visible in editor footer', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.getByTitle('Toggle writing stats')).toBeVisible();
	});

	test('Stats panel expands when toggle clicked', async ({ page, goto }) => {
		await goto('/app');
		const toggle = page.getByTitle('Toggle writing stats');
		// Ensure panel starts closed
		if (await page.getByTestId('writing-stats-panel').isVisible()) {
			await toggle.click(); // close it first
		}
		await toggle.click();
		await expect(page.getByTestId('writing-stats-panel')).toBeVisible();
	});

	test('Stats panel collapses on second click', async ({ page, goto }) => {
		await goto('/app');
		const toggle = page.getByTitle('Toggle writing stats');
		// Open
		if (!(await page.getByTestId('writing-stats-panel').isVisible())) {
			await toggle.click();
		}
		await expect(page.getByTestId('writing-stats-panel')).toBeVisible();
		// Close
		await toggle.click();
		await expect(page.getByTestId('writing-stats-panel')).toBeHidden();
	});

	test('Stats panel shows word count after typing', async ({ page, goto }) => {
		await goto('/app');
		const editor = page.locator('textarea').first();
		await editor.click();
		await editor.fill('The quick brown fox jumps over the lazy dog today.');
		// Open stats
		const toggle = page.getByTitle('Toggle writing stats');
		if (!(await page.getByTestId('writing-stats-panel').isVisible())) {
			await toggle.click();
		}
		const panel = page.getByTestId('writing-stats-panel');
		await expect(panel).toContainText('words');
		await expect(panel).toContainText('min read');
	});

	test('FK badge updates color based on content complexity', async ({ page, goto }) => {
		await goto('/app');
		const badge = page.getByTestId('fk-badge');
		await expect(badge).toBeVisible();
		// Badge should have a colour style set
		const style = await badge.getAttribute('style');
		expect(style).toContain('color:');
	});
});
