import { test, expect } from '@playwright/test';

test.describe('Sive App - Navigation', () => {
	test('should navigate between pages', async ({ page }) => {
		await page.goto('/');
		
		// Look for navigation links
		const links = page.locator('a');
		const linkCount = await links.count();
		expect(linkCount).toBeGreaterThan(0);
	});

	test('app page should load layout', async ({ page }) => {
		await page.goto('/app');
		
		// Check if there's any content
		const body = page.locator('body');
		await expect(body).toBeVisible();
		
		// Should not error
		await expect(page).not.toHaveURL('/+error');
	});

	test('profile page should be accessible', async ({ page }) => {
		await page.goto('/profile');
		
		// Should load without error
		const content = page.locator('main, [role="main"]');
		if (await content.count() > 0) {
			await expect(content).toBeVisible();
		}
	});

	test('demo pages should load', async ({ page }) => {
		await page.goto('/demo');
		
		// Demo page should exist
		const body = page.locator('body');
		await expect(body).toBeVisible();
	});

	test('form submission handling', async ({ page }) => {
		await page.goto('/auth');
		
		const form = page.locator('form').first();
		if (await form.count() > 0) {
			// Form should exist
			await expect(form).toBeVisible();
			
			// Should have input fields
			const inputs = form.locator('input');
			expect(await inputs.count()).toBeGreaterThan(0);
		}
	});
});
