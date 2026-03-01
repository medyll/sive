import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
	test('login page renders with email, password fields and GitHub button', async ({ page }) => {
		await page.goto('/auth');
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
	});

	test('login page has link to signup', async ({ page }) => {
		await page.goto('/auth');
		await expect(page.getByRole('link', { name: /Create one/i })).toBeVisible();
	});

	test('signup page renders with email and password fields', async ({ page }) => {
		await page.goto('/auth/signup');
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();
	});

	test('signup page has link back to sign in', async ({ page }) => {
		await page.goto('/auth/signup');
		await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible();
	});

	test('login page shows dev mode notice in mock environment', async ({ page }) => {
		await page.goto('/auth');
		// In dev (isMock=true) mode the notice is shown and links to /app
		const notice = page.locator('.auth-notice');
		await expect(notice).toBeVisible();
		await expect(page.getByRole('link', { name: /Continue as guest/i })).toBeVisible();
	});

	test('login form shows error on submit in mock mode', async ({ page }) => {
		await page.goto('/auth');
		await page.getByLabel('Email').fill('test@test.com');
		await page.getByLabel('Password').fill('secret');
		await page.getByRole('button', { name: /Sign in/i }).click();
		await expect(page.locator('.auth-error')).toBeVisible();
	});
});
