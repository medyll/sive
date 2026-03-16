import { test, expect } from '@playwright/test';

/**
 * Smoke tests — Sprint 18 Release Candidate
 * Covers the critical happy paths across all major features.
 * These tests must pass before any release is cut.
 */

test.describe('Smoke — Auth flow', () => {
	test('auth page loads with sign-in form', async ({ page }) => {
		await page.goto('/auth');
		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 10000 });
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	});

	test('invalid credentials show an error alert', async ({ page }) => {
		await page.goto('/auth');
		await page.getByLabel('Email').fill('bad@example.com');
		await page.getByLabel('Password').fill('wrongpass');
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert')).toBeVisible({ timeout: 15000 });
	});
});

test.describe('Smoke — App / Document list', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('sive:onboarding_seen', '1');
		});
	});

	test('app page loads with document list', async ({ page }) => {
		await page.goto('/app');
		await expect(page.locator('.doc-list')).toBeVisible({ timeout: 10000 });
	});

	test('app page shows the editor panel', async ({ page }) => {
		await page.goto('/app');
		// The editor textarea / contenteditable area
		await expect(page.locator('.editor-panel, [data-testid="editor-panel"], .editor-area').first()).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Smoke — Editor', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('sive:onboarding_seen', '1');
		});
	});

	test('toolbar is visible', async ({ page }) => {
		await page.goto('/app');
		await expect(page.locator('.toolbar, [role="toolbar"]').first()).toBeVisible({ timeout: 10000 });
	});

	test('export button is present in toolbar', async ({ page }) => {
		await page.goto('/app');
		await expect(page.getByRole('button', { name: /Export/i })).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Smoke — AI panel tabs', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('sive:onboarding_seen', '1');
		});
	});

	test('Suggestions tab is visible and accessible', async ({ page }) => {
		await page.goto('/app');
		await expect(page.getByRole('button', { name: 'Suggestions', exact: true })).toBeVisible({ timeout: 10000 });
	});

	test('Coherence tab is visible and accessible', async ({ page }) => {
		await page.goto('/app');
		await expect(page.getByRole('button', { name: 'Coherence', exact: true })).toBeVisible({ timeout: 10000 });
	});

	test('Review tab is visible and accessible', async ({ page }) => {
		await page.goto('/app');
		await expect(page.getByRole('button', { name: 'Review', exact: true })).toBeVisible({ timeout: 10000 });
	});

	test('Style tab is visible and accessible', async ({ page }) => {
		await page.goto('/app');
		await expect(page.getByRole('button', { name: 'Style', exact: true })).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Smoke — Settings', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('sive:onboarding_seen', '1');
		});
	});

	test('settings page loads without error', async ({ page }) => {
		await page.goto('/settings');
		await expect(page).toHaveURL(/settings/);
		// Page should not be a blank error page
		const body = await page.content();
		expect(body.length).toBeGreaterThan(100);
	});
});

test.describe('Smoke — Profile', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('sive:onboarding_seen', '1');
		});
	});

	test('profile page loads and has back link', async ({ page }) => {
		await page.goto('/profile');
		const backLink = page.locator('a[href="/app"]');
		await expect(backLink).toBeVisible({ timeout: 10000 });
	});
});
