import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from '@vitest/browser/context';
import ChatBar from './ChatBar.svelte';

describe('ChatBar', () => {
	it('renders with default placeholder', async () => {
		render(ChatBar, {});
		await expect.element(page.getByPlaceholder('Type a message...')).toBeVisible();
	});

	it('renders with custom placeholder', async () => {
		render(ChatBar, { placeholder: 'Ask AI anything…' });
		await expect.element(page.getByPlaceholder('Ask AI anything…')).toBeVisible();
	});

	it('renders the Send button', async () => {
		render(ChatBar, {});
		await expect.element(page.getByRole('button', { name: 'Send' })).toBeVisible();
	});

	it('calls onSend with input value on Send button click', async () => {
		const onSend = vi.fn();
		render(ChatBar, { onSend });
		const input = page.getByRole('textbox');
		await input.fill('Hello AI');
		await page.getByRole('button', { name: 'Send' }).click();
		expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello AI');
	});

	it('clears the input after Send button click', async () => {
		render(ChatBar, { onSend: vi.fn() });
		const input = page.getByRole('textbox');
		await input.fill('some message');
		await page.getByRole('button', { name: 'Send' }).click();
		await expect.element(input).toHaveValue('');
	});

	it('calls onSend with input value on Enter key', async () => {
		const onSend = vi.fn();
		render(ChatBar, { onSend });
		const input = page.getByRole('textbox');
		await input.fill('Enter test');
		await userEvent.keyboard('{Enter}');
		expect(onSend).toHaveBeenCalledExactlyOnceWith('Enter test');
	});

	it('clears the input after Enter key', async () => {
		render(ChatBar, { onSend: vi.fn() });
		const input = page.getByRole('textbox');
		await input.fill('clear me');
		await userEvent.keyboard('{Enter}');
		await expect.element(input).toHaveValue('');
	});

	it('does NOT call onSend when input is empty on Send click', async () => {
		const onSend = vi.fn();
		render(ChatBar, { onSend });
		await page.getByRole('button', { name: 'Send' }).click();
		expect(onSend).not.toHaveBeenCalled();
	});

	it('does NOT call onSend when input is whitespace-only', async () => {
		const onSend = vi.fn();
		render(ChatBar, { onSend });
		await page.getByRole('textbox').fill('   ');
		await page.getByRole('button', { name: 'Send' }).click();
		expect(onSend).not.toHaveBeenCalled();
	});
});
