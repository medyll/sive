import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Toast from './Toast.svelte';
import { toastStore } from '$lib/toastStore.svelte';

describe('Toast.svelte', () => {
	beforeEach(() => {
		// Dismiss all existing toasts
		for (const t of [...toastStore.items]) toastStore.dismiss(t.id);
	});

	it('renders nothing when no toasts', async () => {
		const { container } = render(Toast);
		const toasts = container.querySelectorAll('.toast');
		expect(toasts.length).toBe(0);
	});

	it('renders a success toast', async () => {
		const { container } = render(Toast);
		toastStore.success('Saved successfully');
		await new Promise((r) => setTimeout(r, 20));
		const toast = container.querySelector('.toast--success');
		expect(toast).not.toBeNull();
		expect(toast?.textContent).toContain('Saved successfully');
	});

	it('renders an error toast', async () => {
		const { container } = render(Toast);
		toastStore.error('Something went wrong');
		await new Promise((r) => setTimeout(r, 20));
		const toast = container.querySelector('.toast--error');
		expect(toast).not.toBeNull();
	});

	it('dismiss button removes the toast', async () => {
		const { container } = render(Toast);
		toastStore.info('Hello');
		await new Promise((r) => setTimeout(r, 20));
		const btn = container.querySelector<HTMLButtonElement>('.toast-close');
		btn?.click();
		await new Promise((r) => setTimeout(r, 20));
		expect(container.querySelectorAll('.toast').length).toBe(0);
	});
});
