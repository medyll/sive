import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import TabBar from './TabBar.svelte';

describe('TabBar', () => {
	const TABS = ['Suggestions', 'Coherence', 'Style', 'History'];

	it('renders all tabs from the tabs prop', async () => {
		render(TabBar, { tabs: TABS, activeTab: 'Suggestions' });
		for (const tab of TABS) {
			await expect.element(page.getByRole('button', { name: tab })).toBeVisible();
		}
	});

	it('active tab has the "active" class', async () => {
		render(TabBar, { tabs: TABS, activeTab: 'Coherence' });
		const activeBtn = page.getByRole('button', { name: 'Coherence' });
		await expect.element(activeBtn).toHaveClass(/active/);
	});

	it('inactive tabs do not have the "active" class', async () => {
		render(TabBar, { tabs: TABS, activeTab: 'Suggestions' });
		const inactiveBtn = page.getByRole('button', { name: 'Coherence' });
		await expect.element(inactiveBtn).not.toHaveClass(/active/);
	});

	it('clicking a tab dispatches a tabbar-change event with the tab name', async () => {
		const { container } = render(TabBar, { tabs: TABS, activeTab: 'Suggestions' });
		// attach a listener on the container so the dispatched event is captured in the test context
		const root = container.querySelector('.tab-bar');
		let lastTab: string | null = null;
		if (root) {
			root.addEventListener('tabbar-change', (e: any) => {
				lastTab = e.detail;
			});
		}
		await page.getByRole('button', { name: 'Style' }).click();
		// allow microtask queue for any async handlers
		await new Promise((r) => setTimeout(r, 10));
		expect(lastTab).toBe('Style');
	});

	it('dispatches an event even when clicking the already-active tab', async () => {
		const { container } = render(TabBar, { tabs: TABS, activeTab: 'Suggestions' });
		const root = container.querySelector('.tab-bar');
		let lastTab: string | null = null;
		if (root) {
			root.addEventListener('tabbar-change', (e: any) => {
				lastTab = e.detail;
			});
		}
		await page.getByRole('button', { name: 'Suggestions' }).click();
		await new Promise((r) => setTimeout(r, 10));
		expect(lastTab).toBe('Suggestions');
	});

	it('renders no tabs when tabs prop is empty', async () => {
		const { container } = render(TabBar, { tabs: [], activeTab: '' });
		const tabs = container.querySelectorAll('.tab');
		expect(tabs.length).toBe(0);
	});
});
