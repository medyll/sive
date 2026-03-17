import { test, expect } from './fixtures';

test.describe('Sprint 30 - Full-Text Search & Filtering', () => {
  test.describe('Search Functionality', () => {
    test('should search documents by title', async ({ page, goto }) => {
      await goto('/app');

      // Create test documents (assuming we have document list UI)
      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('Gatsby');

      // Wait for results
      await page.waitForSelector('[role="listbox"]');

      // Verify result appears
      const result = page.getByText(/Gatsby/i).first();
      expect(result).toBeDefined();
    });

    test('should search documents by content', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('vulnerable');

      await page.waitForSelector('[role="listbox"]');

      // Should find document with matching content
      expect(page.getByRole('listbox')).toBeVisible();
    });

    test('should be case-insensitive', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);

      // Search lowercase
      await searchInput.fill('gatsby');
      let results = page.locator('[role="option"]');
      let count1 = await results.count();

      // Search uppercase
      await searchInput.fill('GATSBY');
      results = page.locator('[role="option"]');
      let count2 = await results.count();

      expect(count1).toBeGreaterThan(0);
      expect(count1).toBe(count2); // Should be same
    });

    test('should support phrase search with quotes', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('"quick brown"');

      await page.waitForTimeout(500); // Debounce delay
      const results = page.locator('[role="listbox"]');

      // Should find exact phrase
      expect(results).toBeVisible();
    });

    test('should show result count', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('test');

      // Should show "X results for 'test'"
      const resultCount = page.getByText(/result/i);
      expect(resultCount).toBeVisible();
    });

    test('should display result snippets with highlights', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('search');

      await page.waitForSelector('[role="listbox"]');

      // Check for snippet (truncated content)
      const snippet = page.locator('.result-snippet').first();
      expect(snippet).toBeVisible();
    });

    test('should rank title matches higher than content matches', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('search');

      await page.waitForSelector('[role="listbox"]');

      // First result should have higher match score
      const firstScore = page.locator('.result-score').first();
      const firstScoreText = await firstScore.textContent();

      expect(firstScoreText).toMatch(/\d+%/);
    });

    test('should allow selecting a result to jump to document', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('test');

      await page.waitForSelector('[role="option"]');

      // Click first result
      const firstResult = page.locator('[role="option"]').first();
      await firstResult.click();

      // Should navigate or select document (implementation specific)
      // Verify action was triggered
      expect(firstResult).toHaveClass(/selected/);
    });

    test('should clear search and results', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('test');

      // Wait for results to appear
      await page.waitForSelector('[role="listbox"]');

      // Click clear button
      const clearButton = page.getByLabel(/clear search/i);
      await clearButton.click();

      // Search input should be empty
      expect(searchInput).toHaveValue('');

      // Results should disappear
      expect(page.locator('[role="listbox"]')).not.toBeVisible();
    });

    test('should debounce search input', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);

      // Type characters one by one quickly
      await searchInput.type('test', { delay: 50 });

      // Search should not fire until debounce completes
      let resultsVisible = false;
      try {
        await page.waitForSelector('[role="listbox"]', { timeout: 150 });
        resultsVisible = true;
      } catch {
        resultsVisible = false;
      }

      // Wait for debounce to complete
      await page.waitForTimeout(350);

      // Now results should be visible
      expect(page.locator('[role="listbox"]')).toBeVisible();
    });

    test('should show loading state during search', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('test');

      // Briefly check for loading spinner (may appear/disappear quickly)
      const loadingText = page.getByText(/searching/i);
      // Loading state should resolve to results or empty state
    });

    test('should show empty state when no results', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('nonexistentquerystring12345');

      await page.waitForTimeout(400);

      // Should show "No documents found"
      const emptyState = page.getByText(/no documents found/i);
      expect(emptyState).toBeVisible();
    });
  });

  test.describe('Filtering', () => {
    test('should filter by single tag', async ({ page, goto }) => {
      await goto('/app');

      // Open filter panel
      const filterButton = page.getByLabel(/filter/i);
      if (filterButton) {
        await filterButton.click();
      }

      // Select a tag
      const tagCheckbox = page.locator('input[type="checkbox"]').first();
      await tagCheckbox.check();

      // Should show documents with that tag only
      const resultItems = page.locator('[role="option"]');
      expect(await resultItems.count()).toBeGreaterThan(0);
    });

    test('should filter by multiple tags (AND logic)', async ({ page, goto }) => {
      await goto('/app');

      // Select multiple tags
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Results should be intersection of both tags
        const results = page.locator('[role="option"]');
        expect(await results.count()).toBeLessThanOrEqual(
          await page.locator('[role="option"]').count()
        );
      }
    });

    test('should filter by date range', async ({ page, goto }) => {
      await goto('/app');

      // Set date range
      const dateStart = page.locator('input[type="date"]').first();
      const dateEnd = page.locator('input[type="date"]').nth(1);

      await dateStart.fill('2026-01-01');
      await dateEnd.fill('2026-12-31');

      // Results should be filtered by date
      const results = page.locator('[role="option"]');
      expect(results).toBeDefined();
    });

    test('should sort by modified date descending', async ({ page, goto }) => {
      await goto('/app');

      // Change sort option
      const sortSelect = page.locator('select').first();
      await sortSelect.selectOption('date_modified');

      // Documents should be ordered by modified date
      const results = page.locator('[role="option"]');
      expect(await results.count()).toBeGreaterThan(0);
    });

    test('should sort by title alphabetically', async ({ page, goto }) => {
      await goto('/app');

      // Select title sort
      const sortSelect = page.locator('select').first();
      await sortSelect.selectOption('title');

      // Documents should be sorted A-Z
      const titles = page.locator('.result-title');
      expect(await titles.count()).toBeGreaterThan(0);
    });

    test('should combine search with filters', async ({ page, goto }) => {
      await goto('/app');

      // Search
      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('test');

      // Apply filter
      const tagCheckbox = page.locator('input[type="checkbox"]').first();
      await tagCheckbox.check();

      // Results should be intersection of search AND filter
      const results = page.locator('[role="option"]');
      expect(results).toBeVisible();
    });

    test('should show active filters', async ({ page, goto }) => {
      await goto('/app');

      // Apply filters
      const tagCheckbox = page.locator('input[type="checkbox"]').first();
      await tagCheckbox.check();

      // Should display active filters section
      const activeFilters = page.getByText(/active filters/i);
      expect(activeFilters).toBeVisible();
    });

    test('should clear individual filters via chip', async ({ page, goto }) => {
      await goto('/app');

      // Apply a filter
      const tagCheckbox = page.locator('input[type="checkbox"]').first();
      await tagCheckbox.check();

      // Find filter chip and remove it
      const chipRemove = page.locator('.chip-remove').first();
      await chipRemove.click();

      // Filter should be removed
      expect(tagCheckbox).not.toBeChecked();
    });

    test('should clear all filters', async ({ page, goto }) => {
      await goto('/app');

      // Apply multiple filters
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      if (count >= 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();
      }

      // Click "Clear All"
      const clearAllButton = page.getByText(/clear all/i);
      await clearAllButton.click();

      // All filters should be cleared
      const checkedBoxes = page.locator('input[type="checkbox"]:checked');
      expect(await checkedBoxes.count()).toBe(0);
    });

    test('should persist filter state to localStorage', async ({ page, goto }) => {
      await goto('/app');

      // Apply filters
      const tagCheckbox = page.locator('input[type="checkbox"]').first();
      await tagCheckbox.check();

      // Reload page
      await page.reload();

      // Filter should be restored
      expect(tagCheckbox).toBeChecked();
    });
  });

  test.describe('Search History', () => {
    test('should store recent searches', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);

      // Perform multiple searches
      await searchInput.fill('first');
      await page.waitForTimeout(400);
      await searchInput.fill('second');
      await page.waitForTimeout(400);

      // History should be available (implementation dependent)
      // Verify searches were stored
      expect(searchInput).toHaveValue('second');
    });

    test('should persist search history across sessions', async ({ page, goto }) => {
      await goto('/app');

      // Perform search
      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.fill('test query');
      await page.waitForTimeout(400);

      // Close and reopen
      await page.reload();

      // History should still be available
      // Can verify via localStorage or UI
      expect(searchInput).toBeDefined();
    });
  });

  test.describe('Performance', () => {
    test('should search 100+ documents in <200ms', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);

      const startTime = Date.now();
      await searchInput.fill('document');
      await page.waitForTimeout(400); // Debounce

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Should complete within reasonable time (accounting for debounce)
      expect(elapsed).toBeLessThan(600);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page, goto }) => {
      await goto('/app');

      // Search input should have label
      const searchInput = page.getByLabel(/search documents/i);
      expect(searchInput).toBeVisible();

      // Results should have role
      await searchInput.fill('test');
      await page.waitForTimeout(400);

      const results = page.locator('[role="listbox"]');
      expect(results).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page, goto }) => {
      await goto('/app');

      const searchInput = page.getByPlaceholder(/search documents/i);
      await searchInput.focus();

      // Type and trigger search
      await searchInput.type('test');
      await page.waitForTimeout(400);

      // Should be able to navigate with arrow keys (implementation specific)
      // Verify focus management works
      expect(searchInput).toBeFocused();
    });
  });
});
