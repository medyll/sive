import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
	});

	test('hamburger menu button visible on mobile', async ({ page }) => {
		await page.goto('/');
		
		const menuBtn = page.locator('.mobile-menu-btn');
		await expect(menuBtn).toBeVisible();
	});

	test('navigation drawer opens on hamburger click', async ({ page }) => {
		await page.goto('/');
		
		const menuBtn = page.locator('.mobile-menu-btn');
		await menuBtn.click();
		
		const drawer = page.locator('.nav-drawer');
		await expect(drawer).toHaveClass(/open/);
	});

	test('navigation drawer closes on overlay click', async ({ page }) => {
		await page.goto('/');
		
		const menuBtn = page.locator('.mobile-menu-btn');
		await menuBtn.click();
		
		const overlay = page.locator('.nav-overlay');
		await overlay.click();
		
		const drawer = page.locator('.nav-drawer');
		await expect(drawer).not.toHaveClass(/open/);
	});

	test('navigation drawer closes on Escape key', async ({ page }) => {
		await page.goto('/');
		
		const menuBtn = page.locator('.mobile-menu-btn');
		await menuBtn.click();
		
		await page.keyboard.press('Escape');
		
		const drawer = page.locator('.nav-drawer');
		await expect(drawer).not.toHaveClass(/open/);
	});

	test('navigation items visible in drawer', async ({ page }) => {
		await page.goto('/');
		
		const menuBtn = page.locator('.mobile-menu-btn');
		await menuBtn.click();
		
		await expect(page.getByText('Documents')).toBeVisible();
		await expect(page.getByText('Discover')).toBeVisible();
		await expect(page.getByText('Challenges')).toBeVisible();
		await expect(page.getByText('Leaderboard')).toBeVisible();
		await expect(page.getByText('Settings')).toBeVisible();
	});
});

test.describe('Mobile Editor Toolbar', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
	});

	test('mobile toolbar visible on mobile', async ({ page }) => {
		await page.goto('/');
		
		const toolbar = page.locator('.mobile-toolbar');
		await expect(toolbar).toBeVisible();
	});

	test('toolbar buttons visible', async ({ page }) => {
		await page.goto('/');
		
		await expect(page.locator('button[aria-label="Bold"]')).toBeVisible();
		await expect(page.locator('button[aria-label="Italic"]')).toBeVisible();
		await expect(page.locator('button[aria-label="Undo"]')).toBeVisible();
		await expect(page.locator('button[aria-label="Redo"]')).toBeVisible();
		await expect(page.locator('button[aria-label="AI Rewrite"]')).toBeVisible();
	});

	test('toolbar collapsible', async ({ page }) => {
		await page.goto('/');
		
		const collapseBtn = page.locator('.collapse-btn');
		await collapseBtn.click();
		
		const toolbar = page.locator('.mobile-toolbar');
		await expect(toolbar).toHaveClass(/collapsed/);
	});

	test('toolbar expands after collapse', async ({ page }) => {
		await page.goto('/');
		
		const collapseBtn = page.locator('.collapse-btn');
		await collapseBtn.click();
		await collapseBtn.click();
		
		const toolbar = page.locator('.mobile-toolbar');
		await expect(toolbar).not.toHaveClass(/collapsed/);
	});
});

test.describe('Offline Indicator', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
	});

	test('offline banner hidden when online', async ({ page }) => {
		await page.goto('/');
		
		const banner = page.locator('.offline-banner');
		await expect(banner).not.toBeVisible();
	});

	test('offline banner shown when offline', async ({ page }) => {
		await page.goto('/');
		
		// Simulate offline
		await page.context().setOffline(true);
		
		const banner = page.locator('.offline-banner');
		await expect(banner).toBeVisible();
		await expect(banner).toContainText('You are offline');
	});

	test('offline banner hidden when back online', async ({ page }) => {
		await page.goto('/');
		
		// Simulate offline then online
		await page.context().setOffline(true);
		await page.context().setOffline(false);
		
		const banner = page.locator('.offline-banner');
		await expect(banner).not.toBeVisible();
	});
});

test.describe('Touch Gestures', () => {
	test.beforeEach(async ({ page, isMobile }) => {
		if (!isMobile) {
			await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
		}
	});

	test('editor accepts swipe gestures', async ({ page }) => {
		await page.goto('/');
		
		const editor = page.locator('.editor-textarea');
		await expect(editor).toBeVisible();
		
		// Swipe left gesture
		await editor.touchstart({ x: 200, y: 300 });
		await page.waitForTimeout(100);
		await editor.touchmove({ x: 100, y: 300 });
		await page.waitForTimeout(100);
		await editor.touchend();
		
		// Gesture should be recognized (no error)
		await expect(editor).toBeVisible();
	});
});
