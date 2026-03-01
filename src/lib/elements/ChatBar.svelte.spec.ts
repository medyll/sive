import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from '@vitest/browser/context';
import ChatBar from './ChatBar.svelte';

// Mock fetch for chatStore calls
const mockFetch = vi.fn().mockResolvedValue({
	ok: true,
	json: async () => ({ reply: 'Mock AI response' })
});

beforeEach(() => {
	vi.stubGlobal('fetch', mockFetch);
	mockFetch.mockClear();
});

describe('ChatBar', () => {
	it('renders with default placeholder', async () => {
		render(ChatBar, {});
		await expect.element(page.getByRole('textbox', { name: 'Chat input' })).toBeVisible();
	});

	it('renders with custom placeholder', async () => {
		render(ChatBar, { placeholder: 'Ask AI anything…' });
		await expect.element(page.getByPlaceholder('Ask AI anything…')).toBeVisible();
	});

	it('renders the Send button', async () => {
		render(ChatBar, {});
		await expect.element(page.getByRole('button', { name: 'Send' })).toBeVisible();
	});

	it('clears the input after Send button click', async () => {
		render(ChatBar, {});
		const input = page.getByRole('textbox', { name: 'Chat input' });
		await input.fill('Hello AI');
		await page.getByRole('button', { name: 'Send' }).click();
		await expect.element(input).toHaveValue('');
	});

	it('clears the input after Enter key', async () => {
		render(ChatBar, {});
		const input = page.getByRole('textbox', { name: 'Chat input' });
		await input.fill('Enter test');
		await userEvent.keyboard('{Enter}');
		await expect.element(input).toHaveValue('');
	});

	it('Send button is disabled when input is empty', async () => {
		render(ChatBar, {});
		const btn = page.getByRole('button', { name: 'Send' });
		await expect.element(btn).toBeDisabled();
	});

	it('Send button is disabled when input is whitespace-only', async () => {
		render(ChatBar, {});
		await page.getByRole('textbox', { name: 'Chat input' }).fill('   ');
		const btn = page.getByRole('button', { name: 'Send' });
		await expect.element(btn).toBeDisabled();
	});
});

