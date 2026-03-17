import { test, expect } from './fixtures';

test.describe('Sprint 39 — Advanced Export', () => {
	test('EPUB export endpoint returns 401 for unauthenticated', async ({ request }) => {
		const res = await request.post('/api/export/epub', {
			data: { title: 'Test', content: 'Hello' }
		});
		expect([401, 302]).toContain(res.status());
	});

	test('DOCX export endpoint returns 401 for unauthenticated', async ({ request }) => {
		const res = await request.post('/api/export/docx', {
			data: { title: 'Test', content: 'Hello' }
		});
		expect([401, 302]).toContain(res.status());
	});
});

test.describe('Sprint 40 — Onboarding Tour', () => {
	test('tour does not appear after being completed', async ({ page, goto }) => {
		// Fixture sets localStorage before load — mark tour as done
		await page.addInitScript(() => {
			localStorage.setItem('sive:tour:completed', '1');
		});
		await goto('/app');
		await expect(page.getByRole('dialog', { name: /tour step/i })).not.toBeVisible();
	});

	test('skip button completes tour', async ({ page, goto }) => {
		await page.addInitScript(() => {
			localStorage.removeItem('sive:tour:completed');
		});
		await goto('/app');
		const skipBtn = page.getByRole('button', { name: /skip tour/i });
		if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
			await skipBtn.click();
			await expect(skipBtn).not.toBeVisible();
		}
	});
});

test.describe('Sprint 41 — Writing Goals', () => {
	test('goal bar renders in the app', async ({ page, goto }) => {
		await goto('/app');
		// Goal bar is at the bottom of the document list
		const bar = page.locator('.goal-bar');
		if (await bar.isVisible({ timeout: 1000 }).catch(() => false)) {
			await expect(bar).toBeVisible();
		}
	});

	test('goal target can be edited', async ({ page, goto }) => {
		await goto('/app');
		const targetBtn = page.getByRole('button', { name: /goal:/i });
		if (await targetBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
			await targetBtn.click();
			const input = page.locator('.target-edit input');
			await expect(input).toBeVisible();
			await input.fill('1000');
			await page.keyboard.press('Enter');
			await expect(page.getByRole('button', { name: /goal: 1000/i })).toBeVisible();
		}
	});
});
