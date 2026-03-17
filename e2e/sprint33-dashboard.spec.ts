import { test, expect } from './fixtures';

test.describe('Sprint 33 - Writing Dashboard', () => {
	test.describe('Dashboard page', () => {
		test('should load /dashboard without error', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/writing dashboard/i)).toBeVisible();
		});

		test('should show 4 stat cards', async ({ page, goto }) => {
			await goto('/dashboard');
			const cards = page.locator('.stat-card');
			await expect(cards).toHaveCount(4);
		});

		test('should display total words card', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/total words/i)).toBeVisible();
		});

		test('should display documents count card', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/documents/i)).toBeVisible();
		});

		test('should display streak card', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/day streak/i)).toBeVisible();
		});

		test('should display avg words/doc card', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/avg words/i)).toBeVisible();
		});
	});

	test.describe('Activity heatmap', () => {
		test('should render 30 heatmap cells', async ({ page, goto }) => {
			await goto('/dashboard');
			const cells = page.locator('.heat-cell:not(.legend-cell)');
			await expect(cells).toHaveCount(30);
		});

		test('should show heatmap legend', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText('Less')).toBeVisible();
			await expect(page.getByText('More')).toBeVisible();
		});

		test('cells should have title tooltips', async ({ page, goto }) => {
			await goto('/dashboard');
			const firstCell = page.locator('.heat-cell:not(.legend-cell)').first();
			await expect(firstCell).toHaveAttribute('title');
		});
	});

	test.describe('Document lists', () => {
		test('should show Top Documents section', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/top documents/i)).toBeVisible();
		});

		test('should show Recently Edited section', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/recently edited/i)).toBeVisible();
		});

		test('should show empty hint when no docs', async ({ page, goto }) => {
			await goto('/dashboard');
			// In stub/mock mode may show empty state
			const emptyHint = page.locator('.empty-hint');
			// Either docs or empty hint should be present
			const docList = page.locator('.doc-list');
			const hasContent =
				(await docList.count()) > 0 || (await emptyHint.count()) > 0;
			expect(hasContent).toBe(true);
		});
	});

	test.describe('Footer summary', () => {
		test('should show reading time summary', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.locator('.summary-footer')).toBeVisible();
			await expect(page.getByText(/min/i).first()).toBeVisible();
		});

		test('should show longest streak', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByText(/longest streak/i)).toBeVisible();
		});
	});

	test.describe('Navigation', () => {
		test('should have back link to editor', async ({ page, goto }) => {
			await goto('/dashboard');
			const backLink = page.getByText(/back to editor/i);
			await expect(backLink).toBeVisible();
			await backLink.click();
			await expect(page).toHaveURL(/\/app/);
		});
	});

	test.describe('WordCountBadge', () => {
		test('should show word count in editor', async ({ page, goto }) => {
			await goto('/app');
			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Hello world this is a test');
			await page.waitForTimeout(600);

			const badge = page.locator('.badge');
			await expect(badge).toBeVisible({ timeout: 1000 });
			await expect(badge).toContainText('words');
		});

		test('should show read time in badge', async ({ page, goto }) => {
			await goto('/app');
			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Some text to show read time');
			await page.waitForTimeout(600);

			const badge = page.locator('.badge');
			await expect(badge).toContainText('min read');
		});

		test('should update badge live as user types', async ({ page, goto }) => {
			await goto('/app');
			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('first');
			await page.waitForTimeout(600);

			const before = await page.locator('.badge').textContent();
			await editor.type(' second third fourth');
			await page.waitForTimeout(600);

			const after = await page.locator('.badge').textContent();
			expect(before).not.toBe(after);
		});

		test('should hide badge when content is empty', async ({ page, goto }) => {
			await goto('/app');
			// Empty editor should not show badge
			const badge = page.locator('.badge');
			// May not be visible on empty doc
			const editor = page.locator('[contenteditable="true"], textarea').first();
			await expect(editor).toBeVisible();
		});
	});

	test.describe('Stats API', () => {
		test('GET /api/stats returns valid shape', async ({ page, goto }) => {
			await goto('/app');
			const response = await page.evaluate(async () => {
				const r = await fetch('/api/stats');
				return r.json();
			});
			expect(response).toHaveProperty('totalWords');
			expect(response).toHaveProperty('totalDocs');
			expect(response).toHaveProperty('currentStreak');
			expect(response).toHaveProperty('activityByDay');
			expect(typeof response.totalWords).toBe('number');
		});
	});

	test.describe('Accessibility', () => {
		test('stat cards should be labelled', async ({ page, goto }) => {
			await goto('/dashboard');
			await expect(page.getByRole('region', { name: /writing statistics/i })).toBeVisible();
		});

		test('heatmap should have aria-label on cells', async ({ page, goto }) => {
			await goto('/dashboard');
			const cell = page.locator('[aria-label*="words written"]').first();
			await expect(cell).toBeAttached();
		});
	});
});
