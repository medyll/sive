import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('AI context awareness', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
		// Ensure chat tab is visible
		await page.getByRole('tab', { name: 'Chat' }).click();
	});

	test('context toggle button is visible in Chat tab', async ({ page }) => {
		const toggle = page.getByRole('button', { name: /Use doc as context|Doc context active/i });
		await expect(toggle).toBeVisible();
	});

	test('context toggle persists across reload', async ({ page }) => {
		const toggle = page.getByRole('button', { name: /Use doc as context|Doc context active/i });
		const initialPressed = await toggle.getAttribute('aria-pressed');

		// Click to flip state
		await toggle.click();
		const flippedPressed = await toggle.getAttribute('aria-pressed');
		expect(flippedPressed).not.toBe(initialPressed);

		// Reload and check persistence
		await page.reload();
		await page.getByRole('tab', { name: 'Chat' }).click();
		const afterReload = page.getByRole('button', { name: /Use doc as context|Doc context active/i });
		await expect(afterReload).toHaveAttribute('aria-pressed', flippedPressed!);
	});

	test('sending a chat message returns a response (stub mode)', async ({ page }) => {
		const input = page.getByLabel('Chat input');
		await input.fill('What genre is this story?');
		await page.getByRole('button', { name: 'Send' }).click();

		// User bubble appears
		await expect(page.locator('.chat-bubble--user')).toContainText('What genre is this story?');
		// Assistant bubble eventually appears with some text
		await expect(page.locator('.chat-bubble--assistant').last()).not.toBeEmpty({ timeout: 5000 });
	});

	test('history hint appears after sending a message', async ({ page }) => {
		const input = page.getByLabel('Chat input');
		await input.fill('Test prompt for history');
		await page.getByRole('button', { name: 'Send' }).click();

		// Wait for streaming to finish (Cancel button disappears)
		await expect(page.getByRole('button', { name: 'Cancel' })).not.toBeVisible({ timeout: 5000 });

		// History hint should be visible
		await expect(page.locator('.history-hint')).toBeVisible();
	});
});

test.describe('Prompt history recall', () => {
	test('ArrowUp in empty input recalls last sent prompt', async ({ page }) => {
		// Pre-seed localStorage with a known history entry
		await page.addInitScript(() => {
			localStorage.setItem('sive.promptHistory', JSON.stringify(['My historical prompt']));
		});
		await page.goto('/app');
		await page.getByRole('tab', { name: 'Chat' }).click();

		const input = page.getByLabel('Chat input');
		await input.focus();
		await input.press('ArrowUp');
		await expect(input).toHaveValue('My historical prompt');
	});

	test('ArrowDown after ArrowUp clears the input', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('sive.promptHistory', JSON.stringify(['Recall me']));
		});
		await page.goto('/app');
		await page.getByRole('tab', { name: 'Chat' }).click();

		const input = page.getByLabel('Chat input');
		await input.focus();
		await input.press('ArrowUp');
		await expect(input).toHaveValue('Recall me');
		await input.press('ArrowDown');
		await expect(input).toHaveValue('');
	});

	test('sent prompt is saved to history', async ({ page }) => {
		await page.goto('/app');
		await page.getByRole('tab', { name: 'Chat' }).click();

		const input = page.getByLabel('Chat input');
		await input.fill('Unique prompt 42');
		await page.getByRole('button', { name: 'Send' }).click();

		// Wait for streaming to finish
		await expect(page.getByRole('button', { name: 'Cancel' })).not.toBeVisible({ timeout: 5000 });

		// Reload and verify history survives
		await page.reload();
		await page.getByRole('tab', { name: 'Chat' }).click();

		const storedRaw = await page.evaluate(() => localStorage.getItem('sive.promptHistory'));
		const stored: string[] = JSON.parse(storedRaw ?? '[]');
		expect(stored).toContain('Unique prompt 42');
	});
});
