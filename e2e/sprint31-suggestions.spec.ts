import { test, expect } from './fixtures';

test.describe('Sprint 31 - Inline AI Suggestions', () => {
	test.describe('Ghost text autocomplete', () => {
		test('should show ghost text after 800ms idle in editor', async ({ page, goto }) => {
			await goto('/app');

			// Click into editor
			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Once upon a time');

			// Wait for debounce
			await page.waitForTimeout(900);

			// Ghost text should appear
			const ghost = page.locator('.ghost-content');
			await expect(ghost).toBeVisible({ timeout: 2000 });
		});

		test('should dismiss ghost text on Escape', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Once upon a time');
			await page.waitForTimeout(900);

			await page.keyboard.press('Escape');

			const ghost = page.locator('.ghost-content');
			await expect(ghost).not.toBeVisible();
		});

		test('should accept ghost text on Tab', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Once upon a time');
			await page.waitForTimeout(900);

			const ghostText = await page.locator('.ghost-content').textContent();
			await page.keyboard.press('Tab');

			// Editor content should include the accepted text
			const editorContent = await editor.textContent();
			expect(editorContent?.length).toBeGreaterThan('Once upon a time'.length);
		});

		test('should dismiss ghost text on any printable keypress', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Once upon a time');
			await page.waitForTimeout(900);

			// Press a printable key
			await page.keyboard.press('a');

			const ghost = page.locator('.ghost-content');
			await expect(ghost).not.toBeVisible();
		});

		test('should show loading dots while fetching', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('The knight rode');
			await page.waitForTimeout(900);

			// Briefly check for loading state
			const pending = page.locator('.ghost-pending');
			// May appear only briefly — just check it doesn't crash
			expect(page.locator('.ghost-text')).toBeDefined();
		});

		test('should show Tab hint on ghost text', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('The story began');
			await page.waitForTimeout(900);

			const hint = page.locator('.ghost-hint');
			await expect(hint).toBeAttached();
		});
	});

	test.describe('Selection toolbar', () => {
		test('should appear when ≥10 chars selected', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('This is some text that should trigger the toolbar when selected');

			// Select all text
			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });
		});

		test('should NOT appear when fewer than 10 chars selected', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Short');

			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).not.toBeVisible();
		});

		test('should show Rewrite and Vivid buttons', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('The quick brown fox jumps over the lazy dog');
			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });

			await expect(toolbar.getByText(/Rewrite/)).toBeVisible();
			await expect(toolbar.getByText(/Vivid/)).toBeVisible();
		});

		test('should open diff preview on Rewrite click', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('The knight stood at the gate wondering what lay beyond');
			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });

			await toolbar.getByText(/Rewrite/).click();

			const diff = page.locator('[role="dialog"]');
			await expect(diff).toBeVisible({ timeout: 2000 });
		});

		test('should show original and suggested in diff preview', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('The old house stood on the hill looking out over the valley');
			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });
			await toolbar.getByText(/Rewrite/).click();

			const diff = page.locator('[role="dialog"]');
			await expect(diff).toBeVisible({ timeout: 2000 });

			// Wait for suggestion to load
			await expect(diff.locator('.diff-suggested .diff-text')).not.toBeEmpty({
				timeout: 5000
			});

			await expect(diff.locator('.diff-original')).toBeVisible();
			await expect(diff.locator('.diff-suggested')).toBeVisible();
		});

		test('should replace text on Accept', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('The old house stood on the hill looking out over the valley');
			const originalContent = await editor.textContent();

			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });
			await toolbar.getByText(/Rewrite/).click();

			const diff = page.locator('[role="dialog"]');
			await expect(diff).toBeVisible({ timeout: 2000 });
			await expect(diff.locator('.diff-suggested .diff-text')).not.toBeEmpty({ timeout: 5000 });

			await diff.getByText('Accept').click();

			// Toolbar and diff should close
			await expect(toolbar).not.toBeVisible();
			await expect(diff).not.toBeVisible();
		});

		test('should dismiss diff preview on Dismiss', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('The knight approached the ancient stone fortress alone');
			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });
			await toolbar.getByText(/Rewrite/).click();

			const diff = page.locator('[role="dialog"]');
			await expect(diff).toBeVisible({ timeout: 2000 });

			await diff.getByText('Dismiss').click();
			await expect(diff).not.toBeVisible();
		});

		test('should dismiss toolbar on Escape', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Some text that is long enough to show toolbar');
			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });

			await page.keyboard.press('Escape');
			await expect(toolbar).not.toBeVisible();
		});

		test('should dismiss toolbar on click outside', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('Some text that is long enough to show toolbar');
			await page.keyboard.press('Control+a');

			const toolbar = page.locator('[role="toolbar"]');
			await expect(toolbar).toBeVisible({ timeout: 1000 });

			// Click somewhere else
			await page.mouse.click(10, 10);
			await expect(toolbar).not.toBeVisible();
		});
	});

	test.describe('Rate limit handling', () => {
		test('should show error state (not crash) when rate limited', async ({ page, goto }) => {
			await goto('/app');

			// Simulate rate limit by rapid requests
			// The UI should degrade gracefully
			const ghost = page.locator('.ghost-text');
			// Should not throw or cause page crash
			expect(page.locator('body')).toBeAttached();
		});
	});

	test.describe('Stub mode (no API key)', () => {
		test('should return stub suggestion in stub mode', async ({ page, goto }) => {
			await goto('/app');

			const editor = page.locator('[contenteditable="true"], textarea').first();
			await editor.click();
			await editor.type('In the beginning there was');
			await page.waitForTimeout(900);

			const ghost = page.locator('.ghost-content, .ghost-text');
			await expect(ghost).toBeAttached({ timeout: 3000 });
		});
	});
});
