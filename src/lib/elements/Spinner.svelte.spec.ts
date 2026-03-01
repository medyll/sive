import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import Spinner from './Spinner.svelte';

describe('Spinner', () => {
	it('renders with default medium size', async () => {
		render(Spinner, {});
		const el = page.locator('.spinner');
		await expect.element(el).toBeVisible();
		await expect.element(el).toHaveClass(/medium/);
	});

	it('renders with small size class', async () => {
		render(Spinner, { size: 'small' });
		await expect.element(page.locator('.spinner.small')).toBeVisible();
	});

	it('renders with large size class', async () => {
		render(Spinner, { size: 'large' });
		await expect.element(page.locator('.spinner.large')).toBeVisible();
	});

	it('applies the data-theme attribute from theme prop', async () => {
		render(Spinner, { theme: 'dark' });
		await expect.element(page.locator('[data-theme="dark"]')).toBeVisible();
	});

	it('defaults to light theme', async () => {
		render(Spinner, {});
		await expect.element(page.locator('[data-theme="light"]')).toBeVisible();
	});
});
