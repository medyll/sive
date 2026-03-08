import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import HardenModal from './HardenModal.svelte';

describe('HardenModal', () => {
	it('renders label input and message textarea', async () => {
		render(HardenModal, { onConfirm: vi.fn(), onCancel: vi.fn() });
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect.element(page.getByRole('textbox', { name: /version label/i })).toBeVisible();
		await expect.element(page.getByRole('textbox', { name: /description/i })).toBeVisible();
	});

	it('Confirm button is disabled when label is empty', async () => {
		render(HardenModal, { onConfirm: vi.fn(), onCancel: vi.fn() });
		await expect.element(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
	});

	it('Confirm button is enabled when label has a value', async () => {
		render(HardenModal, { onConfirm: vi.fn(), onCancel: vi.fn() });
		await userEvent.fill(page.getByRole('textbox', { name: /version label/i }), 'end_act_1');
		await expect.element(page.getByRole('button', { name: 'Confirm' })).not.toBeDisabled();
	});

	it('clicking Confirm dispatches harden-confirm with label and message', async () => {
		const { container } = render(HardenModal, { onConfirm: vi.fn(), onCancel: vi.fn() });
		const root = container.querySelector('.harden-modal');
		let last: any = null;
		if (root) {
			root.addEventListener('harden-confirm', (e: any) => { last = e.detail; });
		}
		await userEvent.fill(page.getByRole('textbox', { name: /version label/i }), 'incipit');
		await userEvent.fill(page.getByRole('textbox', { name: /description/i }), 'First draft');
		await page.getByRole('button', { name: 'Confirm' }).click();
		await new Promise((r) => setTimeout(r, 50));
		expect(last).toEqual({ label: 'incipit', message: 'First draft' });
	});

	it('clicking Cancel dispatches harden-cancel', async () => {
		const { container } = render(HardenModal, { onConfirm: vi.fn(), onCancel: vi.fn() });
		const root = container.querySelector('.harden-modal');
		let cancelled = false;
		if (root) {
			root.addEventListener('harden-cancel', () => { cancelled = true; });
		}
		await page.getByRole('button', { name: 'Cancel' }).click();
		await new Promise((r) => setTimeout(r, 50));
		expect(cancelled).toBe(true);
	});

	it('dialog has accessible title', async () => {
		render(HardenModal, { onConfirm: vi.fn(), onCancel: vi.fn() });
		await expect.element(page.getByRole('dialog', { name: /create new version/i })).toBeVisible();
	});
});
