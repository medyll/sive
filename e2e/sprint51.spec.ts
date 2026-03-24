import { test, expect } from './fixtures';

/**
 * S51-06 — E2E smoke for Sprint 51 integrations
 * Covers: Ctrl+K wiring, NotificationBell presence, WritingGoalBar visibility
 */

test.describe('Sprint 51 — Command Palette, Notifications & WritingGoalBar', () => {

	test('Ctrl+K opens the command palette', async ({ page, goto }) => {
		await goto('/app');
		await page.keyboard.press('Control+k');
		await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
	});

	test('NotificationBell button is present in the toolbar', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.getByRole('button', { name: /notifications/i })).toBeVisible();
	});

	test('NotificationBell panel opens on click', async ({ page, goto }) => {
		await goto('/app');
		await page.getByRole('button', { name: /notifications/i }).click();
		await expect(page.getByRole('dialog', { name: /notifications/i })).toBeVisible();
	});

	test('WritingGoalBar progress track is visible in the sidebar', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.locator('.goal-bar')).toBeVisible();
		await expect(page.locator('.goal-track')).toBeVisible();
	});

	test('WritingGoalBar shows word target button', async ({ page, goto }) => {
		await goto('/app');
		await expect(page.locator('.target-btn')).toBeVisible();
	});
});
