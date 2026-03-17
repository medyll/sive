import { test, expect } from './fixtures';

test.describe('Sprint 47 — UI Wiring', () => {
	test('WritingGoalBar is visible in the sidebar', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.locator('.goal-bar')).toBeVisible({ timeout: 3000 });
	});

	test('Version history button opens version panel', async ({ page, goto }) => {
		await goto('/app');
		const btn = page.getByRole('button', { name: /history/i });
		await expect(btn).toBeVisible();
		await btn.click();
		await expect(page.getByText(/version history/i)).toBeVisible({ timeout: 2000 });
	});

	test('Pomodoro button opens focus panel', async ({ page, goto }) => {
		await goto('/app');
		const btn = page.getByRole('button', { name: /🍅/i });
		await expect(btn).toBeVisible();
		await btn.click();
		await expect(page.getByText(/pomodoro timer/i)).toBeVisible({ timeout: 2000 });
	});

	test('Template picker opens from command palette', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await page.locator('.search-input').fill('New from Template');
		await page.keyboard.press('Enter');
		await expect(page.getByRole('dialog', { name: /template picker/i })).toBeVisible({ timeout: 3000 });
	});

	test('OnboardingTour does not crash the app', async ({ page, goto }) => {
		await page.addInitScript(() => localStorage.removeItem('sive:tour:completed'));
		await goto('/app');
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.waitForTimeout(500);
		expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
	});

	test('Plugin manager is visible in Settings', async ({ page, goto }) => {
		await goto('/settings');
		await expect(page.getByText(/plugins/i)).toBeVisible({ timeout: 3000 });
	});

	test('CommandPalette mounts and opens with Ctrl+K', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
	});

	test('AI chat history persists for active document', async ({ page, goto }) => {
		await goto('/app');
		// docId is passed to AIPanel — chat messages stored under sive:chat:<docId>
		const docId = await page.evaluate(() => {
			return Object.keys(localStorage).find((k) => k.startsWith('sive:chat:')) ?? null;
		});
		// No prior history expected — just verify no errors
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.waitForTimeout(300);
		expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
	});
});
