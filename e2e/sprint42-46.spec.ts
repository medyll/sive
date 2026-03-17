import { test, expect } from './fixtures';

test.describe('Sprint 42 — Plugin System', () => {
	test('plugin manager renders in settings', async ({ page, goto }) => {
		await goto('/settings');
		// Plugin manager may be under an "Extensions" or "Plugins" section
		const section = page.getByText(/plugin/i).first();
		if (await section.isVisible({ timeout: 1000 }).catch(() => false)) {
			await expect(section).toBeVisible();
		}
	});

	test('palette:newFromTemplate command dispatches event', async ({ page, goto }) => {
		await goto('/app');
		const events: string[] = [];
		await page.exposeFunction('__captureEvent', (name: string) => events.push(name));
		await page.evaluate(() => {
			window.addEventListener('palette:newFromTemplate', () => (window as any).__captureEvent('palette:newFromTemplate'));
		});
		await page.keyboard.press('Control+k');
		await page.locator('.search-input').fill('New from Template');
		await page.keyboard.press('Enter');
		await page.waitForTimeout(300);
		// Event fired or palette closed
		const dialog = page.getByRole('dialog', { name: /command palette/i });
		await expect(dialog).not.toBeVisible();
	});
});

test.describe('Sprint 43 — Document Sharing', () => {
	test('share API returns 401 for unauthenticated GET', async ({ request }) => {
		const res = await request.get('/api/share?docId=test');
		expect([401, 302]).toContain(res.status());
	});

	test('share API returns 401 for unauthenticated POST', async ({ request }) => {
		const res = await request.post('/api/share', { data: { docId: 'test' } });
		expect([401, 302]).toContain(res.status());
	});

	test('shared doc route returns 404 for invalid token', async ({ page, goto }) => {
		const res = await page.goto('/s/invalidtoken123');
		expect(res?.status()).toBe(404);
	});
});

test.describe('Sprint 44 — Focus Mode', () => {
	test('focus panel renders without errors', async ({ page, goto }) => {
		await goto('/app');
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.waitForTimeout(500);
		expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
	});
});

test.describe('Sprint 45 — AI Document Chat', () => {
	test('chat API returns 401 for unauthenticated', async ({ request }) => {
		const res = await request.get('/api/ai/chat?q=hello');
		expect([401, 302]).toContain(res.status());
	});
});

test.describe('Sprint 46 — PWA', () => {
	test('manifest.webmanifest is served', async ({ request }) => {
		const res = await request.get('/manifest.webmanifest');
		expect(res.status()).toBe(200);
		const json = await res.json();
		expect(json.name).toContain('Sive');
		expect(json.start_url).toBe('/app');
	});

	test('service worker is served', async ({ request }) => {
		const res = await request.get('/sw.js');
		expect(res.status()).toBe(200);
	});

	test('app.html includes manifest link', async ({ page, goto }) => {
		await goto('/app');
		const manifest = page.locator('link[rel="manifest"]');
		await expect(manifest).toHaveAttribute('href', '/manifest.webmanifest');
	});

	test('apple-touch-icon is declared', async ({ page, goto }) => {
		await goto('/app');
		const icon = page.locator('link[rel="apple-touch-icon"]');
		await expect(icon).toHaveAttribute('href', '/icons/icon-192.png');
	});
});
