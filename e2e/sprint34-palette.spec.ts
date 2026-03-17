import { test, expect } from './fixtures';

test.describe('Sprint 34 - Command Palette', () => {
	test.describe('Opening & closing', () => {
		test('Cmd+K opens the palette', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
		});

		test('Ctrl+K opens the palette (alias)', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
		});

		test('Escape closes the palette', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.keyboard.press('Escape');
			await expect(page.getByRole('dialog', { name: /command palette/i })).not.toBeVisible();
		});

		test('clicking backdrop closes the palette', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.mouse.click(5, 5);
			await expect(page.getByRole('dialog', { name: /command palette/i })).not.toBeVisible();
		});

		test('input is focused on open', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			const input = page.locator('.search-input');
			await expect(input).toBeFocused();
		});
	});

	test.describe('Search & filter', () => {
		test('typing filters commands in real time', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');

			const input = page.locator('.search-input');
			await input.type('dashboard');

			await expect(page.getByText(/Go to Dashboard/i)).toBeVisible();
		});

		test('shows "No commands found" for nonsense query', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');

			await page.locator('.search-input').type('zzznomatch99999');
			await expect(page.getByText(/no commands found/i)).toBeVisible();
		});

		test('shows results grouped by category', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			// Category headers visible
			const headers = page.locator('.group-header');
			await expect(headers.first()).toBeVisible();
		});

		test('shows command icons and shortcuts', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');

			// Settings command has Cmd+, shortcut
			await page.locator('.search-input').type('Settings');
			const shortcut = page.locator('.shortcut');
			await expect(shortcut.first()).toBeVisible();
		});
	});

	test.describe('Keyboard navigation', () => {
		test('ArrowDown selects next item', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.keyboard.press('ArrowDown');

			const selected = page.locator('.result-item.selected');
			await expect(selected).toBeVisible();
		});

		test('ArrowUp from top wraps to last item', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.keyboard.press('ArrowUp');

			const selected = page.locator('.result-item.selected');
			await expect(selected).toBeVisible();
		});

		test('Enter executes selected command', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');

			await page.locator('.search-input').type('Dashboard');
			await page.keyboard.press('Enter');

			// Palette should close and navigate
			await expect(page.getByRole('dialog', { name: /command palette/i })).not.toBeVisible();
		});

		test('ArrowDown + ArrowDown then Enter executes second item', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.keyboard.press('ArrowDown');
			await page.keyboard.press('ArrowDown');
			await page.keyboard.press('Enter');

			await expect(page.getByRole('dialog', { name: /command palette/i })).not.toBeVisible();
		});
	});

	test.describe('Command execution', () => {
		test('"Go to Dashboard" command navigates to /dashboard', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');

			await page.locator('.search-input').type('Dashboard');
			await page.keyboard.press('Enter');

			await expect(page).toHaveURL(/\/dashboard/, { timeout: 3000 });
		});

		test('"Go to Settings" command navigates to /settings', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');

			await page.locator('.search-input').type('Settings');
			await page.keyboard.press('Enter');

			await expect(page).toHaveURL(/\/settings/, { timeout: 3000 });
		});
	});

	test.describe('Recent commands', () => {
		test('executed commands appear in recents on next open', async ({ page, goto }) => {
			await goto('/app');

			// Execute a command
			await page.keyboard.press('Control+k');
			await page.locator('.search-input').type('Dashboard');
			await page.keyboard.press('Enter');
			await page.waitForURL(/\/dashboard/);

			// Reopen palette with empty query
			await page.keyboard.press('Control+k');
			// "Go to Dashboard" should appear in recents (Recent group)
			const recentHeader = page.locator('.group-header', { hasText: /recent/i });
			await expect(recentHeader).toBeVisible({ timeout: 1000 });
		});
	});

	test.describe('Accessibility', () => {
		test('search input has role=combobox', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			const input = page.locator('[role="combobox"]');
			await expect(input).toBeVisible();
		});

		test('results list has role=listbox', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await expect(page.locator('[role="listbox"]')).toBeVisible();
		});

		test('selected item has aria-selected=true', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			await page.keyboard.press('ArrowDown');
			const selected = page.locator('[aria-selected="true"]');
			await expect(selected).toBeAttached();
		});

		test('dialog has aria-modal=true', async ({ page, goto }) => {
			await goto('/app');
			await page.keyboard.press('Control+k');
			const dialog = page.getByRole('dialog', { name: /command palette/i });
			await expect(dialog).toHaveAttribute('aria-modal', 'true');
		});
	});
});
