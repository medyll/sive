import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import HardenTimeline from './HardenTimeline.svelte';
import { STUB_HARDENS } from '$lib/harden.js';

describe('HardenTimeline', () => {
	it('renders one point per snapshot', async () => {
		render(HardenTimeline, {
			snapshots: STUB_HARDENS,
			onSelectVersion: vi.fn()
		});
		for (const snap of STUB_HARDENS) {
			await expect.element(page.getByRole('button', { name: new RegExp(snap.label) })).toBeVisible();
		}
	});

	it('shows empty state when snapshots is empty', async () => {
		render(HardenTimeline, { snapshots: [], onSelectVersion: vi.fn() });
		await expect
			.element(page.getByText('No versions yet. Use 💾 New version to create one.'))
			.toBeVisible();
	});

	it('clicking a point dispatches a harden-select event with the snapshot id', async () => {
		const { container } = render(HardenTimeline, { snapshots: STUB_HARDENS });
		const root = container.querySelector('.harden-timeline');
		let last: string | null = null;
		if (root) {
			root.addEventListener('harden-select', (e: any) => {
				last = e.detail;
			});
		}
		await page.getByRole('button', { name: /incipit/ }).click();
		await new Promise((r) => setTimeout(r, 10));
		expect(last).toBe('h001');
	});

	it('selected snapshot button has aria-current="true"', async () => {
		const { container } = render(HardenTimeline, {
			snapshots: STUB_HARDENS,
			selectedId: 'h002',
			onSelectVersion: vi.fn()
		});
		const selected = container.querySelector('[aria-current="true"]');
		expect(selected).not.toBeNull();
		expect(selected!.textContent).toContain('end_act_1');
	});
});
