import { test, expect } from '@playwright/test';

test.describe('AI Features', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.setViewportSize({ width: 1366, height: 900 });
	});

	test('ghost text appears after typing pause', async ({ page }) => {
		// Type in editor
		const editor = page.locator('.editor-textarea');
		await editor.fill('The quick brown fox');
		
		// Wait for ghost text debounce (500ms + API time)
		await page.waitForTimeout(1500);
		
		// Ghost text should appear (check for ghost text element)
		const ghostText = page.locator('.ghost-text');
		await expect(ghostText).toBeVisible({ timeout: 5000 });
	});

	test('tab accepts ghost text', async ({ page }) => {
		// Type in editor
		const editor = page.locator('.editor-textarea');
		await editor.fill('The quick brown fox');
		
		// Wait for ghost text
		await page.waitForTimeout(1500);
		
		// Press Tab to accept
		await editor.press('Tab');
		
		// Content should be updated with accepted text
		const content = await editor.inputValue();
		expect(content.length).toBeGreaterThan('The quick brown fox'.length);
	});

	test('escape dismisses ghost text', async ({ page }) => {
		// Type in editor
		const editor = page.locator('.editor-textarea');
		await editor.fill('The quick brown fox');
		
		// Wait for ghost text
		await page.waitForTimeout(1500);
		
		// Press Escape to dismiss
		await editor.press('Escape');
		
		// Ghost text should be hidden
		const ghostText = page.locator('.ghost-text');
		await expect(ghostText).not.toBeVisible();
	});

	test('selection toolbar appears on text selection', async ({ page }) => {
		// Fill editor with text
		const editor = page.locator('.editor-textarea');
		await editor.fill('This is a test paragraph with some content to select.');
		
		// Select text (using keyboard for reliability)
		await editor.focus();
		await page.keyboard.press('Control+A'); // Select all
		
		// Wait for selection toolbar
		await page.waitForTimeout(500);
		
		// Toolbar should be visible
		const toolbar = page.locator('.selection-toolbar');
		await expect(toolbar).toBeVisible();
	});

	test('rewrite action modifies selection', async ({ page }) => {
		// Fill editor with text
		const editor = page.locator('.editor-textarea');
		await editor.fill('This is simple text.');
		
		// Select text
		await editor.focus();
		await page.keyboard.press('Control+A');
		await page.waitForTimeout(500);
		
		// Click rewrite button
		const rewriteBtn = page.getByText('✏️ Rewrite');
		await rewriteBtn.click();
		
		// Suggestion should be requested (check for AI panel or loading state)
		const aiPanel = page.locator('.ai-panel, [class*="ai"]');
		await expect(aiPanel).toBeVisible({ timeout: 5000 });
	});

	test('outline generator creates structure', async ({ page }) => {
		// Fill editor with some content
		const editor = page.locator('.editor-textarea');
		await editor.fill('A story about a writer who discovers an AI writing assistant...');
		
		// Open AI panel or outline generator
		// Note: This depends on how outline generator is triggered in the UI
		// Adjust selector based on actual implementation
		const outlineBtn = page.getByText('Outline').or(page.getByText('📋'));
		if (await outlineBtn.isVisible()) {
			await outlineBtn.click();
			
			// Outline should be generated
			await page.waitForTimeout(2000);
			
			// Check for outline elements
			const outlinePanel = page.locator('.outline-panel, [class*="outline"]');
			await expect(outlinePanel).toBeVisible({ timeout: 5000 });
		}
	});

	test('outline insert at cursor', async ({ page }) => {
		// Fill editor with content
		const editor = page.locator('.editor-textarea');
		await editor.fill('Chapter 1\n\n');
		
		// Position cursor and insert outline
		await editor.focus();
		await page.keyboard.press('End');
		
		// Trigger outline insert (depends on UI implementation)
		// This is a placeholder - adjust based on actual implementation
		const insertOutlineBtn = page.getByText('Insert').or(page.getByText('📋'));
		if (await insertOutlineBtn.isVisible()) {
			await insertOutlineBtn.click();
			
			// Content should be updated
			const content = await editor.inputValue();
			expect(content.length).toBeGreaterThan('Chapter 1\n\n'.length);
		}
	});

	test('tone submenu shows tone options', async ({ page }) => {
		// Fill editor with text
		const editor = page.locator('.editor-textarea');
		await editor.fill('This is test text.');
		
		// Select text
		await editor.focus();
		await page.keyboard.press('Control+A');
		await page.waitForTimeout(500);
		
		// Click tone button
		const toneBtn = page.getByText('🎨 Tone');
		await toneBtn.click();
		
		// Tone menu should appear
		const toneMenu = page.locator('.tone-menu, [class*="tone"]');
		await expect(toneMenu).toBeVisible();
		
		// Check for tone options
		await expect(page.getByText('Formal')).toBeVisible();
		await expect(page.getByText('Casual')).toBeVisible();
	});

	test('AI rewrite from selection toolbar', async ({ page }) => {
		// Fill editor with text
		const editor = page.locator('.editor-textarea');
		await editor.fill('The cat sat on the mat.');
		
		// Select text
		await editor.focus();
		await page.keyboard.press('Control+A');
		await page.waitForTimeout(500);
		
		// Click rewrite
		const rewriteBtn = page.getByText('✏️ Rewrite');
		await rewriteBtn.click();
		
		// Wait for AI processing
		await page.waitForTimeout(2000);
		
		// Check for suggestion or AI response
		const suggestionItem = page.locator('.suggestion-item, [class*="suggestion"]');
		await expect(suggestionItem).toBeVisible({ timeout: 5000 });
	});

	test('expand action from selection toolbar', async ({ page }) => {
		// Fill editor with short text
		const editor = page.locator('.editor-textarea');
		await editor.fill('The cat slept.');
		
		// Select text
		await editor.focus();
		await page.keyboard.press('Control+A');
		await page.waitForTimeout(500);
		
		// Click expand button
		const expandBtn = page.getByText('📝 Expand');
		if (await expandBtn.isVisible()) {
			await expandBtn.click();
			
			// Wait for AI processing
			await page.waitForTimeout(2000);
			
			// Check for suggestion
			const suggestionItem = page.locator('.suggestion-item');
			await expect(suggestionItem).toBeVisible({ timeout: 5000 });
		}
	});

	test('condense action from selection toolbar', async ({ page }) => {
		// Fill editor with longer text
		const editor = page.locator('.editor-textarea');
		await editor.fill('The very fluffy cat with long white fur slept peacefully on the comfortable soft cushion all day long.');
		
		// Select text
		await editor.focus();
		await page.keyboard.press('Control+A');
		await page.waitForTimeout(500);
		
		// Click condense button
		const condenseBtn = page.getByText('📌 Condense');
		if (await condenseBtn.isVisible()) {
			await condenseBtn.click();
			
			// Wait for AI processing
			await page.waitForTimeout(2000);
			
			// Check for suggestion
			const suggestionItem = page.locator('.suggestion-item');
			await expect(suggestionItem).toBeVisible({ timeout: 5000 });
		}
	});
});
