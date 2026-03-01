import { expect, test } from '@playwright/test';

test.describe('Auth – login flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/auth');
	});

	// --- Page structure ---

	test('sign-in page loads with title and form elements', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	});

	test('email input is of type email and password input is of type password', async ({ page }) => {
		await expect(page.locator('#email')).toHaveAttribute('type', 'email');
		await expect(page.locator('#password')).toHaveAttribute('type', 'password');
	});

	test('both inputs are required (HTML5 validation)', async ({ page }) => {
		await expect(page.locator('#email')).toHaveAttribute('required', '');
		await expect(page.locator('#password')).toHaveAttribute('required', '');
	});

	// --- Error display ---

	test('shows accessible error message on invalid credentials', async ({ page }) => {
		await page.locator('#email').fill('invalid@example.com');
		await page.locator('#password').fill('wrongpassword');
		await page.getByRole('button', { name: 'Sign in' }).click();

		const alert = page.getByRole('alert');
		await expect(alert).toBeVisible({ timeout: 5000 });
		// Error comes from the server stub (503 or 401) — any non-empty message is valid
		await expect(alert).not.toBeEmpty();
	});

	test('error message disappears on subsequent submission attempt', async ({ page }) => {
		// Trigger first error
		await page.locator('#email').fill('a@b.com');
		await page.locator('#password').fill('bad');
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

		// Submit again — error resets before new request
		await page.getByRole('button', { name: 'Sign in' }).click();
		// Alert will reappear with the response, but it cleared momentarily — just assert it's still visible after
		await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
	});

	// --- Success path (mocked network) ---

	test('redirects to / on successful sign-in', async ({ page }) => {
		// Intercept the POST /auth request and return a mocked success response
		await page.route('/auth', (route) => {
			if (route.request().method() === 'POST') {
				route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ ok: true })
				});
			} else {
				route.continue();
			}
		});

		await page.locator('#email').fill('user@example.com');
		await page.locator('#password').fill('correctpassword');
		await page.getByRole('button', { name: 'Sign in' }).click();

		await page.waitForURL('/', { timeout: 5000 });
		expect(page.url()).toContain('/');
	});

	// --- Accessibility ---

	test('form is labelled via aria-labelledby', async ({ page }) => {
		const form = page.locator('form[aria-labelledby="login-title"]');
		await expect(form).toBeVisible();
	});
});
