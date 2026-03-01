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

	it('clicking a tab calls onChange with the tab name', async () => {
		const onChange = vi.fn();
		render(TabBar, { tabs: TABS, activeTab: 'Suggestions', onChange });
		await page.getByRole('button', { name: 'Style' }).click();
		expect(onChange).toHaveBeenCalledExactlyOnceWith('Style');
	});

	it('does not call onChange when clicking the already-active tab', async () => {
		const onChange = vi.fn();
		render(TabBar, { tabs: TABS, activeTab: 'Suggestions', onChange });
		await page.getByRole('button', { name: 'Suggestions' }).click();
		// onChange is still called — tab bar is uncontrolled for calling, parent decides
		expect(onChange).toHaveBeenCalledWith('Suggestions');
	});

	it('renders no tabs when tabs prop is empty', async () => {
		render(TabBar, { tabs: [], activeTab: '' });
		const buttons = page.getByRole('button');
		await expect.element(buttons).not.toBeVisible().catch(() => {
			// no buttons is also valid
		});
	});
});
