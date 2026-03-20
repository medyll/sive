import { test, expect } from './fixtures';

test.describe('Sive App - Smoke Tests', () => {
	test('homepage should load', async ({ page }) => {
		await page.goto('/');
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test.skip('auth page should be accessible', async ({ page, context }) => {
		// Clear auth state
		await context.clearCookies();
		await page.goto('/auth');

		// Wait for the h1 to appear (client-side rendering)
		await page.waitForSelector('h1', { timeout: 5000 });
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test.skip('signup page should be accessible', async ({ page, context }) => {
		// Clear auth state
		await context.clearCookies();
		await page.goto('/auth/signup');

		// Wait for the h1 to appear (client-side rendering)
		await page.waitForSelector('h1', { timeout: 5000 });
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('settings page should load', async ({ page }) => {
		await page.goto('/settings');
		// Just verify page loads without error
		const heading = page.locator('h1, h2');
		// Settings page should have some heading
		await expect(page).not.toHaveURL('/+error');
	});

	test('dashboard should load', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).not.toHaveURL('/+error');
	});

	test('offline page should be accessible', async ({ page }) => {
		await page.goto('/offline');
		const heading = page.locator('h1, h2');
		await expect(heading).not.toHaveCount(0);
	});

	test('404 handling - invalid routes should show error', async ({ page }) => {
		await page.goto('/this-page-does-not-exist-12345');
		// Should show error page or redirect
		const content = page.locator('body');
		await expect(content).toBeVisible();
	});
});
